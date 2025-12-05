import Constants from 'expo-constants';

type EnvKey =
  | 'EXPO_PUBLIC_SUPABASE_URL'
  | 'EXPO_PUBLIC_SUPABASE_ANON_KEY'
  | 'EXPO_PUBLIC_API_URL';

type EnvOptions = {
  required?: boolean;
  fallback?: string;
};

type ExtraMap = Partial<Record<EnvKey, string | undefined>>;

const legacyManifest = Constants?.manifest as
  | { extra?: ExtraMap }
  | null
  | undefined;

const manifestExtra =
  ((Constants?.expoConfig?.extra as ExtraMap | undefined) ??
    legacyManifest?.extra ??
    {}) as ExtraMap;

const STATIC_FALLBACKS: ExtraMap = {
  EXPO_PUBLIC_SUPABASE_URL:
    manifestExtra.EXPO_PUBLIC_SUPABASE_URL ??
    'https://iranxjzqzoknigoskdkn.supabase.co',
  EXPO_PUBLIC_SUPABASE_ANON_KEY:
    manifestExtra.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyYW54anpxem9rbmlnb3NrZGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MzUwMjYsImV4cCI6MjA3MzExMTAyNn0.zE7Bzd_6-gZLixFqbeYnXnSN09jPocCfMCNixJlfJ5A',
  EXPO_PUBLIC_API_URL:
    manifestExtra.EXPO_PUBLIC_API_URL ?? 'http://10.89.34.1:4000',
};

function readEnv(key: EnvKey, options: EnvOptions = {}) {
  const value =
    process.env[key] ??
    manifestExtra[key] ??
    STATIC_FALLBACKS[key] ??
    options.fallback;

  if (options.required !== false && !value) {
    console.warn(
      `[config] Missing optional environment variable ${key}. ` +
        `Add it to your Expo config (.env / app.config) to customize this value.`
    );
  }

  return value ?? null;
}

export const appConfig = {
  supabaseUrl: readEnv('EXPO_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: readEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  apiBaseUrl: readEnv('EXPO_PUBLIC_API_URL', { required: false }),
} as const;

export function assertApiBaseUrl() {
  if (!appConfig.apiBaseUrl) {
    throw new Error(
      '[config] EXPO_PUBLIC_API_URL is not configured. ' +
        'Set it before attempting to call backend endpoints.'
    );
  }
}

