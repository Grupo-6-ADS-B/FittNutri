# ─── VPC ───
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = merge(var.tags, {
    Name = "${var.project}-vpc-${var.environment}"
  })
}

# ─── INTERNET GATEWAY ───
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(var.tags, {
    Name = "${var.project}-igw-${var.environment}"
  })
}

# ─── SUBNETS PÚBLICAS ───
resource "aws_subnet" "public" {
  count                   = length(var.azs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.azs[count.index]
  map_public_ip_on_launch = true

  tags = merge(var.tags, {
    Name = "${var.project}-public-${substr(var.azs[count.index], -2, 2)}-${var.environment}"
    Tier = "public"
  })
}

# ─── SUBNETS PRIVADAS — APP ───
resource "aws_subnet" "private_app" {
  count             = length(var.private_app_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_app_subnet_cidrs[count.index]
  availability_zone = var.azs[count.index]

  tags = merge(var.tags, {
    Name = "${var.project}-private-app-${substr(var.azs[count.index], -2, 2)}-${var.environment}"
    Tier = "private-app"
  })
}

# ─── SUBNETS PRIVADAS — DB ───
resource "aws_subnet" "private_db" {
  count             = length(var.private_db_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_db_subnet_cidrs[count.index]
  availability_zone = var.azs[count.index]

  tags = merge(var.tags, {
    Name = "${var.project}-private-db-${substr(var.azs[count.index], -2, 2)}-${var.environment}"
    Tier = "private-db"
  })
}

# ─── SUBNET PRIVADA — MONITORING ───
resource "aws_subnet" "private_monitoring" {
  count             = length(var.private_monitoring_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_monitoring_subnet_cidrs[count.index]
  availability_zone = var.azs[count.index % length(var.azs)]

  tags = merge(var.tags, {
    Name = "${var.project}-private-monitoring-${count.index + 1}-${var.environment}"
    Tier = "private-monitoring"
  })
}

# ─── ROUTE TABLE PÚBLICA ───
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(var.tags, {
    Name = "${var.project}-public-rt-${var.environment}"
  })
}

resource "aws_route_table_association" "public" {
  count          = length(var.azs)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# ─── ELASTIC IP PARA NAT GATEWAY ───
resource "aws_eip" "nat" {
  count  = var.enable_nat_gateway ? 1 : 0
  domain = "vpc"

  tags = merge(var.tags, {
    Name = "${var.project}-nat-eip-${var.environment}"
  })

  depends_on = [aws_internet_gateway.main]
}

# ─── NAT GATEWAY (subnet publica 1a) ───
resource "aws_nat_gateway" "main" {
  count         = var.enable_nat_gateway ? 1 : 0
  allocation_id = aws_eip.nat[0].id
  subnet_id     = aws_subnet.public[0].id

  tags = merge(var.tags, {
    Name = "${var.project}-nat-${var.environment}"
  })

  depends_on = [aws_internet_gateway.main]
}

# ─── ROUTE TABLE PRIVADA (compartilhada para app, db, monitoring) ───
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  dynamic "route" {
    for_each = var.enable_nat_gateway ? [1] : []
    content {
      cidr_block     = "0.0.0.0/0"
      nat_gateway_id = aws_nat_gateway.main[0].id
    }
  }

  tags = merge(var.tags, {
    Name = "${var.project}-private-rt-${var.environment}"
  })
}

resource "aws_route_table_association" "private_app" {
  count          = length(aws_subnet.private_app)
  subnet_id      = aws_subnet.private_app[count.index].id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_db" {
  count          = length(aws_subnet.private_db)
  subnet_id      = aws_subnet.private_db[count.index].id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_monitoring" {
  count          = length(aws_subnet.private_monitoring)
  subnet_id      = aws_subnet.private_monitoring[count.index].id
  route_table_id = aws_route_table.private.id
}
