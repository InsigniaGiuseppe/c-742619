
import React from 'react';
import { motion } from 'framer-motion';

interface SpinRewardTierDisplayProps {
  tier: string;
  multiplier: number;
  rewardAmount: number;
  cryptoSymbol: string;
  className?: string;
}

const SpinRewardTierDisplay: React.FC<SpinRewardTierDisplayProps> = ({
  tier,
  multiplier,
  rewardAmount,
  cryptoSymbol,
  className = ''
}) => {
  const getTierConfig = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'common':
        return {
          color: 'from-gray-400 to-gray-600',
          glowColor: 'shadow-[0_0_40px_15px_rgba(180,180,180,0.8)]',
          borderColor: 'border-gray-400',
          scale: 1.0,
          pulseIntensity: 0.05,
          boxShadow: '0 0 60px 20px rgba(180,180,180,0.6)'
        };
      case 'rare':
        return {
          color: 'from-blue-400 to-blue-600',
          glowColor: 'shadow-[0_0_50px_20px_rgba(70,130,255,0.85)]',
          borderColor: 'border-blue-400',
          scale: 1.1,
          pulseIntensity: 0.1,
          boxShadow: '0 0 80px 30px rgba(70,130,255,0.7)'
        };
      case 'epic':
        return {
          color: 'from-purple-400 to-purple-600',
          glowColor: 'shadow-[0_0_60px_25px_rgba(150,70,255,0.9)]',
          borderColor: 'border-purple-400',
          scale: 1.2,
          pulseIntensity: 0.15,
          boxShadow: '0 0 100px 40px rgba(150,70,255,0.8)'
        };
      case 'legendary':
        return {
          color: 'from-yellow-400 to-orange-500',
          glowColor: 'shadow-[0_0_80px_35px_rgba(255,180,35,0.95)]',
          borderColor: 'border-yellow-400',
          scale: 1.3,
          pulseIntensity: 0.2,
          boxShadow: '0 0 120px 50px rgba(255,180,35,0.9)'
        };
      default:
        return {
          color: 'from-gray-400 to-gray-600',
          glowColor: 'shadow-[0_0_40px_15px_rgba(180,180,180,0.8)]',
          borderColor: 'border-gray-400',
          scale: 1.0,
          pulseIntensity: 0.05,
          boxShadow: '0 0 60px 20px rgba(180,180,180,0.6)'
        };
    }
  };

  const config = getTierConfig(tier);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: config.scale,
        opacity: 1,
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.6
      }}
      className={`relative z-10 ${className}`}
      style={{
        filter: `drop-shadow(${config.boxShadow})`
      }}
    >
      {/* Enhanced outer glow effect with custom CSS */}
      <motion.div
        animate={{
          scale: [1, 1 + config.pulseIntensity, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`absolute inset-[-20px] z-20 bg-gradient-to-r ${config.color} rounded-lg blur-xl opacity-90`}
        style={{
          pointerEvents: 'none',
          boxShadow: config.boxShadow,
          background: `linear-gradient(45deg, ${config.color.includes('gray') ? '#9ca3af, #4b5563' : 
            config.color.includes('blue') ? '#60a5fa, #2563eb' :
            config.color.includes('purple') ? '#a78bfa, #7c3aed' :
            '#fbbf24, #f97316'})`,
        }}
      />

      {/* Secondary glow layer for enhanced visibility */}
      <motion.div
        animate={{
          scale: [1.1, 1.2, 1.1],
          opacity: [0.6, 0.8, 0.6]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`absolute inset-[-30px] z-15 bg-gradient-to-r ${config.color} rounded-lg blur-2xl opacity-70`}
        style={{
          pointerEvents: 'none',
        }}
      />

      {/* Main reward container with enhanced styling */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`relative bg-gradient-to-r ${config.color} rounded-lg p-6 border-4 ${config.borderColor} backdrop-blur-sm z-30`}
        style={{
          background: `linear-gradient(135deg, ${config.color.includes('gray') ? '#9ca3af, #4b5563' : 
            config.color.includes('blue') ? '#60a5fa, #2563eb' :
            config.color.includes('purple') ? '#a78bfa, #7c3aed' :
            '#fbbf24, #f97316'})`,
          boxShadow: `inset 0 0 20px rgba(255,255,255,0.2), ${config.boxShadow}`
        }}
      >
        {/* Tier badge with enhanced visibility */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-40">
          <motion.div
            animate={{
              rotateY: [0, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider bg-gradient-to-r ${config.color} border-2 ${config.borderColor} text-white shadow-2xl`}
            style={{
              boxShadow: `0 0 30px rgba(255,255,255,0.5), ${config.boxShadow}`
            }}
          >
            {tier}
          </motion.div>
        </div>

        {/* Multiplier display with enhanced effects */}
        <div className="text-center mb-4 mt-3">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              textShadow: ['0 0 10px rgba(255,255,255,0.5)', '0 0 20px rgba(255,255,255,0.8)', '0 0 10px rgba(255,255,255,0.5)']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-5xl font-bold text-white mb-2"
            style={{
              textShadow: '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4)'
            }}
          >
            {multiplier.toFixed(2)}x
          </motion.div>
          <div className="text-white/90 text-sm font-semibold">Multiplier</div>
        </div>

        {/* Reward amount with enhanced styling */}
        <div className="text-center">
          <div className="text-3xl font-semibold text-white mb-2" style={{
            textShadow: '0 0 15px rgba(255,255,255,0.6)'
          }}>
            {rewardAmount.toFixed(8)}
          </div>
          <div className="text-white/90 text-sm font-medium uppercase tracking-wide">
            {cryptoSymbol}
          </div>
        </div>

        {/* Enhanced animated particles effect for all tiers */}
        <div className="absolute inset-0 pointer-events-none z-50">
          {[...Array(tier.toLowerCase() === 'legendary' ? 12 : tier.toLowerCase() === 'epic' ? 8 : 6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                left: `${15 + i * 8}%`,
                top: `${25 + (i % 3) * 25}%`,
                boxShadow: '0 0 10px rgba(255,255,255,0.8)'
              }}
              animate={{
                y: [-15, -40, -15],
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SpinRewardTierDisplay;
