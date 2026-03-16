import { useEffect, useRef, useState } from 'react';

const HEIGHT = 400;
const WIDTH = window.innerWidth;

export const AudioDetector = () => {
  const [stream, setStream] = useState<null | MediaStream>(null);
  // const [analyser, setAnalyser] = useState<null | AnalyserNode>(null);
  const freqArray = useRef<null | Uint8Array<ArrayBuffer>>(null);
  const audioRef = useRef(new AudioContext());
  const analyserRef = useRef<null | AnalyserNode>(null);
  const rafRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode>(null);

  const animate = () => {
    const freq = freqArray.current as Uint8Array<ArrayBuffer>;
    analyserRef.current?.getByteFrequencyData(freq);
    const ctx = canvasRef.current?.getContext('2d');
    ctx!.fillStyle = 'white';
    ctx!.fillRect(0, 0, WIDTH, HEIGHT);
    ctx!.fillStyle = 'black';
    const barWidth = WIDTH / freq.length;
    console.log(Math.max(...freq));
    // console.log(audioRef.current.currentTime);
    // console.log(audioRef.current.state);
    for (let i = 0; i < freq.length; i++) {
      ctx?.fillRect(i * barWidth, window.innerHeight / 2, barWidth, freq[i]);
    }

    rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const requestStream = async () => {
      await audioRef.current.resume();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(stream);
    };
    requestStream();
  }, []);
  useEffect(() => {
    if (!stream) {
      return;
    }
    const track = stream.getAudioTracks()[0];

    console.log('track state:', track.readyState);

    track.onended = () => console.log('track ended');
    track.onmute = () => console.log('track muted');
    track.onunmute = () => console.log('track unmuted');
    const analyser = audioRef.current.createAnalyser();
    analyserRef.current = analyser;
    analyserRef.current.fftSize = 2048;
    freqArray.current = new Uint8Array(analyserRef.current.frequencyBinCount);

    sourceRef.current = audioRef.current.createMediaStreamSource(stream);
    sourceRef.current.connect(analyserRef.current);
    analyserRef.current.connect(audioRef.current.destination);
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [stream]);

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
    ></canvas>
  );
};
