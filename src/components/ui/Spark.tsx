import { motion } from 'framer-motion';

interface SparkProps {
  size?: number;
  animate?: 'float' | 'pulse' | 'drift';
  duration?: number;
  className?: string;
}

export const Spark = ({ 
  size = 24, 
  animate = 'float', 
  duration = 6,
  className = ''
}: SparkProps) => {
  const animationVariants = {
    float: {
      x: [0, 10, -5, 0],
      y: [0, -15, -10, 0],
      scale: [1, 1.05, 0.95, 1],
      opacity: [0.6, 0.9, 0.7, 0.6],
    },
    pulse: {
      scale: [1, 1.1, 1],
      opacity: [0.6, 0.9, 0.6],
    },
    drift: {
      x: [0, 20, 10, 0],
      y: [0, -20, -30, 0],
      opacity: [0.6, 0.8, 0.9, 0.6],
    },
  };

  return (
    <motion.div
      className={`pointer-events-none ${className}`}
      animate={animationVariants[animate]}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="sparkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="100%" stopColor="#FFD166" />
          </linearGradient>
        </defs>
        <path
          d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
          fill="url(#sparkGradient)"
          opacity="0.8"
        />
        <circle cx="12" cy="10" r="2" fill="url(#sparkGradient)" />
      </svg>
    </motion.div>
  );
};
