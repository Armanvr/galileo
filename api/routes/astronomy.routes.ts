import { Router } from 'express'
import { getAllAstronomy } from '../controllers/astronomy.controller'

export const astronomyRouter = Router()

astronomyRouter.get('/astronomy', getAllAstronomy)
