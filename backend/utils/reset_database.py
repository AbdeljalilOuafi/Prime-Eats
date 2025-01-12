#!/usr/bin/env python3
import os
import django
import sys
from django.db import connection
import dj_database_url


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.deployement_settings')
print("Django settings module:", os.environ.get('DJANGO_SETTINGS_MODULE'))

django.setup()

from django.conf import settings
from django.core.cache import cache
from restaurants.models import (
    Restaurant, FetchRestaurant, ChainRestaurant,
    Menu, Category, MenuItem, CuisineType
)
from django.db import transaction

def get_all_tables():
    """Get all table names from the public schema"""
    with connection.cursor() as cursor:
        if connection.vendor == 'postgresql':
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
                AND table_name != 'django_migrations'
            """)
        else:
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' 
                AND name != 'django_migrations'
                AND name != 'sqlite_sequence';
            """)
        return [row[0] for row in cursor.fetchall()]

def clear_database():
    """Clear all tables in the database"""
    try:
        print(f"Database engine: {connection.vendor}")
        
        with connection.cursor() as cursor:
            if connection.vendor == 'postgresql':
                # Get all tables first
                tables = get_all_tables()
                
                # Ensure we're not in a transaction
                cursor.execute("ROLLBACK;")
                
                # Try the simple DELETE approach first (most likely to work)
                try:
                    # Start a new transaction
                    cursor.execute("BEGIN;")
                    
                    # Disable foreign key checks
                    cursor.execute("SET CONSTRAINTS ALL DEFERRED;")
                    
                    # Delete in reverse order to handle dependencies
                    for table in reversed(tables):
                        try:
                            cursor.execute(f'DELETE FROM "{table}";')
                        except Exception as table_error:
                            print(f"Error clearing table {table}: {table_error}")
                            cursor.execute("ROLLBACK;")
                            raise table_error
                    
                    # Reset sequences
                    for table in tables:
                        try:
                            cursor.execute(f"""
                                SELECT setval(pg_get_serial_sequence('{table}', 'id'), 1, false)
                                WHERE EXISTS (
                                    SELECT 1 
                                    FROM pg_class 
                                    WHERE relname = '{table}' 
                                    AND EXISTS (
                                        SELECT 1 
                                        FROM pg_attribute 
                                        WHERE attrelid = pg_class.oid 
                                        AND attname = 'id'
                                    )
                                );
                            """)
                        except Exception as seq_error:
                            print(f"Note: Could not reset sequence for {table}: {seq_error}")
                            # Continue even if sequence reset fails
                            
                    # Re-enable constraints and commit
                    cursor.execute("SET CONSTRAINTS ALL IMMEDIATE;")
                    cursor.execute("COMMIT;")
                    print("Successfully cleared database using DELETE approach")
                    
                except Exception as delete_error:
                    print(f"DELETE approach failed: {delete_error}")
                    cursor.execute("ROLLBACK;")
                    raise delete_error
                    
            else:
                # SQLite specific clearing
                tables = get_all_tables()
                cursor.execute('PRAGMA foreign_keys=OFF;')
                for table in tables:
                    cursor.execute(f'DELETE FROM {table};')
                cursor.execute('PRAGMA foreign_keys=ON;')
        
        # Clear Django cache
        try:
            cache.clear()
            print("Cache cleared successfully")
        except Exception as cache_error:
            print(f"Warning: Cache clearing failed: {cache_error}")
        
        print("Database reset completed successfully")
        return True
        
    except Exception as e:
        print(f"Error clearing database: {e}")
        print(f"Current database engine: {connection.vendor}")
        return False

def populate_database():
    """Import and run the populate_db script"""
    try:
        from utils.populate_db import populate_db
        populate_db()
        print("Database populated successfully")
        return True
    except Exception as e:
        print(f"Error populating database: {e}")
        return False

def reset_and_populate_database():
    """Clear the database and repopulate it"""
    try:
        print("Starting database reset process...")
        print(f"Using database engine: {connection.vendor}")
        
        # Ensure we're not in a transaction
        with connection.cursor() as cursor:
            cursor.execute("ROLLBACK;")
        
        # Clear the database
        if clear_database():
            # Populate the database
            if populate_database():
                print("Database reset and population completed successfully")
                return True
            else:
                print("Database population failed")
                return False
        else:
            print("Database clearing failed")
            return False
            
    except Exception as e:
        print(f"Error during database reset: {e}")
        with connection.cursor() as cursor:
            cursor.execute("ROLLBACK;")
        return False

if __name__ == "__main__":
    reset_and_populate_database()