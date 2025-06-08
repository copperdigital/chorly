import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CelebrationAnimationProps {
  isVisible: boolean;
  points: number;
  taskTitle: string;
}

export default function CelebrationAnimation({ isVisible, points, taskTitle }: CelebrationAnimationProps) {
  const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; x: number; color: string; delay: number }>>([]);

  useEffect(() => {
    if (isVisible) {
      // Generate confetti pieces
      const pieces = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][Math.floor(Math.random() * 5)],
        delay: Math.random() * 0.5,
      }));
      setConfettiPieces(pieces);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center"
        >
          {/* Main celebration content */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
            className="text-center"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <h2 className="text-2xl font-bold text-secondary mb-2">Great Job!</h2>
            <p className="text-slate-600">+{points} points earned</p>
            <p className="text-sm text-slate-500 mt-1">"{taskTitle}" completed!</p>
          </motion.div>

          {/* Confetti */}
          {confettiPieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{ y: -100, x: `${piece.x}vw`, rotate: 0 }}
              animate={{ y: "100vh", rotate: 720 }}
              transition={{ duration: 3, delay: piece.delay, ease: "easeOut" }}
              className="absolute w-3 h-3 rounded-sm"
              style={{ backgroundColor: piece.color }}
            />
          ))}

          {/* Sparkles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                x: [0, (i - 4) * 50],
                y: [0, (i % 2 === 0 ? -1 : 1) * 30],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                ease: "easeOut",
              }}
              className="absolute text-2xl"
            >
              ✨
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
