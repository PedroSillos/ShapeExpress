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
      className="fixed inset-0 z-[999] bg-[#0a0a0a]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
        <motion.img
          src="/icon.png"
          alt="Shape Express"
          className="w-44 h-44 object-contain -mb-6"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />

        {/* Text starts fully dark, bright reveal sweeps left → right, then repeats */}
        <motion.p
          className="font-display font-semibold text-[20px] tracking-widest uppercase whitespace-nowrap"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
        >
          <motion.span
            style={{
              backgroundImage:
                'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.9) var(--fill), rgba(255,255,255,0.2) var(--fill), rgba(255,255,255,0.2) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'inline-block',
            }}
            initial={{ '--fill': '0%' } as React.CSSProperties}
            animate={{ '--fill': ['0%', '100%', '100%', '0%'] } as React.CSSProperties}
            transition={{
              duration: 2.5,
              delay: 0.6,
              times: [0, 0.5, 0.8, 1],
              repeat: Infinity,
              repeatDelay: 0.5,
              ease: 'easeInOut',
            }}
          >
            Shape Express
          </motion.span>
        </motion.p>
      </div>
    </motion.div>
  );
}
