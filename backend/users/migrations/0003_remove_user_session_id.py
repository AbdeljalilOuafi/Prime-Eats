# Generated by Django 5.1 on 2024-12-27 21:13

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_user_session_id'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='session_id',
        ),
    ]
