import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FitMeetVideoModal } from './FitMeetVideoModal';

const REFERENCE_PAGE = '/fitmeet-reference-home.html';

export const ReferenceHomepage: React.FC = () => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const handleLoad = useCallback(() => {
    cleanupRef.current?.();

    const frame = frameRef.current;
    const frameWindow = frame?.contentWindow;
    const frameDocument = frame?.contentDocument;
    if (!frame || !frameWindow || !frameDocument?.body) return;

    const style = frameDocument.createElement('style');
    style.textContent = `
      #topnav { display: none !important; }
      .pg-home .hero { min-height: var(--homepage-viewport-height) !important; }
      .pg-home .left { padding-top: clamp(40px, calc(var(--homepage-viewport-height) * .08), 88px) !important; }
      .pg-home .tag { margin-bottom: clamp(22px, calc(var(--homepage-viewport-height) * .045), 36px) !important; }
      .pg-home .facts { margin-top: clamp(28px, calc(var(--homepage-viewport-height) * .05), 44px) !important; }
      .pg-home .scene, .pg-home .hero-live-scene {
        top: calc(var(--homepage-viewport-height) * .26) !important;
        height: calc(var(--homepage-viewport-height) * .74) !important;
      }
      .pg-home .beam {
        top: calc(var(--homepage-viewport-height) * .22) !important;
        height: calc(var(--homepage-viewport-height) * .78) !important;
      }
      .pg-home .drawer {
        height: min(92vh, calc(var(--homepage-viewport-height) * .92)) !important;
      }
      @media (min-width: 1024px) {
        .pg-home .hero-live-scene {
          top: calc(var(--homepage-viewport-height) * .16) !important;
          height: calc(var(--homepage-viewport-height) * .84) !important;
        }
      }
      @media (min-width: 1280px) {
        .pg-home .hero-live-scene {
          top: calc(var(--homepage-viewport-height) * .20) !important;
          height: calc(var(--homepage-viewport-height) * .80) !important;
        }
      }
      @media (max-width: 900px) {
        .pg-home .scene, .pg-home .hero-live-scene {
          top: auto !important;
          bottom: 0 !important;
          height: 420px !important;
        }
        .pg-home .beam {
          top: auto !important;
          bottom: 0 !important;
          height: 420px !important;
        }
      }
    `;
    frameDocument.head.appendChild(style);

    const syncHeight = () => {
      frameDocument.documentElement.style.setProperty(
        '--homepage-viewport-height',
        `${window.innerHeight}px`
      );
      frame.style.height = `${Math.max(
        frameDocument.documentElement.scrollHeight,
        frameDocument.body.scrollHeight
      )}px`;
    };

    const scrollToHomeContent = (event: Event) => {
      const target = event.target;
      if (!target || !('nodeType' in target) || target.nodeType !== 1) return;
      if (!(target as Element).closest('[data-open]')) return;
      const headerHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 0;
      const frameTop = frame.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: frameTop - headerHeight, behavior: 'auto' });
    };

    const openVideo = (event: Event) => {
      const target = event.target;
      if (!target || !('nodeType' in target) || target.nodeType !== 1) return;
      if (!(target as Element).closest('[data-video-open]')) return;
      event.preventDefault();
      event.stopPropagation();
      setIsVideoOpen(true);
    };

    frameDocument.addEventListener('click', openVideo, true);
    frameDocument.addEventListener('click', scrollToHomeContent, true);
    window.addEventListener('resize', syncHeight);
    const resizeObserver = new ResizeObserver(syncHeight);
    resizeObserver.observe(frameDocument.documentElement);
    resizeObserver.observe(frameDocument.body);
    syncHeight();

    cleanupRef.current = () => {
      frameDocument.removeEventListener('click', openVideo, true);
      frameDocument.removeEventListener('click', scrollToHomeContent, true);
      window.removeEventListener('resize', syncHeight);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => () => cleanupRef.current?.(), []);

  return (
    <>
      <iframe
        ref={frameRef}
        src={REFERENCE_PAGE}
        title="FitMeet homepage"
        onLoad={handleLoad}
        className="block w-full border-0"
        style={{ height: '100vh' }}
        scrolling="no"
      />
      <FitMeetVideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
    </>
  );
};
