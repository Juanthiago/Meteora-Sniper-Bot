import * as fs from 'fs';
import * as path from 'path';

export function ensureLogsDirectory(): void {
  const logsDir = path.join(process.cwd(), 'logs');
  
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}
