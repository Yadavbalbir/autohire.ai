import { motion } from 'framer-motion';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Globe SVG */}
      <motion.div
        className="absolute top-20 left-20 w-32 h-32 opacity-10"
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-blue-500">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M2 12h20" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </motion.div>

      {/* Window SVG */}
      <motion.div
        className="absolute top-40 right-32 w-24 h-24 opacity-10"
        animate={{
          y: [-10, 10, -10],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-purple-500">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M9 9h6v6H9z" stroke="currentColor" strokeWidth="2"/>
          <path d="M16 3.5v5" stroke="currentColor" strokeWidth="2"/>
          <path d="M20.5 16H16" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </motion.div>

      {/* Code SVG */}
      <motion.div
        className="absolute bottom-32 left-1/4 w-28 h-28 opacity-10"
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, -2, 2, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-green-500">
          <path d="M16 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>

      {/* Brain SVG */}
      <motion.div
        className="absolute top-1/2 right-20 w-20 h-20 opacity-10"
        animate={{
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-indigo-500">
          <path d="M9.5 2A2.5 2.5 0 0 0 7 4.5c0 .6-.4 1-1 1A2.5 2.5 0 0 0 3.5 8c0 .9.3 1.75.85 2.4A2.5 2.5 0 0 0 2 13a2.5 2.5 0 0 0 1.35 2.24c-.37.6-.6 1.31-.6 2.07C2.75 19.34 4.91 21.5 7.74 21.5c1.13 0 2.16-.35 3-.95A4.23 4.23 0 0 0 14 22c2.21 0 4-1.79 4-4 0-.34-.04-.67-.12-.98C19.16 16.45 20 15.28 20 13.9c0-.98-.41-1.85-1.07-2.47.02-.14.07-.28.07-.43 0-1.38-1.12-2.5-2.5-2.5-.69 0-1.31.28-1.76.73A3.457 3.457 0 0 0 11.5 7c-.34 0-.66.05-.97.14C10.2 6.41 9.91 6 9.5 6V2z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </motion.div>

      {/* Floating particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full opacity-20"
          style={{
            left: `${20 + (i * 15)}%`,
            top: `${30 + (i * 8)}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
