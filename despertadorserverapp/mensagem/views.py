from django.shortcuts import render
from rest_framework import routers, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import mixins
from .models import Mensagem
from rest_framework.renderers import JSONRenderer
import json

class MensagemSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Mensagem
        fields = '__all__'

# ViewSets define the view behavior.
class MensagemViewSet(viewsets.ModelViewSet):
    queryset = Mensagem.objects.all()
    serializer_class = MensagemSerializer
    
    # @action(detail=False)
    # def obter(self, request):
    #     idCliente = request.query_params.getlist('idCliente')[0]
        
    #     return Response(Mensagem.obter(self, idCliente))