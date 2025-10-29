# Specificatie: ExcelFlow MVP

## 1. Overzicht

### Doel
ExcelFlow MVP is een moderne web-applicatie die gebruikers in staat stelt om Excel-bestanden te uploaden, deze te laten verwerken via een externe API, de voortgang in real-time te volgen, en de geanalyseerde resultaten te downloaden. Het MVP richt zich op de kernfunctionaliteit: een end-to-end flow van upload naar download met een uitstekende gebruikerservaring.

### Toegevoegde Waarde voor Gebruikers
- **Tijdsbesparing:** Geautomatiseerde Excel-verwerking bespaart 70% tijd vergeleken met handmatige methoden
- **Transparantie:** Real-time voortgangsupdates geven volledige inzicht in het verwerkingsproces
- **Gebruiksgemak:** Geen installatie vereist, werkt direct in de browser op elk apparaat
- **Betrouwbaarheid:** Robuuste error handling en duidelijke feedback bij elke stap

### Scope

#### In Scope voor MVP
1. **Upload Interface** - Drag-and-drop + file picker voor Excel bestanden
2. **API Client** - Robuuste communicatie met externe backend API
3. **Upload Flow** - Bestand uploaden en verwerkingsjob starten
4. **Progress Monitoring** - Real-time voortgangsupdates via polling
5. **Download Functionaliteit** - Geanalyseerde bestanden downloaden

#### Expliciet Out of Scope
- User authentication / login systemen
- Bestandsgeschiedenis of archief functionaliteit
- Multi-file upload (één bestand per keer in MVP)
- Custom analysis settings of configuratie
- Dark mode / theme switching
- Advanced error recovery met automatic retry UI
- Backend API implementatie (wordt separaat ontwikkeld)

## 2. User Stories

### US-1: Excel Bestand Uploaden
**Als een** zakelijke gebruiker
**Wil ik** een Excel bestand kunnen uploaden via drag-and-drop of file picker
**Zodat** ik snel en intuïtief mijn bestand kan indienen voor analyse

**Acceptatiecriteria:**
- Gebruiker kan bestand slepen naar een gemarkeerde dropzone
- Visuele feedback tijdens drag-over (kleurverandering, schaal effect)
- File picker button als alternatief voor drag-and-drop
- Alleen .xlsx en .xls bestanden worden geaccepteerd
- Maximale bestandsgrootte van 10MB wordt gevalideerd
- Foutmelding verschijnt bij ongeldige bestandstype of grootte
- Preview van geselecteerd bestand toont naam en grootte
- Clear/reset optie om bestandsselectie ongedaan te maken

### US-2: Verwerkingsstatus Volgen
**Als een** gebruiker die een bestand heeft geüpload
**Wil ik** de voortgang van de verwerking in real-time kunnen zien
**Zodat** ik weet hoe lang het nog duurt en dat het proces niet is vastgelopen

**Acceptatiecriteria:**
- Progress bar toont percentage van 0% tot 100%
- Status updates verschijnen (bijv. "Uploading", "Processing", "Analyzing", "Complete")
- UI update gebeurt automatisch zonder pagina refresh
- Polling mechanisme haalt elke 2-3 seconden status op van API
- Duidelijke visuele animaties tijdens verwerking (pulserend icoon, loading states)
- Gebruiker kan niet per ongeluk navigeren weg tijdens verwerking (confirmation prompt)

### US-3: Geanalyseerd Bestand Downloaden
**Als een** gebruiker met een succesvol verwerkt bestand
**Wil ik** het geanalyseerde Excel bestand direct kunnen downloaden
**Zodat** ik verder kan werken met de verwerkte data

**Acceptatiecriteria:**
- Download button verschijnt zodra verwerking compleet is
- Bestand wordt gedownload met logische naam (bijv. "analyzed_[originele-naam].xlsx")
- Success message verschijnt na succesvolle download
- Optie om nieuwe analyse te starten (terug naar upload scherm)
- Download werkt correct in alle ondersteunde browsers
- Gebruiker kan dezelfde file opnieuw downloaden indien nodig

### US-4: Fouten Begrijpen en Herstellen
**Als een** gebruiker die een fout tegenkomt
**Wil ik** een duidelijke uitleg krijgen over wat er mis ging en hoe ik het kan oplossen
**Zodat** ik zelfstandig kan herstellen en verder kan gaan

**Acceptatiecriteria:**
- Foutmeldingen zijn menselijk leesbaar (geen technische jargon)
- Specifieke feedback per fouttype (netwerk, validatie, API error, etc.)
- Suggesties voor herstel acties worden getoond
- "Probeer opnieuw" button is duidelijk zichtbaar
- Toast notificaties voor niet-kritieke meldingen
- Error boundary vangt onverwachte crashes en toont fallback UI

### US-5: Applicatie Gebruiken op Mobiel
**Als een** gebruiker op mobiel apparaat
**Wil ik** dezelfde functionaliteit hebben als op desktop
**Zodat** ik onderweg bestanden kan analyseren

**Acceptatiecriteria:**
- Responsive layout past zich aan aan schermgrootte
- Touch-friendly buttons en interacties (minimaal 44x44px touch targets)
- File picker werkt correct op mobiele browsers
- Progress indicators zijn duidelijk leesbaar op klein scherm
- Layout verschuift niet of breekt niet op verschillende schermformaten
- Optimale weergave op iOS Safari en Chrome Android

## 3. Technische Architectuur

### Component Hiërarchie

