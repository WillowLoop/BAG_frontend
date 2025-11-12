# BAG API Integration Documentation

## Overview

This document describes how the BAG Address Validation Frontend integrates with the BAG API backend.

## API Base URL

Configure via environment variable:
- **Development**: `http://localhost:8000`
- **Production**: Configure in `.env.production`

## Authentication

Currently, no authentication is required. If authentication is added in the future, update `bagClient.ts` to include authentication headers.

## Standard Response Format

All BAG API endpoints return a standard response wrapper:

### Success Response
```typescript
{
  success: true,
  data: {
    // Endpoint-specific data
  },
  metadata: {
    request_id: string,    // UUID v4
    timestamp: string,      // ISO 8601
    version: string         // API version
  }
}
```

### Error Response
```typescript
{
  error: {
    code: string,
    message: string,
    details?: object,
    request_id: string
  }
}
```

## API Endpoints

### 1. Upload Endpoint

**POST** `/api/v1/upload`

Upload Excel file with addresses for validation.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `file`: File (.xlsx)
  - `config`: string (JSON, optional)

**Default Config:**
```json
{
  "strict_mode": false,
  "max_similar_results": 5,
  "case_sensitive_places": false,
  "allow_abbreviations": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "uuid-string",
    "message": "File uploaded successfully",
    "filename": "addresses.xlsx"
  },
  "metadata": { ... }
}
```

### 2. Validate Endpoint

**POST** `/api/v1/validate/{session_id}`

Start validation process for uploaded file.

**Request:**
- Content-Type: `application/json`
- Body: `{ config?: ValidationConfig }`

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "uuid-string",
    "message": "Validation started",
    "status": "processing"
  },
  "metadata": { ... }
}
```

### 3. Status Endpoint (Polling)

**GET** `/api/v1/status/{session_id}`

Get current validation status (polled every 2.5 seconds).

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "uuid-string",
    "status": "queued" | "processing" | "complete" | "failed",
    "progress": 75,           // 0-100
    "phase": "Validating addresses",
    "processed_count": 75,
    "total_count": 100,
    "message": "Optional status message",
    "error": "Error message if failed"
  },
  "metadata": { ... }
}
```

### 4. Download Endpoint

**GET** `/api/v1/download/{session_id}`

Download validated results as Excel file.

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="validated_{session_id}.xlsx"`
- Body: Binary Excel file

### 5. Cleanup Endpoint

**DELETE** `/api/v1/cleanup/{session_id}`

Clean up session data after download.

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "uuid-string",
    "message": "Session cleaned up successfully"
  },
  "metadata": { ... }
}
```

## Error Codes

| Code | HTTP Status | Description | User Message (Dutch) |
|------|-------------|-------------|----------------------|
| `INVALID_FILE_TYPE` | 400 | File is not .xlsx | "Alleen .xlsx bestanden zijn toegestaan" |
| `EXCEL_STRUCTURE_ERROR` | 400 | Missing required columns | "Excel bestand heeft niet de juiste structuur" |
| `VALIDATION_ERROR` | 400 | Invalid configuration | "Ongeldige configuratie" |
| `FILE_NOT_FOUND` | 404 | Session not found | "Sessie niet gevonden. Start opnieuw." |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests | "Te veel verzoeken. Wacht een minuut." |
| `INTERNAL_SERVER_ERROR` | 500 | Server error | "Server fout. Probeer later opnieuw." |

## Rate Limiting

- **Limit**: 100 requests per minute per IP
- **Headers**:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`
- **Frontend Handling**: Show user-friendly message when 429 received

## Request/Response Transformation

The frontend automatically unwraps the BAG API response format:

```typescript
// API returns:
{ success: true, data: {...}, metadata: {...} }

// Frontend receives (via interceptor):
{...} // Just the data property
```

Error responses are transformed to AppError format:

```typescript
interface AppError {
  type: 'validation' | 'network' | 'api' | 'unknown';
  message: string;
  details?: string;
  statusCode?: number;
}
```

## Polling Strategy

- **Interval**: 2500ms (2.5 seconds)
- **Stop Conditions**:
  - `status === 'complete'`
  - `status === 'failed'`
  - 5-minute timeout
- **Retry**: 3 attempts on network errors
- **Enabled**: Only when `sessionId` is present and state is 'validating'

## CORS Configuration

Backend must allow requests from frontend origin:

```
Access-Control-Allow-Origin: <frontend-origin>
Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## Timeouts

- **HTTP Requests**: 30 seconds (axios default)
- **Validation Processing**: 5 minutes maximum
- **Polling**: Continues until complete/failed or timeout

## File Size Limits

- **Client-side**: 10MB (validated before upload)
- **Server-side**: Verify matches client-side limit

## Implementation Files

- **API Client**: `src/api/bagClient.ts`
- **Services**:
  - `src/api/services/bagUpload.service.ts`
  - `src/api/services/bagValidation.service.ts`
  - `src/api/services/bagDownload.service.ts`
  - `src/api/services/bagCleanup.service.ts`
- **Error Mapping**: `src/api/bag-error-mapping.ts`
- **Type Definitions**: `src/api/types/bag.types.ts`
