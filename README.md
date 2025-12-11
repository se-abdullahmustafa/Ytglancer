# YtGlancer - YouTube to PDF Converter

Convert YouTube videos into organized, searchable PDF notes instantly. Perfect for students and professionals who want to capture important information from videos.

## Table of Contents

- [Environment Configuration](#environment-configuration)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [API Integration](#api-integration)
- [Frontend Implementation](#frontend-implementation)
- [API Endpoints](#api-endpoints)
- [Demo Mode](#demo-mode)
- [Error Handling](#error-handling)
- [Frontend Improvements](#frontend-improvements)
- [Testing Checklist](#testing-checklist)
- [Deployment](#deployment)

## Environment Configuration

The application uses different API endpoints based on the environment:

- **Local**: `http://localhost:8000` (set `NEXT_PUBLIC_APP_ENV=local`)
- **Staging**: `https://staging.api.rajag.site` (set `NEXT_PUBLIC_APP_ENV=staging`)
- **Production**: `http://api.rajag.site` (set `NEXT_PUBLIC_APP_ENV=production`)

### Environment Files

- `.env.example` - Template file (committed to git) - **Use this as your template**
- `.env.local` - Local development (ignored by git) - **Do not commit**

### Setup Instructions

1. Copy `.env.example` to `.env.local` for local development
2. Set `NEXT_PUBLIC_APP_ENV=local` in `.env.local`
3. Set `NEXT_PUBLIC_DEMO_MODE=false` to use real backend API
4. The application will automatically use the correct API URL based on the environment

### Environment Variables

```bash
# Application environment
NEXT_PUBLIC_APP_ENV=local|staging|production

# API URL based on environment
NEXT_PUBLIC_API_URL=http://localhost:8000|https://staging.api.rajag.site|http://api.rajag.site

# Demo mode (true for testing, false for production)
NEXT_PUBLIC_DEMO_MODE=false
```

## Getting Started

This project is built with [Next.js 14](https://nextjs.org/), a React framework for production.

### Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/se-abdullahmustafa/Ytglancer.git

# Navigate to the project directory
cd Ytglancer

# Install dependencies
npm install
```

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `.next` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm start`

Starts the production server.

### `npm run lint`

Runs the Next.js linting to check for code issues.

## API Integration

### API Endpoints

All endpoints are based on the OpenAPI 3.1.0 specification.

#### 1. Convert Video to PDF

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

#### 2. Get Progress

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

#### 3. Progress Stream (Server-Sent Events)

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

#### 4. Download PDF

**Endpoint:** `GET /download/{pdf_filename}`

**Response:** Binary PDF file

#### 5. Health Check

**Endpoint:** `GET /health`

#### 6. API Stats

**Endpoint:** `GET /stats`

#### 7. List Tasks

**Endpoint:** `GET /tasks?status={optional_status}`

#### 8. Cancel Task

**Endpoint:** `DELETE /task/{task_id}`

#### 9. API Info

**Endpoint:** `GET /info`

### Frontend Implementation

#### Configuration

- Demo mode enabled by default: `NEXT_PUBLIC_DEMO_MODE=true`
- Backend API URL: `NEXT_PUBLIC_API_URL=http://localhost:8000`
- Disable demo when backend is ready: `NEXT_PUBLIC_DEMO_MODE=false`

#### Key Files

- `lib/apiService.js` - API client with request/response handling
- `lib/constants.js` - API configuration
- `lib/apiTypes.js` - TypeScript/JSDoc type definitions
- `app/page.js` - Main conversion UI component
- `app/page.css` - Styling for the application

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

## Frontend Improvements

### Real-Time Progress Streaming (✅ Implemented)
- **Endpoint Used**: `GET /stream/{task_id}` (Server-Sent Events)
- **Implementation**: `subscribeToProgress()` in `apiService.js`
- **Features**:
  - Real-time progress updates via SSE
  - Handles both demo mode and production mode
  - Automatic cleanup of connections
  - Comprehensive error handling for connection failures

### Download Card Component (✅ Implemented)
- **Location**: `app/page.js`
- **Features**:
  - Beautiful card design with success animation
  - Displays conversion metadata (filename, status)
  - Download button with loading state
  - "Convert Another Video" button for repeated use
  - Responsive and mobile-friendly
  - Modern gradient background
  - Info grid with icons and details

### Enhanced Progress Display (✅ Implemented)
- **Real-time Status Badge**: Shows current processing status
- **Progress Details**: Displays detailed messages from API
- **Visual Feedback**: Animated spinner and progress bar
- **Status Messages**: Clear indication of conversion stages

### Step Progress Indicator (✅ Implemented)
- **Visual Steps**: Three-step process visualization
  - Step 1: Initializing
  - Step 2: Processing
  - Step 3: Complete
- **Active Indicators**: Shows current processing step with pulse animation
- **Completion Status**: Displays completed steps with checkmarks
- **Smooth Animations**: Pulse animation for active steps, smooth color transitions

### Modern Minimalist UI (✅ Implemented)
- **Clean Design**: Minimalist interface with focus on functionality
- **Two Titled Input Fields**:
  - YouTube Video URL (with link icon)
  - Capture Interval in seconds (with clock icon)
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Accessibility**: Proper ARIA labels and semantic HTML
- **Color Scheme**: Professional blue and green color palette
- **Typography**: Clean, readable fonts with proper hierarchy

### Production-Ready Logging (✅ Implemented)
- **Logger Module**: Custom logger in `apiService.js`
- **Features**:
  - Timestamp support
  - Environment-aware logging (local vs production)
  - Structured logging with context data
  - Applied to all API methods

## API Endpoint Coverage

All 8 FastAPI endpoints are properly implemented:

| Endpoint | Method | Frontend Handler | Status |
|----------|--------|-----------------|--------|
| `/health` | GET | `getHealthStatus()` | ✅ |
| `/convert` | GET | `convertVideoToPdf()` | ✅ |
| `/progress/{task_id}` | GET | `getConversionProgress()` | ✅ |
| `/stream/{task_id}` | GET | `subscribeToProgress()` | ✅ |
| `/download/{pdf_filename}` | GET | `downloadPdf()` | ✅ |
| `/tasks` | GET | `listTasks()` | ✅ |
| `/task/{task_id}` | DELETE | `cancelTask()` | ✅ |
| `/stats` | GET | `getApiStats()` | ✅ |

## User Experience Flow

1. **User enters YouTube URL** → Validates input
2. **Selects capture interval** → Defaults to 60 seconds
3. **Starts conversion** → Shows initializing status (Step 1)
4. **API processes** → Real-time progress updates via `/stream` endpoint (Step 2)
5. **Progress updates in real-time** → User sees step progress indicator
6. **Conversion completes** → Beautiful download card appears (Step 3)
7. **User downloads PDF** → Smooth file download with loading indicator
8. **Option to convert another** → Reset form and start over

## Testing Checklist

- [x] API endpoint structure matches OpenAPI spec
- [x] Response schemas match spec definitions
- [x] Demo mode works without backend
- [x] Error handling is comprehensive
- [x] Progress streaming implemented
- [x] PDF download functionality works
- [x] Step progress indicator displays correctly
- [x] Two input fields with labels display properly
- [x] Download card UI is modern and minimalist
- [x] Form validation and error messages
- [ ] Test with real backend API running
- [ ] Verify all error scenarios
- [ ] Test concurrent conversions
- [ ] Mobile responsiveness testing

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Vercel will automatically detect Next.js and configure the build
4. Set environment variables in Vercel dashboard
5. Deploy with a single click

### Deploy to Other Platforms

Refer to the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for detailed instructions for:
- Docker
- AWS
- Google Cloud
- Azure
- And more...

### Environment Variables for Deployment

Make sure to set these environment variables in your deployment platform:

```
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_DEMO_MODE=false
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Production Checklist

- ✅ Real-time progress streaming via SSE
- ✅ Beautiful UI for download completion
- ✅ Production-ready logging
- ✅ Comprehensive error handling
- ✅ Timeout handling
- ✅ Network error recovery
- ✅ Validation error display
- ✅ State management
- ✅ Resource cleanup on unmount
- ✅ Mobile-responsive design
- ✅ Accessibility considerations (ARIA labels, semantic HTML)
- ✅ Demo mode fallback
- ✅ Step progress indication
- ✅ Modern minimalist UI
- ✅ Two titled input fields
- ✅ Enhanced download card

## Future Enhancements

- [ ] Add conversion history/persistence
- [ ] Multiple concurrent conversions
- [ ] Advanced PDF customization options
- [ ] User account system
- [ ] Webhook notifications
- [ ] Batch conversions
- [ ] Video preview thumbnails
- [ ] Custom fonts and styles for PDF
- [ ] Dark mode support

## Support

For issues or questions:

1. Check the console logs in browser dev tools
2. Review network requests in the Network tab
3. Try demo mode for testing without backend
4. Open an issue on GitHub
5. Contact the development team

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Authors

- **Hammad** - Initial development and UI improvements
- **se-abdullahmustafa** - Project owner

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Changelog

### Version 1.1.0 (Latest)
- ✅ Updated UI with two titled input fields
- ✅ Enhanced download card with modern design
- ✅ Merged documentation (API_INTEGRATION.md and FRONTEND_IMPROVEMENTS.md into README.md)
- ✅ Improved info grid layout with icons
- ✅ Better animations and visual feedback

### Version 1.0.0
- ✅ Initial release with YouTube to PDF conversion
- ✅ Real-time progress streaming
- ✅ Beautiful download card component
- ✅ Step progress indicator
- ✅ Modern minimalist UI
- ✅ Comprehensive error handling
- ✅ Demo mode support
