import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GlobalMusicPlayer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  // 你的音乐列表
  const playlist = [
    {
      id: 1,
      title: 'Broken',
      artist: 'Ray Xi',
      url: '/music/broken.mp3'
    },
  ];

  // Initialize audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration * 1000); // Convert to ms
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime * 1000); // Convert to ms
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      nextTrack();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    // Set initial volume
    audio.volume = volume / 100;

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
      setIsPlaying(true);
    }
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => {
      const next = (prev + 1) % playlist.length;
      return next;
    });
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => {
      const previous = (prev - 1 + playlist.length) % playlist.length;
      return previous;
    });
  };

  // Auto-play when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && isPlaying) {
      audio.play().catch(error => {
        console.error('Error auto-playing:', error);
      });
    }
  }, [currentTrack]);

  const handleProgressChange = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    audio.currentTime = (newProgress / 100) * audio.duration;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Mini Player - Always visible */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="fixed bottom-8 right-8 z-[100] p-3 bg-transparent border border-gold/20 hover:border-gold/50 hover:bg-gold/5 transition-all duration-500"
        whileTap={{ scale: 0.95 }}
        style={{ position: 'fixed' }}
      >
        <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>

        {/* Subtle indicator when playing */}
        {isPlaying && (
          <motion.div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-px bg-gold"
            animate={{
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.button>

      {/* Full Player Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/30 dark:bg-navy/80 backdrop-blur-sm z-[9998]"
            />

            {/* Player Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-bg-light/95 dark:bg-bg-dark/95 backdrop-blur-xl border-t border-gold/30 z-[9999] p-8 md:p-12"
            >
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 p-2 text-gold/60 hover:text-gold transition-colors duration-300"
              >
                <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Now Playing */}
              <div className="mb-8">
                <p className="font-display text-xs tracking-[0.3em] uppercase text-text-light/60 dark:text-text-dark/60 mb-3">Now Playing</p>
                <h3 className="font-display text-3xl text-text-light dark:text-text-dark mb-2">
                  {playlist[currentTrack].title}
                </h3>
                <p className="font-sans text-sm text-gold">{playlist[currentTrack].artist}</p>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleProgressChange}
                  className="w-full h-px bg-gold/20 appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-gold
                    [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3
                    [&::-moz-range-thumb]:bg-gold [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-gold"
                />
                <div className="flex justify-between text-xs font-display text-text-light/40 dark:text-text-dark/40 mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6 mb-8">
                {/* Previous */}
                <button
                  onClick={prevTrack}
                  className="w-10 h-10 border border-gold/20 hover:border-gold/50 hover:bg-gold/5 flex items-center justify-center transition-all duration-500"
                >
                  <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                  </svg>
                </button>

                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 border border-gold/40 hover:border-gold hover:bg-gold/10 flex items-center justify-center transition-all duration-500"
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gold ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>

                {/* Next */}
                <button
                  onClick={nextTrack}
                  className="w-10 h-10 border border-gold/20 hover:border-gold/50 hover:bg-gold/5 flex items-center justify-center transition-all duration-500"
                >
                  <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                  </svg>
                </button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-4 mb-8">
                <svg className="w-4 h-4 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="flex-1 h-px bg-gold/20 appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                    [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-gold
                    [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-2
                    [&::-moz-range-thumb]:bg-gold [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-gold"
                />
              </div>

              {/* Playlist */}
              <div>
                <p className="font-display text-xs tracking-[0.2em] uppercase text-text-light/60 dark:text-text-dark/60 mb-4">Playlist</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {playlist.map((track, index) => (
                    <button
                      key={track.id}
                      onClick={() => setCurrentTrack(index)}
                      className={`w-full flex items-center gap-4 p-4 border transition-all duration-500 ${
                        currentTrack === index
                          ? 'border-gold/40 bg-gold/5'
                          : 'border-gold/10 hover:border-gold/30 hover:bg-gold/5'
                      }`}
                    >
                      <span className="font-display text-xs text-gold/60 w-6">{String(index + 1).padStart(2, '0')}</span>
                      <div className="flex-1 text-left">
                        <p className="font-sans text-sm text-text-light dark:text-text-dark">{track.title}</p>
                        <p className="font-sans text-xs text-text-light/50 dark:text-text-dark/50">{track.artist}</p>
                      </div>
                      {currentTrack === index && isPlaying && (
                        <div className="flex gap-0.5">
                          <motion.div
                            className="w-px h-3 bg-gold"
                            animate={{ scaleY: [1, 1.5, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                          />
                          <motion.div
                            className="w-px h-3 bg-gold"
                            animate={{ scaleY: [1, 1.5, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                          />
                          <motion.div
                            className="w-px h-3 bg-gold"
                            animate={{ scaleY: [1, 1.5, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                          />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={playlist[currentTrack].url}
        preload="auto"
      />
    </>
  );
};

export default GlobalMusicPlayer;
