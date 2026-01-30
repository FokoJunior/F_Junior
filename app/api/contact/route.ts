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

    // Email principal vers vous - Design professionnel F_Junior
    const mainMailOptions = {
      from: {
        name: "Portfolio F_Junior",
        address: process.env.SMTP_USER as string
      },
      to: process.env.SMTP_USER,
      replyTo: email,
      subject: `📬 ${cleanSubject}`,
      // Headers anti-spam
      headers: {
        "X-Priority": "3",
        "X-Mailer": "Portfolio F_Junior",
        "List-Unsubscribe": `<mailto:${process.env.SMTP_USER}?subject=unsubscribe>`,
      },
      html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f23;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f0f23; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          
          <!-- Header avec logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px 15px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                📧 Nouveau Message
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">
                Reçu via votre portfolio fokojunior.com
              </p>
            </td>
          </tr>
          
          <!-- Contenu principal -->
          <tr>
            <td style="background-color: #1a1a3e; padding: 35px;">
              
              <!-- Info expéditeur -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                <tr>
                  <td style="background: rgba(102, 126, 234, 0.15); border-radius: 12px; padding: 20px; border-left: 4px solid #667eea;">
                    <table width="100%">
                      <tr>
                        <td width="50" valign="top">
                          <div style="width: 45px; height: 45px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; line-height: 45px; text-align: center;">
                            👤
                          </div>
                        </td>
                        <td style="padding-left: 15px;">
                          <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 600;">${cleanName}</p>
                          <a href="mailto:${email}" style="color: #667eea; text-decoration: none; font-size: 14px;">${email}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Sujet -->
              <div style="margin-bottom: 20px;">
                <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">Sujet</p>
                <p style="color: #ffffff; font-size: 16px; margin: 0; font-weight: 500;">${cleanSubject}</p>
              </div>
              
              <!-- Message -->
              <div style="background: #0f0f23; border-radius: 12px; padding: 25px; border: 1px solid rgba(102, 126, 234, 0.3);">
                <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px;">Message</p>
                <p style="color: #e0e0e0; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${cleanMessage}</p>
              </div>
              
              <!-- Bouton répondre -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                <tr>
                  <td align="center">
                    <a href="mailto:${email}?subject=Re: ${cleanSubject}" style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                      ✉️ Répondre à ${cleanName}
                    </a>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0f0f23; padding: 20px; border-radius: 0 0 15px 15px; border-top: 1px solid rgba(102, 126, 234, 0.2);">
              <table width="100%">
                <tr>
                  <td style="color: #666; font-size: 12px;">
                    📅 ${currentDate}
                  </td>
                  <td align="right" style="color: #666; font-size: 12px;">
                    🌐 fokojunior.com
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
      text: `
════════════════════════════════════════
📧 NOUVEAU MESSAGE - Portfolio F_Junior
════════════════════════════════════════

👤 De: ${cleanName}
📧 Email: ${email}
📋 Sujet: ${cleanSubject}

────────────────────────────────────────
MESSAGE:
────────────────────────────────────────

${message}

────────────────────────────────────────
📅 Reçu le: ${currentDate}
🌐 Source: fokojunior.com
════════════════════════════════════════
      `,
    }

    // Email de confirmation - Design moderne pour l'expéditeur
    const confirmationMail = {
      from: {
        name: "F_Junior - Portfolio",
        address: process.env.SMTP_USER as string
      },
      to: email,
      subject: `✅ Message bien reçu, ${cleanName} !`,
      headers: {
        "X-Priority": "3",
        "X-Mailer": "Portfolio F_Junior",
      },
      html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f23;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f0f23; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 35px; border-radius: 15px 15px 0 0; text-align: center;">
              <div style="font-size: 50px; margin-bottom: 10px;">✅</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;">
                Message Envoyé !
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 15px;">
                Merci de m'avoir contacté, ${cleanName}
              </p>
            </td>
          </tr>
          
          <!-- Contenu -->
          <tr>
            <td style="background-color: #1a1a3e; padding: 35px;">
              
              <p style="color: #e0e0e0; font-size: 16px; line-height: 1.7; margin: 0 0 25px;">
                Bonjour <strong style="color: #10b981;">${cleanName}</strong>,
              </p>
              
              <p style="color: #e0e0e0; font-size: 16px; line-height: 1.7; margin: 0 0 25px;">
                J'ai bien reçu votre message et je vous en remercie ! 🙏
              </p>
              
              <p style="color: #e0e0e0; font-size: 16px; line-height: 1.7; margin: 0 0 30px;">
                Je m'efforce de répondre à tous les messages dans un délai de <strong style="color: #10b981;">24 à 48 heures</strong>. Votre message est important pour moi !
              </p>
              
              <!-- Récapitulatif -->
              <div style="background: #0f0f23; border-radius: 12px; padding: 25px; border: 1px solid rgba(16, 185, 129, 0.3); margin-bottom: 30px;">
                <p style="color: #10b981; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px; font-weight: 600;">
                  📋 Récapitulatif de votre message
                </p>
                <table width="100%" style="color: #e0e0e0; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                      <strong>Sujet:</strong>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                      ${cleanSubject}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;" valign="top">
                      <strong>Message:</strong>
                    </td>
                    <td style="padding: 8px 0; color: #aaa;">
                      ${cleanMessage.length > 150 ? cleanMessage.substring(0, 150) + "..." : cleanMessage}
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Call to action -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://fokojunior.com" style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                      🌐 Visiter mon Portfolio
                    </a>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- À propos -->
          <tr>
            <td style="background: rgba(102, 126, 234, 0.1); padding: 25px;">
              <table width="100%">
                <tr>
                  <td width="60" valign="top">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; text-align: center; line-height: 50px; font-size: 24px;">
                      👨‍💻
                    </div>
                  </td>
                  <td style="padding-left: 15px;">
                    <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 5px;">FOKO TADJUIGE B. Junior</p>
                    <p style="color: #888; font-size: 13px; margin: 0 0 8px;">Développeur Full Stack & IA</p>
                    <p style="color: #888; font-size: 13px; margin: 0;">Master 1 Génie Logiciel et Systèmes d'Information</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Réseaux sociaux -->
          <tr>
            <td style="background-color: #1a1a3e; padding: 25px; text-align: center;">
              <p style="color: #888; font-size: 13px; margin: 0 0 15px;">Restons connectés !</p>
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="padding: 0 10px;">
                    <a href="https://github.com/FokoJunior" style="color: #667eea; text-decoration: none; font-size: 13px;">GitHub</a>
                  </td>
                  <td style="color: #444;">|</td>
                  <td style="padding: 0 10px;">
                    <a href="https://linkedin.com/in/fokojunior" style="color: #667eea; text-decoration: none; font-size: 13px;">LinkedIn</a>
                  </td>
                  <td style="color: #444;">|</td>
                  <td style="padding: 0 10px;">
                    <a href="https://fokojunior.com" style="color: #667eea; text-decoration: none; font-size: 13px;">Portfolio</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0f0f23; padding: 20px; border-radius: 0 0 15px 15px; text-align: center; border-top: 1px solid rgba(102, 126, 234, 0.2);">
              <p style="color: #555; font-size: 11px; margin: 0;">
                Cet email a été envoyé automatiquement depuis fokojunior.com<br>
                © ${new Date().getFullYear()} F_Junior. Tous droits réservés.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
      text: `
════════════════════════════════════════
✅ MESSAGE BIEN REÇU !
════════════════════════════════════════

Bonjour ${cleanName},

J'ai bien reçu votre message et je vous en remercie !

Je m'efforce de répondre à tous les messages dans un délai de 24 à 48 heures.

────────────────────────────────────────
📋 RÉCAPITULATIF:
────────────────────────────────────────
Sujet: ${cleanSubject}
Message: ${cleanMessage}

────────────────────────────────────────

À très bientôt !

FOKO TADJUIGE B. Junior
Développeur Full Stack & IA
Master 1 Génie Logiciel et Systèmes d'Information

🌐 fokojunior.com
📧 info@fokojunior.com

════════════════════════════════════════
      `,
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
