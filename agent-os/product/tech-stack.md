# Tech Stack

Deze document beschrijft alle technologiekeuzes voor ExcelFlow, gebaseerd op moderne best practices en de specificaties uit de example code.

## Frontend

### Core Framework
- **React 18.3.1** - Modern UI framework met hooks, concurrent features, en optimale performance
- **TypeScript** - Type-safe development voor betere code quality en developer experience
- **Vite 6.3.5** - Ultrasnelle build tool met HMR (Hot Module Replacement) en optimale bundle sizes

### Build & Development Tools
- **@vitejs/plugin-react-swc** - SWC-based React plugin voor Vite, zorgt voor extreem snelle compilatie
- **ESLint & Prettier** - Code linting en formatting (te configureren)
- **TypeScript Compiler** - Strikte type checking tijdens development

## Styling & UI Components

### CSS Framework
- **Tailwind CSS** - Utility-first CSS framework voor rapid UI development
- **tailwind-merge** - Intelligente Tailwind class merging
- **clsx** - Conditional className utilities
- **class-variance-authority (CVA)** - Type-safe component variants

### Component Libraries
- **Radix UI** - Headless, accessible UI primitives:
  - `@radix-ui/react-dialog` - Modals en dialogs
  - `@radix-ui/react-progress` - Progress bars (essentieel voor voortgang)
  - `@radix-ui/react-toast` - Toast notifications (via sonner)
  - `@radix-ui/react-label` - Accessible form labels
  - `@radix-ui/react-tabs` - Tab navigation
  - `@radix-ui/react-dropdown-menu` - Dropdown menus
  - `@radix-ui/react-accordion` - Collapsible content
  - `@radix-ui/react-slider` - Slider inputs
  - En vele andere Radix primitives

### UI Enhancement Libraries
- **Shadcn/ui** - Pre-built component collection op basis van Radix UI en Tailwind
- **Lucide React** (v0.487.0) - Modern icon library met 1000+ icons
- **Sonner** (v2.0.3) - Elegante toast notifications
- **next-themes** (v0.4.6) - Dark mode / theme management
- **Recharts** (v2.15.2) - Data visualization library (voor toekomstige analytics/dashboards)

## State Management

### Huidige Aanpak
- **React Hooks** - useState, useEffect, useReducer voor local component state
- **React Context** (indien nodig) - Voor global state zoals user authentication, theme

### Aanbeveling voor Toekomst
Zodra state complexer wordt (feature 4+), overwegen:
- **Zustand** - Lightweight state management (modern, minimalistisch)
- **Jotai** - Atomic state management (alternatief)
- **TanStack Query (React Query)** - Voor server state management en caching (STERK AANBEVOLEN voor API calls)

## Form Management

- **React Hook Form** (v7.55.0) - Performant form library met validation
  - Gebruikt voor upload settings, configuratie dialogs
  - Minimale re-renders, goede TypeScript support

## API Integration & HTTP Client

### HTTP Client
- **Fetch API** (native) - Voor basis API calls
- **Axios** (aanbevolen toe te voegen) - Voor advanced features:
  - Request/response interceptors
  - Automatic request retries
  - Upload progress tracking
  - Better error handling
  - Request cancellation

### API Client Structuur
```typescript
// Aanbevolen structuur:
/src
  /api
    - client.ts          // Axios instance configuratie
    - endpoints.ts       // API endpoint definitions
    - types.ts          // TypeScript types voor requests/responses
    /services
      - uploadService.ts // Upload-gerelateerde API calls
      - analysisService.ts // Analysis status checking
      - downloadService.ts // Download handling
```

### State Management voor API Calls
- **TanStack Query (React Query)** - STERK AANBEVOLEN:
  - Automatic caching
  - Background refetching
  - Polling voor status updates
  - Optimistic updates
  - Error retry logic
  - Loading/error states

## File Handling

### Upload
- **Native File API** - Voor file selection en client-side validation
- **FormData API** - Voor multipart/form-data uploads
- **FileReader API** - Voor file preview functionaliteit

### Download
- **Blob API** - Voor het verwerken van downloaded files
- **URL.createObjectURL()** - Voor het creëren van download links
- **File-saver** (optioneel) - Library voor cross-browser file downloads

### Excel Parsing (Client-side, optioneel)
- **SheetJS (xlsx)** - Voor client-side Excel parsing indien nodig voor preview functionaliteit
  - Alleen toevoegen als er client-side preview van Excel content nodig is

## Real-time Updates

### Voortgangsmonitoring Strategieën

**Optie 1: Polling (Eenvoudigste)**
- Interval-based API calls (elke 2-5 seconden)
- Implementatie met `setInterval` of TanStack Query's `refetchInterval`
- Beste keuze voor MVP

**Optie 2: Server-Sent Events (SSE)**
- Eenrichtings real-time updates van server naar client
- Goede balance tussen eenvoud en real-time ervaring
- Native browser support via EventSource API

**Optie 3: WebSockets**
- Bidirectionele real-time communicatie
- Meest complex maar meest real-time
- Vereist WebSocket library (zoals `socket.io-client`)

**Aanbeveling:** Start met polling (Optie 1) voor MVP, upgrade naar SSE indien real-time requirements toenemen.

## Backend API Overwegingen

De externe API moet de volgende endpoints ondersteunen:

