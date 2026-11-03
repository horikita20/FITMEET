import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, X, ArrowRight } from 'lucide-react';
import { FITMEET_EMBLEM_URL, getPublicAssetUrl } from '../../lib/brandAssets';

interface FitMeetVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinClick?: () => void;
}

const VIDEO_SRC = getPublicAssetUrl('assets/aistudio/fitmeet-home-video.mp4');

export const FitMeetVideoModal: React.FC<FitMeetVideoModalProps> = ({
  isOpen,
  onClose,
  onJoinClick,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(38);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setCurrentTime(0);
      return;
    }

    // Auto-play when opened
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // If unmuted autoplay is blocked by browser policy, fall back to muted autoplay
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration) {
      setDuration(videoRef.current.duration);
    }
  };

  const seekTo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const next = !isMuted;
    videoRef.current.muted = next;
    setIsMuted(next);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-6 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="FitMeet Official Explainer Video"
    >
      <div className="relative w-full max-w-4xl bg-[#0c0d10] border border-[#26262b] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#26262b] bg-[#070709]">
          <div className="flex items-center gap-3">
            <img
              src={FITMEET_EMBLEM_URL}
              alt="FitMeet Emblem"
              className="h-7 w-7 rounded-full object-cover border border-[#FC5300]/40"
            />
            <div className="text-left">
              <span className="font-head font-bold text-sm uppercase text-white block leading-tight">
                FitMeet Explainer
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                Sunday isn't a rest day. It's game day.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute video' : 'Mute video'}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-red-400" />
              ) : (
                <Volume2 className="h-4 w-4 text-[#FC5300]" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Video Canvas Container (16:9 Aspect Ratio) */}
        <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center group">
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            className="w-full h-full object-contain cursor-pointer"
            playsInline
            autoPlay
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={togglePlay}
          />

          {/* Big Center Play Overlay when Paused */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-[#FC5300]/90 text-white flex items-center justify-center shadow-2xl hover:bg-[#ff7a2e] transform hover:scale-105 transition-all cursor-pointer"
              title="Play"
            >
              <Play className="h-8 w-8 fill-current ml-1" />
            </button>
          )}
        </div>

        {/* Video Player Controls Bar */}
        <div className="p-3 sm:p-4 bg-[#070709] border-t border-[#26262b] space-y-2">
          {/* Progress Slider */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-neutral-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 38}
              step={0.1}
              value={currentTime}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#FC5300]"
            />
            <span className="text-[11px] font-mono text-neutral-400 w-10">
              {formatTime(duration || 38)}
            </span>
          </div>

          {/* Button Controls */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 rounded-lg bg-[#FC5300] hover:bg-[#ff7a2e] text-white transition-colors cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 fill-white" />
                )}
              </button>
              <button
                onClick={() => seekTo(0)}
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Restart"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={toggleMute}
                className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-red-400" />
                ) : (
                  <Volume2 className="h-4 w-4 text-[#FC5300]" />
                )}
              </button>
            </div>

            {onJoinClick && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onJoinClick();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#FC5300] hover:bg-[#ff7a2e] rounded-md transition-all cursor-pointer shadow-sm"
                >
                  <span>Join The Meet</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
