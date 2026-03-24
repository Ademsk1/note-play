import { useEffect, useRef, useState } from "react";
import { SignalGraph } from "../utilities/SignalGraph";
import { Notes } from "../utilities/Notes";

const HEIGHT = 700;
const WIDTH = window.innerWidth;

export const AudioDetector = () => {
  const [stream, setStream] = useState<null | MediaStream>(null);
  // const [analyser, setAnalyser] = useState<null | AnalyserNode>(null);
  const audioRef = useRef(new AudioContext());
  const analyserRef = useRef<null | AnalyserNode>(null);
  const rafRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graphRef = useRef<null | SignalGraph>(null)
  const animate = () => {
    analyserRef.current!.getByteFrequencyData(graphRef.current!.decibels);
    graphRef.current!.clear()
    graphRef.current!.drawData()
    graphRef.current!.drawPeaks()
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
    const audioContext = audioRef.current
    const canvasContext = canvasRef.current?.getContext('2d')!
    analyserRef.current = audioRef.current.createAnalyser();
    const freqs = new Uint8Array(analyserRef.current.frequencyBinCount);
    audioContext.createMediaStreamSource(stream).connect(analyserRef.current);;
    graphRef.current = new SignalGraph(WIDTH, HEIGHT, canvasContext, freqs, audioContext.sampleRate)
    graphRef.current.drawFrame()
    graphRef.current.drawTicks()

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [stream]);

  return (
    <div className="p-2">
      <canvas
        className="border border-r-2"
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
      ></canvas>
    </div>
  );
};