### Required Endpoints
```
POST /api/upload          - Upload Excel file
GET /api/status/:id       - Get processing status
GET /api/download/:id     - Download processed file
GET /api/files            - List user's files (optioneel)
DELETE /api/files/:id     - Delete file (optioneel)
```

### Aanbevolen Backend Tech Stacks

**Optie 1: Node.js + Express**
- **Runtime:** Node.js 20+ LTS
- **Framework:** Express.js of Fastify
- **Excel Processing:** node-xlsx, exceljs
- **File Storage:** AWS S3, Azure Blob Storage, of local filesystem
- **Pros:** Zelfde taal als frontend (JavaScript/TypeScript), grote ecosystem

**Optie 2: Python + FastAPI**
- **Runtime:** Python 3.11+
- **Framework:** FastAPI (moderne async framework)
- **Excel Processing:** pandas, openpyxl, xlrd/xlwt
- **File Storage:** AWS S3, Azure Blob Storage
- **Pros:** Uitstekend voor data processing, veel data science libraries

**Optie 3: Node.js + NestJS**
- **Runtime:** Node.js 20+ LTS
- **Framework:** NestJS (enterprise-grade, TypeScript-first)
- **Excel Processing:** exceljs, node-xlsx
- **Pros:** Gestructureerd, schaalbaar, TypeScript native

## Deployment & Hosting

### Frontend Deployment
- **Vercel** (aanbevolen) - Optimaal voor Vite + React apps, gratis tier, automatische deployments
- **Netlify** - Alternatief met vergelijkbare features
- **AWS S3 + CloudFront** - Voor enterprise deployments
- **Azure Static Web Apps** - Microsoft alternative

### Backend Deployment (afhankelijk van backend keuze)
- **Vercel Serverless Functions** - Voor Node.js backend
- **AWS Lambda + API Gateway** - Serverless optie
- **Railway** - Eenvoudige container deployments
- **DigitalOcean App Platform** - Eenvoudig en betaalbaar
- **Azure App Service** - Enterprise optie

### File Storage
- **AWS S3** - Industry standard, schaalbaar, betrouwbaar
- **Azure Blob Storage** - Microsoft alternative
- **Cloudflare R2** - Kosteneffectief alternatief zonder egress fees
- **Supabase Storage** - Open source optie met goede DX

## Monitoring & Analytics

### Error Tracking
- **Sentry** - Error monitoring en crash reporting voor frontend en backend
- **LogRocket** - Session replay en error tracking (optioneel)

### Analytics
- **Vercel Analytics** - Built-in performance analytics (indien deployed op Vercel)
- **Plausible Analytics** - Privacy-friendly analytics
- **Google Analytics 4** - Comprehensive analytics (indien privacy-compliance geregeld is)

### Performance Monitoring
- **Web Vitals** - Core Web Vitals tracking (built into React)
- **Lighthouse CI** - Automated performance testing
- **Vercel Speed Insights** - Real user monitoring

## Development Tools

### Package Manager
- **npm** - Default Node.js package manager
- **pnpm** (aanbevolen) - Sneller en efficiënter disk space gebruik
- **yarn** - Alternatief

### Version Control
- **Git** - Source control
- **GitHub** / **GitLab** - Remote repository hosting

### Testing (aanbevolen toe te voegen)
- **Vitest** - Vite-native testing framework (sneller dan Jest)
- **React Testing Library** - Component testing
- **Playwright** - End-to-end testing
- **MSW (Mock Service Worker)** - API mocking voor tests

## Security

### Frontend Security
- **Environment Variables** - Voor API keys en sensitive config (.env files)
- **HTTPS** - Enforced via deployment platform
- **Content Security Policy** - XSS protection
- **Input Validation** - Client-side validation (nooit als enige beveiliging)

### API Security (Backend Requirements)
- **Authentication** - JWT tokens, API keys, of OAuth 2.0
- **Rate Limiting** - Bescherming tegen abuse
- **CORS Configuration** - Restrictive CORS policies
- **File Upload Validation** - Server-side file type/size validation
- **Virus Scanning** - Voor uploaded files (ClamAV of cloud service)

## Browser Compatibility

### Target Browsers
- Chrome 90+ (primary target)
- Firefox 88+
- Safari 14+
- Edge 90+

### Polyfills
- Minimal polyfills needed dankzij moderne target browsers
- Vite handles moderne JavaScript features automatisch

## Performance Targets

### Loading Performance
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.5s
- **Bundle Size:** < 300KB (gzipped) voor initial load

### Runtime Performance
- **API Response Time:** < 500ms voor status checks
- **Upload Speed:** Afhankelijk van file size en netwerk, met progress feedback
- **Download Speed:** Optimale throughput via streaming

## Samenvatting

De tech stack is gebaseerd op moderne, production-ready technologieën met sterke nadruk op:
- **Developer Experience:** TypeScript, Vite, moderne tooling
- **User Experience:** React 18, Tailwind CSS, Radix UI, smooth animations
- **Performance:** Vite build optimizations, code splitting, lazy loading
- **Scalability:** Component-based architectuur, clean API layer
- **Maintainability:** TypeScript types, modular structuur, goede documentatie

Deze stack biedt een solide fundament voor een moderne, schaalbare, en onderhoudbare web-applicatie.
