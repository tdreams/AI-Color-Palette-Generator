"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";

interface Step {
  step: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    step: 1,
    title: "Describe Your Vision",
    description:
      "Enter a prompt describing the mood, theme, or inspiration for your color palette.",
  },
  {
    step: 2,
    title: "AI Generation",
    description:
      "Our advanced AI analyzes your prompt and generates a variety of harmonious color schemes.",
  },
  {
    step: 3,
    title: "Customize and Export",
    description:
      "Fine-tune your palette, preview it in real-world scenarios, and export in various formats.",
  },
];

const HowItWorks = forwardRef<HTMLElement>((props, ref) => {
  return (
    <section ref={ref} className="space-y-12">
      <h2 className="text-3xl font-bold text-center">How It Works</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <motion.div
            key={step.step}
            className="flex flex-col items-center text-center space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              {step.step}
            </div>
            <h3 className="text-xl font-semibold">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
});

HowItWorks.displayName = "HowItWorks";

export default HowItWorks;
