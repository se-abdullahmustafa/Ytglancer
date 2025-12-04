import constants from "./constants";

// Base URL for the YouTube to PDF Converter API
const API_BASE_URL = constants.apiUrl || "http://localhost:8000";

// Default time interval in seconds (5 minutes)
const DEFAULT_TIME_INTERVAL = 300;

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
 * Convert YouTube video to PDF
 * @param {string} youtubeUrl - YouTube video URL
 * @param {number} [timeInterval=300] - Time interval in seconds between frames (1-3600)
 * @returns {Promise<Object>} - Response containing task ID
 * @throws {ApiError} - Throws on validation errors or server errors
 */
async function convertVideoToPdf(youtubeUrl, timeInterval = DEFAULT_TIME_INTERVAL) {
  if (!youtubeUrl || typeof youtubeUrl !== "string") {
    throw new ApiError("YouTube URL is required and must be a string", 400);
  }

  if (timeInterval <= 0 || timeInterval > 3600) {
    throw new ApiError("Time interval must be between 1 and 3600 seconds", 400);
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/convert_video_to_pdf?youtube_url=${encodeURIComponent(
        youtubeUrl
      )}&time_interval=${timeInterval}`
    );
    return await handleResponse(response);
  } catch (error) {
    console.error("Error converting video to PDF:", error);
    throw error instanceof ApiError ? error : new ApiError("Failed to convert video to PDF", 500);
  }
}

/**
 * Get conversion progress for a task
 * @param {string} taskId - Task ID to check progress for
 * @returns {Promise<Object>} - Progress information
 * @throws {ApiError} - Throws on invalid task ID or server errors
 */
async function getConversionProgress(taskId) {
  if (!taskId || typeof taskId !== "string") {
    throw new ApiError("Task ID is required and must be a string", 400);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/progress/${taskId}`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error getting conversion progress:", error);
    throw error instanceof ApiError ? error : new ApiError("Failed to get conversion progress", 500);
  }
}

/**
 * Subscribe to real-time progress updates via Server-Sent Events
 * @param {string} taskId - Task ID to track
 * @param {Function} onProgress - Callback for progress updates
 * @param {Function} onComplete - Callback when conversion is complete
 * @param {Function} onError - Error handler
 * @returns {Function} - Function to close the EventSource
 */
function subscribeToProgress(taskId, onProgress, onComplete, onError) {
  if (!taskId || typeof taskId !== "string") {
    const error = new ApiError("Task ID is required and must be a string", 400);
    onError?.(error);
    return () => {};
  }

  const eventSource = new EventSource(
    `${API_BASE_URL}/progress-stream/${taskId}`
  );

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.status === "completed") {
        onComplete?.(data);
        eventSource.close();
      } else if (data.status === "error") {
        onError?.(new ApiError(data.message || "Conversion failed", 500));
        eventSource.close();
      } else {
        onProgress?.(data);
      }
    } catch (error) {
      console.error("Error processing progress update:", error);
      onError?.(error instanceof Error ? error : new Error(String(error)));
      eventSource.close();
    }
  };

  eventSource.onerror = (error) => {
    console.error("EventSource failed:", error);
    onError?.(new ApiError("Connection to progress stream failed", 500));
    eventSource.close();
  };

  // Return cleanup function
  return () => {
    if (eventSource.readyState !== EventSource.CLOSED) {
      eventSource.close();
    }
  };
}

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

  try {
    const response = await fetch(
      `${API_BASE_URL}/download/${encodeURIComponent(filename)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/pdf",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(
        errorText || "Failed to download PDF",
        response.status
      );
    }

    return await response.blob();
  } catch (error) {
    console.error("Download error:", error);
    throw error instanceof ApiError ? error : new ApiError("Failed to download PDF", 500);
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
  convertVideoToPdf,
  getConversionProgress,
  subscribeToProgress,
  downloadPdf,
  triggerPdfDownload,
};

export default ApiService;

// Export ApiError for error handling
export { ApiError };
