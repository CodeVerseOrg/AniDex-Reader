import { NextRequest, NextResponse } from 'next/server';
import { handleTelegramUpdate, getBotInfo } from '@/lib/telegram';

// Telegram Webhook Handler
export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    
    // Process the update asynchronously
    await handleTelegramUpdate(update);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: false, error: 'Processing failed' }, { status: 500 });
  }
}

// Health check / Bot info
export async function GET() {
  const botInfo = await getBotInfo();
  
  if (botInfo) {
    return NextResponse.json({
      ok: true,
      bot: {
        id: botInfo.id,
        username: botInfo.username,
        name: botInfo.first_name,
      },
    });
  }

  return NextResponse.json({ ok: false, error: 'Bot not configured' }, { status: 503 });
}
