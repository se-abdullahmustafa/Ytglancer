const getAppEnvironment = () => {
  // App environment should be set in .env (copied from .env.example)
  // Defaults to local if not configured
  return process.env.NEXT_PUBLIC_APP_ENV || "local";
};

const getApiUrl = () => {
  // 1. Highest priority: explicit public API URL
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // 2. Fallback based on environment flag
  const environment = getAppEnvironment();

  if (environment === "production") {
    return "http://api.rajag.site";
  }

  if (environment === "staging") {
    return "https://staging.api.rajag.site";
  }

  // 3. Default to local development
  return "http://localhost:8001";
};

const constants = {
  // API Configuration
  apiUrl: getApiUrl(),

  // Environment Information
  environment: getAppEnvironment(),
  isProduction: process.env.NODE_ENV === "production",

  // App Configuration
  appName: "YtGlancer",
  version: "0.1.0",

  // Timeouts and Limits
  apiTimeout: 10000,
  maxRetries: 3,

  // Pagination
  defaultPageSize: 20,
  maxPageSize: 100,
};

export default constants;
