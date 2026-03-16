import { useState } from 'react';

const audioContext = new AudioContext();

export const useAnalyser = () => {
  const [analyser, setAnalyser] = useState<null | AnalyserNode>(null);
  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
      const source = audioContext.createMediaStreamSource(stream);

      setAnalyser(audioContext.createAnalyser());
    });
};
