import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX} from 'lucide-react';
import './index.css';

export default function TennisTrainer() {
    const [level, setLevel] = useState('beginner');
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentCue, setCurrentCue] = useState('');
    const [currentAction, setCurrentAction] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [newCue, setNewCue] = useState('');
    const [availableVoices, setAvailableVoices] = useState([]);

    const timerRef = useRef(null);

    const [timing, setTiming] = useState({
        beginner: { recoveringDelay: 2, cueDelay: 3, hitDelay: 1.5 },
        intermediate: { recoveringDelay: 2.5, cueDelay: 2.5, hitDelay: 1.5 },
        pro: { recoveringDelay: 2, cueDelay: 2, hitDelay: 1.5  },
        custom: { recoveringDelay: 2, cueDelay: 2, hitDelay: 1.5 },
    });

    const [cueOptions, setCueOptions] = useState({
        beginner: {
            shotTypes: [
                { label: 'Prepare forehand', selected: true },
                { label: 'Prepare backhand', selected: true },
            ],
            custom: [],
        },
    
        intermediate: {
            shotTypes: [
                { label: 'Far from your right forehand', selected: true },
                { label: 'Far from your left backhand', selected: true },
                { label: 'Close to you on the left backhand', selected: true },
                { label: 'Close to you on the right backhand', selected: true },
                { label: 'Close to you on the left forehand', selected: true },
                { label: 'Close to you on the right forehand', selected: true },
                { label: 'Forehand volley', selected: true },
                { label: 'Backhand volley', selected: true },
                { label: 'Overhead smash', selected: true },
            ],
            custom: [],
        },

        pro: {
            shotTypes: [
                { label: 'Far left - Backhand', selected: true },
                { label: 'Far right - Forehand', selected: true },
                { label: 'Wide backhand - Slice', selected: true },
                { label: 'Wide forehand - Slice', selected: true },
                { label: 'Inside-out forehand - Midcourt', selected: true },
                { label: 'Backhand slice - Short left', selected: true },
                { label: 'Running forehand - Far right', selected: true },
                { label: 'Stretching backhand - Far left', selected: true },
                { label: 'Approach shot - Midcourt forehand', selected: true },
                { label: 'Forehand volley - Close right', selected: true },
                { label: 'Backhand volley - Close left', selected: true },
                { label: 'Drop volley - Close center', selected: true },
                { label: 'Low volley - Midcourt', selected: true },
                { label: 'Overhead - Lob recovery', selected: true },
                { label: 'Overhead - Backpedal', selected: true },
                { label: 'Smash - High center', selected: true },
            ],
            custom: [],
        },

        custom: {
            shotTypes: [
                { label: 'Far left - Backhand', selected: false },
                { label: 'Far right - Forehand', selected: false },
                { label: 'Wide backhand - Slice', selected: false },
                { label: 'Wide forehand - Slice', selected: false },
                { label: 'Inside-out forehand - Midcourt', selected: false },
                { label: 'Backhand slice - Short left', selected: false },
                { label: 'Running forehand - Far right', selected: false },
                { label: 'Stretching backhand - Far left', selected: false },
                { label: 'Approach shot - Midcourt forehand', selected: false },
                { label: 'Forehand volley - Close right', selected: false },
                { label: 'Backhand volley - Close left', selected: false },
                { label: 'Drop volley - Close center', selected: false },
                { label: 'Low volley - Midcourt', selected: false },
                { label: 'Overhead - Lob recovery', selected: false },
                { label: 'Overhead - Backpedal', selected: false },
                { label: 'Smash - High center', selected: false },
            ],
            custom: [],
        },
    });

    const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const speak = (text) => {
        if (isMuted || !window.speechSynthesis) return;
        const utterance = new SpeechSynthesisUtterance(text);

          // Filter to likely human voices
        const maleVoices = availableVoices.filter((voice) => {
            const name = voice.name.toLowerCase();
            const isEnglish = voice.lang.startsWith('en');
            const soundsHuman =
              name.includes('google') || // Chrome voices
              name.includes('david') ||  // Windows
              name.includes('zira') ||   // Windows
              name.includes('alex') ||   // macOS
              name.includes('brian');  // Microsoft Online
        
            return isEnglish && soundsHuman;            
        });

        const selectedVoice = maleVoices[0] || availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.rate = 1.2;
        utterance.pitch = 0.9;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
    };

    const startTraining = () => {
        clearTimeout(timerRef.current);
        setIsPlaying(true);

        const levelSettings = timing[level];

    const runSequence = () => {
        const selectedCues = cueOptions[level].shotTypes.filter(c => c.selected).map(c => c.label);
        if (selectedCues.length === 0) return;
        const cue = getRandomItem(selectedCues);
        setCurrentCue(cue);
        setCurrentAction('shot');
        speak(cue);

        timerRef.current = setTimeout(() => {
            setCurrentCue('Hit!');
            setCurrentAction('hit');
            speak('Hit!');

            timerRef.current = setTimeout(() => {
                setCurrentAction('recover');
                setCurrentCue('Recover');
                speak('Recover');

                timerRef.current = setTimeout(runSequence, levelSettings.recoveringDelay * 1000);
            }, levelSettings.hitDelay * 1000);
        }, levelSettings.cueDelay * 1000);
    };

    runSequence();
    }

    const stopTraining = () => {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        setIsPlaying(false);
        setCurrentCue('');
        setCurrentAction('');
        window.speechSynthesis.cancel();
    };

    useEffect(() => {
        return () => {
        clearTimeout(timerRef.current);
        window.speechSynthesis.cancel();
        };
    }, []);

    useEffect(() => {
        stopTraining();
    }, [timing.custom, cueOptions.custom, level]);

    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                setAvailableVoices(voices);
            }
        };
        // Call once immediately
        loadVoices();
        // Call again when voices are loaded (especially in Firefox)
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    return (
        <div className="trainer-wrapper">
            <header className="trainer-header">
                <h1>🎾 Shadow Tennis Trainer 🎾</h1>
                    <div className="icons">
                        <button onClick={() => setIsMuted(!isMuted)}>
                            {isMuted ? <VolumeX /> : <Volume2 />}
                        </button>
                    </div>
            </header>

            <section className="intro">
                <p>
                    Inspired by <strong>shadow boxing</strong>, this app helps you improve your tennis swing technique by following timed audio cues.
                </p>
            </section>

            <section className="levels">
                {Object.keys(timing).map((lvl) => (
                    <button
                        key={lvl}
                        onClick={() => setLevel(lvl)}
                        className={`level-btn ${level === lvl ? 'active' : ''}`}
                    >
                        {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                    </button>
                ))}
            </section>

            <section className="training-area">
                {isPlaying ? (
                    <>
                        <div className={`cue ${currentAction}`}>
                            {currentAction === 'hit' ? 'HIT!' : currentCue}
                        </div>
                        <p className="cue-label">{level.toUpperCase()} MODE</p>
                    </>
                ) : (
                <p className="idle-text">Press play to begin your training session.</p>
                )}
            </section>

            <section className="controls">
                <button
                    onClick={isPlaying ? stopTraining : startTraining}
                    className="play-btn"
                >
                    {isPlaying ? <Pause /> : <Play />}
                </button>
            </section>

            {level === 'custom' && (
                <section className="custom-settings">
                    <div className="custom-card">
                        <h2>Customize Cues</h2>
                        <div className="cue-selector">
                            {cueOptions.custom.shotTypes.map((cue, index) => (
                                <label key={index}>
                                    <input
                                        type="checkbox"
                                        checked={cue.selected}
                                        onChange={() => {
                                            const updated = [...cueOptions.custom.shotTypes];
                                                updated[index].selected = !updated[index].selected;
                                                setCueOptions(prev => ({
                                                    ...prev,
                                                    custom: { ...prev.custom, shotTypes: updated },
                                                }));
                                        }}
                                    />
                                    <span>{cue.label}</span>
                                </label>
                            ))}
                        </div>
                        <div className="add-cue">
                            <input
                                type="text"
                                placeholder="Add custom cue"
                                value={newCue}
                                onChange={(e) => setNewCue(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const trimmed = newCue.trim();
                                    if (trimmed.length === 0) return;
                                    const existing = cueOptions.custom.shotTypes.some(
                                        (cue) => cue.label.toLowerCase() === trimmed.toLowerCase()
                                    );
                                    if (!existing) {
                                        const newEntry = { label: trimmed, selected: true };
                                        setCueOptions((prev) => ({
                                            ...prev,
                                            custom: {
                                                ...prev.custom,
                                                shotTypes: [...prev.custom.shotTypes, newEntry],
                                                custom: [...prev.custom.custom, newEntry.label],
                                            },
                                        }));
                                        setNewCue('');
                                    }
                                }}
                            >
                            Add Cue
                            </button>
                        </div>
                    </div>
                    <div className="custom-card">
                        <h2>Timing Settings</h2>
                        <div className="timing-settings">
                            {['cueDelay', 'hitDelay', 'recoveringDelay', ].map((key) => (
                                <label key={key}>
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    <input
                                        type="number"
                                        value={timing.custom[key]}
                                        step="0.1"
                                        min="0.5"
                                        max="10"
                                        onChange={(e) =>
                                            setTiming((prev) => ({
                                                ...prev,
                                                custom: {
                                                    ...prev.custom,
                                                    [key]: parseFloat(e.target.value),
                                                },
                                            }))
                                        }
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <footer className="trainer-footer">
                Made by <i>Kéhat Tokannou</i>. View on{' '}
                <a
                    href="https://github.com/Kehat365/Shadow-Tennis-Trainer"
                    target="_blank"
                    rel="noreferrer"
                >
                    GitHub
                </a>
            </footer>
        </div>
    );
}
