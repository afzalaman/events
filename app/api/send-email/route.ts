import { sendEventEmail } from '@/lib/actions/email.actions';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { emails, subject, message, eventTitle } = await request.json();

    if (!emails || !Array.isArray(emails)) {
      console.error('Invalid email array:', emails);
      return NextResponse.json(
        { error: 'Invalid email array provided' },
        { status: 400 }
      );
    }

    if (!subject || !message || !eventTitle) {
      console.error('Missing required fields:', { subject, message, eventTitle });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Attempting to send emails to:', emails);

    // Send email to each attendee
    const emailResults = await Promise.allSettled(
      emails.map((email: string) => 
        sendEventEmail({
          recipientEmail: email,
          subject,
          message,
          eventTitle
        })
      )
    );

    // Log detailed results
    emailResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`Email ${index + 1} result:`, result.value);
      } else {
        console.error(`Email ${index + 1} failed:`, result.reason);
      }
    });

    // Check if any emails failed to send
    const failedEmails = emailResults.filter(
      result => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)
    );

    if (failedEmails.length > 0) {
      console.error('Some emails failed to send:', failedEmails);
      return NextResponse.json(
        { error: 'Some emails failed to send' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Emails sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in send-email route:', error);
    return NextResponse.json(
      { error: 'Failed to send emails' },
      { status: 500 }
    );
  }
}