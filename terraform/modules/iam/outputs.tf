output "instance_profile_name" {
  description = "Nome do Instance Profile"
  value       = aws_iam_instance_profile.ec2.name
}

output "instance_profile_arn" {
  description = "ARN do Instance Profile"
  value       = aws_iam_instance_profile.ec2.arn
}

output "role_name" {
  description = "Nome da IAM Role"
  value       = aws_iam_role.ec2.name
}

output "role_arn" {
  description = "ARN da IAM Role"
  value       = aws_iam_role.ec2.arn
}
