import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Settings, Info, Volume2, VolumeX } from 'lucide-react';

export default function TennisTrainer() {
  const [level, setLevel] = useState('beginner');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCue, setCurrentCue] = useState('');
  const [currentAction, setCurrentAction] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Timer reference
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  
  // Custom timing settings (in seconds)
  const [timing, setTiming] = useState({
    beginner: { interval: 6, hitDelay: 2 },
    intermediate: { interval: 5, hitDelay: 2, footworkDelay: 0.5 },
    pro: { interval: 4, hitDelay: 1.5, footworkDelay: 0.5 }
  });
  
  // Shot types and footwork cues based on level
  const cues = {
    beginner: {
      shotTypes: ["Forehand", "Backhand"],
      footworkCues: []
    },
    intermediate: {
      shotTypes: ["Forehand", "Backhand"],
      footworkCues: ["Split Step", "Recover", "Move Left", "Move Right"]
    },
    pro: {
      shotTypes: ["Forehand", "Backhand", "Forehand Slice", "Backhand Slice", "Volley", "Overhead"],
      footworkCues: ["Move Left", "Move Right", "Split Step", "Recover", "Lunge", "Quick Step"]
    }
  };
  
  // Function to get a random item from an array
  const getRandomItem = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
  };
  
  // Text-to-speech function
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
  
  // Function to start the training sequence
  const startTraining = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPlaying(true);
    
    let lastTimestamp = Date.now();
    let phase = "shot"; // Starts with shot type cue
    
    const runSequence = () => {
      const now = Date.now();
      const levelSettings = timing[level];
      
      // Calculate time since last cue in seconds
      const timeSinceLastCue = (now - lastTimestamp) / 1000;
      
      if (phase === "shot" && timeSinceLastCue >= levelSettings.interval) {
        // Time to announce the next shot
        const shotType = getRandomItem(cues[level].shotTypes);
        setCurrentCue(shotType);
        setCurrentAction("shot");
        speak(shotType);
        lastTimestamp = now;
        phase = "hit";
      } else if (phase === "hit" && timeSinceLastCue >= levelSettings.hitDelay) {
        // Time to say "Hit!"
        setCurrentAction("hit");
        speak("Hit!");
        
        if (level === "beginner") {
          phase = "shot"; // For beginner, go back to shot announcement
        } else {
          phase = "footwork"; // For intermediate and pro, go to footwork
          lastTimestamp = now;
        }
      } else if (phase === "footwork" && timeSinceLastCue >= levelSettings.footworkDelay) {
        // Time for footwork cue (intermediate and pro only)
        const footworkCue = getRandomItem(cues[level].footworkCues);
        setCurrentAction("footwork");
        setCurrentCue(footworkCue);
        speak(footworkCue);
        
        phase = "shot"; // Go back to shot announcement
        lastTimestamp = now;
      }
      
      timerRef.current = setTimeout(runSequence, 100); // Check every 100ms
    };
    
    // Start the sequence with a shot cue
    const shotType = getRandomItem(cues[level].shotTypes);
    setCurrentCue(shotType);
    setCurrentAction("shot");
    speak(shotType);
    
    timerRef.current = setTimeout(runSequence, 100);
  };
  
  // Function to stop the training
  const stopTraining = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setCurrentCue('');
    setCurrentAction('');
    window.speechSynthesis.cancel(); // Stop any ongoing speech
  };
  
  // Update training when level changes
  useEffect(() => {
    if (isPlaying) {
      stopTraining();
      startTraining();
    }
  }, [level, timing, isMuted]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, []);
  
  // Handle timing setting changes
  const updateTiming = (levelKey, settingKey, value) => {
    setTiming(prev => ({
      ...prev,
      [levelKey]: {
        ...prev[levelKey],
        [settingKey]: parseFloat(value)
      }
    }));
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 p-4 text-white flex justify-between items-center">
          <h1 className="text-xl font-bold">Shadow Tennis Trainer</h1>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowInfo(!showInfo)} 
              className="p-2 rounded-full hover:bg-green-700 transition-colors"
            >
              <Info size={20} />
            </button>
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className="p-2 rounded-full hover:bg-green-700 transition-colors"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)} 
              className="p-2 rounded-full hover:bg-green-700 transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
        
        {/* Level Selection */}
        <div className="p-4 bg-gray-100 flex justify-between">
          <button 
            onClick={() => setLevel('beginner')}
            className={`px-4 py-2 rounded-xl font-semibold ${level === 'beginner' ? 'bg-green-500 text-white' : 'bg-white text-green-600 hover:bg-gray-200'}`}
          >
            Beginner
          </button>
          <button 
            onClick={() => setLevel('intermediate')}
            className={`px-4 py-2 rounded-xl font-semibold ${level === 'intermediate' ? 'bg-yellow-500 text-white' : 'bg-white text-yellow-600 hover:bg-gray-200'}`}
          >
            Intermediate
          </button>
          <button 
            onClick={() => setLevel('pro')}
            className={`px-4 py-2 rounded-xl font-semibold ${level === 'pro' ? 'bg-red-500 text-white' : 'bg-white text-red-600 hover:bg-gray-200'}`}
          >
            Pro
          </button>
        </div>
        
        {/* Main Display */}
        <div className="p-8 flex flex-col items-center justify-center min-h-64 relative">
          {isPlaying ? (
            <>
              <div className={`text-4xl font-bold mb-4 transition-opacity ${currentAction === 'hit' ? 'text-red-600' : 'text-blue-600'}`}>
                {currentAction === 'hit' ? 'HIT!' : currentCue}
              </div>
              <div className="text-sm text-gray-500">
                {level === 'beginner' ? 'Beginner Level' : 
                 level === 'intermediate' ? 'Intermediate Level' : 'Pro Level'}
              </div>
            </>
          ) : (
            <div className="text-xl text-center text-gray-600 my-8">
              Press play to start your shadow tennis training
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="p-4 border-t flex justify-center">
          <button 
            onClick={isPlaying ? stopTraining : startTraining}
            className={`p-4 rounded-full ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white shadow-md`}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
        </div>
        
        {/* Info Modal */}
        {showInfo && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-md max-h-96 overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Training Levels</h2>
              <div className="mb-4">
                <h3 className="font-bold text-green-600">Beginner Level</h3>
                <ul className="list-disc pl-5 text-sm">
                  <li>Shot types: Forehand, Backhand</li>
                  <li>Every 6 seconds: new shot cue</li>
                  <li>2 seconds after shot cue: "Hit!"</li>
                </ul>
              </div>
              <div className="mb-4">
                <h3 className="font-bold text-yellow-600">Intermediate Level</h3>
                <ul className="list-disc pl-5 text-sm">
                  <li>Shot types: Forehand, Backhand</li>
                  <li>Footwork cues included</li>
                  <li>Every 5 seconds: new shot cue</li>
                  <li>2 seconds later: "Hit!"</li>
                  <li>0.5 seconds after hit: footwork cue</li>
                </ul>
              </div>
              <div className="mb-4">
                <h3 className="font-bold text-red-600">Pro Level</h3>
                <ul className="list-disc pl-5 text-sm">
                  <li>Six different shot types</li>
                  <li>Advanced footwork cues</li>
                  <li>Every 4 seconds: new shot cue</li>
                  <li>1.5 seconds later: "Hit!"</li>
                  <li>0.5 seconds after hit: footwork cue</li>
                </ul>
              </div>
              <button 
                onClick={() => setShowInfo(false)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full"
              >
                Close
              </button>
            </div>
          </div>
        )}
        
        {/* Settings Modal */}
        {showSettings && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Timing Settings</h2>
              
              {/* Beginner Settings */}
              <div className="mb-4">
                <h3 className="font-bold text-green-600">Beginner</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm">Shot interval (s)</label>
                    <input 
                      type="number" 
                      min="2" 
                      max="10" 
                      step="0.5"
                      value={timing.beginner.interval}
                      onChange={(e) => updateTiming('beginner', 'interval', e.target.value)}
                      className="p-2 border rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Hit delay (s)</label>
                    <input 
                      type="number" 
                      min="0.5" 
                      max="5" 
                      step="0.5"
                      value={timing.beginner.hitDelay}
                      onChange={(e) => updateTiming('beginner', 'hitDelay', e.target.value)}
                      className="p-2 border rounded w-full"
                    />
                  </div>
                </div>
              </div>
              
              {/* Intermediate Settings */}
              <div className="mb-4">
                <h3 className="font-bold text-yellow-600">Intermediate</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm">Shot interval (s)</label>
                    <input 
                      type="number" 
                      min="2" 
                      max="10" 
                      step="0.5"
                      value={timing.intermediate.interval}
                      onChange={(e) => updateTiming('intermediate', 'interval', e.target.value)}
                      className="p-2 border rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Hit delay (s)</label>
                    <input 
                      type="number" 
                      min="0.5" 
                      max="5" 
                      step="0.5"
                      value={timing.intermediate.hitDelay}
                      onChange={(e) => updateTiming('intermediate', 'hitDelay', e.target.value)}
                      className="p-2 border rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Footwork delay (s)</label>
                    <input 
                      type="number" 
                      min="0.1" 
                      max="2" 
                      step="0.1"
                      value={timing.intermediate.footworkDelay}
                      onChange={(e) => updateTiming('intermediate', 'footworkDelay', e.target.value)}
                      className="p-2 border rounded w-full"
                    />
                  </div>
                </div>
              </div>
              
              {/* Pro Settings */}
              <div className="mb-4">
                <h3 className="font-bold text-red-600">Pro</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm">Shot interval (s)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="10" 
                      step="0.5"
                      value={timing.pro.interval}
                      onChange={(e) => updateTiming('pro', 'interval', e.target.value)}
                      className="p-2 border rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Hit delay (s)</label>
                    <input 
                      type="number" 
                      min="0.5" 
                      max="5" 
                      step="0.5"
                      value={timing.pro.hitDelay}
                      onChange={(e) => updateTiming('pro', 'hitDelay', e.target.value)}
                      className="p-2 border rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Footwork delay (s)</label>
                    <input 
                      type="number" 
                      min="0.1" 
                      max="2" 
                      step="0.1"
                      value={timing.pro.footworkDelay}
                      onChange={(e) => updateTiming('pro', 'footworkDelay', e.target.value)}
                      className="p-2 border rounded w-full"
                    />
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setShowSettings(false)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        Shadow Tennis Trainer - Practice your strokes without a court
      </div>
    </div>
  );
}