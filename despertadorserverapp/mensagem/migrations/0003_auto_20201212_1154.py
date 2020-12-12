# Generated by Django 3.1.4 on 2020-12-12 14:54

import django.core.files.uploadhandler
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mensagem', '0002_mensagem_arquivo_msg'),
    ]

    operations = [
        migrations.CreateModel(
            name='MensagemLote',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('arquivo_msg', models.FileField(null=True, upload_to='data/mensagens')),
            ],
            bases=(models.Model, django.core.files.uploadhandler.TemporaryFileUploadHandler),
        ),
        migrations.RemoveField(
            model_name='mensagem',
            name='arquivo_msg',
        ),
    ]
