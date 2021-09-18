# Instalar Serverless Framework
npm i -g serverless

# Inicializar
sls

# Sempre fazer deploy antes de começar a desenvolver para garantir que o ambiente está funcionando
sls deploy

# Invocar na AWS
sls invoke -f hello

# Invocar local
sls invoke local -f hello --log

# Abre listener de eventos de uma função (logs)
sls logs -f hello -t

# Deletar tudo que foi criado pelo Serverless Framework
sls remove