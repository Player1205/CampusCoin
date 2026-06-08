"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    avatarUrl: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    university: { type: String, required: true },
    department: { type: String, default: '' },
    bio: { type: String, default: '' },
    skills: { type: [String], default: [] },
    coinBalance: { type: Number, default: 100, min: 0 },
    milestoneRewards: {
        type: {
            skills: { type: Boolean, default: false },
            avatar: { type: Boolean, default: false },
        },
        default: () => ({ skills: false, avatar: false }),
        _id: false,
    },
    dailyLikeCoinsEarned: { type: Number, default: 0 },
    dailyLikeCoinsDate: { type: Date },
    isVerified: { type: Boolean, default: false },
    emailVerificationOtp: { type: String },
    emailVerificationOtpExpires: { type: Date },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
}, { timestamps: true, versionKey: false });
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    const salt = await bcryptjs_1.default.genSalt(12);
    this.password = await bcryptjs_1.default.hash(this.password, salt);
    next();
});
userSchema.methods.comparePassword = async function (candidate) {
    return bcryptjs_1.default.compare(candidate, this.password);
};
userSchema.methods.toSafeObject = function () {
    const { password, ...safe } = this.toObject();
    return safe;
};
userSchema.index({ university: 1, isActive: 1 });
userSchema.index({ isVerified: 1 });
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
//# sourceMappingURL=User.js.map