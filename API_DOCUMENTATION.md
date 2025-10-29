# BAG Address Validation API - Frontend Integration Guide

**API Version:** 1.0.0
**Base URL:** `http://localhost:8000`
**Base Path:** `/api/v1`

## 📋 Overzicht

Deze API biedt Nederlandse adresvalidatie tegen de BAG (Basisregistratie Adressen en Gebouwen) database. De API accepteert Excel bestanden met adressen en valideert deze real-time met voortgangsupdates via WebSocket.

## 🔑 Belangrijke Concepten

### Response Formaat

Alle API endpoints (behalve WebSocket en downloads) gebruiken een gestandaardiseerd response formaat:

**Success Response:**
```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  metadata: {
    request_id: string;      // UUID v4 voor tracking
    timestamp: string;        // ISO 8601 datetime
    version: string;          // API versie (bijv. "1.0.0")
  };
}
```

**Error Response:**
```typescript
interface ErrorResponse {
  error: {
    code: string;            // Machine-readable error code
    message: string;         // Human-readable message
    details?: object;        // Extra error informatie
    request_id: string;      // UUID voor debugging
  };
}
```

### Rate Limiting

- **Limiet:** 100 requests per minuut per IP address
- **Headers:**
  - `X-RateLimit-Limit`: Maximum requests per window
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Unix timestamp wanneer limiet reset
- **Error bij overschrijding:** HTTP 429 Too Many Requests

### Request Tracking

Elke request krijgt een unieke `request_id` (UUID v4):
- Automatisch gegenereerd door de server
- Teruggegeven in response metadata
- Te gebruiken voor debugging en support

---

## 🛠️ API Endpoints

### 1. Root Endpoint

**Endpoint:** `GET /`

Geeft basis API informatie.

**Request:**
```bash
GET http://localhost:8000/
```

**Response:**
```typescript
{
  success: true,
  data: {
    name: string;              // "BAG Address Validation API"
    version: string;           // "1.0.0"
    description: string;
    status: string;            // "operational"
  },
  metadata: {
    request_id: string;
    timestamp: string;
    version: string;
  }
}
```

**TypeScript Example:**
```typescript
async function getApiInfo() {
  const response = await fetch('http://localhost:8000/');
  const data: SuccessResponse<ApiInfo> = await response.json();
  return data.data;
}

interface ApiInfo {
  name: string;
  version: string;
  description: string;
  status: string;
}
```

---

### 2. Health Check

**Endpoint:** `GET /api/v1/health`

Controleert de status van de API en database connectie.

**Request:**
```bash
GET http://localhost:8000/api/v1/health
```

**Response:**
```typescript
{
  success: true,
  data: {
    status: "healthy" | "unhealthy";
    database: "connected" | "disconnected";
    uptime_seconds: number;
    version: string;
  },
  metadata: {
    request_id: string;
    timestamp: string;
    version: string;
  }
}
```

**TypeScript Example:**
```typescript
interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  database: 'connected' | 'disconnected';
  uptime_seconds: number;
  version: string;
}

async function checkHealth(): Promise<HealthCheck> {
  const response = await fetch('http://localhost:8000/api/v1/health');
  const data: SuccessResponse<HealthCheck> = await response.json();
  return data.data;
}
```

---

### 3. Upload Excel File

**Endpoint:** `POST /api/v1/upload`

Upload een Excel bestand (.xlsx) met adressen voor validatie.

**Content-Type:** `multipart/form-data`

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | Excel bestand (.xlsx) met adressen |
| `config` | string (JSON) | No | Configuratie voor validatie (als JSON string) |

**Excel Structure:**

Het Excel bestand moet de volgende kolommen bevatten in de eerste rij:
- `Baartdiensten`
- `Team`
- `Straat`
- `Huisnummer`
- `Toevoeging`
- `Postcode`
- `Plaats`
- `Mailbox`

**Configuration Object:**
```typescript
interface ValidationConfig {
  strict_mode?: boolean;              // Default: false
  max_similar_results?: number;       // Default: 5, range: 1-10
  case_sensitive_places?: boolean;    // Default: false
  allow_abbreviations?: boolean;      // Default: true
}
```

**Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/upload" \
  -H "accept: application/json" \
  -F "file=@addresses.xlsx" \
  -F 'config={"strict_mode": false, "max_similar_results": 5, "case_sensitive_places": false, "allow_abbreviations": true}'
```

**Response:**
```typescript
{
  success: true,
  data: {
    session_id: string;      // UUID voor deze upload sessie
    message: string;         // "File uploaded successfully"
    filename: string;        // Originele bestandsnaam
  },
  metadata: {
    request_id: string;
    timestamp: string;
    version: string;
  }
}
```

**TypeScript Example:**
```typescript
interface UploadResponse {
  session_id: string;
  message: string;
  filename: string;
}

interface ValidationConfig {
  strict_mode?: boolean;
  max_similar_results?: number;
  case_sensitive_places?: boolean;
  allow_abbreviations?: boolean;
}

async function uploadFile(
  file: File,
  config?: ValidationConfig
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  if (config) {
    formData.append('config', JSON.stringify(config));
  }

  const response = await fetch('http://localhost:8000/api/v1/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error.message);
  }

  const data: SuccessResponse<UploadResponse> = await response.json();
  return data.data;
}
```

**React Example:**
```tsx
import React, { useState } from 'react';

function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('config', JSON.stringify({
        strict_mode: false,
        max_similar_results: 5,
        case_sensitive_places: false,
        allow_abbreviations: true
      }));

      const response = await fetch('http://localhost:8000/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setSessionId(result.data.session_id);
        console.log('Upload successful!', result.data);
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError('Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload} disabled={!file || loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <div className="error">{error}</div>}
      {sessionId && <div>Session ID: {sessionId}</div>}
    </div>
  );
}
```

**Error Codes:**
- `INVALID_FILE_TYPE`: Bestand is niet .xlsx
- `EXCEL_STRUCTURE_ERROR`: Excel mist verplichte kolommen
- `VALIDATION_ERROR`: Ongeldige configuratie
- `INTERNAL_SERVER_ERROR`: Server fout bij opslaan

---

### 4. Start Validation

**Endpoint:** `POST /api/v1/validate/{session_id}`

Start de adresvalidatie voor een geüploade sessie.

**Path Parameters:**
- `session_id` (string, required): Session ID van de upload

**Request Body:**
```typescript
interface ValidateRequest {
  config?: ValidationConfig;  // Optioneel: overschrijft upload config
}
```

**Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/validate/{session_id}" \
  -H "Content-Type: application/json" \
  -d '{"config": {"strict_mode": false, "max_similar_results": 5}}'
```

**Response:**
```typescript
{
  success: true,
  data: {
    session_id: string;
    message: string;         // "Validation started"
    status: "processing";
  },
  metadata: {
    request_id: string;
    timestamp: string;
    version: string;
  }
}
```

**TypeScript Example:**
```typescript
interface ValidateResponse {
  session_id: string;
  message: string;
  status: 'processing';
}

async function startValidation(
  sessionId: string,
  config?: ValidationConfig
): Promise<ValidateResponse> {
  const response = await fetch(
    `http://localhost:8000/api/v1/validate/${sessionId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config }),
    }
  );

  const data: SuccessResponse<ValidateResponse> = await response.json();
  return data.data;
}
```

**Error Codes:**
- `FILE_NOT_FOUND`: Session niet gevonden
- `VALIDATION_ERROR`: Ongeldige configuratie

---

### 5. WebSocket Progress Tracking

**Endpoint:** `WS /api/v1/ws/progress/{session_id}`

Real-time voortgangsupdates tijdens validatie via WebSocket.

**Connection:**
```javascript
const ws = new WebSocket(`ws://localhost:8000/api/v1/ws/progress/${sessionId}`);
```

**Message Types:**

**Progress Update:**
```typescript
interface ProgressMessage {
  type: 'progress';
  progress: number;           // 0-100
  phase: string;              // Huidige fase (bijv. "Validating addresses")
  processed_count: number;    // Aantal verwerkte adressen
  total_count: number;        // Totaal aantal adressen
  timestamp: string;          // ISO 8601
}
```

**Completion:**
```typescript
interface CompletionMessage {
  type: 'complete';
  output_file_id: string;     // Session ID voor download
  timestamp: string;
}
```

**Error:**
```typescript
interface ErrorMessage {
  type: 'error';
  error: string;              // Error beschrijving
  timestamp: string;
}
```

**TypeScript Example:**
```typescript
type WebSocketMessage = ProgressMessage | CompletionMessage | ErrorMessage;

