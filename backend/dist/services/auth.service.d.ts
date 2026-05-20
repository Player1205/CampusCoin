import { IUser } from '../models/User';
import { RegisterInput, LoginInput } from '../validations/auth.schema';
import { JwtPayload } from '../types';
export declare const signToken: (userId: string, role: string) => string;
export declare const verifyToken: (token: string) => JwtPayload;
export declare const cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "strict";
    maxAge: number;
    path: string;
};
export interface RegisterResult {
    user: Omit<IUser, 'password'>;
    token: string;
}
export declare const registerUser: (input: RegisterInput) => Promise<RegisterResult>;
export interface LoginResult {
    user: Omit<IUser, 'password'>;
    token: string;
}
export declare const loginUser: (input: LoginInput) => Promise<LoginResult>;
export declare const getCurrentUser: (userId: string) => Promise<Omit<IUser, "password">>;
//# sourceMappingURL=auth.service.d.ts.map