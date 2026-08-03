#!/bin/bash
set -euo pipefail
exec > /var/log/user-data-db.log 2>&1
umask 077

echo "=== FittNutri DB boot $(date) ==="

# 1. Detectar device EBS (Nitro/t3 usa NVMe, instancias antigas usam xvdf)
# Aguarda ate um dos possiveis devices aparecer
for i in $(seq 1 30); do
  if   [ -b "/dev/nvme1n1" ]; then DATA_DEV=/dev/nvme1n1; break
  elif [ -b "/dev/xvdf" ];    then DATA_DEV=/dev/xvdf;    break
  elif [ -b "${data_device}" ]; then DATA_DEV=${data_device}; break
  fi
  echo "aguardando volume EBS... ($${i}/30)"
  sleep 2
done
echo "Device detectado: $${DATA_DEV}"

if ! blkid "$${DATA_DEV}" >/dev/null 2>&1; then
  mkfs.ext4 -F "$${DATA_DEV}"
fi

# 2. Montar volume em /var/lib/mysql-data (persiste pos-reboot)
mkdir -p /var/lib/mysql-data
grep -q "$${DATA_DEV}" /etc/fstab || \
  echo "$${DATA_DEV} /var/lib/mysql-data ext4 defaults,nofail 0 2" >> /etc/fstab
mount -a

# 3. Docker guard
command -v docker >/dev/null 2>&1 || (curl -fsSL https://get.docker.com | sh)

# 4. Gravar secret em arquivo owner-only (nao expoe na ps/linha de comando)
SECRET_DIR=/etc/fittnutri
mkdir -p "$${SECRET_DIR}"
umask 077
cat > "$${SECRET_DIR}/mysql.env" <<'ENVEOF'
MYSQL_ROOT_PASSWORD=${mysql_root_password}
MYSQL_DATABASE=${mysql_database}
ENVEOF
chmod 600 "$${SECRET_DIR}/mysql.env"

# 5. Subir MySQL 8.0 usando --env-file (credenciais nunca aparecem em 'docker inspect')
docker rm -f fittnutri-mysql 2>/dev/null || true
docker run -d \
  --name fittnutri-mysql \
  --restart unless-stopped \
  -p 3306:3306 \
  -v /var/lib/mysql-data:/var/lib/mysql \
  --env-file "$${SECRET_DIR}/mysql.env" \
  mysql:8.0 \
  --default-authentication-plugin=caching_sha2_password

echo "=== MySQL up $(date) ==="
docker ps --filter name=fittnutri-mysql
