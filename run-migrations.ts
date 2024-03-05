import { AppDataSource } from './src/data-source';

AppDataSource.initialize()
  .then(() => {
    console.log("Running migrations...");
    return AppDataSource.runMigrations();
  })
  .then(() => {
    console.log("Migrations completed successfully");
    return AppDataSource.destroy();
  })
  .catch(error => {
    console.error("Migration failed: ", error);
    process.exit(1);
  });
