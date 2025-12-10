import constants from "./constants";

// Base URL for the YouTube to PDF Converter API
const API_BASE_URL = constants.apiUrl || "http://localhost:8000";

// Default time interval in seconds (5 minutes)
const DEFAULT_TIME_INTERVAL = 300;

// Enable demo mode if backend is not available
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// Default request timeout in milliseconds
const DEFAULT_TIMEOUT = 30000; // 30 seconds

// Cache for storing active EventSource connections
const eventSources = new Map();

/**
 * Production-ready logger
 * @private
 */
const logger = {
  log: (message, data = null) => {
    const timestamp = new Date().toISOString();
    if (constants.isProduction) {
      console.log(`[${timestamp}] [INFO] ${message}`, data || "");
    } else {
      console.log(`[API] ${message}`, data || "");
    }
  },
  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    if (constants.isProduction) {
      console.error(`[${timestamp}] [ERROR] ${message}`, error || "");
    } else {
      console.error(`[API] ERROR: ${message}`, error || "");
    }
  },
  warn: (message, data = null) => {
    const timestamp = new Date().toISOString();
    if (constants.isProduction) {
      console.warn(`[${timestamp}] [WARN] ${message}`, data || "");
    } else {
      console.warn(`[API] WARNING: ${message}`, data || "");
    }
  },
};

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(message, statusCode, requestId, validationErrors) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.requestId = requestId;
    this.validationErrors = validationErrors;
  }
}

/**
 * Create a fetch request with timeout using Promise.race
 * @private
 */
const fetchWithTimeout = async (url, options = {}, timeoutMs = 15000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    logger.log(`Making request to: ${url}`, { method: options.method || "GET" });
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error(
        `Request failed with status ${response.status}`,
        errorData
      );
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    logger.error("Fetch error", error);
    if (error.name === "AbortError") {
      throw new Error(
        "Request timed out. Please check your internet connection and try again."
      );
    }
    throw new Error(
      `Failed to connect to the server. Please make sure the backend is running. Error: ${error.message}`
    );
  }
};

/**
 * Handle API response and errors
 * @private
 * @param {Response} response - Fetch response object
 * @returns {Promise<Object>} - Parsed JSON response
 * @throws {ApiError} - Throws ApiError with detailed information
 */
const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");

  // Handle successful responses
  if (response.ok) {
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    // For blob responses (PDF downloads)
    return response;
  }

  // Handle error responses
  let errorData;
  try {
    errorData = await response.json();
  } catch {
    throw new ApiError(
      `HTTP ${response.status}: ${response.statusText}`,
      response.status
    );
  }

  // Handle validation errors (422)
  if (response.status === 422 && errorData.detail) {
    throw new ApiError(
      "Validation error",
      422,
      errorData.request_id,
      errorData.detail
    );
  }

  // Handle standard error responses
  throw new ApiError(
    errorData.message || errorData.error || "An error occurred",
    errorData.status_code || response.status,
    errorData.request_id
  );
};

/**
 * Demo mode conversion - simulates a successful conversion
 * Matches API response: SuccessResponse with task_id in data
 */