```
App.tsx
├── Header (navigation, branding)
├── Main Content
│   ├── ConditionalRender op uploadState
│   │   ├── [LANDING STATE]
│   │   │   ├── HeroSection (titel, beschrijving)
│   │   │   ├── UploadSection (drag-drop, file picker)
│   │   │   └── FeaturesGrid (3 features: Fast, Secure, Easy)
│   │   │
│   │   ├── [UPLOADING STATE]
│   │   │   └── ProcessingView (upload progress bar)
│   │   │
│   │   ├── [PROCESSING STATE]
│   │   │   └── ProcessingView (analysis progress, status updates)
│   │   │
│   │   ├── [COMPLETE STATE]
│   │   │   └── DownloadSection (success message, download button)
│   │   │
│   │   └── [ERROR STATE]
│   │       └── ErrorView (error message, retry button)
│   │
└── Footer (copyright, links)

Shared Components:
├── ui/button.tsx (Shadcn Button)
├── ui/card.tsx (Shadcn Card)
├── ui/progress.tsx (Shadcn Progress)
├── Toaster (Sonner voor notifications)
└── ErrorBoundary (React error boundary)

API Layer:
├── api/client.ts (Axios instance configuratie)
├── api/services/upload.service.ts (Upload API calls)
├── api/services/analysis.service.ts (Status polling)
├── api/services/download.service.ts (Download handling)
└── api/types.ts (TypeScript interfaces)

Hooks:
├── hooks/useFileUpload.ts (Upload logic + TanStack Query)
├── hooks/useAnalysisStatus.ts (Polling logic + TanStack Query)
└── hooks/useFileDownload.ts (Download logic)
```

### Data Flow

```
1. UPLOAD FLOW:
   User selecteert file
   → Client-side validatie (type, grootte)
   → useFileUpload hook
   → POST /api/upload (multipart/form-data)
   → Ontvang { jobId, status }
   → State update naar PROCESSING

2. PROGRESS FLOW:
   State = PROCESSING
   → useAnalysisStatus hook activeert polling
   → GET /api/status/:jobId elke 2-3 seconden
   → Ontvang { progress, status, message }
   → Update progress bar
   → Bij status="complete" → State update naar COMPLETE

3. DOWNLOAD FLOW:
   State = COMPLETE
   → User klikt download button
   → useFileDownload hook
   → GET /api/download/:jobId
   → Ontvang binary file data
   → Blob creation + download trigger
   → Toast notificatie: "Download succesvol"

4. ERROR FLOW:
   Bij elke stap kan error optreden
   → Error wordt gevangen door try-catch of TanStack Query
   → Error state update
   → ErrorView component toont foutmelding
   → User kan retry of terug naar upload
```

### State Management Strategie

**Global State (React Context):**
```typescript
interface AppState {
  uploadState: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  currentFile: File | null;
  jobId: string | null;
  error: AppError | null;
}
```

**Server State (TanStack Query):**
- Upload mutations: `useMutation` voor POST /api/upload
- Status polling: `useQuery` met `refetchInterval` voor GET /api/status/:jobId
- Download: `useMutation` voor GET /api/download/:jobId

**Benefits:**
- Automatische caching en deduplicatie van requests
- Built-in loading en error states
- Optimistic updates mogelijk
- Retry logic out-of-the-box

### API Integratie Patterns

**Axios Instance Setup:**
```typescript
// api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor voor logging/auth
apiClient.interceptors.request.use(
  (config) => {
    // Voeg API key toe indien nodig
    // Voeg request ID toe voor tracing
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor voor error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralized error handling
    // Network errors, timeouts, API errors
    return Promise.reject(transformError(error));
  }
);
```

