import type { ExpoConfig } from "expo/config";

export default (): ExpoConfig => {
  const base = require("./app.json").expo as ExpoConfig;

  const SUPABASE_URL =
    process.env.SUPABASE_URL || base.extra?.supabaseUrl || "";
  const SUPABASE_ANON_KEY =
    process.env.SUPABASE_ANON_KEY || base.extra?.supabaseAnonKey || "";

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("⚠️ Supabase environment variables are missing.");
  }

  return {
    ...base,
    extra: {
      ...(base.extra || {}),
      supabaseUrl: SUPABASE_URL,
      supabaseAnonKey: SUPABASE_ANON_KEY,
    },
  };
};
