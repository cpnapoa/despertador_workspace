# despertador_workspace
Obs.: Contem os projetos do aplicativo react native e do servidor django. Refeito, devido a erros no anterior.

Instalar o python, seguindo o artigo: https://www.python.org/about/gettingstarted/
Instalar VSCode
Instalar git
Instalar o react-native e o emulador Android, seguindo o arquivo: Instruções_Instalacao_React-Native-Linux.txt

As linhas iniciadas por "=>" são comandos a serem executados no terminal ou ações manuais.

1. Baixar os projetos React-Native e Python do repositório no GitHub, com os seguintes comandos:
	=> git clone https://github.com/cpnapoa/despertador_workspace.git

2. Abrir a workspace no Visual Studio Code (VSCode): 
	=> Abrir o VSCode (no Linux digitar "code") 
	=> Menu "File > Open Workspace", abrir o arquivo localizado em ...\despertadorapp_workspace\despertadorapp_workspace.code-workspace

3. Preparar o ambiente para começar a desenvolver:
	
	Acessar o terminal de comandos (no windows, usar o prompt de comandos (cmd), não usar o PowerShell)
	
	3.1 Baixar os módulos Node do React-Native:
   		=> npm install

	3.2 Criar o virtual environment do python e baixar os pacotes necessários, na pasta do repositório:
	
		=> cd despertadorapp_workspace/despertadorserverapp

		No Linux:
		=> sudo apt-get install python3-venv
		=> python3 -m venv .venv
		=> . .venv/bin/activate

		No Windows no prompt cmd:
		=> python.exe -m venv .venv
		=> .venv\Scripts\Activate.bat

		Seguir com os comandos de instalação dos pacotes Django e suas dependencias:
			Obs.: no Linux usar o "sudo" se solicitar no inicio dos comandos.
		
		=> pip install django
		=> pip install djangorestframework
		=> pip install markdown
		=> pip install django-filter
		=> pip install python-decouple
		=> pip install dj-database-url

		Criar as definições de banco de dados:
		=> python manage.py makemigrations
		=> python manage.py migrate

		Criar o usuario administrador:
		=> python3 manage.py createsuperuser
			No Windows: usar python.exe no lugar de python3
		=> User: admin
		=> Password: 123456
		=> Confirmar o cadastro da senha fraca: Y

		Rodar o servidor do Django local:
		Descobrir o IP local:
		No Linux:
			=> ifconfig 
		No Windows: 
			=> ipconfig
		
		Autorizar o IP no servidor do Django:
			=> No VSCode, abrir o arquivo despertadorserverapp\despertadorserverapp\settings.py
			=> Inculir na propriedade ALLOWED_HOSTS o IP local, conforme o seguinte exemplo:
				ALLOWED_HOSTS = ['localhost', '192.168.1.118']
				
		Rodar o servidor do Django 
			=> python3 manage.py runserver <ip local>:8000
			
				No Windows: usar python.exe no lugar de python3
		
		Exemplo:
		=> python3 manage.py runserver 192.168.2.131:8000
		
		Cadastrar as mensagens no banco de dados do aplicativo, através do servidor Django:
		=> Abrir o navegador Web
		=> Acessar o endereço http://<ip local>:8000/admin
		=> Informar o usuário (admin) e senha (123456) cadastrados com o createsuperuser
		=> Cadastrar mensagens.

5. Emulador Android:

	4.1 Criar um emulador (este item rodar apenas a primeira vez):
		=> Abrir o Android Studio.
		=> Acessar Configure -> AVD Manager.
		=> Clicar em Create Virtual Device (embaixo à esquerda).
		=> Selecionar preferencialmente o Pixel 2, com a Play Store.
		=> Selecionar o Android Pie 28 (ABI x86).
		=> Next e Finish.
		
		Depois de criado, o mesmo deve aparecer na lista do etapa seguinte (4.2).
				
	4.2 Para executar o emulador:
		=> Abrir um novo terminal.
		=> emulator -list-avds
		=> emulator -avd <Nome do emulador que aparece na lista> -dns-server 8.8.8.8
	
6. Rodar o projeto React-Native no emulador:

	5.1 Descobrir o IP local:
		No Linux:
			=> ifconfig 
		No Windows: 
			=> ipconfig
		
		Configurar o IP local do Django no aplicativo:
			=> No VSCode, abrir o arquivo despertadorapp\src\Util.js
			=> Substituir o IP existente pelo da maquina local. Exemplo:
				domain = '192.168.1.118:8000';

	5.2 Apenas no Linux, configurar arquivos (apenas a primeira vez):
		=> Abrir um novo terminal.
		=> cd despertadorapp_workspace/despertadorapp/android
		
		Mudar as permissões do arquivo gradlew:
		=> chmod 755 gradlew

		Criar arquivo de propriedades "local.properties" com o seguinte conteúdo:
			sdk.dir = /home/USERNAME/Android/Sdk

	5.3 Baixar os pacotes de dependencias do projeto:
	
	=> cd despertador_workspace/despertadorapp
	
	Baixar as dependencias para navegação entre telas:
	=> npm install react-navigation react-native-gesture-handler react-native-reanimated react-native-screens --save
	=> npm install react-navigation-stack --save
	=> npm install react-native-safe-area-context --save
	=> npm install @react-native-community/masked-view --save
	
	Baixar as dependencias para rotina de armazenamento local:
	=> npm install @react-native-community/async-storage --save 
	
	Baixar as dependencias para ícones:
	=> npm install react-native-vector-icons --save
	
	Baixar as dependencias para notificações:
	=> npm install react-native-push-notification --save
	
	5.4 Apenas no Linux, iniciar o serviço Metro do Node (no windows este serviço inicia automaticamente).
		=> Abrir um novo terminal.
		=> cd despertadorapp_workspace/despertadorapp/
		=> sudo npm install -g npx
		=> sudo react-native start (apenas no Linux)
		
	5.5 Executar o projeto do app no emulador que está rodando:
		=> Abrir um novo terminal.
		=> cd despertadorapp_workspace/despertadorapp/
		=> sudo react-native run-android  *Obs.: A primeira vez demora mais.
		
		A partir daqui o aplicativo está funcionando e deve mostrar as mensagens cadastradas no servidor através do Djando Admin.