function monitorProgress(
  sessionId: string,
  onProgress: (data: ProgressMessage) => void,
  onComplete: (data: CompletionMessage) => void,
  onError: (error: string) => void
): WebSocket {
  const ws = new WebSocket(
    `ws://localhost:8000/api/v1/ws/progress/${sessionId}`
  );

  ws.onmessage = (event) => {
    const data: WebSocketMessage = JSON.parse(event.data);

    switch (data.type) {
      case 'progress':
        onProgress(data);
        break;
      case 'complete':
        onComplete(data);
        ws.close();
        break;
      case 'error':
        onError(data.error);
        ws.close();
        break;
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    onError('WebSocket connection failed');
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
  };

  return ws;
}
```

**React Hook Example:**
```tsx
import { useEffect, useState, useRef } from 'react';

interface ProgressState {
  progress: number;
  phase: string;
  processed: number;
  total: number;
}

function useValidationProgress(sessionId: string | null) {
  const [state, setState] = useState<ProgressState>({
    progress: 0,
    phase: '',
    processed: 0,
    total: 0,
  });
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const ws = new WebSocket(
      `ws://localhost:8000/api/v1/ws/progress/${sessionId}`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'progress') {
        setState({
          progress: data.progress,
          phase: data.phase,
          processed: data.processed_count,
          total: data.total_count,
        });
      } else if (data.type === 'complete') {
        setIsComplete(true);
        setState(prev => ({ ...prev, progress: 100 }));
      } else if (data.type === 'error') {
        setError(data.error);
      }
    };

    ws.onerror = () => {
      setError('WebSocket connection failed');
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [sessionId]);

  return { ...state, isComplete, error };
}

// Usage in component:
function ValidationProgress({ sessionId }: { sessionId: string }) {
  const { progress, phase, processed, total, isComplete, error } =
    useValidationProgress(sessionId);

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (isComplete) {
    return <div className="success">Validation complete!</div>;
  }

  return (
    <div>
      <progress value={progress} max="100" />
      <p>{phase} - {progress.toFixed(1)}%</p>
      <p>{processed} / {total} addresses processed</p>
    </div>
  );
}
```

---

### 6. Download Results

**Endpoint:** `GET /api/v1/download/{session_id}`

Download het gevalideerde Excel bestand met resultaten.

**Path Parameters:**
- `session_id` (string, required): Session ID

**Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/download/{session_id}" \
  -o validated_addresses.xlsx
```

**Response:**
- **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Body:** Binary Excel file
- **Headers:**
  - `Content-Disposition: attachment; filename="validated_{session_id}.xlsx"`

**TypeScript Example:**
```typescript
async function downloadResults(sessionId: string): Promise<void> {
  const response = await fetch(
    `http://localhost:8000/api/v1/download/${sessionId}`
  );

  if (!response.ok) {
    throw new Error('Download failed');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `validated_${sessionId}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
```

**React Example:**
```tsx
function DownloadButton({ sessionId }: { sessionId: string }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/download/${sessionId}`
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `validated_addresses_${sessionId}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button onClick={handleDownload} disabled={downloading}>
      {downloading ? 'Downloading...' : 'Download Results'}
    </button>
  );
}
```

**Error Codes:**
- `FILE_NOT_FOUND`: Resultaat bestand niet gevonden (validatie nog niet klaar)

---

### 7. Cleanup Session

**Endpoint:** `DELETE /api/v1/cleanup/{session_id}`

Verwijder alle bestanden voor een sessie (upload + output).

**Path Parameters:**
- `session_id` (string, required): Session ID

**Request:**
```bash
curl -X DELETE "http://localhost:8000/api/v1/cleanup/{session_id}"
```

**Response:**
```typescript
{
  success: true,
  data: {
    session_id: string;
    message: string;         // "Session cleaned up successfully"
  },
  metadata: {
    request_id: string;
    timestamp: string;
    version: string;
  }
}
```

**TypeScript Example:**
```typescript
async function cleanupSession(sessionId: string): Promise<void> {
  const response = await fetch(
    `http://localhost:8000/api/v1/cleanup/${sessionId}`,
    { method: 'DELETE' }
  );

  const data: SuccessResponse<{ message: string }> = await response.json();
  console.log(data.data.message);
}
```

**Error Codes:**
- `FILE_NOT_FOUND`: Session niet gevonden

---

## 🔄 Complete Workflow Example

Hier is een complete React component die de hele workflow laat zien:

```tsx
import React, { useState, useEffect } from 'react';

