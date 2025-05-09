# Generated by Django 5.2 on 2025-04-10 13:43

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0002_rename_updated_at_service_last_updated_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='service',
            name='last_updated',
        ),
        migrations.AddField(
            model_name='service',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='service',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AlterField(
            model_name='service',
            name='status',
            field=models.CharField(choices=[('operational', 'Operational'), ('degraded', 'Degraded Performance'), ('partial_outage', 'Partial Outage'), ('major_outage', 'Major Outage')], default='operational', max_length=20),
        ),
    ]
