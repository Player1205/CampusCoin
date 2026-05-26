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
exports.getMyTasks = exports.completeTask = exports.submitTask = exports.assignDoer = exports.withdrawApplication = exports.applyToTask = exports.cancelTask = exports.updateTask = exports.createTask = exports.getTaskById = exports.listTasks = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const Task_1 = __importDefault(require("../models/Task"));
const Chat_1 = __importDefault(require("../models/Chat"));
const coin_service_1 = require("./coin.service");
const service_helpers_1 = require("../utils/service.helpers");
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const taskNotFound = () => (0, service_helpers_1.makeAppError)('Task not found.', 404);
const forbidden = (msg = 'You do not have permission to perform this action.') => (0, service_helpers_1.makeAppError)(msg, 403);
const ensureTaskExists = async (taskId) => {
    if (!mongoose_1.Types.ObjectId.isValid(taskId))
        throw (0, service_helpers_1.makeAppError)('Invalid task ID.', 400);
    const task = await Task_1.default.findById(taskId);
    if (!task)
        throw taskNotFound();
    return task;
};
const listTasks = async (query, university, userId) => {
    const { page, limit, status, category, urgency, minReward, maxReward, search, sortBy } = query;
    const filter = { university };
    if (status)
        filter.status = status;
    else
        filter.status = 'open';
    if (category)
        filter.category = category;
    if (urgency)
        filter.urgency = urgency;
    if (minReward !== undefined || maxReward !== undefined) {
        filter.coinReward = {
            ...(minReward !== undefined && { $gte: minReward }),
            ...(maxReward !== undefined && { $lte: maxReward }),
        };
    }
    if (search) {
        const safeSearch = escapeRegex(search);
        filter.$or = [
            { title: { $regex: safeSearch, $options: 'i' } },
            { description: { $regex: safeSearch, $options: 'i' } },
            { tags: { $regex: safeSearch, $options: 'i' } },
        ];
    }
    const sortMap = {
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        reward_high: { coinReward: -1 },
        reward_low: { coinReward: 1 },
    };
    const skip = (page - 1) * limit;
    const sort = (0, service_helpers_1.buildSortStage)(sortBy, sortMap);
    const [tasks, total] = await Promise.all([
        Task_1.default.find(filter)
            .populate('poster', 'name avatarUrl university')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Task_1.default.countDocuments(filter),
    ]);
    let enrichedTasks = tasks;
    if (userId) {
        const taskIds = tasks.map((t) => t._id);
        const existingChats = await Chat_1.default.find({ task: { $in: taskIds }, doer: userId }, { task: 1 }).lean();
        const chatTaskIds = new Set(existingChats.map((c) => c.task.toString()));
        enrichedTasks = enrichedTasks.map((t) => ({
            ...t,
            hasChat: chatTaskIds.has(t._id.toString()),
        }));
    }
    return {
        data: enrichedTasks,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1,
        },
    };
};
exports.listTasks = listTasks;
const getTaskById = async (taskId) => {
    const task = await ensureTaskExists(taskId);
    void Task_1.default.findByIdAndUpdate(taskId, { $inc: { viewCount: 1 } });
    await task.populate([
        { path: 'poster', select: 'name avatarUrl university department' },
        { path: 'doer', select: 'name avatarUrl university' },
        { path: 'applications.applicant', select: 'name avatarUrl skills' },
    ]);
    return task;
};
exports.getTaskById = getTaskById;
const createTask = async (input, posterId, university) => {
    const session = await mongoose_1.default.startSession();
    try {
        let task;
        await session.withTransaction(async () => {
            await (0, coin_service_1.lockCoinsForTask)(posterId, input.coinReward, session);
            const [created] = await Task_1.default.create([
                {
                    ...input,
                    deadline: input.deadline ? new Date(input.deadline) : undefined,
                    poster: posterId,
                    university,
                    status: 'open',
                },
            ], { session });
            task = created;
        });
        return task;
    }
    finally {
        await session.endSession();
    }
};
exports.createTask = createTask;
const updateTask = async (taskId, input, requesterId) => {
    const task = await ensureTaskExists(taskId);
    if (task.poster.toString() !== requesterId)
        throw forbidden();
    if (task.status !== 'open')
        throw (0, service_helpers_1.makeAppError)('Only open tasks can be edited.', 400);
    Object.assign(task, input);
    if (input.deadline)
        task.deadline = new Date(input.deadline);
    await task.save();
    return task;
};
exports.updateTask = updateTask;
const cancelTask = async (taskId, requesterId) => {
    const task = await ensureTaskExists(taskId);
    if (task.poster.toString() !== requesterId)
        throw forbidden();
    if (!['open', 'in_progress'].includes(task.status)) {
        throw (0, service_helpers_1.makeAppError)('This task cannot be cancelled in its current state.', 400);
    }
    const session = await mongoose_1.default.startSession();
    try {
        await session.withTransaction(async () => {
            await (0, coin_service_1.releaseCoinsToUser)(requesterId, task.coinReward, session);
            task.status = 'cancelled';
            await task.save({ session });
        });
        return task;
    }
    finally {
        await session.endSession();
    }
};
exports.cancelTask = cancelTask;
const applyToTask = async (taskId, input, applicantId) => {
    const task = await ensureTaskExists(taskId);
    if (task.status !== 'open')
        throw (0, service_helpers_1.makeAppError)('This task is no longer accepting applications.', 400);
    if (task.poster.toString() === applicantId)
        throw (0, service_helpers_1.makeAppError)('You cannot apply to your own task.', 400);
    const alreadyApplied = task.applications.some((a) => a.applicant.toString() === applicantId && !a.isWithdrawn);
    if (alreadyApplied)
        throw (0, service_helpers_1.makeAppError)('You have already applied to this task.', 409);
    const session = await mongoose_1.default.startSession();
    try {
        await session.withTransaction(async () => {
            await (0, coin_service_1.lockCoinsForTask)(applicantId, 2, session);
            task.applications.push({
                _id: new mongoose_1.Types.ObjectId(),
                applicant: new mongoose_1.Types.ObjectId(applicantId),
                message: input.message,
                appliedAt: new Date(),
                isWithdrawn: false,
            });
            await task.save({ session });
        });
        return task;
    }
    finally {
        await session.endSession();
    }
};
exports.applyToTask = applyToTask;
const withdrawApplication = async (taskId, applicantId) => {
    const task = await ensureTaskExists(taskId);
    const app = task.applications.find((a) => a.applicant.toString() === applicantId && !a.isWithdrawn);
    if (!app)
        throw (0, service_helpers_1.makeAppError)('Application not found or already withdrawn.', 404);
    if (task.status !== 'open')
        throw (0, service_helpers_1.makeAppError)('Cannot withdraw from a task that is no longer open.', 400);
    app.isWithdrawn = true;
    await task.save();
    await (0, coin_service_1.releaseCoinsToUser)(applicantId, 2);
    return task;
};
exports.withdrawApplication = withdrawApplication;
const assignDoer = async (taskId, input, posterId) => {
    const task = await ensureTaskExists(taskId);
    if (task.poster.toString() !== posterId)
        throw forbidden();
    if (task.status !== 'open')
        throw (0, service_helpers_1.makeAppError)('You can only assign a doer to an open task.', 400);
    task.doer = new mongoose_1.Types.ObjectId(input.applicantId);
    task.status = 'in_progress';
    await task.save();
    return task;
};
exports.assignDoer = assignDoer;
const submitTask = async (taskId, input, doerId) => {
    const task = await ensureTaskExists(taskId);
    if (!task.doer || task.doer.toString() !== doerId)
        throw forbidden('Only the assigned doer can submit this task.');
    if (!['in_progress', 'submitted'].includes(task.status)) {
        throw (0, service_helpers_1.makeAppError)('Task is not currently in progress.', 400);
    }
    task.status = 'submitted';
    task.submissionNote = input.submissionNote;
    await task.save();
    return task;
};
exports.submitTask = submitTask;
const completeTask = async (taskId, input, posterId) => {
    const task = await ensureTaskExists(taskId);
    if (task.poster.toString() !== posterId)
        throw forbidden();
    if (task.status !== 'submitted')
        throw (0, service_helpers_1.makeAppError)('You can only approve a submitted task.', 400);
    if (!task.doer)
        throw (0, service_helpers_1.makeAppError)('No doer assigned to this task.', 400);
    const doerId = task.doer.toString();
    await (0, coin_service_1.transferCoins)(posterId, doerId, task.coinReward);
    await (0, coin_service_1.releaseCoinsToUser)(doerId, 10);
    task.status = 'completed';
    if (input.completionNote)
        task.completionNote = input.completionNote;
    await task.save();
    return task;
};
exports.completeTask = completeTask;
const getMyTasks = async (userId, role, page, limit) => {
    const filter = role === 'poster'
        ? { poster: userId }
        : { doer: userId, status: { $in: ['in_progress', 'submitted', 'completed'] } };
    const skip = (page - 1) * limit;
    const [tasks, total] = await Promise.all([
        Task_1.default.find(filter)
            .populate('poster', 'name avatarUrl')
            .populate('doer', 'name avatarUrl')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Task_1.default.countDocuments(filter),
    ]);
    return {
        data: tasks,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1,
        },
    };
};
exports.getMyTasks = getMyTasks;
//# sourceMappingURL=task.service.js.map