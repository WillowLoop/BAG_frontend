/**
 * BAG Error Transformation Utility
 *
 * Re-exports transformBagError from bag-error-mapping for convenience.
 * This module provides a clean import path for error transformation.
 */

export { transformBagError } from '../bag-error-mapping';
export type { BagApiError, BagErrorCode } from '../types/bag.types';
