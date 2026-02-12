import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, Maximize2, Download, Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  className?: string;
}

export function VideoPlayer({ src, poster, autoPlay = false, className = '' }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => setIsLoading(true);
    const handleLoadedData = () => setIsLoading(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleVolumeChange = () => setVolume(video.volume);

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen().catch(err => {
          console.error('Fullscreen failed:', err);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const handleTimeSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setVolume(vol);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = src;
    a.download = `video-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={className} style={{
      position: 'relative',
      width: '100%',
      backgroundColor: 'var(--bg-base)',
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        onClick={togglePlay}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: 'pointer',
        }}
      />

      {isLoading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
          <Loader2 style={{ width: '48px', height: '48px', animation: 'spin 1s linear infinite', color: 'white' }} />
        </div>
      )}

      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        opacity: 0,
        transition: 'opacity 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '0';
      }}
      >
        <div />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <button
            onClick={togglePlay}
            style={{
              padding: '8px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            }}
          >
            {isPlaying ? <Pause style={{ width: '20px', height: '20px' }} /> : <Play style={{ width: '20px', height: '20px' }} />}
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'white',
          }}>
            <span style={{ fontSize: '14px', fontFamily: 'monospace' }}>
              {formatTime(currentTime)}
            </span>
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
              / {formatTime(duration)}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleTimeSeek}
            style={{
              width: '120px',
              height: '4px',
              borderRadius: '2px',
              background: 'rgba(255, 255, 255, 0.3)',
              appearance: 'none',
              cursor: 'pointer',
            }}
          />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <Volume2 style={{ width: '18px', height: '18px', color: 'white' }} />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              style={{
                width: '60px',
                height: '4px',
                borderRadius: '2px',
                background: 'rgba(255, 255, 255, 0.3)',
                appearance: 'none',
                cursor: 'pointer',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={toggleFullscreen}
              style={{
                padding: '8px',
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
              }}
            >
              <Maximize2 style={{ width: '18px', height: '18px' }} />
            </button>
            <button
              onClick={handleDownload}
              style={{
                padding: '8px',
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
              }}
            >
              <Download style={{ width: '18px', height: '18px' }} />
            </button>
          </div>
        </div>

        <div />
      </div>
    </div>
  );
}
