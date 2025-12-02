const getApiUrl = () => {
  // Use environment variable if set, otherwise fall back to defaults
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Fallback logic based on environment
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:8000";
  }
  if (process.env.NEXT_PUBLIC_APP_ENV === "staging") {
    return "https://staging.api.rajag.site";
  }
  return "https://api.rajag.site"; // production
};

const getAppEnvironment = () => {
  return (
    process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || "development"
  );
};

const isDevelopment = () => {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_APP_ENV === "development"
  );
};

const isStaging = () => {
  return process.env.NEXT_PUBLIC_APP_ENV === "staging";
};

const isProduction = () => {
  return (
    process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_APP_ENV
  );
};

const constants = {
  // API Configuration
  apiUrl: getApiUrl(),

  // Environment Information
  environment: getAppEnvironment(),
  isDevelopment: isDevelopment(),
  isStaging: isStaging(),
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
