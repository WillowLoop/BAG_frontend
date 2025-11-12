# Architecture Documentation - BAG Address Validation Frontend

## Overview

The BAG Address Validation Frontend is a single-page React application built with TypeScript that validates Dutch addresses against the official BAG database. The architecture is designed for maintainability, testability, and reusability, adapting 90% of components from the existing ExcelFlow MVP.

## Component Hierarchy

```
App (with BagValidationProvider)
├── ErrorBoundary
├── QueryClientProvider (TanStack Query)
└── Conditional rendering based on state:
    ├── state === 'idle' || 'uploading'
    │   └── BagUploadSection
    ├── state === 'validating'
    │   └── BagProcessingView
    ├── state === 'complete'
    │   └── BagDownloadSection
    └── state === 'error'
        └── BagErrorView
```

## State Machine

The application follows a five-state workflow:

```
idle → uploading → validating → complete
                     ↓
                   error
```

### State Definitions

1. **idle**: Initial state, awaiting file upload
2. **uploading**: File upload in progress
3. **validating**: BAG validation in progress (polling status)
4. **complete**: Validation successful, ready to download
5. **error**: Error occurred, user can retry or reset

### State Transitions

| From | To | Trigger |
|------|-----|---------|
| idle | uploading | User selects file |
| uploading | validating | Upload succeeds, auto-trigger validation |
| validating | complete | Status === 'complete' |
| validating | error | Status === 'failed' or timeout |
| complete | idle | User clicks reset |
| error | idle | User clicks reset |
| error | uploading | User clicks retry (if recoverable) |

## Data Flow

### Upload Flow

1. User selects .xlsx file
2. Client-side validation (file type, size, empty check)
3. `useBagFileUpload` hook triggers upload mutation
4. FormData created with file + config JSON
5. POST to `/api/v1/upload`
6. Receive `session_id` in response
7. Auto-trigger validation

### Validation Flow

1. Upload success triggers `useBagValidation` hook
2. POST to `/api/v1/validate/{session_id}`
3. `useBagValidationStatus` hook begins polling
4. GET `/api/v1/status/{session_id}` every 2.5 seconds
5. Update progress bar and phase message
6. Stop polling when status is 'complete' or 'failed'
7. Transition to complete or error state

### Download Flow

1. User clicks "Download Resultaten"
2. `useBagFileDownload` hook triggers download mutation
3. GET `/api/v1/download/{session_id}`
4. Receive blob response
5. Create object URL and trigger browser download
6. Auto-trigger cleanup: DELETE `/api/v1/cleanup/{session_id}`
7. Cleanup blob URL
8. Remain in complete state (allow multiple downloads)

## API Integration Layer

### Client Configuration

**File**: `src/api/bagClient.ts`

- Axios instance with base URL from environment
- 30-second timeout
- Request interceptor: Add headers
- Response interceptor: Unwrap BAG API response wrapper
- Error interceptor: Transform to AppError format

### Services

Each service encapsulates one API endpoint:

- **bagUpload.service.ts**: Upload file with config
- **bagValidation.service.ts**: Start validation, get status
- **bagDownload.service.ts**: Download validated file
- **bagCleanup.service.ts**: Cleanup session

### Error Transformation

BAG API errors are transformed to consistent AppError format:

```typescript
interface AppError {
  type: 'validation' | 'network' | 'api' | 'unknown';
  message: string;        // User-friendly Dutch message
  details?: string;       // Technical details (dev mode only)
  statusCode?: number;    // HTTP status code
}
```

## State Management

### Global State (React Context)

**File**: `src/contexts/BagValidationContext.tsx`

```typescript
interface BagValidationState {
  state: 'idle' | 'uploading' | 'validating' | 'complete' | 'error';
  sessionId: string | null;
  currentFile: File | null;
  error: AppError | null;

  // Actions
  setUploading: (file: File) => void;
  setValidating: (sessionId: string) => void;
  setComplete: () => void;
  setError: (error: AppError) => void;
  reset: () => void;
}
```

### API State (TanStack Query)

- **Mutations**: Upload, validation, download
- **Queries**: Status polling (with `refetchInterval: 2500`)
- **Caching**: 5-minute stale time
- **Retry**: 3 attempts for failed requests

## Custom Hooks

### useBagFileUpload

- Manages file upload mutation
- Tracks upload progress (0-100%)
- Auto-triggers validation on success
- Updates global state

### useBagValidation

- Triggers validation start
- Called automatically after upload
- Updates state to 'validating'

### useBagValidationStatus

- Polls status endpoint every 2.5 seconds
- Enabled when: `sessionId` exists and state is 'validating'
- Stops when: status is 'complete' or 'failed'
- 5-minute timeout mechanism
- Updates progress, phase, processed/total counts

### useBagFileDownload

- Manages download mutation
- Blob handling and browser download trigger
- Auto-triggers cleanup after success
- Generates filename: `bag_validated_{original}.xlsx`

## UI Components

### BagUploadSection

**Adapted from**: ExcelFlow UploadSection

**Features**:
- Drag-and-drop zone
- File picker button
- Client-side validation (.xlsx only)
- File preview with size
- Upload progress bar
- Dutch language messages

### BagProcessingView

**Adapted from**: ExcelFlow ProcessingView

