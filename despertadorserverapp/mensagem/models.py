from django.db import models

# Create your models here.
class Mensagem(models.Model):
    texto = models.CharField(max_length=200, blank=False, null=False)

    def __str__(self):
        return self.texto

    def __unicode__(self):
        return 
