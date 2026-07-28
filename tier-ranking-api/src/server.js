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
  console.error(error);
  process.exit(1);
});
