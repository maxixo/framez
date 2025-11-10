import fs from 'fs';
import path from 'path';
import type { ExpoConfig } from 'expo/config';

function loadEnvLocal(filePath: string): Record<string, string> {
  const env: Record<string, string> = {};
  if (!fs.existsSync(filePath)) return env;
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/);
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;

    // Prefer KEY=VALUE syntax
    const eq = line.indexOf('=');
    if (eq > 0) {
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
      continue;
    }

    // Also support legacy "key: value" lines for convenience
    const colon = line.indexOf(':');
    if (colon > 0) {
      const key = line.slice(0, colon).trim();
      let val = line.slice(colon + 1).trim();
      // remove leading/trailing quotes and trailing comma
      if (val.startsWith('"') || val.startsWith("'")) val = val.slice(1);
      val = val.replace(/[,'\"]+$/g, '');
      env[key] = val;
    }
  }
  return env;
}

export default (): ExpoConfig => {
  const base = require('./app.json').expo as ExpoConfig;
  const envPath = path.resolve(__dirname, '.env.local');
  const env = loadEnvLocal(envPath);

  const SUPABASE_URL = env.SUPABASE_URL || env.supabaseUrl || process.env.SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || env.supabaseAnonKey || process.env.SUPABASE_ANON_KEY || '';

  return {
    ...base,
    extra: {
      ...(base.extra || {}),
      // Inject from environment instead of committing secrets in app.json
      supabaseUrl: SUPABASE_URL,
      supabaseAnonKey: SUPABASE_ANON_KEY,
    },
  } as ExpoConfig;
};