**TanStack Query Setup:**
```typescript
// main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

## 4. Component Specificaties

### 4.1 UploadSection Component

**Locatie:** `src/components/UploadSection.tsx`

**Props Interface:**
```typescript
interface UploadSectionProps {
  onFileSelect: (file: File) => void;
  isDisabled?: boolean;
}
```

**State Requirements:**
- `isDragging: boolean` - Track drag-over state voor visuele feedback
- `selectedFile: File | null` - Tijdelijke opslag van geselecteerd bestand voor preview

**Key Behaviors:**
1. **Drag-and-Drop:**
   - `onDragOver`: Prevent default, set isDragging=true
   - `onDragLeave`: Set isDragging=false
   - `onDrop`: Prevent default, extract file, validate, call onFileSelect
   - Visuele feedback: border kleur, achtergrond kleur, schaal transformatie

2. **File Picker:**
   - Hidden `<input type="file">` met ref
   - Button click triggers input.click()
   - `accept=".xlsx,.xls"` attribuut
   - `onChange` handler extracts file, validates, calls onFileSelect

3. **Validatie:**
   - Check bestandsextensie (.xlsx, .xls)
   - Check bestandsgrootte (max 10MB = 10485760 bytes)
   - Toon error toast bij ongeldige bestanden

**Edge Cases:**
- Gebruiker dropt meerdere bestanden → Neem alleen eerste bestand
- Gebruiker dropt niet-Excel bestand → Toast error: "Alleen .xlsx en .xls bestanden toegestaan"
- Gebruiker dropt bestand > 10MB → Toast error: "Bestand te groot. Maximum is 10MB"
- Browser ondersteunt geen drag-and-drop → File picker blijft beschikbaar

**UI States:**
- `default`: Neutrale kleuren, upload icoon
- `dragging`: Blauwe border, lichtblauwe achtergrond, icoon schaalt
- `disabled`: Grijze kleuren, pointer-events: none

**Referentie:** Zie `/Users/cheersrijneau/Developer/newproject/example code/src/components/FileUploadSection.tsx` voor visueel design patroon.

---

### 4.2 ProcessingView Component

**Locatie:** `src/components/ProcessingView.tsx`

**Props Interface:**
```typescript
interface ProcessingViewProps {
  jobId: string;
  fileName: string;
  onComplete: () => void;
  onError: (error: AppError) => void;
}
```

**State Requirements:**
- `progress: number` - Percentage 0-100
- `status: ProcessingStatus` - 'uploading' | 'processing' | 'analyzing' | 'complete'
- `statusMessage: string` - Menselijk leesbare status beschrijving

**Key Behaviors:**
1. **Polling Mechanisme:**
   ```typescript
   const { data, error } = useQuery({
     queryKey: ['analysisStatus', jobId],
     queryFn: () => analysisService.getStatus(jobId),
     refetchInterval: 2500, // Poll elke 2.5 seconden
     enabled: !!jobId,
   });
   ```

2. **Progress Updates:**
   - Update progress bar met data.progress
   - Update status message op basis van data.status
   - Animeer status changes met smooth transitions

3. **Completion Detection:**
   - Wanneer data.status === 'complete', stop polling
   - Call onComplete() callback
   - Transition naar DownloadSection

4. **Error Detection:**
   - Wanneer data.status === 'failed', stop polling
   - Call onError() met error details
   - Toon retry optie

**Edge Cases:**
- Polling fails door netwerk error → Retry automatisch (TanStack Query)
- API response missing progress field → Default naar 0
- Status blijft hangen op 99% → Timeout na 5 minuten, toon error
- User navigeert weg tijdens processing → Toon confirmation dialog

**UI Elements:**
- Progress bar (Shadcn Progress component)
- Percentage label (bijv. "67%")
- Status message met animatie (fade in/out bij wijziging)
- Pulserende dot indicators voor actieve status
- Cancel button (optioneel voor MVP)

**Referentie:** Zie `/Users/cheersrijneau/Developer/newproject/example code/src/components/FileAnalyzer.tsx` regels 125-160 voor progress UI pattern.

---

### 4.3 DownloadSection Component

**Locatie:** `src/components/DownloadSection.tsx`

**Props Interface:**
```typescript
interface DownloadSectionProps {
  jobId: string;
  fileName: string;
  onReset: () => void; // Terug naar upload scherm
}
```

**State Requirements:**
- `isDownloading: boolean` - Loading state tijdens download

**Key Behaviors:**
1. **Download Trigger:**
   ```typescript
   const downloadMutation = useMutation({
     mutationFn: () => downloadService.downloadFile(jobId),
     onSuccess: (blob) => {
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = `analyzed_${fileName}`;
       a.click();
       URL.revokeObjectURL(url);
       toast.success('Bestand succesvol gedownload');
     },
     onError: (error) => {
       toast.error('Download mislukt. Probeer opnieuw.');
     },
   });
   ```

2. **Success State:**
   - Toon success icoon (checkmark in groene cirkel)
   - Toon "Analyse compleet!" bericht
   - Prominent download button
   - "Nieuwe analyse starten" button

3. **Multiple Downloads:**
   - Gebruiker kan meerdere keren downloaden
   - Geen limiet op aantal downloads

**Edge Cases:**
- Download fails → Toast error, retry button blijft zichtbaar
- Bestandsnaam bevat speciale karakters → Sanitize bestandsnaam
- Browser blokkeert automatische download → Instructies tonen aan gebruiker

**UI Elements:**
- Success icoon (groot, gecentreerd)
- Success message
- Download button (primair, gradient)
- Reset button (secundair, outline)
- Optional: Analysis summary kaart (rijen processed, etc.)

**Referentie:** Zie `/Users/cheersrijneau/Developer/newproject/example code/src/components/FileAnalyzer.tsx` regels 162-251 voor complete state UI.

---

### 4.4 ErrorBoundary Component

**Locatie:** `src/components/ErrorBoundary.tsx`

**Purpose:**
Vangt onverwachte React errors en voorkomt dat de hele app crasht. Toont gebruiksvriendelijke fallback UI.

**Implementation:**
```typescript
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log naar monitoring service (bijv. Sentry)
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}
```

**Fallback UI:**
- Foutmelding: "Er is iets misgegaan"
- Beschrijving: "De applicatie heeft een onverwachte fout tegengekomen"
- Refresh button: "Herlaad pagina"
- Contact support link (optioneel)

---

### 4.5 API Client & Services

#### api/client.ts
**Responsibilities:**
- Axios instance configuratie
- Base URL setup (via environment variable)
- Request/response interceptors
- Timeout configuratie (30s default)
- Error transformation

#### api/services/upload.service.ts
**Functions:**
```typescript
async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<UploadResponse>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      // Optional: Track upload progress
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
    },
  });

  return response.data;
}
```

#### api/services/analysis.service.ts
**Functions:**
```typescript
async function getStatus(jobId: string): Promise<AnalysisStatus> {
  const response = await apiClient.get<AnalysisStatus>(`/status/${jobId}`);
  return response.data;
}
```

#### api/services/download.service.ts
**Functions:**
```typescript
async function downloadFile(jobId: string): Promise<Blob> {
  const response = await apiClient.get(`/download/${jobId}`, {
    responseType: 'blob',
  });
  return response.data;
}
```

#### api/types.ts
**TypeScript Interfaces:**
```typescript
interface UploadResponse {
  jobId: string;
  status: 'queued' | 'processing';
  message?: string;
}

interface AnalysisStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'analyzing' | 'complete' | 'failed';
  progress: number; // 0-100
  message?: string;
  error?: string;
}

