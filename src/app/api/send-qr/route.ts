import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, firstName, lastName, token } = await req.json();

    // Nota: L'host deve essere quello reale per il link di validazione
    const validationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://registrazionesoci.vercel.app'}/validate/${token}`;

    const data = await resend.emails.send({
      from: 'LNI Messina <noreply@leganavaleitalianamessina.it>', // Nota: Richiede dominio verificato su Resend, altrimenti usa 'onboarding@resend.dev'
      to: [email],
      subject: `Il tuo QRCode di Accesso - LNI Messina (${firstName} ${lastName})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #003366; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Lega Navale Italiana</h1>
            <p style="color: #ffcc00; margin: 5px 0 0 0;">Sezione di Messina</p>
          </div>
          <div style="padding: 30px; text-align: center;">
            <h2 style="color: #333;">Ciao ${firstName},</h2>
            <p style="font-size: 18px; color: #555;">Grazie per la tua registrazione. Ecco il tuo codice di accesso per il check-in:</p>
            
            <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 10px; display: inline-block;">
              <p style="font-size: 24px; font-weight: bold; color: #007bff; margin: 0 0 10px 0;">TOKEN: ${token}</p>
              <p style="font-size: 14px; color: #888;">Mostra questo codice o il QRCode allegato all'operatore.</p>
            </div>

            <p style="font-size: 16px; color: #555; line-height: 1.5;">
              Puoi anche visualizzare il tuo QRCode in qualsiasi momento visitando questo link:<br>
              <a href="${validationUrl}" style="color: #007bff; font-weight: bold;">Visualizza il mio QRCode</a>
            </p>
          </div>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #888;">
            &copy; ${new Date().getFullYear()} Lega Navale Italiana - Sezione di Messina<br>
            Questa è un'email automatica, per favore non rispondere.
          </div>
        </div>
      `,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}
