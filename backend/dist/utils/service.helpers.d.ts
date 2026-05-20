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
export declare const makeAppError: (message: string, statusCode?: number) => Error;
export declare const buildSortStage: (sortBy: string, sortMap: Record<string, Record<string, 1 | -1>>) => Record<string, 1 | -1>;
export declare const parsePagination: (rawPage: unknown, rawLimit: unknown, maxLimit?: number) => {
    page: number;
    limit: number;
    skip: number;
};
//# sourceMappingURL=service.helpers.d.ts.map