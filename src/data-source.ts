import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
});