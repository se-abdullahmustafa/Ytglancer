const getApiUrl = () => {
  // Use environment variable if set, otherwise fall back to defaults
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Fallback logic based on environment
  if (process.env.NEXT_PUBLIC_APP_ENV === "local") {
    return "http://localhost:8000";
  }
  if (process.env.NEXT_PUBLIC_APP_ENV === "production") {
    return "https://api.rajag.site";
  }

  // Default to local if no environment is set
  return "http://localhost:8000";
};

const getAppEnvironment = () => {
  return process.env.NEXT_PUBLIC_APP_ENV || "local";
};

const isLocal = () => {
  return process.env.NEXT_PUBLIC_APP_ENV === "local";
};

const isProduction = () => {
  return process.env.NEXT_PUBLIC_APP_ENV === "production";
};

const constants = {
  // API Configuration
  apiUrl: getApiUrl(),

  // Environment Information
  environment: getAppEnvironment(),
  isLocal: isLocal(),
  isProduction: isProduction(),

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
