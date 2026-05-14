import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://registrazionesoci.vercel.app';
const privacyUrl = "https://www.leganavale.it/mod/aalborg_theme/pages/generic.php?filename=InformativaTrattamentoDatiPersonaliRegistrazioneTelematica-Maggio.pdf";

export async function POST(req: Request) {
  try {
    const { email, firstName, lastName, token, type, confirmToken } = await req.json();

    if (!email || !firstName || !lastName) {
      return NextResponse.json({ error: 'Parametri mancanti.' }, { status: 400 });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("ERRORE: Variabili EMAIL_USER o EMAIL_PASS mancanti!");
      return NextResponse.json({ error: "Configurazione email mancante sul server." }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    if (type === 'confirmation') {
      if (!confirmToken) {
        return NextResponse.json({ error: 'Token di conferma mancante.' }, { status: 400 });
      }

      const confirmUrl = `${APP_URL}/confirm-email?token=${confirmToken}`;

      const mailOptions = {
        from: `"LNI Messina" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Conferma la tua email - LNI Messina (${firstName} ${lastName})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #003366; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Lega Navale Italiana</h1>
              <p style="color: #ffcc00; margin: 5px 0 0 0;">Sezione di Messina</p>
            </div>
            <div style="padding: 30px; text-align: center;">
              <h2 style="color: #333;">Ciao ${firstName},</h2>
              <p style="font-size: 18px; color: #555;">Grazie per la tua richiesta di pre-iscrizione.</p>
              <p style="font-size: 16px; color: #555;">Per completare la registrazione e ricevere il tuo QRCode personale, conferma il tuo indirizzo email cliccando sul pulsante qui sotto:</p>
              
              <div style="margin: 30px 0;">
                <a href="${confirmUrl}" style="background-color: #28a745; color: white; padding: 18px 40px; border-radius: 10px; text-decoration: none; font-size: 20px; font-weight: bold; display: inline-block;">
                  ✅ Conferma Email
                </a>
              </div>

              <p style="font-size: 14px; color: #888;">Se il pulsante non funziona, copia e incolla questo link nel browser:</p>
              <p style="font-size: 14px; color: #007bff; word-break: break-all;">${confirmUrl}</p>
            </div>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #888;">
              &copy; ${new Date().getFullYear()} Lega Navale Italiana - Sezione di Messina<br>
              <a href="${privacyUrl}" style="color: #888; text-decoration: underline;">Informativa Privacy</a><br><br>
              Questa è un'email automatica, per favore non rispondere.
            </div>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Email conferma inviata:", info.messageId);
      return NextResponse.json({ success: true });
    }

    // Default: send QR code email
    if (!token) {
      return NextResponse.json({ error: 'Token QR mancante.' }, { status: 400 });
    }

    const validationUrl = `${APP_URL}/validate/${token}`;

    const mailOptions = {
      from: `"LNI Messina" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Il tuo QRCode di Accesso - LNI Messina (${firstName} ${lastName})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #003366; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Lega Navale Italiana</h1>
            <p style="color: #ffcc00; margin: 5px 0 0 0;">Sezione di Messina</p>
          </div>
          <div style="padding: 30px; text-align: center;">
            <h2 style="color: #333;">Ciao ${firstName},</h2>
            <p style="font-size: 18px; color: #555;">La tua email è stata verificata con successo! Ecco il tuo codice di accesso per il check-in:</p>
            
            <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 10px; display: inline-block;">
              <p style="font-size: 24px; font-weight: bold; color: #007bff; margin: 0 0 10px 0;">TOKEN: ${token}</p>
              <p style="font-size: 14px; color: #888;">Mostra questo codice o il QRCode all'operatore.</p>
            </div>

            <p style="font-size: 16px; color: #555; line-height: 1.5;">
              Puoi anche visualizzare il tuo QRCode in qualsiasi momento visitando questo link:<br>
              <a href="${validationUrl}" style="color: #007bff; font-weight: bold;">Visualizza il mio QRCode</a>
            </p>
          </div>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #888;">
            &copy; ${new Date().getFullYear()} Lega Navale Italiana - Sezione di Messina<br>
            <a href="${privacyUrl}" style="color: #888; text-decoration: underline;">Informativa Privacy</a><br><br>
            Questa è un'email automatica, per favore non rispondere.
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email QR inviata:", info.messageId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ERRORE INVIO EMAIL:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
