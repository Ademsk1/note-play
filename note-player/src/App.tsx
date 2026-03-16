import { useState } from 'react';
import './App.css';
import { GetStarted } from './screens/GetStarted';
import { AudioDetector } from './screens/AudioDetector';

function App() {
  const [started, setStarted] = useState(false);
  const handleStart = () => {
    setTimeout(() => {
      setStarted(true);
    }, 300);
  };

  return (
    <main className="w-screen h-screen">
      <nav className=" bg-slate-100 py-1 flex justify-end sticky top-0 pr-4">
        <button>dark</button>
      </nav>
      {started ? <AudioDetector /> : <GetStarted handleStart={handleStart} />}
    </main>
  );
}

export default App;
