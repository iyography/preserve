import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(189); // 3:09 duration for demo
  const intervalRef = useRef<NodeJS.Timeout>();

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } else {
      setIsPlaying(true);
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    setCurrentTime(newTime);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = (currentTime / duration) * 100;

  return (
    <div className="flex items-center space-x-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePlayPause}
        className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors duration-200"
        data-testid="audio-play-pause-button"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        <span>{isPlaying ? 'Pause' : 'Play'}</span>
      </Button>
      
      <div className="flex-1 max-w-xs">
        <div 
          className="bg-purple-100 rounded-full h-2 relative overflow-hidden cursor-pointer"
          onClick={handleProgressClick}
          data-testid="audio-progress-bar"
        >
          <div 
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      <span className="text-gray-600 text-sm" data-testid="audio-time-display">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </div>
  );
}
