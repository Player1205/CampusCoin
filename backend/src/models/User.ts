/**
 * NOTE: This is a reference stub for Part 2.
 * The full implementation is in Part 1 → backend/src/models/User.ts
 * Merge both ZIPs into a single backend/ directory when building the project.
 */
import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'student' | 'admin';

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatarUrl?: string;
  university: string;
  department?: string;
  bio?: string;
  skills: string[];
  coinBalance: number;
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  toSafeObject(): Omit<IUser, 'password'>;
}

export type UserDocument = Document & IUser & IUserMethods;
type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    avatarUrl: { type: String, default: '' },
    university: { type: String, required: true },
    department: { type: String, default: '' },
    bio: { type: String, default: '' },
    skills: { type: [String], default: [] },
    coinBalance: { type: Number, default: 100, min: 0 },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password as string);
};

userSchema.methods.toSafeObject = function () {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safe } = this.toObject() as IUser & { password?: string };
  return safe;
};

const User = mongoose.model<IUser, UserModel>('User', userSchema);
export default User;
