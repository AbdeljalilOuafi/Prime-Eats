# Generated by Django 5.1 on 2024-12-27 15:10

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ChainRestaurant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(db_index=True, max_length=255, unique=True)),
                ('image_url', models.CharField(blank=True, max_length=500, null=True)),
                ('menu', models.JSONField()),
            ],
        ),
        migrations.CreateModel(
            name='Restaurant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('latitude', models.FloatField()),
                ('longitude', models.FloatField()),
                ('rounded_coordinates', models.CharField(db_index=True, max_length=50)),
                ('address', models.CharField(blank=True, max_length=500, null=True)),
                ('rating', models.FloatField(blank=True, null=True)),
                ('source', models.CharField(max_length=50)),
                ('menu', models.JSONField(blank=True, null=True)),
                ('image_url', models.CharField(blank=True, max_length=500, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='FetchRestaurant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rounded_coordinates', models.CharField(db_index=True, max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('chain_restaurants', models.ManyToManyField(to='restaurants.chainrestaurant')),
                ('restaurants', models.ManyToManyField(to='restaurants.restaurant')),
            ],
        ),
    ]
