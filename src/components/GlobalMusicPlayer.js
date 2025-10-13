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
  const widgetRef = useRef(null);
  const iframeRef = useRef(null);

  // 你的音乐列表 - SoundCloud tracks
  const playlist = [
    {
      id: 1,
      title: 'Broken',
      artist: 'Ray Xi',
      url: 'https://soundcloud.com/xi-rui-258629141/broken'
    },
  ];

  // Initialize SoundCloud Widget API
  useEffect(() => {
    if (!iframeRef.current) return;

    const SC = window.SC;
    if (!SC || !SC.Widget) {
      // Load SoundCloud Widget API
      const script = document.createElement('script');
      script.src = 'https://w.soundcloud.com/player/api.js';
      script.onload = () => {
        initWidget();
      };
      document.body.appendChild(script);
    } else {
      initWidget();
    }

    function initWidget() {
      const widget = window.SC.Widget(iframeRef.current);
      widgetRef.current = widget;

      widget.bind(window.SC.Widget.Events.READY, () => {
        widget.bind(window.SC.Widget.Events.PLAY, () => setIsPlaying(true));
        widget.bind(window.SC.Widget.Events.PAUSE, () => setIsPlaying(false));
        widget.bind(window.SC.Widget.Events.FINISH, () => {
          setIsPlaying(false);
          nextTrack();
        });
        widget.bind(window.SC.Widget.Events.PLAY_PROGRESS, (data) => {
          setCurrentTime(data.currentPosition);
          setProgress((data.currentPosition / data.duration) * 100);
          setDuration(data.duration);
        });

        // Set initial volume
        widget.setVolume(volume);
      });
    }
  }, []);

  // Update track when currentTrack changes
  useEffect(() => {
    if (widgetRef.current) {
      widgetRef.current.load(playlist[currentTrack].url, {
        auto_play: isPlaying,
      });
    }
  }, [currentTrack]);

  const togglePlay = () => {
    if (widgetRef.current) {
      widgetRef.current.toggle();
    }
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % playlist.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  };

  const handleProgressChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    if (widgetRef.current && duration > 0) {
      widgetRef.current.seekTo((newProgress / 100) * duration);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (widgetRef.current) {
      widgetRef.current.setVolume(newVolume);
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
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-navy/90 backdrop-blur-xl border-2 border-violet/40 flex items-center justify-center shadow-2xl hover:border-violet transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-6 h-6 md:w-7 md:h-7 text-violet" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>

          {/* Pulsing ring when playing */}
          {isPlaying && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-violet/30"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </motion.button>
      </motion.div>

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
              className="fixed inset-0 bg-navy/80 backdrop-blur-sm z-40"
            />

            {/* Player Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-navy/95 backdrop-blur-xl border-t-2 border-violet/30 rounded-t-2xl z-50 p-6 md:p-8"
            >
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-violet/10 hover:bg-violet/20 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Now Playing */}
              <div className="mb-6">
                <h3 className="font-serif text-xl text-champagne mb-1">Now Playing</h3>
                <p className="font-display text-2xl md:text-3xl text-cream font-semibold">
                  {playlist[currentTrack].title}
                </p>
                <p className="font-sans text-sm text-violet mt-1">{playlist[currentTrack].artist}</p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleProgressChange}
                  className="w-full h-2 bg-violet/20 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet
                    [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
                    [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-violet [&::-moz-range-thumb]:border-0"
                />
                <div className="flex justify-between text-xs text-cream/50 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mb-6">
                {/* Previous */}
                <button
                  onClick={prevTrack}
                  className="w-10 h-10 rounded-full bg-violet/10 hover:bg-violet/20 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-violet" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                  </svg>
                </button>

                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-full bg-violet hover:bg-violet/90 flex items-center justify-center transition-all shadow-lg"
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6 text-navy" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-navy ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>

                {/* Next */}
                <button
                  onClick={nextTrack}
                  className="w-10 h-10 rounded-full bg-violet/10 hover:bg-violet/20 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-violet" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                  </svg>
                </button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-5 h-5 text-violet flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="flex-1 h-2 bg-violet/20 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet
                    [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3
                    [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-violet [&::-moz-range-thumb]:border-0"
                />
              </div>

              {/* Playlist */}
              <div>
                <h4 className="font-display text-sm text-cream/60 mb-3 uppercase tracking-wide">Playlist</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {playlist.map((track, index) => (
                    <button
                      key={track.id}
                      onClick={() => setCurrentTrack(index)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                        currentTrack === index
                          ? 'bg-violet/20 border border-violet/40'
                          : 'bg-violet/5 border border-transparent hover:bg-violet/10'
                      }`}
                    >
                      <span className="font-mono text-xs text-violet/60 w-6">{index + 1}</span>
                      <div className="flex-1 text-left">
                        <p className="font-sans text-sm text-cream">{track.title}</p>
                        <p className="font-sans text-xs text-cream/50">{track.artist}</p>
                      </div>
                      {currentTrack === index && isPlaying && (
                        <div className="flex gap-0.5">
                          <motion.div
                            className="w-0.5 h-3 bg-violet rounded-full"
                            animate={{ scaleY: [1, 1.5, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                          />
                          <motion.div
                            className="w-0.5 h-3 bg-violet rounded-full"
                            animate={{ scaleY: [1, 1.5, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                          />
                          <motion.div
                            className="w-0.5 h-3 bg-violet rounded-full"
                            animate={{ scaleY: [1, 1.5, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                          />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hidden SoundCloud iframe */}
              <iframe
                ref={iframeRef}
                width="0"
                height="0"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(playlist[currentTrack].url)}&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false`}
                style={{ display: 'none' }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalMusicPlayer;
