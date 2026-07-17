import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDir, '../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/platepilot',
  jwtSecret: process.env.JWT_SECRET || 'development-only-secret-change-me',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:5173',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  enableDemoLogin: process.env.ENABLE_DEMO_LOGIN !== 'false',
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'PlatePilot <hello@platepilot.app>'
  }
};
