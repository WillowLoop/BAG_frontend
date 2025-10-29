/**
 * Mock Service Worker Browser Setup
 *
 * Configures MSW for browser environment.
 * This allows the frontend to work without a real backend during development.
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * Setup MSW service worker with our handlers
 */
export const worker = setupWorker(...handlers);