interface AppError {
  type: 'validation' | 'network' | 'api' | 'unknown';
  message: string;
  details?: string;
  statusCode?: number;
}
```

## 5. API Integratie Specificatie

### 5.1 API Endpoints

#### POST /api/upload
**Purpose:** Upload Excel bestand en start verwerkingsjob

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData met 'file' field

**Response (Success - 201 Created):**
```json
{
  "jobId": "uuid-v4-string",
  "status": "queued",
  "message": "File uploaded successfully"
}
```

**Response (Error - 400 Bad Request):**
```json
{
  "error": "Invalid file type",
  "message": "Only .xlsx and .xls files are supported"
}
```

**Response (Error - 413 Payload Too Large):**
```json
{
  "error": "File too large",
  "message": "Maximum file size is 10MB"
}
```

---

#### GET /api/status/:jobId
**Purpose:** Haal huidige verwerkingsstatus op

**Request:**
- Method: GET
- URL Parameter: jobId (string)

**Response (Success - 200 OK):**
```json
{
  "jobId": "uuid-v4-string",
  "status": "processing",
  "progress": 67,
  "message": "Analyzing data structure"
}
```

**Mogelijke Status Values:**
- `queued` - Job is in wachtrij
- `processing` - Bestand wordt verwerkt
- `analyzing` - Data wordt geanalyseerd
- `complete` - Verwerking compleet
- `failed` - Verwerking mislukt

**Response (Error - 404 Not Found):**
```json
{
  "error": "Job not found",
  "message": "No job found with ID: xxx"
}
```

---

#### GET /api/download/:jobId
**Purpose:** Download geanalyseerd Excel bestand

**Request:**
- Method: GET
- URL Parameter: jobId (string)

**Response (Success - 200 OK):**
- Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- Content-Disposition: attachment; filename="analyzed_[original-name].xlsx"
- Body: Binary Excel file data

**Response (Error - 404 Not Found):**
```json
{
  "error": "File not found",
  "message": "Analyzed file not available for job: xxx"
}
```

**Response (Error - 400 Bad Request):**
```json
{
  "error": "Job not complete",
  "message": "Cannot download file. Job status is: processing"
}
```

---

### 5.2 Error Handling Scenarios

#### Network Errors
**Scenario:** Geen internetverbinding of server unreachable

**Handling:**
```typescript
if (error.code === 'ERR_NETWORK') {
  return {
    type: 'network',
    message: 'Geen verbinding met de server. Controleer je internetverbinding.',
  };
}
```

**UI:** Toast error met retry button

---

#### Timeout Errors
**Scenario:** Request duurt langer dan 30 seconden

**Handling:**
```typescript
if (error.code === 'ECONNABORTED') {
  return {
    type: 'network',
    message: 'Verzoek duurde te lang. Probeer opnieuw.',
  };
}
```

**UI:** Toast error met retry button

---

#### 4xx Client Errors
**Scenario:** Ongeldige request (validatie errors)

**Handling:**
```typescript
if (error.response?.status >= 400 && error.response?.status < 500) {
  return {
    type: 'validation',
    message: error.response.data.message || 'Ongeldige aanvraag',
    details: error.response.data.error,
  };
}
```

**UI:** Inline error message bij relevant formulier veld

---

#### 5xx Server Errors
**Scenario:** Backend server error

**Handling:**
```typescript
if (error.response?.status >= 500) {
  return {
    type: 'api',
    message: 'Server fout. Ons team is op de hoogte. Probeer later opnieuw.',
    statusCode: error.response.status,
  };
}
```

**UI:** Error page met "Contact support" optie

---

### 5.3 Polling Strategie

**Approach:** Simple interval polling met TanStack Query

**Configuration:**
```typescript
const { data: status } = useQuery({
  queryKey: ['analysisStatus', jobId],
  queryFn: () => analysisService.getStatus(jobId),
  refetchInterval: (data) => {
    // Stop polling als job compleet of gefaald is
    if (data?.status === 'complete' || data?.status === 'failed') {
      return false;
    }
    return 2500; // Poll elke 2.5 seconden
  },
  enabled: !!jobId && uploadState === 'processing',
});
```

**Benefits:**
- Automatische retry bij gefaalde requests
- Stopt automatisch bij complete/failed status
- Geen memory leaks (cleanup via TanStack Query)

**Edge Case - Stuck Jobs:**
Implementeer timeout mechanisme:
```typescript
const [startTime] = useState(Date.now());

useEffect(() => {
  if (uploadState === 'processing') {
    const timeout = setTimeout(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed > 300000) { // 5 minuten
        setError({
          type: 'api',
          message: 'Verwerking duurt onverwacht lang. Neem contact op met support.',
        });
        setUploadState('error');
      }
    }, 300000);

    return () => clearTimeout(timeout);
  }
}, [uploadState]);
```

---

### 5.4 Retry Logic

**TanStack Query Configuration:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3, // Retry 3 keer bij failures
      retryDelay: (attemptIndex) => {
        // Exponential backoff: 1s, 2s, 4s
        return Math.min(1000 * 2 ** attemptIndex, 30000);
      },
    },
    mutations: {
      retry: 1, // Upload mutations retry 1 keer
    },
  },
});
```

**Manual Retry:**
Voor user-initiated retries na error:
```typescript
const { refetch } = useQuery(...);

// In error UI:
<Button onClick={() => refetch()}>Probeer opnieuw</Button>
```

## 6. UI/UX Specificaties

### 6.1 Layout Structuur

**Container:**
- Max-width: 1280px (container class)
- Padding: 16px op mobile, 32px op desktop
- Centered met `mx-auto`

**Grid Systeem:**
- Features grid: 1 kolom mobile, 3 kolommen desktop
- Gap: 24px (gap-6)

**Responsive Breakpoints:**
```css
sm: 640px   /* Tablets */
md: 768px   /* Small laptops */
lg: 1024px  /* Desktops */
xl: 1280px  /* Large desktops */
```

---

### 6.2 Visuele States

#### Landing State (Idle)
**Layout:**
- Hero section bovenaan (titel + beschrijving)
- Upload section centraal
- Features grid onderaan
- Footer

**Colors:**
- Background: Gradient van blue-50 via white naar purple-50
- Card: Wit met subtiele shadow
- Primaire button: Gradient blue-600 naar purple-600

---

#### Uploading State
**Visual Changes:**
- Upload section vervangen door progress card
- Progress bar toont upload percentage
- Status: "Bestand uploaden..."
- Upload icoon met spin animatie

---

#### Processing State
**Visual Changes:**
- Progress card blijft zichtbaar
- Progress bar update met analysis percentage
- Status messages veranderen dynamisch
- Pulserende dot indicators bij actieve taken

---

#### Complete State
**Visual Changes:**
- Success icoon (groene checkmark in cirkel)
- Success message prominent
- Download button (gradient, groot)
- "Nieuwe analyse" button (outline, secundair)
- Optional: Summary card met statistieken

---

#### Error State
**Visual Changes:**
- Error icoon (rode X of alert triangle)
- Error message in duidelijke taal
- Suggestie voor oplossing
- "Probeer opnieuw" button
- "Terug naar upload" button

---

### 6.3 Responsive Behavior

**Mobile (< 768px):**
- Single column layout
- Upload card: Volledige breedte, padding 24px
- Features: Stack verticaal
- Buttons: Volledige breedte
- Font sizes: Kleiner (text-sm voor body)

**Desktop (>= 768px):**
- Multi-column layouts waar logisch
- Upload card: Max-width 600px, centered
- Features: 3 kolom grid
- Buttons: Auto width met padding
- Font sizes: Standaard

**Touch Targets:**
Alle interactieve elementen minimaal 44x44px voor touch accessibility

---

### 6.4 Accessibility Requirements

**Keyboard Navigation:**
- Alle interacties bereikbaar via Tab toets
- Focus indicators zichtbaar (ring-2 ring-offset-2)
- Escape toets sluit dialogs/modals
- Enter/Space activeren buttons

**Screen Reader Support:**
```typescript
// ARIA labels toevoegen:
<button aria-label="Upload Excel bestand">
  <Upload className="w-4 h-4" />
</button>

// Status updates announcements:
<div role="status" aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Progress bar semantics:
<div
  role="progressbar"
  aria-valuenow={progress}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Upload voortgang"
>
```

