import React, { useState, useRef, useEffect } from 'react';
import { getActiveUserId, removeUserItem } from '../../utils/userStorage';
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  Video as VideoIcon,
  CheckCircle2,
  Scan,
  Menu,
  Rewind,
  AlertCircle
} from 'lucide-react';

interface VisualizeViewProps {
  isDarkMode: boolean;
  userId?: string;
  videoUrl?: string | null;
  isVideoCompleted?: boolean;
  onToggleVideoCompleted?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

const PUBLIC_LESSON_VIDEO_URL = '/videos/lesson.mp4';

const CHAPTERS = [
  { time: 0, title: 'Basics & Root' },
  { time: 9.5, title: 'Terminology' },
  { time: 20, title: 'Leaf & Degree' },
  { time: 31, title: '3 Tree Types' },
  { time: 44.5, title: '5 Binary Tree Types' },
];

export const VisualizeView: React.FC<VisualizeViewProps> = ({
  isDarkMode,
  userId,
  videoUrl = PUBLIC_LESSON_VIDEO_URL,
  isVideoCompleted = false,
  onToggleVideoCompleted,
  onToggleSidebar,
  isSidebarOpen = false,
}) => {
  const effectiveUserId = userId || getActiveUserId();
  const activeVideoUrl = videoUrl || PUBLIC_LESSON_VIDEO_URL;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoLoadError, setVideoError] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('contain');
  const [showControls, setShowControls] = useState<boolean>(true);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any legacy saved playback time so video always plays cleanly
  useEffect(() => {
    try {
      removeUserItem(effectiveUserId, 'video_last_time');
    } catch {}
  }, [effectiveUserId]);

