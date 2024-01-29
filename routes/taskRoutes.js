import { Router } from "express"
import { setTask, updateTask, updateTaskDoneState, deleteTask, getTasks, getAllTasks, getTask, getTasksInProject, updateTaskPosition } from '../controllers/taskController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.route('/')
.get(protect, getAllTasks)

router.route('/:listId')
.post(protect, setTask)
.get(protect, getTasks)

router.route('/:id')
.delete(protect, deleteTask)
.put(protect, updateTaskDoneState)

router.route('/:id/reorder')
.put(protect, updateTaskPosition)

router.route('/task/:taskId')
.get(protect, getTask)
.put(protect, updateTask)

router.route('/:projectId/tasks')
.get(protect, getTasksInProject)

export default router