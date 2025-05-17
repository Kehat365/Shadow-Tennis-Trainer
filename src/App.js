import { useState } from 'react';
import TennisTrainer from './TennisTrainer';
import './index.css';

function App() {
  const [started, setStarted] = useState(false);
  
  if (started) {
    return <TennisTrainer />;
  }

  return (
    <div className="landing-container">
      <div className="landing-card">
        <h1>🎾 Shadow Tennis Trainer 🎾</h1>
        <p>
          Train your tennis swings and footworks at home, no partner, no ball, no court needed. <br /><br />
          Inspired by <strong>shadow boxing</strong>, this app brings the same training philosophy to tennis: focus on your <strong>form, timing, and movement</strong> without distractions. Just follow the vocal and visual cues and move as if you're in a real match.
        </p>
        <h2>💡 Shadow tennis?</h2>
        <p>
          Shadow tennis is like shadow boxing: you repeat key movements in the air, visualizing real shots and footwork patterns. It's a fantastic way to build muscle memory, improve coordination, and stay sharp whether you're a beginner or a seasoned player.
        </p>
        <h2>How this web app works?</h2>
        <ul>
          <li>🏓 Hit "Start training" to launch your session</li>
          <li>🏓 The app will call out shots like "Forehand" or "Backhand" for you to prepare</li>
          <li>🏓 After a short delay, you'll hear "Hit!". Swing like you would on court and pay attention to your movements</li>
          <li>🏓 On higher, you'll have cues like "Split Step" or "Move Left" will guide your movement</li>
          <li>🏓 You prefer silence? You can mute the voice and follow the visual prompts only</li>
        </ul>
        <p>
          <br />
          Choose your difficulty level once training starts. Each level adjusts timing and shot variety to match your skill from beginner to pro. There is an additional custom mode where you can set the type of shots and the time between them.
        </p>

        <button onClick={() => setStarted(true)} className="start-btn">
          Start training
        </button>

        <p className="github-link">
          Made by <i>Kéhat Tokannou</i>. Code source : <a href="https://github.com/Kehat365/Shadow-Tennis-Trainer" target="_blank" rel="noreferrer">GitHub</a>
        </p>
      </div>
    </div>
  );
}

export default App;