**Features**:
- Overall progress bar (0-100%)
- Phase message display
- Processed count: "X van Y adressen verwerkt"
- File info display
- 5-minute timeout
- ARIA live regions for accessibility

### BagDownloadSection

**Adapted from**: ExcelFlow DownloadSection

**Features**:
- Success icon and message
- Download button with loading state
- Reset button ("Nieuwe Validatie")
- File summary display
- Multiple download support

### BagErrorView

**Adapted from**: ExcelFlow ErrorView

**Features**:
- Error type icons (network, api, validation)
- User-friendly Dutch messages
- Suggested actions based on error type
- Retry button (for recoverable errors)
- Reset button (always available)
- Technical details (dev mode only)

## Design Patterns

### 1. Adapter Pattern

Components adapted from ExcelFlow maintain the same structure but with BAG-specific logic:
- File type validation: .xlsx only (not .xls)
- API endpoints: BAG specific
- Messages: Dutch, BAG context
- Auto-trigger validation: New behavior

### 2. Hook Composition

Custom hooks compose TanStack Query with global state:

```typescript
function useBagFileUpload() {
  const { setUploading, setValidating } = useBagValidation();
  const validateMutation = useBagValidation();

  const mutation = useMutation({
    onSuccess: (response) => {
      setValidating(response.sessionId);
      validateMutation.mutate(response.sessionId); // Auto-trigger
    },
  });

  return { uploadFile: mutation.mutate, ... };
}
```

### 3. Service Layer Pattern

Services encapsulate API calls, decoupling components from HTTP details:

```typescript
export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('config', JSON.stringify(DEFAULT_CONFIG));

  const response = await bagClient.post('/api/v1/upload', formData);
  return response.data;
}
```

### 4. Error Boundary Pattern

Top-level error boundary catches unhandled React errors:

```typescript
<ErrorBoundary>
  <QueryClientProvider>
    <App />
  </QueryClientProvider>
</ErrorBoundary>
```

## Code Reuse from ExcelFlow

### Direct Reuse (100%)

- UI components: Button, Card, Progress (Shadcn/ui)
- Utility functions: `cn()` for class merging
- File size formatting utility
- TanStack Query configuration pattern
- Toast notification setup (Sonner)

### Adapted (90%)

- UploadSection → BagUploadSection
- ProcessingView → BagProcessingView
- DownloadSection → BagDownloadSection
- ErrorView → BagErrorView
- AppContext → BagValidationContext
- useFileUpload → useBagFileUpload
- useAnalysisStatus → useBagValidationStatus
- useFileDownload → useBagFileDownload

### New Components (10%)

- useBagValidation hook (new two-step workflow)
- bagMessages.ts (Dutch language constants)
- BAG-specific type definitions
- BAG error mapping

## Performance Considerations

### Bundle Optimization

- Code splitting: Vite handles automatically
- Tree shaking: Remove unused code
- CSS optimization: Tailwind JIT mode

### Runtime Performance

- Polling interval: 2.5 seconds (balance between real-time and load)
- Query stale time: 5 minutes (reduce unnecessary refetches)
- Disabled refetch on window focus (avoid polling interruptions)
- Memoization where beneficial (React.memo, useMemo)

### Network Optimization

- HTTP timeout: 30 seconds
- Retry logic: 3 attempts with exponential backoff
- Blob cleanup: Prevent memory leaks with `URL.revokeObjectURL()`

## Accessibility

### ARIA Attributes

- Progress bars: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Live regions: `aria-live="polite"` for status updates
- Labels: `aria-label` for icon buttons
- Regions: `role="region"` for upload area

### Keyboard Navigation

- All interactive elements tabbable
- Focus indicators visible
- Enter/Space activate buttons

### Screen Reader Support

- Descriptive labels for all actions
- Status updates announced via ARIA live
- Error messages announced

## Testing Strategy

### Unit Tests

- Utilities: File validation, filename generation
- Hooks: Upload, status polling, download
- Error transformation

### Component Tests

- Rendering with various props
- User interactions (click, drag-and-drop)
- State integration

### Integration Tests

- Complete workflow: upload → validate → download
- Error scenarios: network errors, validation errors
- State transitions

### Mocking Strategy

- MSW for API mocking
- Mock hooks in component tests
- Mock context providers

## Future Enhancements

### Potential Improvements

1. **WebSocket Support**: Replace polling with real-time updates
2. **Batch Upload**: Support multiple files
3. **Result Preview**: Show validation results before download
4. **Session Persistence**: Resume after page refresh
5. **Dark Mode**: Theme switching
6. **Mobile Optimization**: Responsive design improvements
7. **Offline Support**: PWA features

### Scalability Considerations

1. **Caching Strategy**: Add service worker for offline support
2. **Load Balancing**: Frontend CDN + backend load balancer
3. **Monitoring**: Add performance metrics (Sentry, LogRocket)
4. **A/B Testing**: Feature flags for gradual rollouts

## Maintenance

### Adding New Features

1. Create new service in `src/api/services/`
2. Create custom hook in `src/hooks/`
3. Update state machine if needed
4. Add UI components
5. Write tests
6. Update documentation

### Updating Dependencies

```bash
npm outdated
npm update
npm audit fix
```

### Code Quality

- ESLint for linting
- TypeScript strict mode
- Prettier for formatting (optional)
- Husky for pre-commit hooks (optional)

## Contact

For architecture questions, contact the development team.