**Color Contrast:**
- Tekst heeft minimaal 4.5:1 contrast ratio (WCAG AA)
- Buttons hebben duidelijke focus states
- Error messages gebruiken niet alleen kleur (ook iconen)

**Alt Text:**
- Alle decoratieve iconen krijgen `aria-hidden="true"`
- Informatieve iconen krijgen descriptieve labels

---

### 6.5 Animaties & Transities

**Micro-interactions:**
```css
/* Button hover effect */
.button {
  transition: all 0.2s ease-in-out;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Drag-over feedback */
.dropzone.dragging {
  transition: all 0.3s ease-out;
  transform: scale(1.02);
  border-color: theme('colors.blue.400');
  background-color: theme('colors.blue.50');
}

/* Progress bar animation */
.progress-bar {
  transition: width 0.5s ease-out;
}

/* Status message fade */
.status-message {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

**Loading States:**
- Skeleton loaders voor async content (niet in MVP scope)
- Spinner voor button loading states
- Pulse animation voor processing indicators

**Performance:**
- Gebruik `transform` en `opacity` voor animations (GPU accelerated)
- Vermijd layout thrashing
- Debounce resize handlers

## 7. File Handling Specificatie

### 7.1 Geaccepteerde Bestandstypen

**Toegestaan:**
- `.xlsx` - Excel 2007+ (Office Open XML Spreadsheet)
- `.xls` - Excel 97-2003 (Binary Interchange File Format)

**Niet toegestaan (voor MVP):**
- `.csv` - Comma Separated Values
- `.ods` - OpenDocument Spreadsheet
- `.numbers` - Apple Numbers
- Andere formaten

---

### 7.2 Bestandsgrootte Limiet

**Maximum:** 10 MB (10485760 bytes)

**Validatie:**
```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

