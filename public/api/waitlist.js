// Simple serverless function for waitlist API
// This can be deployed to Netlify, Vercel, or any serverless platform

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email, name, useCase, marketingOptIn, timestamp } = req.body;

    // Validate required fields
    if (!email || !timestamp) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Create entry object
    const entry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      email,
      name: name || '',
      useCase: useCase || '',
      marketingOptIn: marketingOptIn || false,
      timestamp,
      createdAt: new Date().toISOString(),
    };

    // Log the entry (replace with actual database/service integration)
    console.log('New waitlist entry:', entry);

    // TODO: Replace with actual service integration
    // Examples:
    // 
    // Mailchimp:
    // const mailchimp = require('@mailchimp/mailchimp_marketing');
    // await mailchimp.lists.addListMember(listId, {
    //   email_address: email,
    //   status: 'subscribed',
    //   merge_fields: { FNAME: name, USECASE: useCase }
    // });
    //
    // ConvertKit:
    // const convertkit = require('convertkit-api');
    // await convertkit.subscribers.create({
    //   email: email,
    //   first_name: name,
    //   fields: { use_case: useCase }
    // });
    //
    // Airtable:
    // const Airtable = require('airtable');
    // await base('Waitlist').create([{
    //   fields: { Email: email, Name: name, UseCase: useCase, MarketingOptIn: marketingOptIn }
    // }]);

    // Return success response
    res.status(200).json({
      success: true,
      id: entry.id,
      message: 'Successfully added to waitlist'
    });

  } catch (error) {
    console.error('Waitlist API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process waitlist entry'
    });
  }
}