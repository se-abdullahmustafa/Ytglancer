# YtGlancer

## Environment Configuration

The application uses different API endpoints based on the environment:

- **Local**: `http://localhost:8000` (set `NEXT_PUBLIC_APP_ENV=local`)
- **Staging**: `https://staging.api.rajag.site` (set `NEXT_PUBLIC_APP_ENV=staging`)
- **Production**: `https://api.rajag.site` (set `NEXT_PUBLIC_APP_ENV=production`)

### Environment Files

- `.env.example` - Template file (committed to git)
- `.env.local` - Local development (ignored by git)
- `.env.staging` - Staging environment (committed to git)
- `.env.production` - Production environment (committed to git)

### Setup Instructions

1. Copy `.env.example` to `.env.local` for local development
2. Set `NEXT_PUBLIC_APP_ENV=local` in `.env.local`
3. The application will automatically use the correct API URL based on the environment

## Getting Started

This project is built with [Next.js 14](https://nextjs.org/), a React framework for production.

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

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `.next` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm start`

Starts the production server.

### `npm run lint`

Runs the Next.js linting to check for code issues.

## Learn More

To learn more about Next.js, check out the [Next.js documentation](https://nextjs.org/docs).

To learn React, check out the [React documentation](https://reactjs.org/).

## Deployment

Learn more about deploying Next.js applications in the [Next.js deployment documentation](https://nextjs.org/docs/deployment).

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
