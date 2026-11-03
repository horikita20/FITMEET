import React, { useState, useEffect } from 'react';
import { Dumbbell } from 'lucide-react';
import { getPublicAssetUrl } from '../../lib/brandAssets';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc = getPublicAssetUrl('assets/images/hero_runners_dawn.jpg'),
  alt,
  className = '',
  loading = 'lazy',
  decoding = 'async',
  ...rest
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [failed, setFailed] = useState<boolean>(false);

  useEffect(() => {
    setImgSrc(src);
    setFailed(false);
  }, [src]);

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    } else {
      setFailed(true);
    }
  };

  if (failed) {
    return (
      <div
        className={`bg-gradient-to-br from-[#16181d] to-[#0a0a0c] border border-[#25272c] flex flex-col items-center justify-center text-center p-4 select-none ${className}`}
        aria-label={alt}
      >
        <div className="h-10 w-10 rounded-full bg-[#FC5300]/15 flex items-center justify-center text-[#FC5300] mb-2">
          <Dumbbell className="h-5 w-5" />
        </div>
        <span className="font-head font-bold uppercase text-xs tracking-wider text-neutral-300 line-clamp-1">
          {alt || 'FitMeet Event'}
        </span>
        <span className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">
          Patna Fitness Community
        </span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      loading={loading}
      decoding={decoding}
      className={className}
      referrerPolicy="no-referrer"
      {...rest}
    />
  );
};
