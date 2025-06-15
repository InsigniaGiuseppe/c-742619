
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
          glowColor: 'shadow-gray-400/50',
          borderColor: 'border-gray-400',
          scale: 1.0,
          pulseIntensity: 0.05
        };
      case 'rare':
        return {
          color: 'from-blue-400 to-blue-600',
          glowColor: 'shadow-blue-400/50',
          borderColor: 'border-blue-400',
          scale: 1.1,
          pulseIntensity: 0.1
        };
      case 'epic':
        return {
          color: 'from-purple-400 to-purple-600',
          glowColor: 'shadow-purple-400/50',
          borderColor: 'border-purple-400',
          scale: 1.2,
          pulseIntensity: 0.15
        };
      case 'legendary':
        return {
          color: 'from-yellow-400 to-orange-500',
          glowColor: 'shadow-yellow-400/50',
          borderColor: 'border-yellow-400',
          scale: 1.3,
          pulseIntensity: 0.2
        };
      default:
        return {
          color: 'from-gray-400 to-gray-600',
          glowColor: 'shadow-gray-400/50',
          borderColor: 'border-gray-400',
          scale: 1.0,
          pulseIntensity: 0.05
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
      className={`relative ${className}`}
    >
      {/* Outer glow effect */}
      <motion.div
        animate={{
          scale: [1, 1 + config.pulseIntensity, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`absolute inset-0 bg-gradient-to-r ${config.color} rounded-lg blur-lg ${config.glowColor} opacity-75`}
      />
      
      {/* Main reward container */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`relative bg-gradient-to-r ${config.color} rounded-lg p-6 border-2 ${config.borderColor} backdrop-blur-sm`}
      >
        {/* Tier badge */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <motion.div
            animate={{
              rotateY: [0, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r ${config.color} border ${config.borderColor} text-white shadow-lg`}
          >
            {tier}
          </motion.div>
        </div>

        {/* Multiplier display */}
        <div className="text-center mb-4 mt-2">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-4xl font-bold text-white mb-2"
          >
            {multiplier.toFixed(2)}x
          </motion.div>
          <div className="text-white/80 text-sm">Multiplier</div>
        </div>

        {/* Reward amount */}
        <div className="text-center">
          <div className="text-2xl font-semibold text-white mb-1">
            {rewardAmount.toFixed(8)}
          </div>
          <div className="text-white/80 text-sm font-medium">
            {cryptoSymbol}
          </div>
        </div>

        {/* Animated particles effect for higher tiers */}
        {(tier.toLowerCase() === 'epic' || tier.toLowerCase() === 'legendary') && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${20 + i * 10}%`,
                  top: `${30 + (i % 2) * 40}%`,
                }}
                animate={{
                  y: [-10, -30, -10],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SpinRewardTierDisplay;
