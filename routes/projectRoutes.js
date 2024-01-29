import { Router } from "express"
import { getProjects, setProject, updateProject, deleteProject, getProject, getStats } from "../controllers/projectController.js"
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.route('/')
.get(protect, getProjects)
.post(protect, setProject)

router.route('/:id')
.get(protect, getProject)
.put(protect, updateProject)
.delete(protect, deleteProject)

router.route('/:id/stats')
.get(protect, getStats)

export default router