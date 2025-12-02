import constants from "./constants";

const API_BASE_URL = constants.apiUrl || "http://localhost:8000";

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
 * 
 * @param {string} youtubeUrl - YouTube video URL
 * @param {number} timeInterval - Time interval in seconds between frames (1-3600)
 * @returns {Promise<ConversionResponse>} - Task ID and status
 * @throws {ApiError} - Throws on validation errors or server errors
 * 
 * @example
 * const response = await ApiService.convertVideoToPdf(
 *   "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
 *   60
 * );
 * console.log(response.data.task_id);
 */
const convertVideoToPdf = async (youtubeUrl, timeInterval = 60) => {
  // Client-side validation
  if (!youtubeUrl || typeof youtubeUrl !== "string") {
    throw new ApiError("YouTube URL is required and must be a string", 400);
  }

  if (timeInterval <= 0 || timeInterval > 3600) {
    throw new ApiError(
      "Time interval must be between 1 and 3600 seconds",
      400
    );
  }

  try {
    const url = new URL(`${API_BASE_URL}/convert_video_to_pdf`);
    url.searchParams.append("youtube_url", youtubeUrl);
    url.searchParams.append("time_interval", timeInterval.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    const data = await handleResponse(response);
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error("Conversion error:", error);
    throw new ApiError(
      error.message || "Failed to start conversion",
      500
    );
  }
};

/**
 * Get conversion progress for a task
 * 
 * @param {string} taskId - Task ID to check progress for
 * @returns {Promise<ProgressResponse>} - Progress information
 * @throws {ApiError} - Throws on invalid task ID or server errors
 * 
 * @example
 * const progress = await ApiService.getConversionProgress("task-123");
 * console.log(`Progress: ${progress.percentage}%`);
 */
const getConversionProgress = async (taskId) => {
  if (!taskId || typeof taskId !== "string") {
    throw new ApiError("Task ID is required and must be a string", 400);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/progress/${taskId}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error("Progress check error:", error);
    throw new ApiError(
      error.message || "Failed to get progress",
      500
    );
  }
};

/**
 * Subscribe to real-time progress updates via Server-Sent Events
 * 
 * @param {string} taskId - Task ID to track
 * @param {Function} onProgress - Callback for progress updates (receives ProgressResponse)
 * @param {Function} onComplete - Callback when conversion is complete (receives ProgressResponse)
 * @param {Function} onError - Error handler (receives Error)
 * @returns {Function} - Unsubscribe function to close the EventSource
 * 
 * @example
 * const unsubscribe = ApiService.subscribeToProgress(
 *   "task-123",
 *   (progress) => console.log(`${progress.percentage}%`),
 *   (result) => console.log(`Complete: ${result.filename}`),
 *   (error) => console.error(error)
 * );
 * // Later: unsubscribe();
 */
const subscribeToProgress = (taskId, onProgress, onComplete, onError) => {
  if (!taskId || typeof taskId !== "string") {
    onError(new ApiError("Task ID is required and must be a string", 400));
    return () => { };
  }

  const eventSource = new EventSource(
    `${API_BASE_URL}/progress-stream/${taskId}`
  );

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.status === "complete") {
        onComplete(data);
        eventSource.close();
      } else if (data.status === "error") {
        onError(new ApiError(data.message || "Conversion failed", 500));
        eventSource.close();
      } else {
        onProgress(data);
      }
    } catch (error) {
      onError(new ApiError("Failed to parse progress data", 500));
      eventSource.close();
    }
  };

  eventSource.onerror = (error) => {
    console.error("EventSource error:", error);
    onError(new ApiError("Connection to progress stream failed", 500));
    eventSource.close();
  };

  // Return unsubscribe function
  return () => {
    if (eventSource.readyState !== EventSource.CLOSED) {
      eventSource.close();
    }
  };
};

/**
 * Download the generated PDF file
 * 
 * @param {string} filename - Name of the PDF file to download
 * @returns {Promise<Blob>} - PDF file as a Blob
 * @throws {ApiError} - Throws on invalid filename or download errors
 * 
 * @example
 * const pdfBlob = await ApiService.downloadPdf("video_123.pdf");
 * const url = URL.createObjectURL(pdfBlob);
 * window.open(url);
 */
const downloadPdf = async (filename) => {
  if (!filename || typeof filename !== "string") {
    throw new ApiError("Filename is required and must be a string", 400);
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/download/${encodeURIComponent(filename)}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/pdf",
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
    if (error instanceof ApiError) {
      throw error;
    }
    console.error("Download error:", error);
    throw new ApiError(
      error.message || "Failed to download PDF",
      500
    );
  }
};

/**
 * API Service for YouTube to PDF conversion
 * Implements all endpoints from the OpenAPI specification
 */
export const ApiService = {
  convertVideoToPdf,
  getConversionProgress,
  subscribeToProgress,
  downloadPdf,
};

// Export ApiError for error handling
export { ApiError };
