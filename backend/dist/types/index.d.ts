import { Request } from 'express';
import { UserDocument } from '../models/User';
export interface AuthenticatedRequest extends Request {
    user?: UserDocument;
}
export interface JSendSuccess<T = unknown> {
    status: 'success';
    data: T;
}
export interface JSendFail {
    status: 'fail';
    message: string;
    errors?: Record<string, string>;
}
export interface JSendError {
    status: 'error';
    message: string;
}
export type JSendResponse<T = unknown> = JSendSuccess<T> | JSendFail | JSendError;
export interface JwtPayload {
    userId: string;
    role: string;
    iat?: number;
    exp?: number;
}
//# sourceMappingURL=index.d.ts.map