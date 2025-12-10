# YtGlancer API Integration Guide

## API Endpoints

All endpoints are based on the OpenAPI 3.1.0 specification.

### 1. Convert Video to PDF
**Endpoint:** `GET /convert`

**Query Parameters:**
- `youtube_url` (string, required) - YouTube video URL
- `time_interval` (integer, required) - Time interval in seconds (1-3600)

**Response:**
```json
{
  "status": "success",
  "message": "Conversion task created successfully",
  "data": {
    "task_id": "task_abc123...",
    "status": "processing",
    "youtube_url": "https://www.youtube.com/watch?v=...",
    "time_interval": 60
  },
  "timestamp": "2024-12-09T10:30:00Z"
}
```

### 2. Get Progress
**Endpoint:** `GET /progress/{task_id}`

**Response:**
```json
{
  "status": "success",
  "message": "Progress updated",
  "data": {
    "task_id": "task_abc123...",
    "status": "completed",
    "percentage": 100,
    "frames_extracted": 45,
    "pdf_filename": "output_abc123.pdf",
    "duration_seconds": 2.5
  },
  "timestamp": "2024-12-09T10:30:02Z"
}
```

### 3. Progress Stream (Server-Sent Events)
**Endpoint:** `GET /progress-stream/{task_id}`

**Updates Format:**
```json
{
  "percentage": 45,
  "status": "processing",
  "message": "Extracting frames...",
  "frames_extracted": 20
}
```

Completion event:
```json
{
  "status": "completed",
  "percentage": 100,
  "pdf_filename": "output_abc123.pdf"
}
```

### 4. Download PDF
**Endpoint:** `GET /download/{pdf_filename}`

**Response:** Binary PDF file

### 5. Health Check
**Endpoint:** `GET /health`

### 6. API Stats
**Endpoint:** `GET /stats`

### 7. List Tasks
**Endpoint:** `GET /tasks?status={optional_status}`

### 8. Cancel Task
**Endpoint:** `DELETE /task/{task_id}`

### 9. API Info
**Endpoint:** `GET /info`

## Frontend Implementation

### Configuration
- Demo mode enabled by default: `NEXT_PUBLIC_DEMO_MODE=true`
- Backend API URL: `NEXT_PUBLIC_API_URL=http://localhost:8000`
- Disable demo when backend is ready: `NEXT_PUBLIC_DEMO_MODE=false`

### Key Files
- `lib/apiService.js` - API client with request/response handling
- `lib/constants.js` - API configuration
- `lib/apiTypes.js` - TypeScript/JSDoc type definitions
- `app/page.js` - Main conversion UI component

### API Service Methods

#### convertVideoToPdf(youtubeUrl, timeInterval)
Initiates a conversion request via the `/convert` endpoint.

**Returns:** SuccessResponse with task_id in data

**Usage:**
```javascript
const response = await ApiService.convertVideoToPdf(videoUrl, 60);
const taskId = response.data.task_id;
```

#### subscribeToProgress(taskId, onProgress, onComplete, onError)
Subscribes to real-time progress updates.

**Callbacks:**
- `onProgress(data)` - Called on each progress update
- `onComplete(data)` - Called when conversion completes
- `onError(error)` - Called on error

**Returns:** Cleanup function to unsubscribe

**Usage:**
```javascript
const unsubscribe = ApiService.subscribeToProgress(
  taskId,
  (progress) => console.log(progress.percentage),
  (result) => console.log(result.pdf_filename),
  (error) => console.error(error)
);
```

#### downloadPdf(filename)
Downloads the generated PDF file.

**Returns:** Blob object

**Usage:**
```javascript
const blob = await ApiService.downloadPdf(filename);
// Trigger download in browser
```

## Demo Mode

Demo mode simulates the full conversion workflow without a backend:

1. **Conversion Request** - Generates a mock task ID
2. **Progress Updates** - Simulates gradual progress (0-100%)
3. **Completion** - Returns mock PDF filename
4. **Download** - Returns a **sample PDF file** (not a dummy file)

> **Note:** In demo mode, the downloaded PDF is a valid, minimal PDF file that can be opened and viewed. When connected to the real backend, you'll receive the actual conversion output PDF.

To enable/disable:
```bash
# Enable demo mode (default)
NEXT_PUBLIC_DEMO_MODE=true

# Disable and use real backend
NEXT_PUBLIC_DEMO_MODE=false
```

When `DEMO_MODE=false`, the frontend will:
- Call the real `/convert` endpoint for conversion
- Use `/progress-stream/{task_id}` for real-time updates
- Download actual PDFs from `/download/{pdf_filename}`

## Error Handling

The API service provides detailed error information:

```javascript
try {
  await ApiService.convertVideoToPdf(url, interval);
} catch (error) {
  // error is an ApiError instance
  console.log(error.message);        // User-friendly message
  console.log(error.statusCode);     // HTTP status code
  console.log(error.requestId);      // Unique request ID
  console.log(error.validationErrors); // Field validation errors
}
```

Common error codes:
- `400` - Invalid request parameters
- `422` - Validation error
- `503` - API server unavailable (try demo mode)
- `504` - Request timeout
- `500` - Server error

## Testing Checklist

- [x] API endpoint structure matches OpenAPI spec
- [x] Response schemas match spec definitions
- [x] Demo mode works without backend
- [x] Error handling is comprehensive
- [x] Progress streaming implemented
- [x] PDF download functionality works
- [ ] Test with real backend API running
- [ ] Verify all error scenarios
- [ ] Test concurrent conversions
