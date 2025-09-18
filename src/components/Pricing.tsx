import React from "react";
import { Check, ArrowDown, Mail } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Button } from "./ui/button";

export const Pricing: React.FC = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out Neura AI",
      features: [
        "Basic text suggestions",
        "Limited daily usage",
        "Email support",
        "iOS & Android apps"
      ],
      cta: "Join Waitlist",
      ctaVariant: "outline" as const,
      popular: false
    },
    {
      name: "Premium",
      price: "$7.99",
      period: "per month",
      description: "Full-featured experience",
      features: [
        "Unlimited suggestions",
        "Voice mode included",
        "Advanced AI models",
        "Extended conversation history",
        "Priority support",
        "Custom wake words"
      ],
      cta: "Join Waitlist",
      ctaVariant: "default" as const,
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For teams and organizations",
      features: [
        "Self-hosted deployment",
        "Custom model training",
        "EMR/CRM integrations", 
        "Admin dashboard",
        "SSO & compliance",
        "Dedicated support"
      ],
      cta: "Contact Sales",
      ctaVariant: "outline" as const,
      popular: false
    }
  ];

  const scrollToWaitlist = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="pricing" className="py-24 bg-[#0A0A0A]">
      <div className="container mx-auto px-6">
        <SectionHeading
          eyebrow="Pricing"
          title="Choose the plan that works for you"
          subtitle="Start free, upgrade when you're ready"
        />
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? "bg-white/5 border-white/20 ring-1 ring-white/10"
                  : "bg-neutral-900/40 border-white/10"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-white text-black px-4 py-1 rounded-full text-xs font-semibold">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-white">
                    {plan.price}
                  </span>
                  {plan.period !== "contact us" && (
                    <span className="text-neutral-400 text-sm ml-1">
                      /{plan.period}
                    </span>
                  )}
                </div>
                <p className="text-neutral-400 text-sm">
                  {plan.description}
                </p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-neutral-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                variant={plan.ctaVariant}
                size="lg"
                className="w-full"
                onClick={scrollToWaitlist}
              >
                {plan.cta === "Join Waitlist" && (
                  <ArrowDown className="w-4 h-4 mr-2" />
                )}
                {plan.cta === "Contact Sales" && (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};