import React from "react";
import { Star } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      text: "The seamless integration into real life that the voice interface offers is something that you just can't get with ChatGPT. This is a great complimentary cognitive tool.",
      author: "BlackoutArea",
      role: "Early Adopter",
      rating: 5
    },
    {
      text: "Having the ability to have discrete suggestions in your ear during face to face meetings makes you feel like James Bond. A cool app and fun to use!",
      author: "MNK78",
      role: "Professional",
      rating: 5
    },
    {
      text: "Lifesaver to prep for interviews and casual work conversations. This app is an exceptional tool for having more informed and deeper conversations.",
      author: "hyperspace9001",
      role: "Job Seeker",
      rating: 5
    },
    {
      text: "As an educator I asked it to suggest strategies for behavior interventions and it suggested excellent responses. I don't have to type my question—it's like talking to my mentor!",
      author: "roz1234567890987654321",
      role: "Educator",
      rating: 5
    },
    {
      text: "It seamlessly integrated into the conversation and had genuine understanding of the context. Definitely the best AI tool I have experienced so far.",
      author: "Beautyfly8",
      role: "Business Professional", 
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-[#0A0A0A]">
      <div className="container mx-auto px-6">
        <SectionHeading
          eyebrow="User Feedback"
          title="Early adopters love the experience"
          subtitle="Real reviews from App Store users who've tried Neura AI"
        />
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-neutral-900/40 border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-neutral-300 text-sm mb-4 leading-relaxed">
                "{testimonial.text}"
              </p>
              
              <div className="border-t border-white/10 pt-4">
                <p className="font-semibold text-white text-sm">
                  {testimonial.author}
                </p>
                <p className="text-xs text-neutral-400">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};