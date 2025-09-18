import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { sendToDiscord } from '@/utils/discord';

interface FormData {
  email: string;
  name: string;
  useCase: string;
  marketingOptIn: boolean;
}

export const WaitlistForm: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    useCase: '',
    marketingOptIn: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const useCaseOptions = [
    { value: 'work-meetings', label: 'Work Meetings' },
    { value: 'sales-calls', label: 'Sales Calls' },
    { value: 'hiring-interviews', label: 'Hiring/Interviews' },
    { value: 'class-study', label: 'Class/Study' },
    { value: 'healthcare-diagnostics', label: 'Healthcare/Diagnostics' },
    { value: 'other', label: 'Other' },
  ];

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Try to submit to API, fallback to local storage for development
      try {
        const response = await fetch('/api/waitlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            timestamp: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error('API Error');
        }

        // Send to Discord webhook if configured
        await sendToDiscord({ 
          name: formData.name, 
          email: formData.email, 
          use_case: formData.useCase 
        });
      } catch {
        // Fallback to local storage for development
        const existingEntries = JSON.parse(localStorage.getItem('neuraWaitlist') || '[]');
        const newEntry = {
          ...formData,
          timestamp: new Date().toISOString(),
          id: crypto.randomUUID(),
        };
        
        // Check for duplicate email
        if (existingEntries.some((entry: any) => entry.email === formData.email)) {
          throw new Error('Email already registered');
        }
        
        existingEntries.push(newEntry);
        localStorage.setItem('neuraWaitlist', JSON.stringify(existingEntries));
        console.log('Waitlist entry saved locally:', newEntry);
      }

      setIsSuccess(true);
      
      // Confetti effect
      const createConfetti = () => {
        const colors = ['#00ffff', '#0080ff', '#004080'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
          const confetti = document.createElement('div');
          confetti.style.position = 'fixed';
          confetti.style.left = Math.random() * 100 + 'vw';
          confetti.style.top = '-10px';
          confetti.style.width = '4px';
          confetti.style.height = '4px';
          confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
          confetti.style.pointerEvents = 'none';
          confetti.style.zIndex = '9999';
          confetti.style.borderRadius = '50%';
          
          const animation = confetti.animate([
            { transform: 'translateY(-10px) rotate(0deg)', opacity: 1 },
            { transform: `translateY(100vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }
          ], {
            duration: Math.random() * 2000 + 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          });
          
          document.body.appendChild(confetti);
          
          animation.onfinish = () => {
            confetti.remove();
          };
        }
      };
      
      createConfetti();
      
      toast({
        title: "Welcome to the waitlist!",
        description: "We'll notify you as soon as Neura AI is ready.",
        variant: "default",
      });
      
    } catch (error) {
      console.error('Waitlist submission error:', error);
      
      let errorMessage = "Please try again later.";
      if (error instanceof Error) {
        if (error.message === 'Email already registered') {
          errorMessage = "This email is already on the waitlist.";
        }
      }
      
      toast({
        title: "Something went wrong",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-foreground">
          You're on the list!
        </h3>
        <p className="text-foreground-muted">
          Thanks for joining the Neura AI waitlist. We'll be in touch soon with updates and early access.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground font-medium">
          Email address *
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="your.email@example.com"
          className="bg-card border-border focus:border-primary"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground font-medium">
          Name (optional)
        </Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Your name"
          className="bg-card border-border focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-foreground font-medium">
          Primary use case
        </Label>
        <Select
          value={formData.useCase}
          onValueChange={(value) => setFormData({ ...formData, useCase: value })}
        >
          <SelectTrigger className="bg-card border-border focus:border-primary">
            <SelectValue placeholder="Select your use case" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {useCaseOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="marketing"
          checked={formData.marketingOptIn}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, marketingOptIn: !!checked })
          }
          className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <Label
          htmlFor="marketing"
          className="text-sm text-foreground-muted cursor-pointer"
        >
          Email me product updates and early access
        </Label>
      </div>

      <Button
        type="submit"
        variant="hero"
        size="lg"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Joining waitlist...' : 'Join waitlist'}
      </Button>
    </form>
  );
};