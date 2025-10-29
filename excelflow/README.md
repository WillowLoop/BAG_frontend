# ExcelFlow MVP

Een moderne web-applicatie voor het uploaden, analyseren en downloaden van Excel-bestanden met real-time voortgangstracking.

## Features

- **Drag-and-Drop Upload** - Intuïtieve file upload interface met validatie
- **Real-time Voortgang** - Live updates tijdens bestandsverwerking
- **Responsive Design** - Werkt perfect op desktop, tablet en mobiel
- **Toegankelijk** - WCAG AA compliant met screen reader support
- **Type-safe** - Volledig gebouwd met TypeScript
- **Modern Stack** - React 19, Vite, TanStack Query, Tailwind CSS

## Browser Support

ExcelFlow ondersteunt de laatste 2 versies van:
- Chrome / Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- iOS Safari
- Chrome Android

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone de repository
git clone <repository-url>
cd excelflow

# Installeer dependencies
npm install

# Kopieer environment template
cp .env.example .env

# Update .env met je API URL
# VITE_API_BASE_URL=http://localhost:3000/api
```

### Development

```bash
# Start development server
npm run dev

# App draait op http://localhost:5173
```

### Building

```bash
# Production build
npm run build

# Preview production build locally
npm run preview

# Preview draait op http://localhost:4173
```

### Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
excelflow/
├── src/
│   ├── api/              # API client en services
│   │   ├── client.ts     # Axios instance
│   │   ├── types.ts      # API type definitions
│   │   └── services/     # API service modules
│   ├── components/       # React components
│   │   ├── ui/           # Shadcn/ui base components
│   │   ├── UploadSection.tsx
│   │   ├── ProcessingView.tsx
│   │   ├── DownloadSection.tsx
│   │   └── ErrorView.tsx
│   ├── contexts/         # React Context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   │   ├── validation.ts # File validation
│   │   ├── errors.ts     # Error transformation
│   │   └── utils.ts      # General utilities
│   ├── mocks/            # MSW mock API handlers
│   ├── test/             # Test setup
│   ├── types/            # TypeScript type definitions
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── dist/                 # Production build output
└── vitest.config.ts      # Test configuration
```

## Environment Variables

### Development (.env)

```bash
# API Base URL
VITE_API_BASE_URL=http://localhost:3000/api

# Optional configurations
VITE_MAX_FILE_SIZE_MB=10
VITE_POLLING_INTERVAL_MS=2500
VITE_UPLOAD_TIMEOUT_MS=30000
```

### Production (.env.production)

```bash
# Production API URL
VITE_API_BASE_URL=https://api.excelflow.com/api

# Optional: Error monitoring
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

## API Integration

ExcelFlow verwacht een backend API met de volgende endpoints:

### POST /api/upload
Upload een Excel bestand en start een verwerkingsjob.

**Request:**
- Content-Type: `multipart/form-data`
- Body: File in 'file' field

**Response:**
```json
{
  "jobId": "uuid-v4-string",
  "status": "queued"
}
```

### GET /api/status/:jobId
Haal de huidige status van een job op.

**Response:**
```json
{
  "jobId": "uuid-v4-string",
  "status": "processing",
  "progress": 67,
  "message": "Analyzing data structure"
}
```

Mogelijke status values: `queued`, `processing`, `analyzing`, `complete`, `failed`

### GET /api/download/:jobId
Download het geanalyseerde bestand.

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Body: Binary Excel file data

## Development Features

### Mock Service Worker (MSW)

Voor development gebruikt ExcelFlow MSW om de backend API te simuleren:

```typescript
// MSW wordt automatisch geactiveerd in development
// Zie src/mocks/handlers.ts voor mock responses
```

### TanStack Query DevTools

Query DevTools zijn beschikbaar in development mode (linksonder in browser).

### TypeScript

Strict mode is enabled voor maximum type safety:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

## Performance Optimizations

- **Code Splitting** - Vendor chunks voor React, TanStack Query, en UI libraries
- **Tree Shaking** - Ongebruikte code wordt automatisch verwijderd
- **Minification** - esbuild voor snelle builds
- **GPU Accelerated Animations** - Gebruik van `transform` en `opacity`
- **Bundle Analysis** - `dist/stats.html` na production build

## Accessibility

ExcelFlow volgt WCAG 2.1 Level AA guidelines:

- Keyboard navigation support (Tab, Enter, Escape)
- Screen reader compatible (ARIA labels en live regions)
- Focus indicators zichtbaar op alle interactieve elementen
- Minimum color contrast ratio 4.5:1
- Touch targets minimum 44x44px op mobile
- Reduced motion support voor gebruikers met bewegingsgevoeligheid

## File Validation

Client-side validatie controleert:
- Bestandstype: alleen `.xlsx` en `.xls`
- Bestandsgrootte: maximum 10MB
- Lege bestanden worden geweigerd

## Error Handling

ExcelFlow heeft uitgebreide error handling:
- Network errors (geen verbinding, timeout)
- Validation errors (verkeerd bestandstype, te groot)
- API errors (404, 500, etc.)
- Unknown errors (React Error Boundary)

Alle errors worden getransformeerd naar gebruiksvriendelijke Nederlandse messages.

## Testing

Unit tests met Vitest:
- Validation utilities: 20 tests
- Error transformation: 24 tests
- Utility functions: 20 tests

**Total: 64 tests, 100% passing**

```bash
# Run tests
npm test

# With coverage
npm run test:coverage
```

## Deployment

Zie [DEPLOYMENT.md](DEPLOYMENT.md) voor gedetailleerde deployment instructies voor:
- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront

## Known Limitations

- Single file upload (geen multi-file support in MVP)
- Geen authenticatie/authorization
- Geen bestandsgeschiedenis
- Drag-and-drop werkt niet op alle mobile browsers (file picker fallback beschikbaar)

## Support

Voor bugs en feature requests, open een issue op GitHub.

## License

Private - All rights reserved

---

**Built with** React, TypeScript, Vite, TanStack Query, Tailwind CSS, Shadcn/ui
