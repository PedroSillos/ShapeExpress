import { motion } from 'motion/react';

/**
 * Shown while Firebase Auth is resolving and/or Firestore data is loading.
 * Rendered as an AnimatePresence child in App.tsx so it fades out smoothly
 * once both authReady and dataReady are true.
 */
export function SplashScreen() {
  return (
    <motion.div
      key="splash"
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#0a0a0a]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* App icon */}
      <motion.img
        src="/icon.png"
        alt="Shape Express"
        className="w-24 h-24 mb-8 object-contain"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />

      {/* App name */}
      <motion.p
        className="text-white/60 text-sm tracking-widest uppercase mb-10"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
      >
        Shape Express
      </motion.p>

      {/* Spinner */}
      <div className="w-5 h-5 rounded-full border-2 border-white/15 border-t-white/70 animate-spin" />
    </motion.div>
  );
}
