import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://registrazionesoci.vercel.app';
const privacyUrl = "https://www.leganavale.it/mod/aalborg_theme/pages/generic.php?filename=0746730001778785218_InformativaTrattamentoDatiPersonaliRegistrazioneTelematica-Maggio.pdf";

export async function POST(req: Request) {
  try {
    const { email, firstName, lastName, token, website, elapsed } = await req.json();

    // Honeypot check (only if provided, e.g. from recover-qr)
    if (website !== undefined && website) {
      return NextResponse.json({ error: 'Richiesta non valida.' }, { status: 403 });
    }
    // Time-to-submit check (only if provided)
    if (elapsed !== undefined && (typeof elapsed !== 'number' || elapsed < 3000)) {
      return NextResponse.json({ error: 'Richiesta troppo rapida. Ricarica la pagina e riprova.' }, { status: 403 });
    }

    if (!email || !firstName || !lastName || !token) {
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
            <p style="font-size: 18px; color: #555;">La tua pre-iscrizione è stata completata! Ecco il tuo codice di accesso per il check-in:</p>
            
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
            ⚠️ Questo messaggio è stato generato automaticamente dal sistema di pre-iscrizione. Si prega di non rispondere.
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