function validateFileSize(file: File): boolean {
  if (file.size > MAX_FILE_SIZE) {
    toast.error(
      `Bestand te groot (${(file.size / 1024 / 1024).toFixed(2)} MB). ` +
      `Maximum is 10 MB.`
    );
    return false;
  }
  return true;
}
```

**Rationale:**
- Balans tussen gebruiksvriendelijkheid en server load
- 10MB dekt 95% van typische zakelijke Excel bestanden
- Voorkomt excessieve upload tijden op langzame verbindingen

---

### 7.3 Client-side Validatie

**Stappen:**
1. **Type validatie** via bestandsextensie
2. **Grootte validatie** tegen MAX_FILE_SIZE
3. **MIME type check** (optioneel extra layer)

**Implementation:**
```typescript
function validateFile(file: File): { valid: boolean; error?: string } {
  // Check extensie
  const validExtensions = ['.xlsx', '.xls'];
  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

  if (!validExtensions.includes(extension)) {
    return {
      valid: false,
      error: 'Alleen .xlsx en .xls bestanden zijn toegestaan.',
    };
  }

  // Check grootte
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Bestand te groot (${(file.size / 1024 / 1024).toFixed(2)} MB). Maximum is 10 MB.`,
    };
  }

  // Check lege bestanden
  if (file.size === 0) {
    return {
      valid: false,
      error: 'Bestand is leeg.',
    };
  }

  return { valid: true };
}
```

**Note:** Client-side validatie is NIET voldoende als security maatregel. Backend MOET ook valideren.

---

### 7.4 Upload Progress Tracking

**Approach:** Axios `onUploadProgress` callback

**Implementation:**
```typescript
async function uploadFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<UploadResponse>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress?.(percentCompleted);
      }
    },
  });

  return response.data;
}
```

**UI Integration:**
```typescript
const [uploadProgress, setUploadProgress] = useState(0);

const uploadMutation = useMutation({
  mutationFn: (file: File) => uploadService.uploadFile(file, setUploadProgress),
  onSuccess: (data) => {
    setJobId(data.jobId);
    setUploadState('processing');
  },
});
```

---

### 7.5 Download Bestandsnaamgeving

**Formaat:** `analyzed_[originele-naam].xlsx`

**Implementation:**
```typescript
function generateDownloadFilename(originalName: string): string {
  // Remove extensie
  const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));

  // Sanitize special characters
  const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');

  // Add prefix en extensie
  return `analyzed_${sanitized}.xlsx`;
}
```

**Voorbeelden:**
- `sales_data.xlsx` → `analyzed_sales_data.xlsx`
- `Q4 Report 2024.xlsx` → `analyzed_Q4_Report_2024.xlsx`
- `données françaises.xls` → `analyzed_donn_es_fran_aises.xlsx`

**Content-Disposition Header:**
Backend moet header toevoegen:
```
Content-Disposition: attachment; filename="analyzed_sales_data.xlsx"
```

## 8. Error Handling

### 8.1 Network Errors

**Scenario:** Geen internet, server offline, DNS failure

**Detection:**
```typescript
if (axios.isAxiosError(error) && !error.response) {
  // Network error
}
```

**User Message:**
"Kan geen verbinding maken met de server. Controleer je internetverbinding en probeer opnieuw."

**UI:**
- Toast notification (error variant)
- Retry button prominent zichtbaar
- Optie om support te contacteren

**Retry Strategy:**
- Automatisch: 3 retries met exponential backoff
- Manueel: User kan retry button klikken

---

### 8.2 Invalid File Type

**Scenario:** Gebruiker selecteert .pdf, .doc, of ander niet-ondersteund bestandstype

**Detection:**
Client-side validatie in `validateFile()` functie

**User Message:**
"Dit bestandstype wordt niet ondersteund. Upload een .xlsx of .xls bestand."

**UI:**
- Inline error onder upload zone (rode tekst)
- Toast notification
- Upload zone blijft beschikbaar

**Prevention:**
- `accept=".xlsx,.xls"` attribute op file input (hint voor browser)
- Duidelijke instructies: "Ondersteunde formaten: .xlsx, .xls"

---

### 8.3 File Too Large

**Scenario:** Gebruiker selecteert bestand > 10MB

**Detection:**
Client-side validatie controleert `file.size`

**User Message:**
"Bestand te groot ([XX] MB). Het maximum is 10 MB. Probeer een kleiner bestand."

**UI:**
- Toast notification (error variant)
- Inline error message met exacte bestandsgrootte
- Suggestie: "Tip: Verwijder onnodige sheets of comprimeer het bestand"

---

### 8.4 API Errors

#### 400 Bad Request
**Scenario:** Server validatie faalt (type, grootte, corrupt bestand)

**User Message:**
Backend error message (indien beschikbaar) of fallback:
"Het bestand kon niet verwerkt worden. Controleer of het een geldig Excel bestand is."

**UI:**
- Error card met details
- "Probeer een ander bestand" button

---

#### 401 Unauthorized (Toekomstig)
**Scenario:** API key expired of missing (niet in MVP)

**User Message:**
"Autorisatie verlopen. Log opnieuw in."

---

#### 404 Not Found
**Scenario:** Job ID bestaat niet (bij status check of download)

**User Message:**
"Het verzoek kon niet gevonden worden. De verwerking is mogelijk verlopen."

**UI:**
- Error message
- "Terug naar upload" button

---

#### 429 Too Many Requests
**Scenario:** Rate limiting kick in

**User Message:**
"Te veel verzoeken. Wacht even en probeer opnieuw."

**UI:**
- Toast warning
- Countdown timer (optioneel)
- Retry button disabled tijdens countdown

---

#### 500 Internal Server Error
**Scenario:** Backend crash, database error, etc.

**User Message:**
"Er ging iets mis op de server. Ons team is op de hoogte. Probeer later opnieuw."

**UI:**
- Error page (volledige scherm)
- Error code + request ID (voor support)
- "Neem contact op" link

---

#### 503 Service Unavailable
**Scenario:** Server maintenance of overload

**User Message:**
"De service is tijdelijk niet beschikbaar. Probeer over enkele minuten opnieuw."

**UI:**
- Toast warning (niet zo ernstig als 500)
- Automatic retry na 30 seconden

---

### 8.5 Timeout Scenarios

**Upload Timeout (30s):**
**Message:** "Upload duurt te lang. Controleer je verbinding of probeer een kleiner bestand."

**Status Check Timeout (10s):**
**Behavior:** TanStack Query retries automatisch, geen user feedback nodig bij eerste timeout

**Download Timeout (30s):**
**Message:** "Download duurt te lang. Probeer opnieuw."

---

### 8.6 User-friendly Error Messages

**Principes:**
1. **Menselijke taal:** Geen technische jargon of error codes in hoofdbericht
2. **Actionable:** Vertel gebruiker wat ze kunnen doen
3. **Empathie:** Toon begrip voor frustratie
4. **Details optioneel:** Technische details in collapsible section of tooltip

**Voorbeelden:**

❌ **Slecht:**
"ERR_NETWORK: Network request failed with status undefined"

✅ **Goed:**
"Kan geen verbinding maken. Controleer je internet en probeer opnieuw."

---

❌ **Slecht:**
"Validation error: file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'"

✅ **Goed:**
"Dit bestandstype wordt niet ondersteund. Upload een .xlsx of .xls bestand."

---

**Template:**
```typescript
interface ErrorMessage {
  title: string;        // Kort, duidelijk ("Kan niet uploaden")
  message: string;      // Menselijk leesbaar wat er mis is
  action?: string;      // Wat kan gebruiker doen
  details?: string;     // Technische details (collapsible)
}
```

## 9. Implementatie Notities

### 9.1 Key Dependencies

**Core:**
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "typescript": "^5.0.0"
}
```

**Build Tool:**
```json
{
  "vite": "^6.3.5",
  "@vitejs/plugin-react-swc": "^3.0.0"
}
```

**API & State Management:**
```json
{
  "@tanstack/react-query": "^5.0.0",
  "axios": "^1.6.0"
}
```

**UI Components:**
```json
{
  "@radix-ui/react-progress": "^1.0.0",
  "@radix-ui/react-dialog": "^1.0.0",
  "@radix-ui/react-toast": "^1.0.0",
  "lucide-react": "^0.487.0",
  "sonner": "^2.0.3"
}
```

**Styling:**
```json
{
  "tailwindcss": "^3.4.0",
  "tailwind-merge": "^2.0.0",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0"
}
```

**Development:**
```json
{
  "@types/react": "^18.3.0",
  "@types/react-dom": "^18.3.0",
  "eslint": "^8.0.0",
  "prettier": "^3.0.0"
}
```

**Optional (Recommended):**
```json
{
  "vitest": "^1.0.0",           // Testing framework
  "@testing-library/react": "^14.0.0",  // React testing utilities
  "@sentry/react": "^7.0.0"     // Error monitoring
}
```

---

### 9.2 Environment Variables

**Required:**
```bash
# .env
VITE_API_BASE_URL=http://localhost:3000/api
```

**Optional:**
```bash
VITE_MAX_FILE_SIZE_MB=10
VITE_POLLING_INTERVAL_MS=2500
VITE_UPLOAD_TIMEOUT_MS=30000
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx  # Error monitoring
```

**Access in Code:**
```typescript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const maxFileSize = parseInt(import.meta.env.VITE_MAX_FILE_SIZE_MB) * 1024 * 1024;
```

**Development vs Production:**
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api

# .env.production
VITE_API_BASE_URL=https://api.excelflow.com/api
```

---

### 9.3 TypeScript Configuratie

