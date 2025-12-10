/**
 * API Type Definitions
 * Based on OpenAPI 3.1.0 specification for YouTube Video to PDF Converter API
 * https://api.rajag.site/docs
 */

/**
 * @typedef {Object} SuccessResponse
 * @property {string} status - Status of the response (default: "success")
 * @property {string} message - Response message
 * @property {Object|null} [data] - Response data
 * @property {string} timestamp - ISO timestamp of the response
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {number} status_code - HTTP status code
 * @property {string} error - Error type/name
 * @property {string} message - Error message
 * @property {string} timestamp - ISO timestamp of the error
 * @property {string} path - API path that caused the error
 * @property {string} request_id - Unique request identifier
 */

/**
 * @typedef {Object} ValidationError
 * @property {Array<string|number>} loc - Location of the validation error
 * @property {string} msg - Validation error message
 * @property {string} type - Error type
 */

/**
 * @typedef {Object} HTTPValidationError
 * @property {ValidationError[]} [detail] - Array of validation errors
 */

/**
 * ConversionResponse - Response from /convert_video_to_pdf endpoint
 * @typedef {Object} ConversionResponse
 * @property {string} task_id - Unique task identifier for tracking
 * @property {string} status - Current status (processing, completed, error)
 * @property {string} youtube_url - The YouTube URL being converted
 * @property {number} time_interval - Time interval in seconds between frames
 */

/**
 * ProgressResponse - Response from /progress/{task_id} endpoint
 * @typedef {Object} ProgressResponse
 * @property {string} status - Current status (processing, completed, error)
 * @property {number} percentage - Progress percentage (0-100)
 * @property {string} message - Progress message
 * @property {number} [frames_extracted] - Number of frames extracted so far
 * @property {string} [pdf_filename] - Generated PDF filename (on completion)
 * @property {number} [duration_seconds] - Processing time in seconds
 * @property {string} [filename] - PDF filename (when complete)
 * @property {Object} [error] - Error details (if status is error)
 */

/**
 * @typedef {Object} ApiError
 * @property {string} message - Error message
 * @property {number} [statusCode] - HTTP status code
 * @property {string} [requestId] - Request ID from the server
 * @property {ValidationError[]} [validationErrors] - Validation errors
 */

export const ApiTypes = {
    // Export for documentation purposes
};
