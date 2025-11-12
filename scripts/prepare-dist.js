import { rmSync, mkdirSync, cpSync, existsSync } from 'node:fs';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
if (existsSync('assets')) {
  cpSync('assets', 'dist/assets', { recursive: true });
}
