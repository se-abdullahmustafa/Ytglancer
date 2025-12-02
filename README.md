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
