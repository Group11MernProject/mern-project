import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { config } from './config.js';
import { authRouter } from './routes/auth.js';
import { mealPlansRouter } from './routes/mealPlans.js';
import { recipesRouter } from './routes/recipes.js';
import { swaggerSpec } from './swagger.js';

export const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
}));
app.use(cors({ origin: config.clientUrl.split(',').map((origin) => origin.trim()), credentials: true }));
app.use(express.json({ limit: '64kb' }));
if (config.env !== 'test') app.use(morgan('tiny'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'platepilot-api', timestamp: new Date().toISOString() }));
app.use('/api/auth', authRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/meal-plans', mealPlansRouter);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'PlatePilot API' }));
app.get('/api/openapi.json', (_req, res) => res.json(swaggerSpec));

if (config.env === 'production') {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const clientDist = path.resolve(currentDir, '../../client/dist');
  app.use('/assets', express.static(path.join(clientDist, 'assets'), { maxAge: '1y', immutable: true }));
  app.use(express.static(clientDist, { maxAge: '1h' }));
  app.get('/{*splat}', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    return res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use((req, res) => res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} was not found.` }));
app.use((error, _req, res, _next) => {
  if (config.env !== 'test') console.error(error);
  return res.status(error.status || 500).json({ message: error.status ? error.message : 'Something went wrong on our side.' });
});
