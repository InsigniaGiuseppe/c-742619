
import React, { useState } from 'react';

interface CryptoLogoProps {
  logo_url?: string;
  name: string;
  symbol: string;
}

const CryptoLogo: React.FC<CryptoLogoProps> = ({ logo_url, name, symbol }) => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  const showFallback = !logo_url || hasError;

  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 font-bold text-sm shrink-0">
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
