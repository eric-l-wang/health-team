"use client";

import { motion, AnimatePresence } from "framer-motion";

interface TextRotateProps {
  texts: string[];
  className?: string;
}

export function TextRotate({ texts, className }: TextRotateProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={texts[0]} // Use the text itself as the key to trigger animation
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
          {texts[0]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
