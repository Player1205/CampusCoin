import { Router } from 'express';
import * as swapController from '../../controllers/swap.controller';
import { protect } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { validateQuery } from '../../middlewares/validateQuery.middleware';
import {
  createTaskSchema,
  updateTaskSchema,
  applyToTaskSchema,
  assignDoerSchema,
  submitTaskSchema,
  completeTaskSchema,
  taskQuerySchema,
} from '../../validations/swap.schema';

const router = Router();

// All Swap routes require authentication
router.use(protect);

// ─── Feed ─────────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/swap/tasks
 * @desc    List open tasks for the user's university (paginated, filterable)
 * @access  Protected
 */
router.get('/tasks', validateQuery(taskQuerySchema), swapController.listTasks);

/**
 * @route   GET /api/v1/swap/my-tasks
 * @desc    Get current user's tasks (as poster or doer)
 * @access  Protected
 * @query   role=poster|doer  page=1  limit=20
 */
router.get('/my-tasks', swapController.getMyTasks);

// ─── Task CRUD ────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/swap/tasks/:id
 * @desc    Get a single task with full details
 * @access  Protected
 */
router.get('/tasks/:id', swapController.getTask);

/**
 * @route   POST /api/v1/swap/tasks
 * @desc    Create a new task (locks coins in escrow)
 * @access  Protected
 */
router.post('/tasks', validate(createTaskSchema), swapController.createTask);

/**
 * @route   PATCH /api/v1/swap/tasks/:id
 * @desc    Update an open task (poster only)
 * @access  Protected
 */
router.patch('/tasks/:id', validate(updateTaskSchema), swapController.updateTask);

/**
 * @route   DELETE /api/v1/swap/tasks/:id
 * @desc    Cancel a task and refund escrow (poster only)
 * @access  Protected
 */
router.delete('/tasks/:id', swapController.cancelTask);

// ─── Applications ─────────────────────────────────────────────────────────────

/**
 * @route   POST /api/v1/swap/tasks/:id/apply
 * @desc    Apply to a task
 * @access  Protected
 */
router.post('/tasks/:id/apply', validate(applyToTaskSchema), swapController.applyToTask);

/**
 * @route   DELETE /api/v1/swap/tasks/:id/apply
 * @desc    Withdraw application from a task
 * @access  Protected
 */
router.delete('/tasks/:id/apply', swapController.withdrawApplication);

// ─── Task Lifecycle ───────────────────────────────────────────────────────────

/**
 * @route   POST /api/v1/swap/tasks/:id/assign
 * @desc    Assign a doer from applicants (poster only)
 * @access  Protected
 */
router.post('/tasks/:id/assign', validate(assignDoerSchema), swapController.assignDoer);

/**
 * @route   POST /api/v1/swap/tasks/:id/submit
 * @desc    Submit completed work (doer only)
 * @access  Protected
 */
router.post('/tasks/:id/submit', validate(submitTaskSchema), swapController.submitTask);

/**
 * @route   POST /api/v1/swap/tasks/:id/complete
 * @desc    Approve submission and release coins to doer (poster only)
 * @access  Protected
 */
router.post('/tasks/:id/complete', validate(completeTaskSchema), swapController.completeTask);

export default router;
