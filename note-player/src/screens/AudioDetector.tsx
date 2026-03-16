import * as Note from '@tonaljs/note';
import { useEffect, useRef, useState } from 'react';
// const audioContext = new AudioContext();
let freqArray: Uint8Array<ArrayBufferLike>;

export const AudioDetector = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef(new AudioContext());
  const analyserRef = useRef<null | AnalyserNode>(null);
  const [freqSize, setFreqSize] = useState(256);
  const requestRef = useRef<number | null>(null);
  const barWidth = window.innerWidth / freqSize;
  const animate = async (t) => {
    if (!ref.current) {
      requestRef.current = requestAnimationFrame(animate);
    }
    if (!analyserRef.current) {
      requestRef.current = requestAnimationFrame(animate);
      return;
    }
    const ctx = ref.current?.getContext('2d');

    if (!ctx) {
      requestRef.current = requestAnimationFrame(animate);
      return;
    }
    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = 'rgb(0 0 0)';
    let x = 0;
    analyserRef.current.getByteFrequencyData(freqArray);

    let barHeight;
    console.log(Math.max(...freqArray));

    for (let i = 0; i < freqArray.length; i++) {
      barHeight = freqArray[i] * 2 + 1;
      ctx.fillRect(x, window.innerHeight / 2, barWidth, barHeight);
      x += barWidth + 1;
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    analyserRef.current = audioRef.current.createAnalyser();
    setFreqSize(analyserRef.current.frequencyBinCount);
    freqArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    const setup = async () => {
      // navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      //   const source = analyserRef.current.createMediaStreamSource(stream);
      //   source.connect(analyserRef.current);
      // });
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const source = audioRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current!);
    };
    setup();
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  return (
    <div>
      <canvas
        width={window.innerWidth}
        height={window.innerHeight}
        ref={ref}
      ></canvas>
    </div>
  );
};
