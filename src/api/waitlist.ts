// Simple waitlist API handler - can be easily swapped for Mailchimp/ConvertKit/Airtable

interface WaitlistEntry {
  email: string;
  name?: string;
  useCase?: string;
  marketingOptIn: boolean;
  timestamp: string;
  id: string;
}

// In-memory storage for development (replace with actual database/service)
let waitlistEntries: WaitlistEntry[] = [];

export const addToWaitlist = async (data: Omit<WaitlistEntry, 'id'>): Promise<WaitlistEntry> => {
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new Error('Invalid email address');
  }

  // Check if email already exists
  const existingEntry = waitlistEntries.find(entry => entry.email === data.email);
  if (existingEntry) {
    throw new Error('Email already registered');
  }

  // Create new entry
  const entry: WaitlistEntry = {
    ...data,
    id: crypto.randomUUID(),
  };

  // Add to storage
  waitlistEntries.push(entry);

  // Log for debugging
  console.log('New waitlist entry:', {
    email: entry.email,
    name: entry.name,
    useCase: entry.useCase,
    marketingOptIn: entry.marketingOptIn,
    timestamp: entry.timestamp,
  });

  // TODO: Replace this with actual service integration
  // Examples:
  // - Mailchimp: await mailchimp.lists.addListMember(listId, { email_address: data.email, ... })
  // - ConvertKit: await convertkit.subscribers.create({ email: data.email, ... })
  // - Airtable: await airtable.create([{ fields: { Email: data.email, ... } }])

  return entry;
};

export const getWaitlistEntries = (): WaitlistEntry[] => {
  return waitlistEntries;
};

// Simple Express-style handler for Vite dev server
export const waitlistHandler = async (req: any, res: any) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const entry = await addToWaitlist(req.body);
    res.status(200).json({ success: true, id: entry.id });
  } catch (error) {
    console.error('Waitlist error:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};