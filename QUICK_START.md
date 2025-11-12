# Quick Start Guide - BAG Address Validation

## Prerequisites

- Node.js 18+ or 20+
- npm or pnpm
- BAG API backend running (see API_DOCUMENTATION.md)

## Installation Steps

### 1. Install Dependencies

```bash
cd /Users/cheersrijneau/Developer/newproject
npm install
```

### 2. Configure Environment

Edit `.env.development`:
```bash
VITE_BAG_API_BASE_URL=http://localhost:8000
```

### 3. Start Development Server

```bash
npm run dev
```

The app will run on `http://localhost:5173`

## Available Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Testing
```bash
npm test             # Run all tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
```

### Code Quality
```bash
npm run lint         # Run ESLint
```

## Project Structure

```
src/
├── api/              # BAG API client and services
├── components/       # React UI components
├── contexts/         # React Context providers
├── hooks/            # Custom React hooks
├── lib/              # Utilities and constants
├── mocks/            # MSW mock handlers
├── test/             # Test setup
├── App.tsx           # Main app component
└── main.tsx          # Entry point
```

## User Workflow

1. **Upload**: User drags .xlsx file or uses file picker
2. **Validate**: Automatic validation starts (progress updates every 2.5s)
3. **Download**: Click "Download Resultaten" button
4. **Reset**: Click "Nieuwe Validatie" to start over

## Common Issues

### CORS Error
**Problem**: "Access to XMLHttpRequest has been blocked by CORS policy"

**Solution**: Configure CORS on BAG API backend to allow `http://localhost:5173`

### File Upload Fails
**Problem**: Upload shows error

**Solution**:
- Verify file is .xlsx (not .xls)
- Check file size is under 10MB
- Ensure file is not empty

### API Connection Error
**Problem**: "Geen verbinding met de server"

**Solution**:
- Verify BAG API is running on configured URL
- Check `.env.development` has correct `VITE_BAG_API_BASE_URL`
- Restart dev server after changing environment variables

## Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test src/hooks/__tests__/bag-hooks.test.ts
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

## Building for Production

### 1. Configure Production Environment
Edit `.env.production`:
```bash
VITE_BAG_API_BASE_URL=https://api.production-domain.com
```

### 2. Build
```bash
npm run build
```

Output will be in `dist/` directory

### 3. Test Production Build Locally
```bash
npm run preview
```

### 4. Deploy
See `docs/deployment.md` for deployment options (Vercel, Netlify, AWS S3, Docker)

## Documentation

- **README.md** - Full project documentation
- **docs/api-integration.md** - BAG API integration details
- **docs/deployment.md** - Deployment guide
- **docs/architecture.md** - Component architecture
- **docs/troubleshooting.md** - Common issues and solutions
- **API_DOCUMENTATION.md** - Backend API documentation

## Support

For issues or questions:
1. Check troubleshooting guide: `docs/troubleshooting.md`
2. Review error messages in browser console
3. Check backend API logs
4. Contact development team

## Features

- ✅ Drag-and-drop file upload
- ✅ .xlsx file validation
- ✅ Real-time progress updates
- ✅ Dutch language interface
- ✅ Error handling with retry
- ✅ Download validated results
- ✅ Automatic session cleanup

## Browser Support

- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

---

**Status:** Ready for use
**Last Updated:** 2025-10-29
