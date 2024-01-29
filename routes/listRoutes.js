import { Router } from "express"
import { deleteList, setList, updateList, getLists, getList, updateListOrder } from '../controllers/listController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.route('/:projectId')
.post(protect, setList)
.get(protect, getLists)

router.route('/:id')
.delete(protect, deleteList)
.put(protect, updateList)

router.route('/list/:listId')
.get(protect, getList)

router.route('/:id/reorder')
.post(protect, updateListOrder)

export default router