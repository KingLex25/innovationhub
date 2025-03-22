import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from '../shared/schema';

// Configure neon to use WebSockets to avoid closing connection
neonConfig.fetchConnectionCache = true;

// Use the DATABASE_URL environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create a SQL function for queries
export const sql = neon(connectionString);

// Create the Drizzle ORM client with our schema
export const db = drizzle(sql, { schema });