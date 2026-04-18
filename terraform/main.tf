# ============================================================
# FittNutri — Orquestrador Terraform (ALB + VPC segmentada)
# ============================================================

# ─── NETWORKING ───
module "networking" {
  source = "./modules/networking"

  project                         = var.project
  environment                     = var.environment
  vpc_cidr                        = var.vpc_cidr
  azs                             = var.azs
  public_subnet_cidrs             = var.public_subnet_cidrs
  private_app_subnet_cidrs        = var.private_app_subnet_cidrs
  private_db_subnet_cidrs         = var.private_db_subnet_cidrs
  private_monitoring_subnet_cidrs = var.private_monitoring_subnet_cidrs
  enable_nat_gateway              = var.enable_nat_gateway
  tags                            = local.common_tags
}

# ─── SECURITY ───
module "security" {
  source = "./modules/security"

  project     = var.project
  environment = var.environment
  vpc_id      = module.networking.vpc_id
  vpc_cidr    = module.networking.vpc_cidr
  tags        = local.common_tags
}

# ─── STORAGE (S3) — Condicional ───
module "storage" {
  source = "./modules/storage"
  count  = var.enable_s3 ? 1 : 0

  project     = var.project
  environment = var.environment
  bucket_name = local.resolved_s3_bucket
  tags        = local.common_tags
}

# ─── IAM — Condicional (NAO CRIAR NOVOS neste laboratorio) ───
module "iam" {
  source = "./modules/iam"
  count  = var.enable_iam ? 1 : 0

  project       = var.project
  environment   = var.environment
  s3_bucket_arn = var.enable_s3 ? module.storage[0].bucket_arn : ""
  tags          = local.common_tags
}

# ─── ACM — Condicional ao ALB ───
module "acm" {
  source = "./modules/acm"
  count  = var.enable_alb ? 1 : 0

  project                   = var.project
  environment               = var.environment
  domain_name               = var.acm_domain_name
  subject_alternative_names = var.acm_subject_alternative_names
  route53_zone_id           = var.route53_zone_id
  tags                      = local.common_tags
}

# ─── ALB — Condicional ───
module "alb" {
  source = "./modules/alb"
  count  = var.enable_alb ? 1 : 0

  project               = var.project
  environment           = var.environment
  vpc_id                = module.networking.vpc_id
  public_subnet_ids     = module.networking.public_subnet_ids
  alb_security_group_id = module.security.alb_sg_id
  certificate_arn       = module.acm[0].certificate_arn
  tags                  = local.common_tags
}

# ─── DATABASE (MySQL em EC2 privada dedicada) — criado ANTES do compute para expor db_private_ip ───
module "database" {
  source = "./modules/database"

  project             = var.project
  environment         = var.environment
  ami_id              = local.resolved_ami_id
  instance_type       = var.db_instance_type
  key_name            = var.key_name
  subnet_id           = module.networking.private_db_subnet_ids[0]
  security_group_ids  = [module.security.db_sg_id]
  data_volume_size    = var.db_data_volume_size
  ebs_encrypted       = var.enable_ebs_encryption
  mysql_root_password = var.app_db_password
  mysql_database      = "fittnutri"
  tags                = local.common_tags
}

# ─── FRONTEND_URL dinamico: ACM domain se disponivel, senao ALB DNS, senao private IP ───
locals {
  resolved_frontend_url = (
    var.enable_alb && var.acm_domain_name != "" ? "https://${var.acm_domain_name}" :
    var.enable_alb ? "http://${module.alb[0].alb_dns_name}" :
    "http://${module.compute.private_ip}:8080"
  )

  resolved_app_s3_bucket = (
    var.app_s3_bucket != "" ? var.app_s3_bucket :
    (var.enable_s3 ? module.storage[0].bucket_id : "")
  )
}

# ─── COMPUTE (EC2 App em subnet privada) ───
module "compute" {
  source = "./modules/compute"

  project              = var.project
  environment          = var.environment
  ami_id               = local.resolved_ami_id
  instance_type        = var.instance_type
  key_name             = var.key_name
  subnet_id            = module.networking.private_app_subnet_ids[0]
  security_group_ids   = [module.security.app_sg_id]
  iam_instance_profile = var.enable_iam ? module.iam[0].instance_profile_name : ""
  volume_size          = var.volume_size
  ebs_encrypted        = var.enable_ebs_encryption
  target_group_arn     = var.enable_alb ? module.alb[0].app_target_group_arn : ""
  target_group_port    = 8080

  # --- Parametros de aplicacao (.env) ---
  app_frontend_url   = local.resolved_frontend_url
  app_db_host        = module.database.db_private_ip
  app_db_port        = 3306
  app_db_name        = "fittnutri"
  app_db_username    = "root"
  app_db_password    = var.app_db_password
  app_jwt_secret     = var.app_jwt_secret
  app_jwt_validity   = var.app_jwt_validity
  app_aes_key        = var.app_aes_key
  app_rabbitmq_url   = var.app_rabbitmq_url
  app_s3_bucket      = local.resolved_app_s3_bucket
  app_spring_profile = var.app_spring_profile

  tags = local.common_tags

  user_data = templatefile("${path.module}/modules/compute/user-data.sh.tpl", {
    # infra
    project    = var.project
    aws_region = var.aws_region
    git_repo   = var.git_repo
    git_branch = var.git_branch
    # .env — FRONTEND_URL e db_host dinamicos
    app_frontend_url   = local.resolved_frontend_url
    app_db_host        = module.database.db_private_ip
    app_db_port        = 3306
    app_db_name        = "fittnutri"
    app_db_username    = "root"
    app_db_password    = var.app_db_password
    app_jwt_secret     = var.app_jwt_secret
    app_jwt_validity   = var.app_jwt_validity
    app_aes_key        = var.app_aes_key
    app_rabbitmq_url   = var.app_rabbitmq_url
    app_s3_bucket      = local.resolved_app_s3_bucket
    app_spring_profile = var.app_spring_profile
  })
}

# ─── MONITORING (Prometheus + Grafana em EC2 dedicada) ───
module "monitoring" {
  source = "./modules/monitoring"
  count  = var.enable_monitoring ? 1 : 0

  project                  = var.project
  environment              = var.environment
  ami_id                   = local.resolved_ami_id
  instance_type            = "t3.micro"
  key_name                 = var.key_name
  subnet_id                = module.networking.private_monitoring_subnet_ids[0]
  security_group_ids       = [module.security.monitoring_sg_id]
  ebs_encrypted            = var.enable_ebs_encryption
  app_private_ip           = module.compute.private_ip
  grafana_admin_user       = var.grafana_admin_user
  grafana_admin_password   = var.grafana_admin_password
  grafana_target_group_arn = var.enable_alb ? module.alb[0].grafana_target_group_arn : ""
  tags                     = local.common_tags
}