const demoConvertVideoToPdf = async (youtubeUrl, timeInterval) => {
  logger.log("Demo mode: simulating conversion", { url: youtubeUrl, interval: timeInterval });
  
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Generate a mock task ID
  const taskId = `task_demo_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  // Return response matching SuccessResponse schema from API
  return {
    status: "success",
    message: "Conversion task created successfully",
    data: {
      task_id: taskId,
      status: "processing",
      youtube_url: youtubeUrl,
      time_interval: timeInterval,
    },
    timestamp: new Date().toISOString(),
  };
};

/**
 * Convert YouTube video to PDF
 * @param {string} youtubeUrl - YouTube video URL
 * @param {number} [timeInterval=1] - Time interval in minutes between frames (1-60)
 * @returns {Promise<Object>} - Response containing task ID and status
 * @throws {ApiError} - Throws on validation errors or server errors
 */
const convertVideoToPdf = async (
  youtubeUrl,
  timeInterval = 1
) => {
  // If in demo mode, use the demo function
  if (DEMO_MODE) {
    logger.log("Running in demo mode");
    return demoConvertVideoToPdf(youtubeUrl, timeInterval);
  }

  // Validate inputs
  if (!youtubeUrl) {
    throw new ApiError("YouTube URL is required", 400);
  }

  if (
    typeof timeInterval !== "number" ||
    timeInterval < 1 ||
    timeInterval > 60
  ) {
    throw new ApiError(
      "Time interval must be a number between 1 and 60 minutes",
      400
    );
  }

  try {
    // Build URL with query parameters for GET request
    const url = new URL(`${API_BASE_URL}/convert`);
    url.searchParams.append('youtube_url', youtubeUrl);
    url.searchParams.append('time_interval', Math.round(timeInterval));

    const response = await fetchWithTimeout(
      url.toString(),
      { method: "GET" },
      DEFAULT_TIMEOUT
    );

    const responseData = await handleResponse(response);

    // Ensure the response has the expected structure
    if (!responseData || typeof responseData !== "object") {
      throw new ApiError("Invalid response format from server", 500);
    }

    logger.log("Conversion initiated successfully", { taskId: responseData.task_id || responseData.data?.task_id });

    // Return the response as-is (API returns task_id and other info)
    return responseData;
  } catch (error) {
    logger.error("Error in convertVideoToPdf", error);

    // Handle specific error types
    if (error instanceof TypeError) {
      throw new ApiError(
        `Cannot connect to API server at ${API_BASE_URL}. Make sure the backend is running or enable demo mode with NEXT_PUBLIC_DEMO_MODE=true`,
        503
      );
    }

    if (error.name === "AbortError") {
      throw new ApiError(
        "Request timeout. The server took too long to respond.",
        504
      );
    }

    // If it's already an ApiError, just rethrow it
    if (error instanceof ApiError) {
      throw error;
    }

    // For any other errors, wrap them in an ApiError
    throw new ApiError(
      error.message || "Failed to convert video to PDF",
      error.statusCode || 500
    );
  }
};

/**
 * Get conversion progress for a task
 * @param {string} taskId - Task ID to check progress for
 * @returns {Promise<Object>} - Progress information
 * @throws {ApiError} - Throws on invalid task ID or server errors
 */
const getConversionProgress = async (taskId) => {
  if (!taskId) {
    throw new ApiError("Task ID is required", 400);
  }

  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/progress/${encodeURIComponent(taskId)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
      DEFAULT_TIMEOUT
    );

    return await handleResponse(response);
  } catch (error) {
    logger.error("Error getting conversion progress", error);
    throw new ApiError(
      error.message || "Failed to get conversion progress",
      error.statusCode || 500
    );
  }
};

/**
 * Get API health status
 * @returns {Promise<Object>} - Health status information
 * @throws {ApiError} - Throws on server errors
 */
const getHealthStatus = async () => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/health`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
      DEFAULT_TIMEOUT
    );
    const result = await handleResponse(response);
    logger.log("Health check passed");
    return result;
  } catch (error) {
    logger.error("Error getting health status", error);
    throw new ApiError(
      error.message || "Failed to get health status",
      error.statusCode || 500
    );
  }
};

/**
 * Get API statistics and task information
 * @returns {Promise<Object>} - API statistics
 * @throws {ApiError} - Throws on server errors
 */
const getApiStats = async () => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/stats`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
      DEFAULT_TIMEOUT
    );
    const result = await handleResponse(response);
    logger.log("Stats retrieved successfully");
    return result;
  } catch (error) {
    logger.error("Error getting API stats", error);
    throw new ApiError(
      error.message || "Failed to get API statistics",
      error.statusCode || 500
    );
  }
};

/**
 * List all tasks with optional status filter
 * @param {string} [status] - Optional status filter: 'processing', 'completed', 'error'
 * @returns {Promise<Array>} - List of tasks
 * @throws {ApiError} - Throws on server errors
 */
const listTasks = async (status) => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);

  try {
    const url = `${API_BASE_URL}/tasks${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const response = await fetchWithTimeout(
      url,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
      DEFAULT_TIMEOUT
    );
    const result = await handleResponse(response);
    logger.log("Tasks listed successfully", { status, count: result?.length });
    return result;
  } catch (error) {
    logger.error("Error listing tasks", error);
    throw new ApiError(
      error.message || "Failed to list tasks",
      error.statusCode || 500
    );
  }
};

/**
 * Cancel a specific task
 * @param {string} taskId - Task ID to cancel
 * @returns {Promise<Object>} - Cancellation status
 * @throws {ApiError} - Throws on invalid task ID or server errors
 */
const cancelTask = async (taskId) => {
  if (!taskId) {
    throw new ApiError("Task ID is required", 400);
  }

  try {
    logger.log("Canceling task", { taskId });
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/task/${encodeURIComponent(taskId)}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      },
      DEFAULT_TIMEOUT
    );
    const result = await handleResponse(response);
    logger.log("Task canceled successfully", { taskId });
    return result;
  } catch (error) {
    logger.error("Error canceling task", error);
    throw new ApiError(
      error.message || "Failed to cancel task",
      error.statusCode || 500
    );
  }
};

/**
 * Close all active EventSource connections
 */
const closeAllEventSources = () => {
  eventSources.forEach((eventSource, taskId) => {
    console.log(`Closing EventSource for task: ${taskId}`);
    if (eventSource.readyState !== EventSource.CLOSED) {
      eventSource.close();
    }
  });
  eventSources.clear();
};

