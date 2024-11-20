"use client";

import { motion } from "framer-motion";

const Hero: React.FC = () => {
  return (
    <section className="text-center space-y-8">
      <motion.h1
        className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Create stunning color palettes with AI
      </motion.h1>
      <motion.p
        className="text-xl text-muted-foreground max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Transform your ideas into beautiful color schemes. Just describe your
        vision, and let our AI do the rest.
      </motion.p>
    </section>
  );
};

export default Hero;
