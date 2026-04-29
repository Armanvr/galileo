import nodemailer from 'nodemailer'
import { env } from '../config/env'

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.GMAIL_USER,
		pass: process.env.GMAIL_APP_PASSWORD,
	},
})

/**
 * Send an account verification email containing a one-time confirmation link.
 *
 * @param to     Destination email address.
 * @param token  Verification token to embed in the link.
 */
export async function sendVerificationEmail(to: string, token: string): Promise<void> {
	const verifyUrl = `${env.CLIENT_URL}/verify?token=${encodeURIComponent(token)}`

	const text = [
		'Bienvenue sur Galileo !',
		'',
		'Pour confirmer votre inscription, ouvrez le lien suivant :',
		verifyUrl,
		'',
		'Ce lien expire dans 24 heures.',
		"Si vous n'êtes pas à l'origine de cette inscription, vous pouvez ignorer ce message.",
	].join('\n')

	const html = `
		<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #18181b;">
			<h1 style="font-size: 20px; margin: 0 0 16px;">Bienvenue sur Galileo</h1>
			<p style="margin: 0 0 16px; line-height: 1.5;">
				Pour confirmer votre inscription, cliquez sur le bouton ci-dessous :
			</p>
			<p style="margin: 0 0 24px;">
				<a href="${verifyUrl}" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-weight: 600;">
					Confirmer mon adresse
				</a>
			</p>
			<p style="margin: 0 0 8px; font-size: 13px; color: #52525b;">
				Ou copiez ce lien dans votre navigateur :
			</p>
			<p style="margin: 0 0 24px; font-size: 13px; word-break: break-all;">
				<a href="${verifyUrl}" style="color: #4f46e5;">${verifyUrl}</a>
			</p>
			<p style="margin: 0; font-size: 12px; color: #71717a;">
				Ce lien expire dans 24 heures. Si vous n'êtes pas à l'origine de cette inscription, ignorez ce message.
			</p>
		</div>
	`.trim()

	const info = await transporter.sendMail({
		from: `"Galileo" <${process.env.GMAIL_USER}>`,
		to,
		subject: 'Confirmez votre inscription sur Galileo',
		text,
		html,
	})

	console.log('[Mailer] Email envoyé :', info.messageId)
}
