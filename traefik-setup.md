# Traefik Configuration

## Create acme.json file
```bash
touch traefik/acme.json
chmod 600 traefik/acme.json
```

## acme.json content (initially empty)
```json
{}
```

## Deploy Traefik
```bash
# Create external network
docker network create proxy

# Deploy Traefik
docker-compose -f traefik-shared.yml up -d

# Check Traefik dashboard
# http://your-server-ip:8080
```