interface ValidationConfig {
  strict_mode: boolean;
  max_similar_results: number;
  case_sensitive_places: boolean;
  allow_abbreviations: boolean;
}

interface ProgressState {
  progress: number;
  phase: string;
  processed: number;
  total: number;
}

export function AddressValidator() {
  // State
  const [file, setFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [progress, setProgress] = useState<ProgressState>({
    progress: 0,
    phase: '',
    processed: 0,
    total: 0,
  });
  const [isValidating, setIsValidating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string>('');

  // Configuration
  const config: ValidationConfig = {
    strict_mode: false,
    max_similar_results: 5,
    case_sensitive_places: false,
    allow_abbreviations: true,
  };

  // WebSocket effect
  useEffect(() => {
    if (!sessionId || !isValidating) return;

    const ws = new WebSocket(
      `ws://localhost:8000/api/v1/ws/progress/${sessionId}`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'progress') {
        setProgress({
          progress: data.progress,
          phase: data.phase,
          processed: data.processed_count,
          total: data.total_count,
        });
      } else if (data.type === 'complete') {
        setIsComplete(true);
        setIsValidating(false);
        setProgress(prev => ({ ...prev, progress: 100 }));
      } else if (data.type === 'error') {
        setError(data.error);
        setIsValidating(false);
      }
    };

    ws.onerror = () => {
      setError('WebSocket connection failed');
      setIsValidating(false);
    };

    return () => {
      ws.close();
    };
  }, [sessionId, isValidating]);

  // Upload and start validation
  const handleUploadAndValidate = async () => {
    if (!file) return;

    setError('');
    setIsComplete(false);
    setProgress({ progress: 0, phase: '', processed: 0, total: 0 });

    try {
      // 1. Upload file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('config', JSON.stringify(config));

      const uploadResponse = await fetch('http://localhost:8000/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.success) {
        throw new Error(uploadResult.error.message);
      }

      const newSessionId = uploadResult.data.session_id;
      setSessionId(newSessionId);

      // 2. Start validation
      const validateResponse = await fetch(
        `http://localhost:8000/api/v1/validate/${newSessionId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ config }),
        }
      );

      const validateResult = await validateResponse.json();

      if (!validateResult.success) {
        throw new Error(validateResult.error.message);
      }

      setIsValidating(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Download results
  const handleDownload = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/download/${sessionId}`
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `validated_${sessionId}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      // Optional: cleanup after download
      await fetch(`http://localhost:8000/api/v1/cleanup/${sessionId}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      setError('Download failed: ' + err.message);
    }
  };

  return (
    <div className="address-validator">
      <h1>BAG Address Validator</h1>

      {/* File Upload */}
      <div className="upload-section">
        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={isValidating}
        />
        <button
          onClick={handleUploadAndValidate}
          disabled={!file || isValidating}
        >
          {isValidating ? 'Validating...' : 'Upload & Validate'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Progress Display */}
      {isValidating && (
        <div className="progress-section">
          <h2>Validation Progress</h2>
          <progress value={progress.progress} max="100" />
          <p>{progress.phase} - {progress.progress.toFixed(1)}%</p>
          <p>
            Processed: {progress.processed} / {progress.total} addresses
          </p>
        </div>
      )}

      {/* Completion */}
      {isComplete && (
        <div className="complete-section">
          <h2>Validation Complete!</h2>
          <button onClick={handleDownload}>
            Download Results
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 🎨 Complete TypeScript Definitions

```typescript
// ============= BASE TYPES =============

interface SuccessResponse<T> {
  success: true;
  data: T;
  metadata: ResponseMetadata;
}

interface ErrorResponse {
  error: ErrorDetail;
}

interface ResponseMetadata {
  request_id: string;
  timestamp: string;
  version: string;
}

interface ErrorDetail {
  code: string;
  message: string;
  details?: Record<string, any>;
  request_id: string;
}

// ============= API MODELS =============

interface ApiInfo {
  name: string;
  version: string;
  description: string;
  status: string;
}

interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  database: 'connected' | 'disconnected';
  uptime_seconds: number;
  version: string;
}

interface ValidationConfig {
  strict_mode?: boolean;
  max_similar_results?: number;
  case_sensitive_places?: boolean;
  allow_abbreviations?: boolean;
}

interface UploadResponse {
  session_id: string;
  message: string;
  filename: string;
}

interface ValidateResponse {
  session_id: string;
  message: string;
  status: 'processing';
}

interface CleanupResponse {
  session_id: string;
  message: string;
}

// ============= WEBSOCKET TYPES =============

interface ProgressMessage {
  type: 'progress';
  progress: number;
  phase: string;
  processed_count: number;
  total_count: number;
  timestamp: string;
}

interface CompletionMessage {
  type: 'complete';
  output_file_id: string;
  timestamp: string;
}

interface ErrorMessage {
  type: 'error';
  error: string;
  timestamp: string;
}

type WebSocketMessage = ProgressMessage | CompletionMessage | ErrorMessage;

// ============= API CLIENT =============

class BagApiClient {
  constructor(private baseUrl: string = 'http://localhost:8000') {}

  async getApiInfo(): Promise<ApiInfo> {
    const response = await fetch(`${this.baseUrl}/`);
    const data: SuccessResponse<ApiInfo> = await response.json();
    return data.data;
  }

  async checkHealth(): Promise<HealthCheck> {
    const response = await fetch(`${this.baseUrl}/api/v1/health`);
    const data: SuccessResponse<HealthCheck> = await response.json();
    return data.data;
  }

  async uploadFile(
    file: File,
    config?: ValidationConfig
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (config) {
      formData.append('config', JSON.stringify(config));
    }

    const response = await fetch(`${this.baseUrl}/api/v1/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.error.message);
    }

    const data: SuccessResponse<UploadResponse> = await response.json();
    return data.data;
  }

  async startValidation(
    sessionId: string,
    config?: ValidationConfig
  ): Promise<ValidateResponse> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/validate/${sessionId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      }
    );

    const data: SuccessResponse<ValidateResponse> = await response.json();
    return data.data;
  }

  createProgressWebSocket(
    sessionId: string,
    handlers: {
      onProgress?: (data: ProgressMessage) => void;
      onComplete?: (data: CompletionMessage) => void;
      onError?: (error: string) => void;
    }
  ): WebSocket {
    const ws = new WebSocket(
      `ws://${this.baseUrl.replace('http://', '')}/api/v1/ws/progress/${sessionId}`
    );

    ws.onmessage = (event) => {
      const data: WebSocketMessage = JSON.parse(event.data);

      switch (data.type) {
        case 'progress':
          handlers.onProgress?.(data);
          break;
        case 'complete':
          handlers.onComplete?.(data);
          ws.close();
          break;
        case 'error':
          handlers.onError?.(data.error);
          ws.close();
          break;
      }
    };

    ws.onerror = () => {
      handlers.onError?.('WebSocket connection failed');
    };

    return ws;
  }

  async downloadResults(sessionId: string): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/download/${sessionId}`
    );

    if (!response.ok) {
      throw new Error('Download failed');
    }

    return response.blob();
  }

  async cleanupSession(sessionId: string): Promise<CleanupResponse> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/cleanup/${sessionId}`,
      { method: 'DELETE' }
    );

    const data: SuccessResponse<CleanupResponse> = await response.json();
    return data.data;
  }
}

