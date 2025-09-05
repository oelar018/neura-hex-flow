import React, { useState } from 'react';
import { HexSculptP5 } from '@/components/HexSculptP5';
import { VideoModal } from '@/components/VideoModal';
import { WaitlistForm } from '@/components/WaitlistForm';
import { Button } from '@/components/ui/button';
import { ArrowDown, Play, CheckCircle, Users, Zap, Shield } from 'lucide-react';

export const Landing: React.FC = () => {
  const [showVideoModal, setShowVideoModal] = useState(false);

  const scrollToWaitlist = () => {
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-primary font-inter">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: '#0A0A0A' }}>
        {/* Interactive Hex Sculpture Background */}
        <HexSculptP5 
          rings={10}
          dotSize={3.0}
          glowStrength={0.8}
          idleSpeed={0.002}
          focusCount={60}
          noiseAmt={0.15}
          perfMode="auto"
        />
        
        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-primary tracking-wide">
              Neura AI
            </h1>
          </div>
          
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Answers at the speed
            <br />
            <span className="text-primary">of conversation.</span>
          </h1>
          
          {/* Subhead */}
          <p className="text-lg md:text-xl text-foreground-muted max-w-3xl mx-auto mb-12 leading-relaxed">
            Neura AI surfaces concise, relevant insights while you talk—no toggling, no typing.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="hero" 
              size="lg"
              onClick={scrollToWaitlist}
              className="group"
            >
              Join the waitlist
              <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="lg"
              onClick={() => setShowVideoModal(true)}
              className="group"
            >
              <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Watch a 30s preview
            </Button>
          </div>
        </div>
      </section>

      {/* How It Helps Section */}
      <section className="py-24 bg-background-subtle">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-16">
              How it helps
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4 p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Stay in the flow—no context switching.
                </h3>
              </div>
              
              <div className="text-center space-y-4 p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Only what's relevant—signal, not noise.
                </h3>
              </div>
              
              <div className="text-center space-y-4 p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Adapts to your setting—meetings, sales, interviews, diagnostics.
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-foreground-muted">
            <Users className="w-5 h-5" />
            <p className="text-sm">
              Pilot partnerships underway in healthcare and enterprise.
            </p>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="py-24 bg-background-subtle">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Join the waitlist
            </h2>
            <p className="text-lg text-foreground-muted">
              Be among the first to experience Neura AI. Get early access and help shape the future of conversation intelligence.
            </p>
          </div>
          
          <WaitlistForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-foreground-muted text-sm">
              © 2025 Neura AI. All rights reserved.
            </div>
            
            <nav className="flex space-x-6">
              <a 
                href="/privacy" 
                className="text-foreground-muted hover:text-primary text-sm transition-colors"
              >
                Privacy
              </a>
              <a 
                href="/terms" 
                className="text-foreground-muted hover:text-primary text-sm transition-colors"
              >
                Terms
              </a>
              <a 
                href="/contact" 
                className="text-foreground-muted hover:text-primary text-sm transition-colors"
              >
                Contact
              </a>
            </nav>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      <VideoModal 
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
      />
    </div>
  );
};