#!/bin/bash

rabbitmq-server -detached

# Wait for RabbitMQ to initialize
while ! rabbitmqctl status; do
  sleep 1
done

SERVICES=("AUTH" "USER" "GATEWAY_WEB")

declare -A SERVICE_CONFIGURE_MAPPING
declare -A SERVICE_WRITE_MAPPING
declare -A SERVICE_READ_MAPPING

SERVICE_CONFIGURE_MAPPING["AUTH"]="^(auth-exchange|user-events)$"
SERVICE_WRITE_MAPPING["AUTH"]="^(auth-exchange|user-events)$"
SERVICE_READ_MAPPING["AUTH"]="^(auth-exchange|gateway-exchange|user-events)$"

SERVICE_CONFIGURE_MAPPING["USER"]="^(user-events|user\.created|user\.update-profile)$"
SERVICE_WRITE_MAPPING["USER"]="^(user-events|user\.created|user\.update-profile)$"
SERVICE_READ_MAPPING["USER"]="^(user-events|user\.created|user\.update-profile)$"

SERVICE_CONFIGURE_MAPPING["GATEWAY_WEB"]="^(gateway-exchange|auth\.token)$"
SERVICE_WRITE_MAPPING["GATEWAY_WEB"]="^(gateway-exchange|auth\.token|user-events)$"
SERVICE_READ_MAPPING["GATEWAY_WEB"]="^(gateway-exchange|auth-exchange|auth\.token)$"

for SERVICE in "${SERVICES[@]}"; do
  # Read service-specific RabbitMQ credentials from Kubernetes secrets
  RABBIT_USER=$(cat /etc/secrets/${SERVICE}_RABBIT_USER)
  RABBIT_PASSWORD=$(cat /etc/secrets/${SERVICE}_RABBIT_PASSWORD)

  # Create RabbitMQ user and set permissions
  rabbitmqctl add_user $RABBIT_USER $RABBIT_PASSWORD

  CONFIGURE=${SERVICE_CONFIGURE_MAPPING[$SERVICE]}
  WRITE=${SERVICE_WRITE_MAPPING[$SERVICE]}
  READ=${SERVICE_READ_MAPPING[$SERVICE]}

  rabbitmqctl set_permissions -p / $RABBIT_USER "$CONFIGURE" "$WRITE" "$READ"
done

tail -f /dev/stdout