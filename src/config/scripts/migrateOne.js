import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../db.js';
import { logger } from '../../core/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run(){
  const file = process.argv[2];
  if(!file){
    console.error('Usage: node src/config/scripts/migrateOne.js <migration-filename.sql>');
    process.exit(1);
  }
  const migrationsDir = path.join(__dirname,'..','migrations');
  const fullPath = path.join(migrationsDir, file);
  if(!fs.existsSync(fullPath)){
    console.error('Migration file not found:', fullPath);
    process.exit(1);
  }
  const sql = fs.readFileSync(fullPath,'utf8');
  logger.info(`Running single migration ${file}`);
  try {
    await pool.query(sql);
    logger.info('Migration applied');
  } catch(e){
    logger.error(e, 'Migration failed');
    process.exit(1);
  } finally {
    await pool.end();
  }
}
run();
