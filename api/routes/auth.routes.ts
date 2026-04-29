import { Router } from 'express'
import { register, verifyEmail } from '../controllers/auth.controller'

export const authRouter = Router()

authRouter.post('/auth/register', register)
authRouter.get('/auth/verify', verifyEmail)
