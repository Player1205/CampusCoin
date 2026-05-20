import { Document, Model } from 'mongoose';
export type UserRole = 'student' | 'admin';
export interface IMilestoneRewards {
    skills: boolean;
    avatar: boolean;
}
export interface IUser {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    avatarUrl?: string;
    coverUrl?: string;
    university: string;
    department?: string;
    bio?: string;
    skills: string[];
    coinBalance: number;
    isVerified: boolean;
    emailVerificationOtp?: string;
    emailVerificationOtpExpires?: Date;
    isActive: boolean;
    lastLogin?: Date;
    milestoneRewards: IMilestoneRewards;
    dailyLikeCoinsEarned: number;
    dailyLikeCoinsDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface IUserMethods {
    comparePassword(candidatePassword: string): Promise<boolean>;
    toSafeObject(): Omit<IUser, 'password'>;
}
export type UserDocument = Document & IUser & IUserMethods;
type UserModel = Model<IUser, Record<string, never>, IUserMethods>;
declare const User: UserModel;
export default User;
//# sourceMappingURL=User.d.ts.map