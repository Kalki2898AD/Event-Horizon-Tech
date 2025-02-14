import { NextApiRequest, NextApiResponse } from 'next';
import { sendNewsletters } from '../../../utils/sendNewsletter';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify cron secret if needed
  const cronSecret = req.headers['x-vercel-cron'];
  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await sendNewsletters();
    return res.status(200).json({ message: 'Newsletters sent successfully' });
  } catch (error) {
    console.error('Error sending newsletters:', error);
    return res.status(500).json({ error: 'Failed to send newsletters' });
  }
} 