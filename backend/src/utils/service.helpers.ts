// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface CursorPaginationMeta extends PaginationMeta {
  nextCursor: string | null;
}

export interface CursorPaginatedResult<T> {
  data: T[];
  pagination: CursorPaginationMeta;
}

// ─── Error Factory ────────────────────────────────────────────────────────────

/**
 * Creates a typed operational error with an HTTP status code attached.
 * Services throw these; the global error handler reads statusCode to format
 * the JSend fail/error response.
 */
export const makeAppError = (message: string, statusCode = 500): Error => {
  const err = new Error(message) as Error & { statusCode: number; isOperational: boolean };
  err.statusCode = statusCode;
  err.isOperational = true;
  return err;
};

// ─── Sort Stage Builder ───────────────────────────────────────────────────────

/**
 * Returns a Mongoose sort object from a named sort key and a map of sort definitions.
 * Falls back to the first entry in the map if the key is unrecognised.
 */
export const buildSortStage = (
  sortBy: string,
  sortMap: Record<string, Record<string, 1 | -1>>
): Record<string, 1 | -1> => {
  return sortMap[sortBy] ?? Object.values(sortMap)[0];
};

// ─── Pagination Params Parser ─────────────────────────────────────────────────

/**
 * Safely clamps page and limit values before hitting the DB.
 */
export const parsePagination = (
  rawPage: unknown,
  rawLimit: unknown,
  maxLimit = 50
): { page: number; limit: number; skip: number } => {
  const page = Math.max(1, parseInt(String(rawPage ?? 1), 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(String(rawLimit ?? 20), 10) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};
