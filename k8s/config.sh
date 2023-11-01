source ../generated_commands.sh
source ../rabbitmq_secret_command.sh 
kubectl create configmap rabbitmq-startup-script --from-file=startup.sh=./rabbit.sh 
kubectl apply -f ./redis-deployment.yaml 
kubectl apply -f ./rabbitmq-deployment.yaml 
kubectl apply -f ./auth-deployment.yaml