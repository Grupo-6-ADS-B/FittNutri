#!/bin/bash

ACTION=$1

case $ACTION in
  start)
    echo "Subindo containers..."
    docker-compose --env-file .env up -d
    echo "Containers rodando!"
    docker ps
    ;;
  stop)
    echo "Derrubando containers..."
    docker-compose down
    echo "Containers parados!"
    ;;
  restart)
    echo "Reiniciando containers..."
    docker-compose down
    docker-compose --env-file .env up -d
    echo "Containers reiniciados!"
    docker ps
    ;;
  build)
    echo "Buildando imagens..."
    docker build -t fittnutri-backend:1.0 ./backend
    docker build -t fittnutri-frontend ./frontend
    echo "Build concluido!"
    ;;
  rebuild)
    echo "Rebuild completo e reiniciando..."
    docker-compose down
    docker build -t fittnutri-backend:1.0 ./backend
    docker build -t fittnutri-frontend ./frontend
    docker-compose --env-file .env up -d
    echo "Rebuild e restart concluidos!"
    docker ps
    ;;
  logs)
    SERVICE=$2
    if [ -z "$SERVICE" ]; then
      docker-compose logs -f
    else
      docker-compose logs -f $SERVICE
    fi
    ;;
  status)
    echo "Status dos containers:"
    docker ps
    echo "Volumes:"
    docker volume ls
    echo "Networks:"
    docker network ls
    ;;
  *)
    echo "Uso: ./manage.sh {start|stop|restart|build|rebuild|logs [service]|status}"
    ;;
esac

# Limpa imagens antigas mantendo as 2 mais recentes de cada repositorio
cleanup_images() {
  echo "Limpando imagens antigas..."
  docker image prune -f
  
  for repo in fittnutri-frontend fittnutri-backend; do
    images=$(docker images $repo --format "{{.ID}}" | tail -n +3)
    if [ ! -z "$images" ]; then
      echo "Removendo imagens antigas de $repo..."
      echo $images | xargs docker rmi -f 2>/dev/null || true
    fi
  done
  
  echo "Limpeza concluída!"
  df -h
}
