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
exports.getMyTasks = exports.completeTask = exports.submitTask = exports.assignDoer = exports.withdrawApplication = exports.applyToTask = exports.cancelTask = exports.updateTask = exports.createTask = exports.getTask = exports.listTasks = void 0;
const taskService = __importStar(require("../services/task.service"));
const listTasks = async (req, res, next) => {
    try {
        const result = await taskService.listTasks(req.query, req.user.university);
        res.status(200).json({
            status: 'success',
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.listTasks = listTasks;
const getTask = async (req, res, next) => {
    try {
        const task = await taskService.getTaskById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: { task },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getTask = getTask;
const createTask = async (req, res, next) => {
    try {
        const task = await taskService.createTask(req.body, req.user._id.toString(), req.user.university);
        res.status(201).json({
            status: 'success',
            data: { task },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createTask = createTask;
const updateTask = async (req, res, next) => {
    try {
        const task = await taskService.updateTask(req.params.id, req.body, req.user._id.toString());
        res.status(200).json({
            status: 'success',
            data: { task },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateTask = updateTask;
const cancelTask = async (req, res, next) => {
    try {
        const task = await taskService.cancelTask(req.params.id, req.user._id.toString());
        res.status(200).json({
            status: 'success',
            data: { task },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.cancelTask = cancelTask;
const applyToTask = async (req, res, next) => {
    try {
        const task = await taskService.applyToTask(req.params.id, req.body, req.user._id.toString());
        res.status(200).json({
            status: 'success',
            data: { task },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.applyToTask = applyToTask;
const withdrawApplication = async (req, res, next) => {
    try {
        const task = await taskService.withdrawApplication(req.params.id, req.user._id.toString());
        res.status(200).json({
            status: 'success',
            data: { task },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.withdrawApplication = withdrawApplication;
const assignDoer = async (req, res, next) => {
    try {
        const task = await taskService.assignDoer(req.params.id, req.body, req.user._id.toString());
        res.status(200).json({
            status: 'success',
            data: { task },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.assignDoer = assignDoer;
const submitTask = async (req, res, next) => {
    try {
        const task = await taskService.submitTask(req.params.id, req.body, req.user._id.toString());
        res.status(200).json({
            status: 'success',
            data: { task },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.submitTask = submitTask;
const completeTask = async (req, res, next) => {
    try {
        const task = await taskService.completeTask(req.params.id, req.body, req.user._id.toString());
        res.status(200).json({
            status: 'success',
            data: { task },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.completeTask = completeTask;
const getMyTasks = async (req, res, next) => {
    try {
        const role = req.query.role ?? 'poster';
        const page = Math.max(1, parseInt(String(req.query.page ?? 1), 10));
        const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? 20), 10)));
        const result = await taskService.getMyTasks(req.user._id.toString(), role, page, limit);
        res.status(200).json({
            status: 'success',
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getMyTasks = getMyTasks;
//# sourceMappingURL=swap.controller.js.map