export interface AppConfig {
  API_URL: string;
}

let appConfig: AppConfig | null = null;

/**
 * Loads runtime configuration from /config.json.
 * Cache-busting query parameter ensures the browser does not cache stale configuration.
 */
export async function loadAppConfig(): Promise<AppConfig> {
  if (appConfig) {
    return appConfig;
  }

  try {
    const configUrl = `${import.meta.env.BASE_URL}config.json?v=${Date.now()}`;
    const response = await fetch(configUrl, {
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to load config.json: HTTP ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || typeof data.API_URL !== 'string' || !data.API_URL.trim()) {
      throw new Error('Invalid config.json: "API_URL" must be a non-empty string');
    }

    appConfig = {
      API_URL: data.API_URL.trim(),
    };

    return appConfig;
  } catch (error) {
    console.error('Error loading runtime app config from /config.json:', error);
    throw error;
  }
}

/**
 * Synchronous getter for the loaded configuration.
 * Must be called after loadAppConfig() has completed.
 */
export function getAppConfig(): AppConfig {
  if (!appConfig) {
    throw new Error('AppConfig has not been initialized. Ensure loadAppConfig() is called before getAppConfig().');
  }
  return appConfig;
}

/**
 * Helper to get the API base URL from runtime configuration.
 */
export function getApiUrl(): string {
  return getAppConfig().API_URL;
}
