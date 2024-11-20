"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, Users } from "lucide-react";

interface Feature {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Sparkles,
    title: "AI-Powered",
    description:
      "Harness the power of artificial intelligence to create unique and inspiring color palettes.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Generate beautiful color schemes in seconds, saving you time and boosting your creativity.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description:
      "Share your palettes, get inspired by others, and collaborate with designers worldwide.",
  },
];

const Features = forwardRef<HTMLElement>((props, ref) => {
  return (
    <section ref={ref} className="grid md:grid-cols-3 gap-12">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          className="flex flex-col items-center text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <feature.icon className="h-12 w-12 text-primary" />
          <h2 className="text-xl font-semibold">{feature.title}</h2>
          <p className="text-muted-foreground">{feature.description}</p>
        </motion.div>
      ))}
    </section>
  );
});

Features.displayName = "Features";

export default Features;
