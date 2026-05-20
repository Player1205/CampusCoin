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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const applicationSchema = new mongoose_1.Schema({
    applicant: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    message: {
        type: String,
        required: [true, 'Application message is required'],
        maxlength: [500, 'Application message cannot exceed 500 characters'],
        trim: true,
    },
    appliedAt: {
        type: Date,
        default: () => new Date(),
    },
    isWithdrawn: {
        type: Boolean,
        default: false,
    },
}, { _id: true });
const taskSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        minlength: [5, 'Title must be at least 5 characters'],
        maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Task description is required'],
        trim: true,
        minlength: [20, 'Description must be at least 20 characters'],
        maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
        type: String,
        enum: ['tutoring', 'design', 'coding', 'writing', 'errands', 'notes', 'photography', 'other'],
        required: [true, 'Task category is required'],
    },
    urgency: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    coinReward: {
        type: Number,
        required: [true, 'Coin reward is required'],
        min: [5, 'Minimum reward is 5 CampusCoins'],
        max: [5000, 'Maximum reward is 5000 CampusCoins'],
    },
    poster: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    doer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'submitted', 'completed', 'cancelled', 'disputed'],
        default: 'open',
    },
    deadline: {
        type: Date,
    },
    tags: {
        type: [String],
        default: [],
        validate: {
            validator: (v) => v.length <= 5,
            message: 'A task can have a maximum of 5 tags',
        },
    },
    applications: {
        type: [applicationSchema],
        default: [],
    },
    submissionNote: {
        type: String,
        trim: true,
        maxlength: [1000, 'Submission note cannot exceed 1000 characters'],
    },
    completionNote: {
        type: String,
        trim: true,
        maxlength: [500, 'Completion note cannot exceed 500 characters'],
    },
    university: {
        type: String,
        required: true,
        index: true,
    },
    viewCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
    versionKey: false,
});
taskSchema.index({ status: 1, university: 1 });
taskSchema.index({ poster: 1 });
taskSchema.index({ doer: 1 });
taskSchema.index({ category: 1, university: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ coinReward: 1 });
taskSchema.index({ tags: 1 });
const Task = mongoose_1.default.model('Task', taskSchema);
exports.default = Task;
//# sourceMappingURL=Task.js.map