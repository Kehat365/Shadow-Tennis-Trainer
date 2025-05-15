import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Settings, Info, Volume2, VolumeX } from 'lucide-react';
import './index.css';

export default function TennisTrainer() {
  const [level, setLevel] = useState('beginner');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCue, setCurrentCue] = useState('');
  const [currentAction, setCurrentAction] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const timerRef = useRef(null);

  const [timing, setTiming] = useState({
    beginner: { interval: 6, hitDelay: 2 },
    intermediate: { interval: 5, hitDelay: 2, footworkDelay: 0.5 },
    pro: { interval: 4, hitDelay: 1.5, footworkDelay: 0.5 }
  });

  const cues = {
    beginner: { shotTypes: ['Forehand', 'Backhand'], footworkCues: [] },
    intermediate: {
      shotTypes: ['Forehand', 'Backhand'],
      footworkCues: ['Split Step', 'Recover', 'Move Left', 'Move Right']
    },
    pro: {
      shotTypes: ['Forehand', 'Backhand', 'Forehand Slice', 'Backhand Slice', 'Volley', 'Overhead'],
      footworkCues: ['Move Left', 'Move Right', 'Split Step', 'Recover', 'Lunge', 'Quick Step']
    }
  };

  const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const speak = (text) => {
    if (isMuted) return;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startTraining = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPlaying(true);

    let lastTimestamp = Date.now();
    let phase = 'shot';

    const runSequence = () => {
      const now = Date.now();
      const levelSettings = timing[level];
      const timeSinceLastCue = (now - lastTimestamp) / 1000;

      if (phase === 'shot' && timeSinceLastCue >= levelSettings.interval) {
        const shotType = getRandomItem(cues[level].shotTypes);
        setCurrentCue(shotType);
        setCurrentAction('shot');
        speak(shotType);
        lastTimestamp = now;
        phase = 'hit';
      } else if (phase === 'hit' && timeSinceLastCue >= levelSettings.hitDelay) {
        setCurrentAction('hit');
        speak('Hit!');
        if (level === 'beginner') {
          phase = 'shot';
        } else {
          phase = 'footwork';
          lastTimestamp = now;
        }
      } else if (phase === 'footwork' && timeSinceLastCue >= levelSettings.footworkDelay) {
        const footworkCue = getRandomItem(cues[level].footworkCues);
        setCurrentAction('footwork');
        setCurrentCue(footworkCue);
        speak(footworkCue);
        phase = 'shot';
        lastTimestamp = now;
      }

      timerRef.current = setTimeout(runSequence, 100);
    };

    const shotType = getRandomItem(cues[level].shotTypes);
    setCurrentCue(shotType);
    setCurrentAction('shot');
    speak(shotType);

    timerRef.current = setTimeout(runSequence, 100);
  };

  const stopTraining = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setCurrentCue('');
    setCurrentAction('');
    window.speechSynthesis.cancel();
  };

  useEffect(() => {
    if (isPlaying) {
      stopTraining();
      startTraining();
    }
  }, [level, timing, isMuted]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const updateTiming = (levelKey, settingKey, value) => {
    setTiming((prev) => ({
      ...prev,
      [levelKey]: {
        ...prev[levelKey],
        [settingKey]: parseFloat(value)
      }
    }));
  };

  return (
    <div className="trainer-container">
      <div className="trainer-card">
        <header className="trainer-header">
          <h1>Shadow Tennis Trainer</h1>
          <div className="trainer-icons">
            <button onClick={() => setShowInfo(!showInfo)}><Info size={20} /></button>
            <button onClick={() => setIsMuted(!isMuted)}>{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
            <button onClick={() => setShowSettings(!showSettings)}><Settings size={20} /></button>
          </div>
        </header>

        <div className="level-selection">
          {['beginner', 'intermediate', 'pro'].map((lvl) => (
            <button
              key={lvl}
              className={`level-btn ${level === lvl ? `${lvl}-active` : ''}`}
              onClick={() => setLevel(lvl)}
            >
              {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
            </button>
          ))}
        </div>

        <main className="main-display">
          {isPlaying ? (
            <>
              <div className={`cue-text ${currentAction}`}>
                {currentAction === 'hit' ? 'HIT!' : currentCue}
              </div>
              <div className="level-label">
                {level.charAt(0).toUpperCase() + level.slice(1)} Level
              </div>
            </>
          ) : (
            <div className="start-message">Press play to start your shadow tennis training</div>
          )}
        </main>

        <div className="trainer-controls">
          <button className={`play-btn ${isPlaying ? 'pause' : 'play'}`} onClick={isPlaying ? stopTraining : startTraining}>
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
        </div>
      </div>

      <footer className="trainer-footer">
        Shadow Tennis Trainer – Practice your strokes without a court
      </footer>
    </div>
  );
}
