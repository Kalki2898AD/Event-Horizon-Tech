'use client';

import { useState } from 'react';

export default function TestEmailButton({ email }: { email: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);

  const sendTestEmail = async () => {
    try {
      setStatus('loading');
      setErrorMessage(null);
      setScheduledTime(null);
      
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to schedule test email');
      }

      setStatus('success');
      setScheduledTime(data.scheduledTime);
      console.log('Test email scheduled:', data);
    } catch (error) {
      console.error('Error scheduling test email:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to schedule test email');
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={sendTestEmail}
        disabled={status === 'loading'}
        className={`px-4 py-2 rounded-lg text-white font-medium ${
          status === 'loading'
            ? 'bg-gray-400'
            : status === 'success'
            ? 'bg-green-500'
            : status === 'error'
            ? 'bg-red-500'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {status === 'loading'
          ? 'Scheduling...'
          : status === 'success'
          ? 'Email Scheduled!'
          : status === 'error'
          ? 'Failed to Schedule'
          : 'Send Test Email'}
      </button>
      {status === 'success' && scheduledTime && (
        <p className="mt-2 text-sm text-green-600">
          Test email scheduled! You will receive it at: {new Date(scheduledTime).toLocaleString()}
          <br />
          Please check your inbox (and spam folder) in 2 minutes.
        </p>
      )}
      {status === 'error' && errorMessage && (
        <p className="mt-2 text-sm text-red-500">
          Error: {errorMessage}
        </p>
      )}
    </div>
  );
}
