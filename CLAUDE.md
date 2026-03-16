# FittNutri Project Context

This repository contains the FittNutri system.

It is a SaaS platform for nutritionists to manage patients, diets, and anthropometric data.

## Architecture

The system follows a three-tier architecture:

Frontend:
React + Vite

Backend:
Spring Boot REST API

Database:
MySQL

Reverse Proxy:
Nginx

Infrastructure:
Docker + Docker Compose

## Key Features

- Patient management
- Diet planning
- Appointment scheduling
- Anthropometric data tracking
- PDF generation
- File storage using AWS S3

## Development Guidelines

Always explain changes before modifying code.

Prefer small incremental changes.

Follow existing project structure.

Avoid breaking existing features.

## Language Policy

IMPORTANT:

All responses MUST be written in Brazilian Portuguese.

Even when analyzing code, generating plans, or technical documentation.

Never respond in English unless the user explicitly requests English.

If technical terms appear in English (API, endpoint, database), explain them in Portuguese.

## Language Rules

All responses must be written in Brazilian Portuguese.

Never respond in English unless explicitly requested.

Explain concepts clearly for a software engineering student.

## AI Behavior Rules

Before implementing any feature:

1. Analyze the repository
2. Propose a plan
3. Wait for approval
4. Implement step by step

## Tech Stack Details

Backend:
- Spring Boot 3 / Java 21
- Spring Security + JWT
- JPA + Hibernate
- RabbitMQ (async PDF generation)
- AWS SDK (S3, Secrets Manager)

Infrastructure:
- AWS ALB + ASG + RDS MySQL + ECR + Amazon MQ
- Docker + ECR para deploy

## Current Branch Strategy

- `main` → produção
- `dev` → integração
- `aws` → infraestrutura AWS (branch atual de trabalho)

## Security Skills

Available skills:
- `security-owasp` → OWASP Top 10 analysis

## Important Conventions

- Profiles Spring: `local` (H2) e `prod` (MySQL + RabbitMQ + S3)
- Secrets via AWS Secrets Manager em produção
- Nunca commitar credenciais ou .env