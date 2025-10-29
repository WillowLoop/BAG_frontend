/**
 * Mock Service Worker (MSW) Handlers
 *
 * Mock API handlers for development without a real backend.
 * Simulates realistic delays and progressive status updates.
 */

import { http, HttpResponse, delay } from 'msw';
import type { UploadResponse, AnalysisStatus } from '@/api/types';

// Store job progress state (simulated)
const jobProgress = new Map<string, number>();
const jobStatus = new Map<string, AnalysisStatus['status']>();

/**
 * Generate a mock job ID
 */
function generateJobId(): string {
  return `mock-job-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Simulate progressive job status
 * Progress increases over time from 0 to 100%
 */
function getSimulatedProgress(jobId: string): AnalysisStatus {
  // Initialize job if it doesn't exist
  if (!jobProgress.has(jobId)) {
    jobProgress.set(jobId, 0);
    jobStatus.set(jobId, 'queued');
  }

  let currentProgress = jobProgress.get(jobId) || 0;
  let currentStatus = jobStatus.get(jobId) || 'queued';

  // Simulate progress increment (approximately 10% per poll)
  if (currentProgress < 100) {
    currentProgress = Math.min(100, currentProgress + Math.floor(Math.random() * 15) + 5);
    jobProgress.set(jobId, currentProgress);

    // Update status based on progress
    if (currentProgress < 30) {
      currentStatus = 'processing';
    } else if (currentProgress < 90) {
      currentStatus = 'analyzing';
    } else if (currentProgress >= 100) {
      currentStatus = 'complete';
    }
    jobStatus.set(jobId, currentStatus);
  }

  // Generate status message
  let message = '';
  switch (currentStatus) {
    case 'queued':
      message = 'Je bestand staat in de wachtrij...';
      break;
    case 'processing':
      message = 'Bestand wordt verwerkt...';
      break;
    case 'analyzing':
      message = 'Data wordt geanalyseerd...';
      break;
    case 'complete':
      message = 'Analyse compleet!';
      break;
  }

  return {
    jobId,
    status: currentStatus,
    progress: currentProgress,
    message,
  };
}

/**
 * Mock API handlers
 */
export const handlers = [
  /**
   * POST /api/upload
   * Mock file upload endpoint
   */
  http.post('/api/upload', async () => {
    // Simulate network delay (500ms-1s)
    await delay(500 + Math.random() * 500);

    const jobId = generateJobId();

    const response: UploadResponse = {
      jobId,
      status: 'queued',
      message: 'File uploaded successfully',
    };

    return HttpResponse.json(response, { status: 201 });
  }),

  /**
   * GET /api/status/:jobId
   * Mock job status polling endpoint
   */
  http.get('/api/status/:jobId', async ({ params }) => {
    // Simulate network delay (300ms-700ms)
    await delay(300 + Math.random() * 400);

    const { jobId } = params;

    if (typeof jobId !== 'string') {
      return HttpResponse.json(
        {
          error: 'Invalid job ID',
          message: 'Job ID must be a string',
        },
        { status: 400 }
      );
    }

    // Simulate 5% chance of job not found (for testing error handling)
    if (Math.random() < 0.05 && !jobProgress.has(jobId)) {
      return HttpResponse.json(
        {
          error: 'Job not found',
          message: `No job found with ID: ${jobId}`,
        },
        { status: 404 }
      );
    }

    const status = getSimulatedProgress(jobId);
    return HttpResponse.json(status, { status: 200 });
  }),

  /**
   * GET /api/download/:jobId
   * Mock file download endpoint
   */
  http.get('/api/download/:jobId', async ({ params }) => {
    // Simulate network delay (500ms-1s)
    await delay(500 + Math.random() * 500);

    const { jobId } = params;

    if (typeof jobId !== 'string') {
      return HttpResponse.json(
        {
          error: 'Invalid job ID',
          message: 'Job ID must be a string',
        },
        { status: 400 }
      );
    }

    const currentStatus = jobStatus.get(jobId);

    // Check if job is complete
    if (currentStatus !== 'complete') {
      return HttpResponse.json(
        {
          error: 'Job not complete',
          message: `Cannot download file. Job status is: ${currentStatus || 'unknown'}`,
        },
        { status: 400 }
      );
    }

    // Create a mock Excel file (simple blob)
    const mockExcelContent = new Blob(
      [
        'Mock Excel file content - In a real implementation, this would be an actual .xlsx file',
      ],
      {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    );

    return HttpResponse.arrayBuffer(await mockExcelContent.arrayBuffer(), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="analyzed_mock_file.xlsx"',
      },
    });
  }),
];
