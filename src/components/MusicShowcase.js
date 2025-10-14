import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import siteCopy from '../data/siteCopy.json';

const MusicShowcase = () => {
  const { musicShowcase } = siteCopy;
  const tracks = musicShowcase.tracks;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [audioData, setAudioData] = useState(new Array(128).fill(0));
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const setupAudioContext = () => {
    if (!audioContextRef.current && audioRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.85;

      const source = audioContextRef.current.createMediaElementSource(audioRef.current);
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);

      visualize();
    }
  };

  const visualize = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const update = () => {
      analyserRef.current.getByteFrequencyData(dataArray);
      setAudioData([...dataArray]);

      // Update progress
      if (audioRef.current && audioRef.current.duration) {
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }

      animationRef.current = requestAnimationFrame(update);
    };

    update();
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioContextRef.current) {
        setupAudioContext();
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const track = tracks[currentTrack];

  // Calculate average frequency for dynamic effects
  const avgFrequency = audioData.reduce((a, b) => a + b, 0) / audioData.length;
  const intensity = avgFrequency / 255;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-bg-light to-bg-light-secondary dark:from-bg-dark dark:to-bg-dark-secondary overflow-hidden">
      {/* Luxury background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-bronze/5 opacity-50" />

      {/* Animated geometric patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full"
          animate={{
            rotate: isPlaying ? 360 : 0,
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="w-full h-full border border-gold/5 rounded-full" />
        </motion.div>
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full"
          animate={{
            rotate: isPlaying ? -360 : 0,
          }}
          transition={{
            duration: 90,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="w-full h-full border border-bronze/5 rounded-full" />
        </motion.div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-32 w-full">
        {/* Elegant header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto mb-8" />
          <h1 className="font-serif text-6xl md:text-8xl text-text-light dark:text-white-warm mb-6">
            {musicShowcase.title}
          </h1>
          <p className="font-display text-2xl text-bronze dark:text-champagne tracking-wider">
            {musicShowcase.tagline}
          </p>
        </motion.div>

        {/* Main elegant visualizer */}
        <div className="relative max-w-5xl mx-auto">
          {/* Luxury minimal waveform */}
          <div className="relative h-64 mb-16 flex items-center">
            <div className="absolute inset-0 flex items-center justify-center gap-[2px]">
              {audioData.slice(0, 80).map((value, i) => {
                const height = 10 + (value / 255) * 90;
                const delay = i * 0.01;

                return (
                  <motion.div
                    key={i}
                    className="flex-1 relative"
                    style={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {/* Main bar */}
                    <motion.div
                      className="absolute w-full bg-gradient-to-t from-gold/20 to-gold/60"
                      style={{
                        height: `${height}%`,
                        filter: 'blur(0.3px)',
                      }}
                      animate={{
                        scaleY: isPlaying ? [1, 1.1, 1] : 1,
                        opacity: isPlaying ? [0.6, 0.9, 0.6] : 0.6
                      }}
                      transition={{
                        duration: 0.5,
                        delay: delay,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    {/* Reflection */}
                    <motion.div
                      className="absolute w-full bg-gradient-to-b from-gold/10 to-transparent"
                      style={{
                        height: `${height * 0.3}%`,
                        top: '50%',
                        transform: 'scaleY(-1) translateY(-50%)',
                        filter: 'blur(1px)',
                        opacity: 0.3
                      }}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Elegant center line */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
          </div>

          {/* Luxury control panel */}
          <div className="relative mb-16">
            {/* Progress bar */}
            <div className="h-px bg-gold/10 mb-8">
              <motion.div
                className="h-full bg-gradient-to-r from-gold/50 to-gold"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Main controls */}
            <div className="flex items-center justify-center gap-12">
              {/* Play button - luxury design */}
              <motion.button
                onClick={togglePlay}
                className="relative group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Outer ring */}
                <motion.div
                  className="absolute inset-0 w-24 h-24 rounded-full border border-gold/30 group-hover:border-gold/60"
                  animate={{
                    scale: isPlaying ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 2,
                    repeat: isPlaying ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                />
                {/* Inner circle */}
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-gold/10 to-gold/5 backdrop-blur-sm flex items-center justify-center border border-gold/20">
                  {isPlaying ? (
                    <svg className="w-8 h-8 text-gold" fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-gold ml-1" fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                    </svg>
                  )}
                </div>
              </motion.button>
            </div>
          </div>

          {/* Track info - elegant typography */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-center space-y-6"
          >
            <div className="space-y-2">
              <h2 className="font-serif text-5xl md:text-6xl text-text-light dark:text-white-warm">
                {track.title}
              </h2>
              <p className="font-display text-2xl text-bronze dark:text-champagne">
                {track.artist}
              </p>
            </div>

            <div className="flex items-center justify-center gap-8">
              <span className="font-mono text-sm text-text-light/60 dark:text-text-dark/60 tracking-widest uppercase">
                {track.genre}
              </span>
              <span className="text-gold/20">|</span>
              <a
                href={track.soundcloudUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-gold/40 hover:text-gold tracking-widest uppercase transition-colors duration-500"
              >
                {track.soundcloudLabel}
              </a>
            </div>
          </motion.div>

          {/* Circular orbit visualization */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative w-64 h-64 mx-auto mt-20"
          >
            {/* Orbiting dots */}
            {[0, 1, 2].map((ring) => (
              <motion.div
                key={ring}
                className="absolute inset-0"
                animate={{
                  rotate: isPlaying ? 360 : 0,
                }}
                transition={{
                  duration: 20 + ring * 10,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <div
                  className="absolute rounded-full bg-gold/30"
                  style={{
                    width: `${4 + intensity * 8}px`,
                    height: `${4 + intensity * 8}px`,
                    top: '50%',
                    left: `${20 + ring * 25}%`,
                    transform: 'translate(-50%, -50%)',
                    filter: `blur(${0.5 + ring * 0.3}px)`
                  }}
                />
              </motion.div>
            ))}

            {/* Center glow */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                scale: isPlaying ? [1, 1.2, 1] : 1,
                opacity: isPlaying ? [0.3, 0.6, 0.3] : 0.3
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gold/10 to-bronze/10 blur-xl" />
            </motion.div>
          </motion.div>
        </div>

        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          src={track.url}
          loop
          onEnded={() => setIsPlaying(false)}
        />

        {/* Philosophy text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-32 max-w-3xl mx-auto text-center"
        >
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mx-auto mb-8" />
          <p className="font-serif text-xl text-text-light/60 dark:text-text-dark/60 leading-relaxed italic">
            {musicShowcase.quote.text}
          </p>
          {musicShowcase.quote.attribution && (
            <p className="font-display text-lg text-gold/60 mt-4">
              {musicShowcase.quote.attribution}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MusicShowcase;
