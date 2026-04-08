# GFHS Aviation GSE Management System - AWS Deployment Guide

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Node.js 18+ installed
4. PostgreSQL client for database setup

## Step-by-Step Deployment

### 1. Database Setup (Amazon RDS)

\`\`\`bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier gfhs-aviation-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username admin \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name your-subnet-group \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00"
\`\`\`

### 2. Run Database Migrations

\`\`\`bash
# Connect to RDS and run schema
psql -h your-rds-endpoint.rds.amazonaws.com -U admin -d postgres -f scripts/001-create-tables.sql
\`\`\`

### 3. Setup Cognito User Pool

\`\`\`bash
# Create user pool
aws cognito-idp create-user-pool \
  --pool-name gfhs-aviation-users \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true}" \
  --auto-verified-attributes email \
  --mfa-configuration OPTIONAL
\`\`\`

### 4. Configure Environment Variables

Create `.env.production`:

\`\`\`env
# Database
DATABASE_HOST=your-rds-endpoint.rds.amazonaws.com
DATABASE_PORT=5432
DATABASE_NAME=gfhs_aviation
DATABASE_USER=admin
DATABASE_PASSWORD=your_secure_password

# AWS
AWS_REGION=ap-south-1
AWS_S3_BUCKET=gfhs-aviation-files
AWS_SES_REGION=ap-south-1
AWS_SES_FROM_EMAIL=noreply@yourdomain.com

# Cognito
NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-south-1_xxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxx

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
\`\`\`

### 5. Deploy to AWS Amplify

\`\`\`bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
\`\`\`

### 6. Setup CloudWatch Alarms

\`\`\`bash
# CPU Utilization alarm
aws cloudwatch put-metric-alarm \
  --alarm-name gfhs-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
\`\`\`

### 7. Configure Backup

\`\`\`bash
# Enable automated backups
aws backup create-backup-plan \
  --backup-plan file://backup-plan.json
\`\`\`

## Post-Deployment

1. Create 24 user accounts (one per station)
2. Configure email templates in SES
3. Setup CloudWatch dashboards
4. Configure WAF rules
5. Enable AWS Shield for DDoS protection
6. Setup Route 53 for custom domain

## Monitoring

- CloudWatch Logs: `/aws/amplify/gfhs-aviation`
- RDS Performance Insights: Enabled
- X-Ray Tracing: Enabled for API routes

## Backup & Recovery

- Automated daily backups at 3 AM IST
- 7-day retention period
- Point-in-time recovery enabled
- Cross-region backup replication (optional)

## Security Checklist

- [ ] Enable MFA for all admin users
- [ ] Configure VPC security groups
- [ ] Enable encryption at rest (RDS, S3)
- [ ] Enable encryption in transit (SSL/TLS)
- [ ] Configure WAF rules
- [ ] Setup CloudTrail for audit logging
- [ ] Enable GuardDuty for threat detection
- [ ] Configure Secrets Manager for credentials