**tsconfig.json Belangrijke Settings:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,              // Enable alle strict checks
    "noUnusedLocals": true,      // Error op ongebruikte variabelen
    "noUnusedParameters": true,  // Error op ongebruikte parameters
    "noFallthroughCasesInSwitch": true,
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./src/*"]         // Path alias voor imports
    }
  }
}
```

**Benefits Strict Mode:**
- Catch bugs tijdens development
- Betere autocomplete in IDE
- Makkelijker refactoren
- Documentatie via types

---

### 9.4 Testing Approach

**Unit Tests (Vitest):**
Focus op utility functions en business logic:
- `validateFile()` - Test alle edge cases
- `generateDownloadFilename()` - Test sanitization
- `transformError()` - Test error mapping
- API service functions - Mock met MSW

**Component Tests (@testing-library/react):**
Focus op user interactions:
- `UploadSection`: Drag-drop, file picker, validation feedback
- `ProcessingView`: Progress updates, status changes
- `DownloadSection`: Download trigger, reset functionaliteit

**Example Test:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { UploadSection } from './UploadSection';

describe('UploadSection', () => {
  it('shows error toast when invalid file is selected', async () => {
    const onFileSelect = vi.fn();
    render(<UploadSection onFileSelect={onFileSelect} />);

    const input = screen.getByRole('button', { name: /choose file/i });
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText(/alleen .xlsx en .xls/i)).toBeInTheDocument();
    expect(onFileSelect).not.toHaveBeenCalled();
  });
});
```

**E2E Tests (Playwright) - Optioneel voor MVP:**
Test de volledige flow:
1. Upload geldig bestand
2. Wacht op processing
3. Verify download

**Testing Priority voor MVP:**
- Unit tests voor validatie logica (HIGH)
- Component tests voor upload section (MEDIUM)
- E2E tests (LOW - nice to have)

---

### 9.5 Code Organisatie

**Folder Structuur:**
```
src/
├── api/
│   ├── client.ts                 # Axios instance
│   ├── types.ts                  # API interfaces
│   └── services/
│       ├── upload.service.ts
│       ├── analysis.service.ts
│       └── download.service.ts
│
├── components/
│   ├── UploadSection.tsx
│   ├── ProcessingView.tsx
│   ├── DownloadSection.tsx
│   ├── ErrorBoundary.tsx
│   ├── ErrorView.tsx
│   └── ui/                       # Shadcn components
│       ├── button.tsx
│       ├── card.tsx
│       ├── progress.tsx
│       └── ...
│
├── hooks/
│   ├── useFileUpload.ts          # TanStack Query hook
│   ├── useAnalysisStatus.ts      # Polling hook
│   └── useFileDownload.ts        # Download hook
│
├── lib/
│   ├── utils.ts                  # cn() helper, etc.
│   └── validation.ts             # File validation utilities
│
├── types/
│   └── app.ts                    # App-level TypeScript types
│
├── App.tsx                       # Main component
├── main.tsx                      # Entry point + providers
└── index.css                     # Tailwind imports
```

**Import Conventions:**
```typescript
// Use path aliases
import { Button } from '@/components/ui/button';
import { uploadService } from '@/api/services/upload.service';
import { validateFile } from '@/lib/validation';

// Not relative paths:
// import { Button } from '../../components/ui/button'; ❌
```

---

### 9.6 Performance Overwegingen

**Code Splitting:**
```typescript
// Lazy load non-critical components
const AnalysisSettings = lazy(() => import('./components/AnalysisSettings'));

<Suspense fallback={<LoadingSpinner />}>
  <AnalysisSettings />
</Suspense>
```

**Memo voor Expensive Components:**
```typescript
export const ProcessingView = memo(({ jobId, fileName }: Props) => {
  // Only re-render when jobId or fileName changes
});
```

**Debounce Resize Handlers:**
```typescript
const debouncedResize = useMemo(
  () => debounce(() => setWindowSize(window.innerWidth), 200),
  []
);
```

**Optimize Images/Icons:**
- Gebruik SVG voor icons (lucide-react)
- Lazy load hero afbeeldingen indien aanwezig
- Use WebP format voor raster graphics

**Bundle Size Targets:**
- Initial bundle: < 200KB gzipped
- Vendor bundle (React, etc.): < 150KB gzipped
- Total page weight: < 500KB

---

### 9.7 Deployment Checklist

**Voor Production:**
- [ ] Environment variabelen geconfigureerd in hosting platform
- [ ] API base URL wijst naar productie backend
- [ ] Error monitoring (Sentry) geactiveerd
- [ ] Analytics toegevoegd (optioneel)
- [ ] Browser compatibility getest (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive getest op echte devices
- [ ] Lighthouse score > 90 (Performance, Accessibility, Best Practices)
- [ ] HTTPS enforced
- [ ] CSP headers configured
- [ ] Favicon en meta tags toegevoegd

**Build Command:**
```bash
npm run build
```

**Hosting Platforms (Aanbevolen):**
1. **Vercel** - Beste developer experience, zero-config
2. **Netlify** - Goede alternatief
3. **Cloudflare Pages** - Snel en gratis
4. **AWS S3 + CloudFront** - Enterprise optie

## 10. Open Vragen & Beslissingen Nodig

### 10.1 Backend API Contract

**Vraag:** Welke backend technologie wordt gebruikt?
- Node.js + Express?
- Python + FastAPI?
- Java + Spring Boot?
- Andere?

**Impact:** Beïnvloedt test strategie en local development setup.

---

**Vraag:** Is er authenticatie nodig in MVP?
- Huidige spec gaat uit van geen auth
- Als wel, moet er login/signup flow worden toegevoegd

**Impact:** Grote scope change als authenticatie vereist is.

---

**Vraag:** Wat gebeurt er met bestanden na verwerking?
- Blijven ze bewaard op server?
- Zo ja, hoe lang? (retention policy)
- Kan gebruiker historische bestanden opnieuw downloaden?

**Impact:**
- Indien retention > 0: Bestandsgeschiedenis feature wordt relevant voor MVP
- Indien retention = 0: Simpleler, maar minder user-friendly

---

### 10.2 Analysis Settings

**Vraag:** Moet gebruiker analysis settings kunnen configureren?
- Huidige spec: Geen settings in MVP (standaard verwerking)
- Example code toont wel settings dialog

**Opties:**
1. **Geen settings** - Simpel, sneller te implementeren
2. **Basic settings** - 2-3 toggle opties (bijv. "Include statistics", "Remove duplicates")
3. **Advanced settings** - Volledige configuratie (out of scope voor MVP)

**Aanbeveling:** Optie 1 voor MVP, optie 2 voor post-MVP.

---

### 10.3 Error Recovery

**Vraag:** Wat gebeurt er bij incomplete uploads?
- Timeout na X minuten?
- Gebruiker kan hervatten? (chunked upload)
- Of simpel: opnieuw starten?

**Aanbeveling voor MVP:** Simpele timeout (5 minuten), geen resume functionaliteit.

---

### 10.4 File Format Output

**Vraag:** Welk formaat heeft het geanalyseerde bestand?
- Zelfde formaat als input (.xlsx blijft .xlsx)?
- Altijd .xlsx output?
- Of andere formats mogelijk (CSV, PDF report)?

**Assumptie:** Output is altijd .xlsx (simpelste voor MVP).

---

### 10.5 Rate Limiting

**Vraag:** Zijn er rate limits op de API?
- Per IP address?
- Per user (als auth wordt toegevoegd)?
- Hoeveel requests per minuut?

**Impact:**
- Frontend moet rekening houden met 429 errors
- Mogelijk queue systeem of "please wait" message

---

### 10.6 Browser Support Edge Cases

**Vraag:** Moet IE11 ondersteund worden?
- Huidige spec: Nee (moderne browsers only)
- Confirmatie nodig van stakeholders

**Aanbeveling:** Geen IE11 support (verzwakking van development speed, geen relevante userbase).

---

### 10.7 Analytics & Tracking

**Vraag:** Welke analytics tool gebruiken?
- Google Analytics?
- Plausible (privacy-friendly)?
- Custom analytics?
- Geen analytics in MVP?

**Impact:** GDPR compliance overwegingen, cookie consent banner mogelijk nodig.

**Aanbeveling:** Plausible of Vercel Analytics (geen cookies, geen consent banner).

---

### 10.8 Mock Backend voor Development

**Vraag:** Hoe werken frontend developers lokaal zonder backend?
**Opties:**
1. **MSW (Mock Service Worker)** - Mock API in browser
2. **JSON Server** - Simpele mock REST API
3. **Mirage JS** - Advanced API mocking
4. **Wachten op backend** - Blokkeert frontend development

**Aanbeveling:** MSW voor development (modern, flexible, geen extra processen nodig).

**Example MSW Setup:**
```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/upload', async () => {
    await delay(1000); // Simulate network delay
    return HttpResponse.json({
      jobId: 'mock-job-123',
      status: 'queued',
    });
  }),

  http.get('/api/status/:jobId', async () => {
    await delay(500);
    return HttpResponse.json({
      jobId: 'mock-job-123',
      status: 'processing',
      progress: Math.floor(Math.random() * 100),
    });
  }),
];
```

---

## 11. Implementatie Complexiteit

### Geschatte Effort per Feature

**Feature 1: Upload Interface**
- Complexiteit: **Low**
- Tijd: 1-2 dagen
- Reden: Straightforward React component, client-side validatie

**Feature 2: API Client Infrastructure**
- Complexiteit: **Low**
- Tijd: 1 dag
- Reden: Axios setup is template work, interceptors zijn standaard patterns

**Feature 3: Upload Flow**
- Complexiteit: **Medium**
- Tijd: 2-3 dagen
- Reden: Integratie met backend, error handling, state management

**Feature 4: Progress Monitoring**
- Complexiteit: **Medium-High**
- Tijd: 3-4 dagen
- Reden: Polling logic, state synchronisatie, edge cases (timeouts, stuck jobs)

**Feature 5: Download Functionaliteit**
- Complexiteit: **Low**
- Tijd: 1-2 dagen
- Reden: Simpele GET request + blob handling

**UI/UX Polish**
- Complexiteit: **Medium**
- Tijd: 2-3 dagen
- Reden: Responsive design, accessibility, animations

**Testing & Bug Fixes**
- Complexiteit: **Medium**
- Tijd: 2-3 dagen
- Reden: Unit tests, integration tests, cross-browser testing

---

### Totaal Geschat

**Development:** 12-18 dagen (2.5-4 weken)
**Testing & QA:** 2-3 dagen
**Deployment & Documentation:** 1-2 dagen

**Total:** 15-23 dagen (~3-5 weken voor 1 developer)

---

### Kritieke Pad

1. API Client Setup (1 dag)
2. Upload Interface + Validatie (2 dagen)
3. Upload Flow naar Backend (3 dagen)
4. Progress Polling (4 dagen)
5. Download Functionaliteit (2 dagen)
6. Error Handling Polish (2 dagen)
7. UI/UX Responsive + A11y (3 dagen)
8. Testing (3 dagen)

**Parallel Work Mogelijkheden:**
- UI/UX polish kan parallel met feature development
- Testing kan incrementeel tijdens development

---

### Risico Factoren

**Hoog Risico:**
- Backend API beschikbaarheid: Als backend niet op tijd klaar is, blokkeert het testing
- Polling edge cases: Stuck jobs, timeout handling kan complex worden

**Medium Risico:**
- Cross-browser compatibility: File upload APIs kunnen quirks hebben
- Mobile testing: Drag-drop werkt niet op touch devices, file picker fallback moet perfect zijn

**Laag Risico:**
- UI components: Shadcn geeft solide basis
- State management: TanStack Query is battle-tested

---

### Mitigatie Strategieën

**Voor Backend Dependency:**
- Gebruik MSW voor mock API vanaf dag 1
- Definieer API contract vroeg en freeze het
- Frontend en backend teams synchen dagelijks

**Voor Polling Complexity:**
- Start met simpele polling, itereer
- Gebruik TanStack Query's built-in features (auto retry, interval)
- Implementeer timeouts pas als het nodig blijkt

**Voor Browser Compatibility:**
- Test op echte devices vroeg en vaak
- Gebruik Browserstack of vergelijkbaar voor cross-browser tests
- Fallback naar file picker altijd beschikbaar

---

## Conclusie

Deze specificatie beschrijft een volledig MVP van ExcelFlow met focus op:
- **Gebruikersvriendelijkheid:** Intuïtieve drag-and-drop interface, real-time feedback
- **Robuustheid:** Comprehensive error handling, retry logic, validatie
- **Onderhoudbaarheid:** TypeScript, gestructureerde code, reusable components
- **Performance:** Efficient polling, optimized bundle size, responsive design

Het MVP is bewust minimaal gehouden om snelle time-to-market te garanderen, terwijl het fundament legt voor toekomstige features zoals bestandsgeschiedenis, authenticatie, en geavanceerde analytics.

**Next Steps:**
1. Review deze spec met stakeholders
2. Beantwoord open vragen (sectie 10)
3. Setup project structuur + dependencies
4. Implementeer MSW mocks voor development
5. Start met feature 1 (Upload Interface)

---

**Document Versie:** 1.0
**Datum:** 28 oktober 2025
**Auteur:** Claude (Spec Writer Agent)
**Status:** Draft - Ter Review
