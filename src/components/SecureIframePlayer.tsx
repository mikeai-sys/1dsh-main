import React from 'react';

interface SecureIframePlayerProps {
  src: string;
  title: string;
  key?: string | number;
}

const SecureIframePlayer: React.FC<SecureIframePlayerProps> = ({ src, title }) => {
  return (
    <iframe
      src={src}
      className="w-full h-full"
      allowFullScreen
      frameBorder="0"
      title={title}
      allow="autoplay; encrypted-media; fullscreen"
      style={{ 
        pointerEvents: 'auto',
        userSelect: 'none'
      }}
    />
  );
};

export default SecureIframePlayer;