  // Synchronize fullscreen events from browser and native video players
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isDocFull = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isDocFull);
      if (!isDocFull) {
        document.body.style.overflow = '';
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Format seconds to mm:ss
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Play / Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Seek handler - backward navigation only
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (newTime <= currentTime) {
      setCurrentTime(newTime);
      if (videoRef.current) {
        videoRef.current.currentTime = newTime;
      }
    }
  };

  // Skip backward only
  const skip = (seconds: number) => {
    if (!videoRef.current || seconds >= 0) return;
    const target = Math.max(0, videoRef.current.currentTime + seconds);
    videoRef.current.currentTime = target;
    setCurrentTime(target);
  };

  // Volume slider handler
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
    if (nextMuted) {
      videoRef.current.volume = 0;
    } else {
      videoRef.current.volume = volume > 0 ? volume : 0.5;
      if (volume === 0) setVolume(0.5);
    }
  };

  // Playback speed cycle
  const cyclePlaybackSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  // Jump to specific chapter topic - backward only
  const seekToChapter = (timeInSec: number) => {
    if (timeInSec > currentTime) return; // Do not skip forward
    if (videoRef.current) {
      videoRef.current.currentTime = timeInSec;
      setCurrentTime(timeInSec);
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  // Toggle fit mode between 100% cover and contain
  const toggleFitMode = () => {
    setFitMode((prev) => (prev === 'cover' ? 'contain' : 'cover'));
  };

  // Cross-browser Fullscreen toggle (Container + Video native + Viewport fallback)
  const toggleFullscreen = () => {
    const elem = playerContainerRef.current as any;
    const vid = videoRef.current as any;

    if (!isFullscreen) {
      setIsFullscreen(true);
      document.body.style.overflow = 'hidden';

      if (elem) {
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch(() => {
            if (vid) {
              if (vid.requestFullscreen) {
                vid.requestFullscreen().catch(() => {});
              } else if (vid.webkitEnterFullscreen) {
                vid.webkitEnterFullscreen();
              }
            }
          });
          return;
        } else if (elem.webkitRequestFullscreen) {
          try {
            elem.webkitRequestFullscreen();
            return;
          } catch {}
        }
      }

      if (vid) {
        if (vid.requestFullscreen) {
          vid.requestFullscreen().catch(() => {});
        } else if (vid.webkitEnterFullscreen) {
          vid.webkitEnterFullscreen();
        } else if (vid.webkitRequestFullscreen) {
          vid.webkitRequestFullscreen();
        }
      }
    } else {
      setIsFullscreen(false);
      document.body.style.overflow = '';

      if (
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      ) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      }
    }
  };

  // Mouse activity for hiding controls when playing
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  // Keyboard controls
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault();
      togglePlay();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      skip(-5);
    } else if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      toggleMute();
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.key === 'Escape' && isFullscreen) {
      e.preventDefault();
      toggleFullscreen();
    }
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      tabIndex={0}
      ref={playerContainerRef}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      style={
        isFullscreen
          ? {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 99999,
              margin: 0,
              padding: 0,
            }
          : undefined
      }
      className={`relative w-full h-full flex-1 flex flex-col justify-between bg-black overflow-hidden select-none outline-none ${
        isFullscreen ? 'fixed inset-0 z-[99999] w-screen h-screen' : 'min-h-screen h-full'
      }`}
    >
      {/* 100% Screen Video Canvas */}
      <video
        ref={videoRef}
        src={activeVideoUrl}
        poster="/videos/poster.jpg"
        controls={false}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => {
          if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          if (onToggleVideoCompleted && !isVideoCompleted) {
            onToggleVideoCompleted();
          }
        }}
        onError={() => {
          setVideoError(true);
          setIsPlaying(false);
        }}
        className={`absolute inset-0 w-full h-full transition-all duration-300 ${
          fitMode === 'cover' ? 'object-cover' : 'object-contain'
        } cursor-pointer`}
      >
        <source src={activeVideoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Top Floating Overlay Bar - Topic names at the top */}
      <div
        className={`relative z-40 px-4 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-b from-black/95 via-black/60 to-transparent flex items-center justify-between gap-3 sm:gap-4 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 shrink-0">
          {!isSidebarOpen && onToggleSidebar && (
            <button
              id="header-hamburger-btn"
              onClick={onToggleSidebar}
              title="Open Navigation Menu (☰)"
              className="p-2 rounded-xl bg-black/60 hover:bg-black/85 text-slate-300 hover:text-white border border-white/20 transition-all cursor-pointer shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
          <div className="w-8 h-8 rounded-xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300 shrink-0">
            <VideoIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0 hidden md:block">
            <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-violet-400">
              VISUAL LESSON
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate">
              Tree Data Structures & BST
            </h1>
          </div>
        </div>

        {/* Topic Chapters / Navigation (backward navigation only) */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full no-scrollbar">
          {CHAPTERS.map((ch, idx) => {
            const nextCh = CHAPTERS[idx + 1];
            const isActive = currentTime >= ch.time && (!nextCh || currentTime < nextCh.time);
            const isClickable = ch.time <= currentTime;
            return (
              <button
                key={ch.title}
                disabled={!isClickable}
                onClick={() => isClickable && seekToChapter(ch.time)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border backdrop-blur-md ${
                  isActive
                    ? 'bg-violet-600 text-white border-violet-400 shadow-md shadow-violet-950/60'
                    : isClickable
                    ? 'bg-black/50 hover:bg-black/80 text-slate-300 border-white/15 cursor-pointer'
                    : 'bg-black/30 text-slate-600 border-white/5 opacity-50 cursor-not-allowed'
                }`}
                title={isClickable ? `Rewind to ${ch.title}` : `Watch up to ${ch.title} to unlock`}
              >
                {ch.title}
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Completion Status Badge */}
          <div
            id="visualize-points-badge"
            className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border backdrop-blur-md shadow-md ${
              isVideoCompleted
                ? 'bg-emerald-600/90 text-white border-emerald-400/60'
                : 'bg-black/60 text-slate-300 border-white/20'
            }`}
            title={isVideoCompleted ? 'Lesson 100% completed (350 points awarded)' : 'Watch entire video to earn 350 points (50 pts / topic)'}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isVideoCompleted ? 'text-white' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">
              {isVideoCompleted ? 'Completed · 350 / 350 pts' : 'In Progress · 0 / 350 pts'}
            </span>
          </div>

          {/* 100% Screen Fill Toggle */}
          <button
            onClick={toggleFitMode}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border backdrop-blur-md transition-all cursor-pointer shadow-md ${
              fitMode === 'cover'
                ? 'bg-violet-600/80 text-white border-violet-400/60'
                : 'bg-black/60 hover:bg-black/85 text-slate-300 border-white/20'
            }`}
            title={fitMode === 'cover' ? 'Fill Screen (100% Cover)' : 'Fit Frame (Contain)'}
          >
            <Scan className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{fitMode === 'cover' ? '100% Fill' : 'Fit Frame'}</span>
          </button>

          {/* Full Screen Button */}
          <button
            id="btn-visualize-fullscreen"
            onClick={toggleFullscreen}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-black/60 hover:bg-black/85 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer shadow-md"
            title={isFullscreen ? 'Exit Full Screen (Esc or F)' : 'Enter 100% Full Screen (F)'}
          >
            {isFullscreen ? (
              <>
                <Minimize className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit Full Screen</span>
              </>
            ) : (
              <>
                <Maximize className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Full Screen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Center Start / Play Indicator */}
      {!isPlaying && !videoLoadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] z-30 space-y-3 p-4">
          <button
            id="btn-visualize-start"
            onClick={togglePlay}
            className="px-7 py-3.5 sm:px-9 sm:py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white flex items-center gap-3 shadow-2xl shadow-violet-950/80 transition-all transform hover:scale-105 cursor-pointer font-extrabold text-sm sm:text-base border border-violet-400/40"
            title="Start Visual Lesson Video"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>{currentTime > 0 ? 'Resume Visual Lesson' : 'Start Visual Lesson'}</span>
          </button>
          <p className="text-xs text-slate-200/90 font-medium px-4 py-1.5 rounded-full bg-black/70 border border-white/10 text-center max-w-md">
            {isVideoCompleted
              ? '🎉 Lesson video fully completed · 350 / 350 points earned!'
              : 'Students must watch the entire video after clicking Start to award points (50 pts per topic, 350 pts total).'}
          </p>
        </div>
      )}

      {/* Error Overlay */}
      {videoLoadError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-white mb-1">Visual Lesson Stream</p>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            Video stream is loading. Please wait or check your connection.
          </p>
        </div>
      )}

      {/* Bottom Floating Control Bar Overlay */}
      <div
        className={`relative z-40 px-5 sm:px-8 py-4 sm:py-5 bg-gradient-to-t from-black/95 via-black/80 to-transparent transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Seek Bar / Progress Slider (Backward navigation only) */}
        <div className="relative group flex items-center w-full mb-3.5">
          <div className="relative w-full h-1.5 sm:h-2 group-hover:h-2.5 bg-slate-700/80 rounded-full overflow-hidden transition-all">
            <div
              className="h-full bg-violet-500 transition-all rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(0.1, currentTime)}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title="Rewind / backward navigation only"
          />
        </div>

        {/* Bottom Controls Row */}
        <div className="flex items-center justify-between gap-3 text-white">
          {/* Left Controls: Play/Pause, Rewind, Time Display */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={togglePlay}
              className="p-2 rounded-xl hover:bg-white/15 transition-colors cursor-pointer text-white"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {/* Rewind only - forward button removed */}
            <button
              onClick={() => skip(-10)}
              className="p-1.5 rounded-xl hover:bg-white/15 transition-colors cursor-pointer text-slate-300 hover:text-white flex items-center gap-1 text-xs"
              title="Rewind 10 seconds (Left Arrow)"
            >
              <Rewind className="w-4 h-4" />
              <span className="text-[10px] hidden sm:inline">-10s</span>
            </button>

            {/* Time Display */}
            <div className="text-xs font-mono font-medium text-slate-200 tracking-tight ml-1">
              <span>{formatTime(currentTime)}</span>
              <span className="opacity-50 mx-1">/</span>
              <span className="opacity-70">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Volume, Speed, Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Volume Controls */}
            <div className="flex items-center gap-1.5 group">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-xl hover:bg-white/15 transition-colors cursor-pointer text-slate-200 hover:text-white"
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-20 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-violet-500"
                title="Volume slider"
              />
            </div>

            {/* Playback Speed Toggle */}
            <button
              onClick={cyclePlaybackSpeed}
              className="px-2 py-1 rounded-lg hover:bg-white/15 text-xs font-mono font-bold text-slate-200 hover:text-white transition-colors cursor-pointer"
              title="Change playback speed"
            >
              {playbackSpeed}x
            </button>

            {/* Fullscreen Button */}
            <button
              id="btn-player-fullscreen-toggle"
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-all cursor-pointer shadow-lg border border-violet-400/50 ml-1 shrink-0"
              title={isFullscreen ? 'Exit Full Screen (F)' : 'Full Screen (F)'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
