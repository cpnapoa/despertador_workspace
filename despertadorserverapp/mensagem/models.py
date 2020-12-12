from django.db import models
from django.core.files.uploadhandler import TemporaryFileUploadHandler

# Create your models here.
class Mensagem(models.Model, TemporaryFileUploadHandler):
    texto = models.CharField(max_length=200, blank=False, null=False)

    def __str__(self):
        return self.texto

    def __unicode__(self):
        return 

class MensagemLote(models.Model, TemporaryFileUploadHandler):
    arquivo_msg = models.FileField(null=True)

    def receive_data_chunk(self, raw_data, start):
        dados = raw_data.decode()
        ind_cadastrar = True

        if dados:
            mensagens = dados.splitlines()
            
            if mensagens:
                mensagens_cadastradas = Mensagem.objects.all()

                if mensagens_cadastradas:
                    for mensagem in mensagens:
                        if mensagem:
                            
                            mensagem = (str(mensagem).strip())
                            if len(mensagem) > 0:
                                ind_cadastrar = True
                                for mensagem_cadastrada in mensagens_cadastradas:
                                    if(mensagem_cadastrada.texto.strip().upper() == mensagem.upper()):
                                        ind_cadastrar = False
                                        break
                                if(ind_cadastrar):
                                    m_mensagem = Mensagem()
                                    m_mensagem.texto = mensagem
                                    m_mensagem.save()