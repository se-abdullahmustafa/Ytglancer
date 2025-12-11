const getAppEnvironment = () => {
  // App environment should be set in .env (copied from .env.example)
  // Defaults to local if not configured
  return process.env.NEXT_PUBLIC_APP_ENV || "local";
};

const getApiUrl = () => {
  // Determine API URL based on environment
  const environment = getAppEnvironment();
  if (environment === "production") {
    return "http://api.rajag.site";
  }

  // Default to local development
  return "http://localhost:8000";
};

const constants = {
  // API Configuration
  apiUrl: getApiUrl(),

  // Environment Information
  environment: getAppEnvironment(),

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
