import React from "react";
import { SectionHeading } from "./SectionHeading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

export const FAQ: React.FC = () => {
  const faqs = [
    {
      question: "How fast are the responses?",
      answer: "Neura AI provides suggestions in real-time, typically within 1-2 seconds of detecting a relevant conversation topic. The system is optimized for minimal latency to maintain natural conversation flow."
    },
    {
      question: "How much data does it use?",
      answer: "Very minimal data usage. Audio processing happens locally on your device when possible, and only relevant context is sent to our servers. Typical usage is less than 10MB per hour of conversation."
    },
    {
      question: "What integrations are supported?",
      answer: "Currently integrating with Gmail, Calendar, Slack, Teams, Notion, and Google Drive. We're continuously adding new integrations based on user feedback and demand."
    },
    {
      question: "Which platforms are supported?",
      answer: "Neura AI is available on iOS and Android, with web app support coming soon. All platforms maintain feature parity for a consistent experience."
    },
    {
      question: "How does voice mode work?",
      answer: "Voice mode delivers suggestions directly to your headphones or earbuds. You can customize wake words and response types. The audio is processed securely and privately on your device."
    },
    {
      question: "What about enterprise security?",
      answer: "Enterprise deployments include self-hosted options, SOC2 compliance, role-based access controls, and end-to-end encryption. We meet healthcare and financial industry security standards."
    },
    {
      question: "Can I customize the AI's responses?",
      answer: "Yes, you can upload relevant documents, set conversation contexts, and train the AI on your specific use cases. The system learns your communication style over time."
    },
    {
      question: "Is my conversation data stored?",
      answer: "By default, conversations are not stored. You can opt-in to storage for personalization features. When enabled, data is encrypted and you maintain full control over deletion."
    },
    {
      question: "How is this different from ChatGPT?",
      answer: "Unlike ChatGPT, Neura AI works passively in real-time conversations without manual prompting. It understands context, filters for relevance, and delivers concise suggestions that don't interrupt your flow."
    },
    {
      question: "When will premium features be available?",
      answer: "Premium features including voice mode, advanced AI models, and extended conversation history will be available with our Q3 2025 re-launch. Join the waitlist for early access."
    }
  ];

  return (
    <section id="faq" className="py-24 bg-[#0A0A0A]">
      <div className="container mx-auto px-6">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently asked questions"
          subtitle="Everything you need to know about Neura AI"
        />
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-white/10"
              >
                <AccordionTrigger className="text-left text-foreground hover:text-foreground/80 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-foreground-muted">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};