/**
 * Subscribe to real-time progress updates via Server-Sent Events
 * @param {string} taskId - Task ID to track
 * @param {Function} onProgress - Callback for progress updates
 * @param {Function} onComplete - Callback when conversion is complete
 * @param {Function} onError - Error handler
 * @returns {Function} - Function to close the EventSource
 */
const subscribeToProgress = (taskId, onProgress, onComplete, onError) => {
  if (DEMO_MODE) {
    logger.log("Demo mode: simulating progress updates", { taskId });

    // Simulate progress updates
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        onComplete({
          status: "completed",
          progress: 100,
          percentage: 100,
          message: "Conversion completed successfully",
          pdf_filename: `demo_conversion_${Date.now()}.pdf`,
          timestamp: new Date().toISOString(),
        });
      } else {
        onProgress({
          status: "processing",
          progress,
          percentage: progress,
          message: `Processing... ${progress}%`,
          timestamp: new Date().toISOString(),
        });
      }
    }, 1000);

    // Return cleanup function
    return () => clearInterval(interval);
  }

  // Close any existing connection for this task
  if (eventSources.has(taskId)) {
    eventSources.get(taskId).close();
  }

  logger.log("Subscribing to progress stream", { taskId });

  // In production, use real SSE
  const eventSource = new EventSource(
    `${API_BASE_URL}/stream/${encodeURIComponent(taskId)}`
  );

  // Store the event source for potential cleanup
  eventSources.set(taskId, eventSource);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      logger.log("Progress update received", data);

      if (data.status === "completed" || data.status === "error") {
        if (onComplete) onComplete(data);
        eventSource.close();
        eventSources.delete(taskId);
      } else {
        if (onProgress) onProgress(data);
      }
    } catch (error) {
      logger.error("Error parsing SSE data", error);
      if (onError) onError(new Error("Error processing progress update"));
      eventSource.close();
      eventSources.delete(taskId);
    }
  };

  eventSource.onerror = (error) => {
    logger.error("SSE connection error", error);
    if (onError) onError(new Error("Error connecting to progress updates"));
    eventSource.close();
    eventSources.delete(taskId);
  };

  // Return cleanup function
  return () => {
    if (eventSource.readyState !== EventSource.CLOSED) {
      eventSource.close();
      eventSources.delete(taskId);
    }
  };
};

/**
 * Create a realistic sample PDF for demo mode
 * @private
 */
const generateSamplePDF = () => {
  // Minimal but valid PDF structure
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 100 >>
stream
BT
/F1 12 Tf
50 750 Td
(YouTube Video Conversion - Demo PDF) Tj
0 -30 Td
(This is a sample PDF generated in demo mode.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000273 00000 n
0000000424 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
524
%%EOF`;

  return new Blob([pdfContent], { type: "application/pdf" });
};

/**
 * Download the generated PDF file
 * @param {string} filename - Name of the PDF file to download
 * @returns {Promise<Blob>} - PDF file as a Blob
 * @throws {ApiError} - Throws on download errors
 */
async function downloadPdf(filename) {
  if (!filename || typeof filename !== "string") {
    throw new ApiError("Filename is required and must be a string", 400);
  }

  // Demo mode - return sample PDF
  if (DEMO_MODE || filename.startsWith("demo_")) {
    logger.log("Demo mode: generating sample PDF", { filename });
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate download delay
    return generateSamplePDF();
  }

  try {
    logger.log("Starting PDF download", { filename });
    
    // Make request to /download/{pdf_filename} endpoint
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/download/${encodeURIComponent(filename)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/pdf",
        },
      },
      60000
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(
        errorText || "Failed to download PDF",
        response.status
      );
    }

    logger.log("PDF download successful", { filename });
    
    // Return the PDF blob directly from the API
    return await response.blob();
  } catch (error) {
    logger.error("Download error", error);

    if (error instanceof TypeError) {
      throw new ApiError(
        "Cannot connect to API server. Please check if the backend is running.",
        503
      );
    }

    if (error.name === "AbortError") {
      throw new ApiError(
        "Download timeout. The file is taking too long to download.",
        504
      );
    }

    throw error instanceof ApiError
      ? error
      : new ApiError("Failed to download PDF", 500);
  }
}

/**
 * Helper function to trigger PDF download in the browser
 * @param {string} filename - Name of the file
 * @param {Blob} blob - PDF file as a Blob
 */
function triggerPdfDownload(filename, blob) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Create and export the API service
const ApiService = {
  // Core conversion functions
  convertVideoToPdf,
  getConversionProgress,

  // Task management
  listTasks,
  cancelTask,

  // API status and information
  getHealthStatus,
  getApiStats,

  // Event management
  closeAllEventSources,
  subscribeToProgress,
  downloadPdf,
  triggerPdfDownload,
};

export default ApiService;

// Export ApiError for error handling
export { ApiError };
