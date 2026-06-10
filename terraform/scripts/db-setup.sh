#!/bin/bash
set -euo pipefail
exec >> /var/log/user-data-db.log 2>&1

echo "=== DB setup manual $(date) ==="

DATA_DEV=/dev/sdf

for i in $(seq 1 30); do
  [ -b "$DATA_DEV" ] && break
  echo "aguardando $DATA_DEV... ($i/30)"
  sleep 2
done

blkid "$DATA_DEV" >/dev/null 2>&1  mkfs.ext4 -F "$DATA_DEV"

mkdir -p /var/lib/mysql-data
grep -q "$DATA_DEV" /etc/fstab  \
  echo "$DATA_DEV /var/lib/mysql-data ext4 defaults,nofail 0 2" >> /etc/fstab
mount -a

command -v docker >/dev/null 2>&1  (curl -fsSL https://get.docker.com/ | sh)

: "${MYSQL_ROOT_PASSWORD:?Defina MYSQL_ROOT_PASSWORD antes de executar (ex: source scripts/set-credentials.sh)}"

mkdir -p /etc/fittnutri
chmod 700 /etc/fittnutri
cat > /etc/fittnutri/mysql.env << ENVEOF
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
MYSQL_DATABASE=fittnutri
ENVEOF
chmod 600 /etc/fittnutri/mysql.env

docker rm -f fittnutri-mysql 2>/dev/null  true

docker run -d \
  --name fittnutri-mysql \
  --restart unless-stopped \
  -p 3306:3306 \
  -v /var/lib/mysql-data:/var/lib/mysql \
  --env-file /etc/fittnutri/mysql.env \
  mysql:8.0 \
  --default-authentication-plugin=caching_sha2_password

echo "=== MySQL iniciado $(date) ==="
docker ps --filter name=fittnutri-mysql