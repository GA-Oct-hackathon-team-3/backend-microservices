#!/bin/zsh

# Define the mapping of service_name to directory
declare -A service_to_dir
service_to_dir=(
    [auth-service]="./services/authentication"
    [user-service]="./services/user"
    [friend-service]="./services/friend"
    [gateway-web]="./services/gateway-web"
    # Add more mappings as needed
)

# The output file where the generated kubectl commands will be saved
output_file="generated_commands.sh"

# Clear out any previous content in the output file
: > $output_file

# Process each service
for service in "${(@k)service_to_dir}"; do
    dir="${service_to_dir[$service]}"
    env_file="$dir/.env"
    
    # Check if .env file exists for the service
    if [[ -f $env_file ]]; then
        echo "Processing $service from $env_file"
        
        # Start the kubectl command
        cmd="kubectl create secret generic $service-secret \\"
        
        # Parse the .env file and append key-value pairs to the command
        while IFS="=" read -r key value; do
            cmd="${cmd}
--from-literal=$key=$value \\"
        done < $env_file

        # Remove the trailing \\
        cmd=${cmd%\\}
        
        # Append the command to the output file
        echo "$cmd" >> $output_file
        echo "" >> $output_file
    else
        echo "Warning: No .env file found for $service at $env_file"
    fi
done

echo "Generated kubectl commands in $output_file"