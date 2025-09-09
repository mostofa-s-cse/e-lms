import React, { useRef, useState, useCallback, useEffect } from "react";
import { Pause, Play, Volume2, VolumeX, Maximize } from "lucide-react";

interface VideoProps {
  videoUrl?: string;
  thumbnailUrl?: string;
}

const VideoPlayer = ({ videoUrl = "", thumbnailUrl }: VideoProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlayPauseDisabled, setIsPlayPauseDisabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const fullUrl = videoUrl?.startsWith("http")
    ? videoUrl
    : `${process.env.REACT_APP_IMG_URL || "http://localhost:4000"}${videoUrl}`;

  const fullThumbnailUrl = thumbnailUrl?.startsWith("http")
    ? thumbnailUrl
    : thumbnailUrl && thumbnailUrl.trim() !== ""
    ? `${process.env.REACT_APP_IMG_URL || "http://localhost:4000"}${thumbnailUrl}`
    : undefined;

  // Debug thumbnail URL
  // console.log('Thumbnail debug:', {
  //   thumbnailUrl,
  //   fullThumbnailUrl,
  //   apiUrl: process.env.REACT_APP_IMG_URL || "http://localhost:4000"
  // });
  // Generate a fallback thumbnail if none provided
  const generateFallbackThumbnail = (): string | undefined => {
    if (!videoUrl) return undefined;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create a gradient background
      const gradient = ctx.createLinearGradient(0, 0, 1280, 720);
      gradient.addColorStop(0, '#1f2937');
      gradient.addColorStop(1, '#374151');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1280, 720);
      
      // Add play icon (scaled up)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(560, 320);
      ctx.lineTo(560, 400);
      ctx.lineTo(640, 360);
      ctx.closePath();
      ctx.fill();
      
      // Add text (scaled up)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Click to Play', 640, 560);
      
      // Add subtitle
      ctx.font = '24px Arial';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText('Video Player', 640, 600);
    }
    
    return canvas.toDataURL();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      videoRef.current.currentTime = parseFloat(e.target.value);
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handlePlayPause = useCallback(async () => {
    if (!videoRef.current || isPlayPauseDisabled) return;
    
    setIsPlayPauseDisabled(true);
    
    try {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Error in handlePlayPause:', error);
    } finally {
      // Re-enable after a short delay
      setTimeout(() => setIsPlayPauseDisabled(false), 200);
    }
  }, [isPlaying, isPlayPauseDisabled]);

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) videoRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      // Fallback for older browsers
      const videoContainer = videoRef.current.parentElement;
      if (videoContainer?.requestFullscreen) {
        videoContainer.requestFullscreen();
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const formatDuration = (time: number) => formatTime(time);

  // Handle fullscreen changes
  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  // Add fullscreen event listeners
  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Handle keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="lg:col-span-2">
      <div className="bg-black rounded-lg overflow-hidden shadow-lg">
        <div className="relative aspect-video bg-black">
          {!videoUrl ? (
            <div className="flex items-center justify-center w-full h-full bg-gray-800">
              <div className="text-center text-white">
                <p className="text-lg font-semibold mb-2">No Video Available</p>
                <p className="text-sm text-gray-300">This video file has not been uploaded yet.</p>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              style={{
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
              preload="metadata"
              poster={fullThumbnailUrl || generateFallbackThumbnail()}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => {
                setIsPlaying(true);
                setHasStarted(true);
              }}
              onPause={() => setIsPlaying(false)}
              onError={(e) => {
                console.error("Video error:", e);
                console.error("Video element error:", videoRef.current?.error);
              }}
            >
              <source src={fullUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}

          {/* Custom Thumbnail Overlay */}
          {videoUrl && fullThumbnailUrl && !hasStarted && (
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <div className="text-center text-white opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="bg-black bg-opacity-50 rounded-full p-4 mb-4">
                  <Play className="w-12 h-12" />
                </div>
                <p className="text-lg font-semibold">Click to Play</p>
              </div>
            </div>
          )}

          {/* Video Controls Overlay */}
          {videoUrl && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar */}
              <div className="mb-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                      (currentTime / duration) * 100
                    }%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={handlePlayPause} 
                    disabled={isPlayPauseDisabled}
                    className={`text-white hover:text-gray-300 ${isPlayPauseDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </button>

                  <div className="flex items-center space-x-2">
                    <button onClick={handleMute} className="text-white hover:text-gray-300">
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                          volume * 100
                        }%, #4b5563 ${volume * 100}%, #4b5563 100%)`,
                      }}
                    />
                  </div>

                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatDuration(duration)}
                  </span>
                </div>

                <button onClick={handleFullscreen} className="text-white hover:text-gray-300">
                  {isFullscreen ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
