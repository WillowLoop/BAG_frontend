# BAG Adres Validatie Frontend

Een React/TypeScript frontend applicatie voor het valideren van Nederlandse adressen tegen de officiële BAG (Basisregistratie Adressen en Gebouwen) database.

## Overzicht

Deze applicatie stelt gebruikers in staat om Excel-bestanden met Nederlandse adressen te uploaden, deze te valideren tegen de BAG database, en de gevalideerde resultaten te downloaden met duidelijke statusindicatoren.

### Belangrijkste Functies

- **Excel Upload**: Drag-and-drop of bestandskiezer voor .xlsx bestanden
- **Real-time Validatie**: Automatische validatie met voortgangsindicatoren
- **Download Resultaten**: Download gevalideerde adressen met BAG status
- **Foutafhandeling**: Duidelijke Nederlandse foutmeldingen
- **Responsive Design**: Geoptimaliseerd voor desktop (1280px+)

## Technische Stack

- **Framework**: React 19.1.1 met TypeScript 5.9.3 (strict mode)
- **Build Tool**: Vite 7.1.7
- **HTTP Client**: Axios 1.13.0
- **State Management**: TanStack Query 5.90.5 + React Context
- **UI Components**: Shadcn/ui (Radix UI + Tailwind CSS 4.1.16)
- **Notifications**: Sonner 2.0.7
- **Icons**: Lucide React 0.548.0
- **Testing**: Vitest 4.0.4 met React Testing Library

## Vereisten

- Node.js 18+ of 20+
- npm of pnpm
- BAG API backend (zie API_DOCUMENTATION.md)

## Installatie

1. **Clone de repository**
   ```bash
   git clone <repository-url>
   cd newproject
   ```

2. **Installeer dependencies**
   ```bash
   npm install
   ```

3. **Configureer environment variabelen**
   ```bash
   cp .env.example .env.development
   ```

   Bewerk `.env.development` en stel de BAG API URL in:
   ```
   VITE_BAG_API_BASE_URL=http://localhost:8000
   ```

## Development

### Development Server Starten

```bash
npm run dev
```

De applicatie draait op `http://localhost:5173`

### Tests Uitvoeren

```bash
# Alle tests
npm test

# Tests met UI
npm run test:ui

# Tests met coverage
npm run test:coverage
```

### Linting

```bash
npm run lint
```

### Production Build

```bash
npm run build
```

Output wordt gegenereerd in de `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structuur

```
src/
├── api/                      # API client en services
│   ├── bagClient.ts         # Axios client configuratie
│   ├── types/               # TypeScript type definities
│   ├── services/            # BAG API services
│   └── utils/               # Error transformatie
├── components/              # React components
│   ├── ui/                  # Shadcn/ui basis components
│   ├── BagUploadSection.tsx
│   ├── BagProcessingView.tsx
│   ├── BagDownloadSection.tsx
│   ├── BagErrorView.tsx
│   └── ErrorBoundary.tsx
├── contexts/                # React Context providers
│   └── BagValidationContext.tsx
├── hooks/                   # Custom React hooks
│   ├── useBagFileUpload.ts
│   ├── useBagValidation.ts
│   ├── useBagValidationStatus.ts
│   └── useBagFileDownload.ts
├── lib/                     # Utilities en constants
│   ├── bagConstants.ts
│   ├── bagMessages.ts
│   ├── bagUtils.ts
│   ├── validation.ts
│   └── utils.ts
├── mocks/                   # MSW mock handlers voor testing
├── test/                    # Test setup
├── App.tsx                  # Main app component
└── main.tsx                 # Entry point
```

## Environment Variabelen

### Required

- `VITE_BAG_API_BASE_URL`: BAG API base URL (bijv. `http://localhost:8000`)

### Development

Zie `.env.development` voor development configuratie.

### Production

Zie `.env.production` voor production configuratie. Update met daadwerkelijke production API URL.

## User Workflow

1. **Upload**: Gebruiker sleept .xlsx bestand of gebruikt bestandskiezer
2. **Validatie**: Automatische validatie start na upload
3. **Progress**: Real-time voortgang updates (polling elke 2.5 seconden)
4. **Download**: Download gevalideerde resultaten
5. **Reset**: Start nieuwe validatie

## Code Kwaliteit

### TypeScript

- Strict mode enabled
- Geen `any` types
- Expliciete return types voor alle functies

### Testing

- Unit tests voor utilities en hooks
- Component tests met React Testing Library
- Integration tests met MSW
- Target: >80% coverage voor kritieke code

### Linting

- ESLint configuratie
- React hooks regels
- TypeScript strict checking

## Browser Ondersteuning

- Chrome 90+ (primary)
- Firefox 88+
- Safari 14+
- Edge 90+

## Documentatie

- [API Integration](./docs/api-integration.md) - BAG API endpoints en integratie
- [Deployment Guide](./docs/deployment.md) - Deployment instructies
- [Architecture](./docs/architecture.md) - Component architectuur
- [Troubleshooting](./docs/troubleshooting.md) - Veelvoorkomende problemen

## Licentie

Private - Intern gebruik

## Ondersteuning

Voor vragen of problemen, neem contact op met het development team.
