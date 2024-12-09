import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEventEmail({
  recipientEmail,
  subject,
  message,
  eventTitle,
}: {
  recipientEmail: string;
  subject: string;
  message: string;
  eventTitle: string;
}) {
  try {
    console.log('Attempting to send email to:', recipientEmail);
    console.log('Using Resend API Key:', process.env.RESEND_API_KEY?.slice(0, 5) + '...');
//   change to to recipientEmail
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'afzal.ali.alld@gmail.com',
      subject: subject,
      html: `
        <div>
          <h1>Event: ${eventTitle}</h1>
          <p>${message}</p>
        </div>
      `
    });

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
//   change to to recipientEmail
}