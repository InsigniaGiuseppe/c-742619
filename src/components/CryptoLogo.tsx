
import React, { useState } from 'react';

interface CryptoLogoProps {
  logo_url?: string;
  name: string;
  symbol: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CryptoLogo: React.FC<CryptoLogoProps> = ({ logo_url, name, symbol, size = 'md', className }) => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  const showFallback = !logo_url || hasError;

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-2xl',
  };

  return (
    <div className={`rounded-full flex items-center justify-center bg-white/10 font-bold shrink-0 ${sizeClasses[size]} ${className || ''}`}>
      {showFallback ? (
        symbol.substring(0, 2).toUpperCase()
      ) : (
        <img
          src={logo_url}
          alt={`${name} logo`}
          className="w-full h-full rounded-full object-cover"
          onError={handleError}
        />
      )}
    </div>
  );
};

export default CryptoLogo;
