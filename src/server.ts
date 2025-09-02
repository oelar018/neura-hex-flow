// Simple development server for handling API routes
import { addToWaitlist } from './api/waitlist';

// Handle fetch requests in development
if (typeof window === 'undefined') {
  // Server-side setup would go here for production
  console.log('Server setup placeholder - replace with actual backend implementation');
}

// Client-side API handler that can work with fetch
export const handleWaitlistSubmission = async (formData: {
  email: string;
  name?: string;
  useCase?: string;
  marketingOptIn: boolean;
  timestamp: string;
}) => {
  // In a real app, this would be handled by your backend
  // For now, we'll simulate the API call
  
  try {
    console.log('Waitlist submission:', formData);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add to local storage for persistence during development
    const existingEntries = JSON.parse(localStorage.getItem('waitlistEntries') || '[]');
    const newEntry = {
      ...formData,
      id: crypto.randomUUID(),
    };
    
    // Check for duplicate email
    if (existingEntries.some((entry: any) => entry.email === formData.email)) {
      throw new Error('Email already registered');
    }
    
    existingEntries.push(newEntry);
    localStorage.setItem('waitlistEntries', JSON.stringify(existingEntries));
    
    return { success: true, id: newEntry.id };
  } catch (error) {
    throw error;
  }
};

// Export for use in components
export { addToWaitlist };