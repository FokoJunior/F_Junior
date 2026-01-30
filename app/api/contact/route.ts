import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, subject, message } = body

        // Validation
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: "Nom, email et message sont requis" },
                { status: 400 }
            )
        }

        // Configuration du transporteur SMTP
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: true, // true pour port 465
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        })

        // Options de l'email
        const mailOptions = {
            from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER, // Envoyé à vous-même
            replyTo: email,
            subject: subject || `Nouveau message de ${name} via Portfolio`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📧 Nouveau Message</h1>
          </div>
          <div style="background: #f9f9f9; padding: 25px; border-radius: 0 0 10px 10px;">
            <p style="margin: 0 0 15px;"><strong>De:</strong> ${name}</p>
            <p style="margin: 0 0 15px;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            ${subject ? `<p style="margin: 0 0 15px;"><strong>Sujet:</strong> ${subject}</p>` : ""}
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea;">
              <p style="margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          <p style="color: #888; font-size: 12px; text-align: center; margin-top: 20px;">
            Envoyé depuis le portfolio F_Junior
          </p>
        </div>
      `,
            text: `
Nouveau message de ${name}

De: ${name}
Email: ${email}
${subject ? `Sujet: ${subject}` : ""}

Message:
${message}

---
Envoyé depuis le portfolio F_Junior
      `,
        }

        // Envoi de l'email
        await transporter.sendMail(mailOptions)

        // Email de confirmation à l'expéditeur
        const confirmationMail = {
            from: `"F_Junior" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Merci pour votre message ! 🎉",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Merci ${name} ! 🙏</h1>
          </div>
          <div style="background: #f9f9f9; padding: 25px; border-radius: 0 0 10px 10px;">
            <p>Bonjour <strong>${name}</strong>,</p>
            <p>J'ai bien reçu votre message et je vous répondrai dans les plus brefs délais.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
            <h3 style="color: #333;">Récapitulatif de votre message:</h3>
            <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea;">
              <p style="margin: 0; white-space: pre-wrap; color: #666;">${message}</p>
            </div>
            <p style="margin-top: 20px;">À bientôt !</p>
            <p><strong>F_Junior</strong><br/>
            Développeur Full Stack & IA<br/>
            <a href="https://fokojunior.com">fokojunior.com</a></p>
          </div>
        </div>
      `,
        }

        await transporter.sendMail(confirmationMail)

        return NextResponse.json({
            success: true,
            message: "Email envoyé avec succès"
        })

    } catch (error) {
        console.error("Erreur envoi email:", error)
        return NextResponse.json(
            { error: "Erreur lors de l'envoi de l'email" },
            { status: 500 }
        )
    }
}
