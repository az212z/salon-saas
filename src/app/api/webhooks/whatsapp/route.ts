import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyWhatsAppWebhook } from '@/lib/whatsapp/send';

// ============================================================
// GET — Webhook verification
// ============================================================
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  const result = verifyWhatsAppWebhook(mode || '', token || '', challenge || '');

  if (result) {
    return new NextResponse(result, { status: 200 });
  }

  return NextResponse.json({ error: 'Invalid verification' }, { status: 403 });
}

// ============================================================
// POST — Webhook events (message status, replies, etc.)
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // WhatsApp sends events in an "entry" array
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;

        // Handle message status updates (sent, delivered, read)
        if (value.statuses) {
          const supabase = await createClient();

          for (const status of value.statuses) {
            await supabase
              .from('whatsapp_messages')
              .update({
                status: status.status, // sent, delivered, read
                ...(status.status === 'delivered' ? { delivered_at: new Date().toISOString() } : {}),
                ...(status.status === 'read' ? { read_at: new Date().toISOString() } : {}),
              })
              .eq('external_message_id', status.id);
          }
        }

        // Handle incoming messages (customer replies)
        if (value.messages) {
          // Process customer replies if needed
          // For now, we just log them
          console.log('WhatsApp incoming message:', JSON.stringify(value.messages));
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}