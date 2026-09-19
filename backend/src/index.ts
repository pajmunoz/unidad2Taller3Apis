import 'dotenv/config';
import type { Server } from 'node:http';
import { createApp } from './app.js';
import {
  connectDatabase,
  disconnectDatabase,
} from './infrastructure/database/mongoose/connection.js';
import { MongooseEmployeeRepository } from './infrastructure/repositories/MongooseEmployeeRepository.js';

const port = Number(process.env.PORT ?? 3000);
let server: Server | undefined;

const start = async (): Promise<void> => {
  await connectDatabase();
  const employeeRepository = new MongooseEmployeeRepository();
  const app = createApp(employeeRepository);

  server = app.listen(port, () => {
    console.log(`🚀 [Server]: http://localhost:${port}`);
  });
};

const shutdown = async (signal: string): Promise<void> => {
  console.log(`\n${signal} recibido. Cerrando el servidor...`);
  server?.close();
  await disconnectDatabase();
  process.exit(0);
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

start().catch(() => {
  process.exit(1);
});
