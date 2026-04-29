import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import type { Request, Response } from 'express'
import { UserModel } from '../models/user.model'
import { sendVerificationEmail } from '../services/mail.service'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_MIN_LENGTH = 8
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000
const REGISTER_SUCCESS_MESSAGE = "Si l'adresse est valide, un email de confirmation vient d'être envoyé."

/**
 * Register a new user account.
 *
 * @route   POST /api/auth/register
 * @body    {{ email: string, password: string }}
 * @returns {201} When the confirmation email has been dispatched.
 * @returns {400} When the payload is malformed.
 * @returns {409} When an already-verified account exists for this email.
 * @returns {500} When the database or mail provider fails.
 */
export async function register(req: Request, res: Response): Promise<void> {
	const { email: rawEmail, password } = (req.body ?? {}) as {
		email?: unknown
		password?: unknown
	}

	if (typeof rawEmail !== 'string' || typeof password !== 'string') {
		res.status(400).json({ error: 'Email et mot de passe sont requis.' })
		return
	}

	const email = rawEmail.trim().toLowerCase()

	if (!EMAIL_REGEX.test(email)) {
		res.status(400).json({ error: 'Adresse email invalide.' })
		return
	}

	if (password.length < PASSWORD_MIN_LENGTH) {
		res.status(400).json({
			error: `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`,
		})
		return
	}

	try {
		const existing = await UserModel.findOne({ email }).lean()
		if (existing?.verified) {
			res.status(409).json({ error: 'Un compte existe déjà pour cette adresse.' })
			return
		}

		const passwordHash = await bcrypt.hash(password, 10)
		const verificationToken = crypto.randomBytes(32).toString('hex')
		const verificationTokenExpiresAt = new Date(Date.now() + TOKEN_TTL_MS)

		const user = await UserModel.findOneAndUpdate(
			{ email },
			{
				email,
				passwordHash,
				verified: false,
				verificationToken,
				verificationTokenExpiresAt,
			},
			{ upsert: true, new: true, setDefaultsOnInsert: true },
		)

		try {
			await sendVerificationEmail(email, verificationToken)
		} catch (mailError) {
			console.error('Failed to send verification email:', mailError)
			if (!existing) {
				await UserModel.deleteOne({ _id: user._id }).catch((cleanupError) => {
					console.error('Failed to rollback user after mail error:', cleanupError)
				})
			}
			res.status(500).json({ error: "Impossible d'envoyer l'email de confirmation." })
			return
		}

		res.status(201).json({ message: REGISTER_SUCCESS_MESSAGE })
	} catch (error) {
		console.error('Failed to register user:', error)
		res.status(500).json({ error: "Échec de l'inscription." })
	}
}

/**
 * Confirm a user's email address using the token sent by mail.
 *
 * @route   GET /api/auth/verify
 * @query   {string} token - The verification token received by email.
 * @returns {200} `{ verified: true }` on success.
 * @returns {400} `{ verified: false, error }` when the token is missing,
 *                invalid, or expired.
 */
export async function verifyEmail(req: Request, res: Response): Promise<void> {
	const token = typeof req.query.token === 'string' ? req.query.token : ''

	if (!token) {
		res.status(400).json({ verified: false, error: 'Token manquant.' })
		return
	}

	try {
		const user = await UserModel.findOne({
			verificationToken: token,
			verificationTokenExpiresAt: { $gt: new Date() },
		})

		if (!user) {
			res.status(400).json({ verified: false, error: 'Token invalide ou expiré.' })
			return
		}

		user.verified = true
		user.verificationToken = null
		user.verificationTokenExpiresAt = null
		await user.save()

		res.json({ verified: true })
	} catch (error) {
		console.error('Failed to verify user:', error)
		res.status(500).json({ verified: false, error: 'Échec de la vérification.' })
	}
}
