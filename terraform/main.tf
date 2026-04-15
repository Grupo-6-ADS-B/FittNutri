# ============================================================
# FittNutri — Orquestrador Terraform
# Uso: terraform plan -var-file="contas/faculdade.tfvars"
# ============================================================

# ─── NETWORKING ───
module "networking" {
  source = "./modules/networking"

  project             = var.project
  environment         = var.environment
  vpc_cidr            = var.vpc_cidr
  azs                 = var.azs
  public_subnet_cidrs = var.public_subnet_cidrs
  tags                = local.common_tags
}

# ─── SECURITY ───
module "security" {
  source = "./modules/security"

  project           = var.project
  environment       = var.environment
  vpc_id            = module.networking.vpc_id
  vpc_cidr          = module.networking.vpc_cidr
  ssh_allowed_cidrs = var.ssh_allowed_cidrs
  tags              = local.common_tags
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

# ─── IAM — Condicional ───
module "iam" {
  source = "./modules/iam"
  count  = var.enable_iam ? 1 : 0

  project       = var.project
  environment   = var.environment
  s3_bucket_arn = var.enable_s3 ? module.storage[0].bucket_arn : ""
  tags          = local.common_tags
}

# ─── COMPUTE (EC2 + EIP) ───
module "compute" {
  source = "./modules/compute"

  project              = var.project
  environment          = var.environment
  ami_id               = local.resolved_ami_id
  instance_type        = var.instance_type
  key_name             = var.key_name
  subnet_id            = module.networking.public_subnet_ids[0]
  security_group_ids   = [module.security.ec2_sg_id]
  iam_instance_profile = var.enable_iam ? module.iam[0].instance_profile_name : ""
  volume_size          = var.volume_size
  ebs_encrypted        = var.enable_ebs_encryption
  tags                 = local.common_tags

  user_data = templatefile("${path.module}/modules/compute/user-data.sh.tpl", {
    project    = var.project
    aws_region = var.aws_region
    git_repo   = var.git_repo
    git_branch = var.git_branch
    domain     = var.domain
    app_email  = var.app_email
  })
}
