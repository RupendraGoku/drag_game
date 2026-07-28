import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/environment.js';
import { initFileStore } from './services/fileStoreService.js';

const start = async () => {
  if (env.isFileStore) {
    await initFileStore();
    console.log('File-backed development store initialized');
  } else {
    await connectDatabase();
  }

  app.listen(env.port, () => {
    console.log(`Tier Ranking API running on port ${env.port}`);
  });
};

start().catch((error) => {
  console.error('API startup failed');
  console.error(error?.message || error);
  if (error?.name) console.error(`Error name: ${error.name}`);
  if (error?.code) console.error(`Error code: ${error.code}`);
  process.exit(1);
});
