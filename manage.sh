#!/bin/bash

ACTION=$1

case $ACTION in
  dev)
    echo "Subindo ambiente de desenvolvimento..."
    docker compose -f docker-compose.dev.yml --env-file .env.dev up --build
    ;;
  carga)
    # Carrega alimentos (TACO e IBGE) e dietas-modelo no MySQL do container.
    # Rode DEPOIS que o backend subiu (ele cria as tabelas). Pode repetir sem duplicar nada.
    # Uso: ./manage.sh carga            (ambiente dev, container mysql-dev)
    #      ./manage.sh carga mysql      (producao local, container mysql)
    CONTAINER=${2:-mysql-dev}
    echo "Carregando alimentos e dietas-modelo em $CONTAINER..."
    # O arquivo entra pela entrada padrao (-i), assim nao ha caminho de arquivo para o Git Bash converter
    docker exec -i "$CONTAINER" sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" --default-character-set=utf8mb4 "$MYSQL_DATABASE"' < dados/Query/carga_completa.sql || exit 1
    docker exec "$CONTAINER" sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e "SELECT fonte, COUNT(*) AS total FROM alimentos GROUP BY fonte; SELECT COUNT(*) AS dietas FROM dietas;"'
    echo "Carga concluida!"
    ;;
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
    echo "Uso: ./manage.sh {dev|carga|start|stop|restart|build|rebuild|logs [service]|status}"
    echo ""
    echo "  dev       Sobe o ambiente de desenvolvimento local (One-Command-Run)"
    echo "  carga     Carrega alimentos e dietas-modelo no banco (rode depois que o backend subiu)"
    echo "  start     Sobe containers usando docker-compose.yml (produção)"
    echo "  stop      Para todos os containers"
    echo "  restart   Reinicia os containers"
    echo "  build     Builda as imagens Docker"
    echo "  rebuild   Rebuild completo e reinicia"
    echo "  logs      Exibe logs (opcional: nome do serviço)"
    echo "  status    Mostra status dos containers, volumes e redes"
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