// ============= USAGE =============

// Create client instance
const api = new BagApiClient('http://localhost:8000');

// Example usage
async function validateAddresses(file: File) {
  try {
    // Upload
    const upload = await api.uploadFile(file, {
      strict_mode: false,
      max_similar_results: 5,
    });

    // Start validation
    await api.startValidation(upload.session_id);

    // Monitor progress
    const ws = api.createProgressWebSocket(upload.session_id, {
      onProgress: (data) => {
        console.log(`Progress: ${data.progress}%`);
      },
      onComplete: async (data) => {
        // Download results
        const blob = await api.downloadResults(data.output_file_id);
        // ... handle blob

        // Cleanup
        await api.cleanupSession(upload.session_id);
      },
      onError: (error) => {
        console.error('Validation error:', error);
      },
    });
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## 📝 Error Handling

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_FILE_TYPE` | 400 | Bestand is geen .xlsx |
| `EXCEL_STRUCTURE_ERROR` | 400 | Excel mist verplichte kolommen |
| `VALIDATION_ERROR` | 400 | Ongeldige configuratie of input |
| `FILE_NOT_FOUND` | 404 | Session of bestand niet gevonden |
| `RATE_LIMIT_EXCEEDED` | 429 | Te veel requests |
| `INTERNAL_SERVER_ERROR` | 500 | Server fout |

### Error Handling Example

```typescript
async function handleApiCall<T>(
  apiCall: () => Promise<T>
): Promise<T | null> {
  try {
    return await apiCall();
  } catch (error: any) {
    if (error.response) {
      const errorData: ErrorResponse = await error.response.json();

      switch (errorData.error.code) {
        case 'INVALID_FILE_TYPE':
          console.error('Please upload an .xlsx file');
          break;
        case 'RATE_LIMIT_EXCEEDED':
          console.error('Too many requests. Please wait.');
          break;
        case 'FILE_NOT_FOUND':
          console.error('Session not found or expired');
          break;
        default:
          console.error('Error:', errorData.error.message);
      }

      console.log('Request ID for debugging:', errorData.error.request_id);
    } else {
      console.error('Network error:', error.message);
    }

    return null;
  }
}
```

---

## 🔒 Security & CORS

### CORS Configuration

**Development:**
- Allowed origins: `*` (alle origins toegestaan)
- Credentials: allowed

**Production:**
- Allowed origins: Configureerbaar via environment variables
- Credentials: allowed

### Security Headers

Alle responses bevatten security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

---

## 📊 Response Examples

### Success Response Example
```json
{
  "success": true,
  "data": {
    "session_id": "a7f3c2e1-4b5d-6789-0abc-def123456789",
    "message": "File uploaded successfully",
    "filename": "addresses.xlsx"
  },
  "metadata": {
    "request_id": "b8e4d3f2-5c6e-7890-1bcd-ef0234567890",
    "timestamp": "2025-10-29T14:30:00.000Z",
    "version": "1.0.0"
  }
}
```

### Error Response Example
```json
{
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Only .xlsx files are allowed",
    "details": {
      "allowed_types": [".xlsx"],
      "provided_type": ".csv"
    },
    "request_id": "c9f5e4g3-6d7f-8901-2cde-fg1345678901"
  }
}
```

---

## 🚀 Quick Start Checklist

1. ✅ Check API is running: `GET /api/v1/health`
2. ✅ Prepare Excel file with required columns
3. ✅ Upload file: `POST /api/v1/upload`
4. ✅ Get session_id from response
5. ✅ Start validation: `POST /api/v1/validate/{session_id}`
6. ✅ Connect WebSocket: `WS /api/v1/ws/progress/{session_id}`
7. ✅ Monitor progress updates
8. ✅ Download results when complete: `GET /api/v1/download/{session_id}`
9. ✅ Cleanup (optional): `DELETE /api/v1/cleanup/{session_id}`

---

## 📞 Support

Voor vragen of problemen:
- Check de logs met request_id
- Bekijk `/docs` voor interactive API documentation
- Bekijk `/redoc` voor ReDoc documentation

**Built with FastAPI 🚀**
