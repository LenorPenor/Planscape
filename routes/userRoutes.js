import { Router } from 'express'
import { registerUser, loginUser, getUser, deleteUser, updateUser, forgotPassword, resetPassword } from '../controllers/userController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/', registerUser)

router.post('/login', loginUser)

router.route('/:id')
.get(protect, getUser)
.delete(protect, deleteUser)
.put(protect, updateUser)

router.post('/forgot-password', forgotPassword)
router.post('/reset-password', protect, resetPassword)

export default router