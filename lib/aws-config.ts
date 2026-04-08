// AWS Configuration for production deployment
export const awsConfig = {
  region: process.env.AWS_REGION || "ap-south-1", // Mumbai region for India
  cognito: {
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  },
  s3: {
    bucket: process.env.AWS_S3_BUCKET,
    region: process.env.AWS_S3_REGION,
  },
  ses: {
    region: process.env.AWS_SES_REGION,
    fromEmail: process.env.AWS_SES_FROM_EMAIL,
  },
  rds: {
    host: process.env.DATABASE_HOST,
    port: Number.parseInt(process.env.DATABASE_PORT || "5432"),
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  },
}

export const isProduction = process.env.NODE_ENV === "production"
export const isDevelopment = process.env.NODE_ENV === "development"
