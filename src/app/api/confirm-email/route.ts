import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'La verifica email non è più richiesta. La registrazione genera il QR Code immediatamente.' },
    { status: 410 }
  );
}
