export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 6;
export const MAX_LIMIT = 200;

export function resolvePagination(query, { defaultLimit = DEFAULT_LIMIT } = {}) {
  const page = Math.max(Number.parseInt(query.page, 10) || DEFAULT_PAGE, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || defaultLimit, 1), MAX_LIMIT);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function buildPaginationMeta({ page, limit, total }) {
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
