import React, { useState } from "react";
import { ArrowRight, Mail, User, Briefcase } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "./ui/use-toast";
import { sendToDiscord } from "../utils/discord";

export const CTA: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    use_case: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit to existing API
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      // Send to Discord webhook if configured
      await sendToDiscord(formData);

      toast({
        title: "Thanks for joining!",
        description: "You're on the waitlist. We'll be in touch soon with early access.",
      });

      setFormData({ name: "", email: "", role: "", use_case: "" });
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-[#0A0A0A]">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to transform your conversations?
          </h2>
          <p className="text-lg text-neutral-300">
            Join thousands of professionals already on the waitlist. Be among the first to experience Neura AI.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="bg-neutral-900/60 border-white/10 text-white placeholder:text-neutral-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                className="bg-neutral-900/60 border-white/10 text-white placeholder:text-neutral-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Your Role
              </Label>
              <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger className="bg-neutral-900/60 border-white/10 text-white">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executive">Executive</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="sales">Sales Professional</SelectItem>
                  <SelectItem value="consultant">Consultant</SelectItem>
                  <SelectItem value="healthcare">Healthcare Professional</SelectItem>
                  <SelectItem value="educator">Educator</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="use_case" className="text-white">
                Primary Use Case
              </Label>
              <Select value={formData.use_case} onValueChange={(value) => setFormData(prev => ({ ...prev, use_case: value }))}>
                <SelectTrigger className="bg-neutral-900/60 border-white/10 text-white">
                  <SelectValue placeholder="How will you use Neura AI?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meetings">Work Meetings</SelectItem>
                  <SelectItem value="sales">Sales Conversations</SelectItem>
                  <SelectItem value="negotiations">Negotiations</SelectItem>
                  <SelectItem value="interviews">Interviews</SelectItem>
                  <SelectItem value="training">Training & Coaching</SelectItem>
                  <SelectItem value="brainstorming">Brainstorming</SelectItem>
                  <SelectItem value="healthcare">Medical Consultations</SelectItem>
                  <SelectItem value="education">Education & Learning</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full group"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Joining..." : "Join the Waitlist"}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-neutral-400">
              No spam, ever. We'll only email you about early access and important updates.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};