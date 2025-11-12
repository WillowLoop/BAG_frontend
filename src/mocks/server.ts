/**
 * MSW Server for Node.js Tests
 *
 * Sets up the Mock Service Worker server for integration tests
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
