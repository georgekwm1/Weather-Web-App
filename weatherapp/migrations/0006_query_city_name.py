# Generated by Django 5.1.5 on 2025-01-26 21:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('weatherapp', '0005_rename_id_query_query_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='query',
            name='city_name',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
