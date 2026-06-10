# CI/CD — GitHub Actions + Terraform + ECR Deploy

## Pipeline de Deploy da Aplicação

```yaml
# .github/workflows/deploy.yml
name: Deploy FittNutri

on:
  push:
    branches: [main, aws]

env:
  AWS_REGION: us-east-1
  ECR_ACCOUNT: ${{ secrets.AWS_ACCOUNT_ID }}
  ASG_NAME: fittnutri-asg

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to ECR
        id: ecr-login
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push backend
        run: |
          cd backend
          docker build -t ${{ env.ECR_ACCOUNT }}.dkr.ecr.${{ env.AWS_REGION }}.amazonaws.com/fittnutri-backend:latest .
          docker push ${{ env.ECR_ACCOUNT }}.dkr.ecr.${{ env.AWS_REGION }}.amazonaws.com/fittnutri-backend:latest

      - name: Build and push frontend
        run: |
          cd frontend
          docker build -t ${{ env.ECR_ACCOUNT }}.dkr.ecr.${{ env.AWS_REGION }}.amazonaws.com/fittnutri-frontend:latest .
          docker push ${{ env.ECR_ACCOUNT }}.dkr.ecr.${{ env.AWS_REGION }}.amazonaws.com/fittnutri-frontend:latest

      - name: Trigger ASG Instance Refresh
        run: |
          aws autoscaling start-instance-refresh \
            --auto-scaling-group-name ${{ env.ASG_NAME }} \
            --preferences '{"MinHealthyPercentage":50}'
```

## Pipeline de Infraestrutura

```yaml
# .github/workflows/infra.yml
name: Terraform

on:
  push:
    branches: [main]
    paths: ['terraform/**']
  pull_request:
    paths: ['terraform/**']

env:
  TF_VERSION: 1.7.0
  AWS_REGION: us-east-1

jobs:
  plan:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
      pull-requests: write

    steps:
      - uses: actions/checkout@v4

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}

      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}

      - name: Terraform Init
        working-directory: terraform/environments/prod
        run: terraform init

      - name: Terraform Plan
        working-directory: terraform/environments/prod
        run: terraform plan -no-color -out=tfplan

      - name: Comment PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const output = `#### Terraform Plan
            \`\`\`
            ${process.env.PLAN}
            \`\`\``;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: output
            })

  apply:
    needs: plan
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}

      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}

      - name: Terraform Apply
        working-directory: terraform/environments/prod
        run: |
          terraform init
          terraform apply -auto-approve
```

## Terraform Backend (S3 + DynamoDB)

```hcl
# terraform/environments/prod/backend.tf
terraform {
  backend "s3" {
    bucket         = "fittnutri-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "fittnutri-terraform-locks"
    encrypt        = true
  }
}
```

Criar o bucket e tabela antes do primeiro uso:
```bash
aws s3 mb s3://fittnutri-terraform-state --region us-east-1
aws s3api put-bucket-versioning --bucket fittnutri-terraform-state --versioning-configuration Status=Enabled
aws dynamodb create-table --table-name fittnutri-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST --region us-east-1
```