#!/bin/zsh

# Define the mapping of service_name to directory
declare -A service_to_dir
service_to_dir=(
    [AUTH]="./services/authentication"
    [USER]="./services/user"
    [FRIEND]="./services/friend"
    [GATEWAY_WEB]="./services/gateway-web"
    # Add more mappings as needed
)

# Initialize an empty string to accumulate the --from-literal commands
literal_commands=""

# Process each service
for service in "${(@k)service_to_dir}"; do
    dir="${service_to_dir[$service]}"
    env_file="$dir/.env"
    
    # Check if .env file exists for the service
    if [[ -f $env_file ]]; then
        echo "Processing $service from $env_file"

        # Look for RABBIT_USER and RABBIT_PASS specific to the service name
        while IFS="=" read -r key value; do
            if [[ $key == "${service}_RABBIT_USER" || $key == "${service}_RABBIT_PASSWORD" ]]; then
                literal_commands="${literal_commands}
--from-literal=$key=$value"
            fi
        done < $env_file
    else
        echo "Warning: No .env file found for $service at $env_file"
    fi
done

# Now, generate the kubectl command for rabbitmq-secret
output_file="rabbitmq_secret_command.sh"
: > $output_file

echo "kubectl create secret generic rabbitmq-secret ${literal_commands}" >> $output_file

echo "Generated kubectl command for rabbitmq-secret in $output_file"