import mongoose from 'mongoose';
import { app } from './app.js';
import { config } from './config.js';

async function start() {
  await mongoose.connect(config.mongoUri);
  app.listen(config.port, () => console.info(`PlatePilot API listening on port ${config.port}`));
}

start().catch((error) => {
  console.error('PlatePilot failed to start:', error);
  process.exit(1);
});

