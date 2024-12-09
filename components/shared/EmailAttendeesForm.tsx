'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type EmailAttendeesFormProps = {
  eventTitle: string;
  attendeeEmails: string[];
};

const EmailAttendeesForm = ({ eventTitle, attendeeEmails }: EmailAttendeesFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: attendeeEmails,
          subject,
          message,
          eventTitle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send emails');
      }

      // Reset form using ref
      formRef.current?.reset();
      alert('Emails sent successfully!');
    } catch (error) {
      console.error('Error sending emails:', error);
      alert(error instanceof Error ? error.message : 'Failed to send emails. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        type="text"
        placeholder="Email Subject"
        name="subject"
        required
        className="input-field"
      />
      <Textarea
        placeholder="Your message to attendees"
        name="message"
        required
        className="textarea rounded-2xl h-32"
      />
      <Button 
        type="submit" 
        disabled={isLoading}
        className="button w-full"
      >
        {isLoading ? 'Sending...' : 'Send Email to All Attendees'}
      </Button>
    </form>
  );
};

export default EmailAttendeesForm;