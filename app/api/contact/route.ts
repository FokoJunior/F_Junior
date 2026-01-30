import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Validation simple d'email côté serveur
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Nettoyage du texte pour éviter les injections
function sanitizeText(text: string): string {
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .trim()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validation stricte
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Nom, email et message sont requis" },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Email invalide" },
        { status: 400 }
      )
    }

    // Nettoyer les données
    const cleanName = sanitizeText(name)
    const cleanSubject = sanitizeText(subject || `Message de ${name}`)
    const cleanMessage = sanitizeText(message)

    // Configuration du transporteur SMTP avec options anti-spam
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      // Options pour améliorer la délivrabilité
      tls: {
        rejectUnauthorized: false
      }
    })

    const currentDate = new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })

    // Email principal vers vous - Design Minimaliste Tech (Black & White)
    const mainMailOptions = {
      from: {
        name: "Portfolio Notification",
        address: process.env.SMTP_USER as string
      },
      to: process.env.SMTP_USER,
      replyTo: email,
      subject: `[Portfolio] ${cleanSubject}`,
      headers: {
        "X-Priority": "1",
        "X-Mailer": "Portfolio F_Junior",
      },
      html: `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; color: #18181b; margin: 0; padding: 0; line-height: 1.6; }
  .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; }
  .header { background: #18181b; color: #ffffff; padding: 24px 32px; border-bottom: 1px solid #27272a; }
  .badge { display: inline-block; background: #27272a; color: #e4e4e7; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; padding: 4px 8px; border-radius: 4px; margin-bottom: 8px; }
  .content { padding: 32px; }
  .field-label { font-size: 12px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .field-value { font-size: 16px; color: #18181b; margin-bottom: 24px; font-weight: 500; }
  .message-box { background: #f4f4f5; border-left: 3px solid #18181b; padding: 20px; border-radius: 4px; color: #3f3f46; font-size: 15px; margin-top: 8px; }
  .btn { display: inline-block; background: #18181b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; font-size: 14px; margin-top: 8px; }
  .footer { background: #f4f4f5; padding: 20px 32px; text-align: center; font-size: 12px; color: #a1a1aa; border-top: 1px solid #e4e4e7; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">Nouveau contact</div>
      <h1 style="margin: 0; font-size: 20px; font-weight: 600;">Message reçu</h1>
    </div>
    <div class="content">
      <div class="field-label">Expéditeur</div>
      <div class="field-value">${cleanName} <span style="color: #a1a1aa; font-weight: normal;">&lt;${email}&gt;</span></div>
      
      <div class="field-label">Sujet</div>
      <div class="field-value">${cleanSubject}</div>
      
      <div class="field-label">Message</div>
      <div class="message-box">
        ${cleanMessage.replace(/\n/g, "<br>")}
      </div>
      
      <div style="margin-top: 32px;">
        <a href="mailto:${email}?subject=Re: ${cleanSubject}" class="btn">Répondre par email</a>
      </div>
    </div>
    <div class="footer">
      Reçu le ${currentDate} via fokojunior.com
    </div>
  </div>
</body>
</html>
      `,
      text: `Nouveau message de ${cleanName} (${email})\n\nSujet: ${cleanSubject}\n\n${message}\n\nEnvoyé le ${currentDate}`
    }

    // Email de confirmation - Design Minimaliste Clean (White & Grey)
    const confirmationMail = {
      from: {
        name: "F_Junior",
        address: process.env.SMTP_USER as string
      },
      to: email,
      subject: "Message bien reçu",
      headers: {
        "X-Priority": "3",
        "X-Mailer": "Portfolio F_Junior",
      },
      html: `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #334155; margin: 0; padding: 0; line-height: 1.6; }
  .container { max-width: 550px; margin: 40px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
  .header { padding: 40px 32px 20px; text-align: center; }
  .icon { font-size: 32px; margin-bottom: 16px; display: inline-block; }
  .title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px; letter-spacing: -0.5px; }
  .subtitle { font-size: 15px; color: #64748b; margin: 0; }
  .content { padding: 20px 32px 40px; }
  .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0; }
  .card-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
  .card-text { font-size: 14px; color: #475569; font-style: italic; }
  .signature { border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 24px; }
  .name { font-weight: 600; color: #0f172a; font-size: 15px; }
  .role { font-size: 13px; color: #64748b; margin-top: 2px; }
  .links { margin-top: 12px; font-size: 13px; }
  .links a { color: #0f172a; text-decoration: none; margin-right: 12px; font-weight: 500; border-bottom: 1px solid transparent; transition: border-color 0.2s; }
  .links a:hover { border-bottom-color: #0f172a; }
  
  @media (prefers-color-scheme: dark) {
     /* Support simple du dark mode pour les clients qui le gèrent */
    .container { border-color: #333; }
  }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon"></div>
      <h1 class="title">Merci pour votre message</h1>
      <p class="subtitle">Je vous répondrai très prochainement.</p>
    </div>
    <div class="content">
      <p>Bonjour ${cleanName},</p>
      <p>J'ai bien reçu votre demande. Je m'engage généralement à répondre sous 24h.</p>
      
      <div class="card">
        <div class="card-label">Votre message</div>
        <div class="card-text">"${cleanMessage.length > 120 ? cleanMessage.substring(0, 120) + '...' : cleanMessage}"</div>
      </div>
      
      <div class="signature">
        <div class="name">FOKO TADJUIGE B. Junior</div>
        <div class="role">Développeur Full Stack & IA</div>
        <div class="links">
          <a href="https://fokojunior.com">Portfolio</a>
          <a href="https://github.com/FokoJunior">GitHub</a>
          <a href="https://linkedin.com/in/fokojunior">LinkedIn</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
      `,
      text: `Merci pour votre message, ${cleanName}.\n\nJe vous répondrai sous 24h.\n\nCordialement,\nF_Junior`
    }

    // Envoi des emails
    await transporter.sendMail(mainMailOptions)
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
