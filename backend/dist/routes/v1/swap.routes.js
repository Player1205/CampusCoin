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
const express_1 = require("express");
const swapController = __importStar(require("../../controllers/swap.controller"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const validateQuery_middleware_1 = require("../../middlewares/validateQuery.middleware");
const swap_schema_1 = require("../../validations/swap.schema");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect);
router.get('/tasks', (0, validateQuery_middleware_1.validateQuery)(swap_schema_1.taskQuerySchema), swapController.listTasks);
router.get('/my-tasks', swapController.getMyTasks);
router.get('/tasks/:id', swapController.getTask);
router.post('/tasks', (0, validate_middleware_1.validate)(swap_schema_1.createTaskSchema), swapController.createTask);
router.patch('/tasks/:id', (0, validate_middleware_1.validate)(swap_schema_1.updateTaskSchema), swapController.updateTask);
router.delete('/tasks/:id', swapController.cancelTask);
router.post('/tasks/:id/apply', (0, validate_middleware_1.validate)(swap_schema_1.applyToTaskSchema), swapController.applyToTask);
router.delete('/tasks/:id/apply', swapController.withdrawApplication);
router.post('/tasks/:id/assign', (0, validate_middleware_1.validate)(swap_schema_1.assignDoerSchema), swapController.assignDoer);
router.post('/tasks/:id/submit', (0, validate_middleware_1.validate)(swap_schema_1.submitTaskSchema), swapController.submitTask);
router.post('/tasks/:id/complete', (0, validate_middleware_1.validate)(swap_schema_1.completeTaskSchema), swapController.completeTask);
exports.default = router;
//# sourceMappingURL=swap.routes.js.map