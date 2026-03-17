import { useEffect, useRef, useState } from "react";

const HEIGHT = 700;
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
  const barWidthRef = useRef<number>(100);
  const animate = () => {
    const freq = freqArray.current as Uint8Array<ArrayBuffer>;
    analyserRef.current?.getByteFrequencyData(freq);
    const ctx = canvasRef.current?.getContext("2d");
    ctx!.fillStyle = "white";
    ctx!.fillRect(
      10,
      window.innerHeight / 2 - 1,
      barWidthRef.current * freq.length - 2,
      -HEIGHT + 1,
    );

    for (let i = 0; i < freq.length; i++) {
      ctx!.fillStyle = `rgb(${freq[i] + 100} 0 ${256 - (freq[i] + 100)})`;
      ctx?.fillRect(
        i * barWidthRef.current + 11,
        window.innerHeight / 2,
        barWidthRef.current,
        -freq[i],
      );
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

    console.log("track state:", track.readyState);

    track.onended = () => console.log("track ended");
    track.onmute = () => console.log("track muted");
    track.onunmute = () => console.log("track unmuted");
    const analyser = audioRef.current.createAnalyser();
    analyserRef.current = analyser;
    analyserRef.current.fftSize = 512;
    freqArray.current = new Uint8Array(analyserRef.current.frequencyBinCount);
    barWidthRef.current = WIDTH / (freqArray.current.length * 2);
    sourceRef.current = audioRef.current.createMediaStreamSource(stream);
    sourceRef.current.connect(analyserRef.current);
    analyserRef.current.connect(audioRef.current.destination);

    canvasRef.current
      ?.getContext("2d")
      ?.strokeRect(
        10,
        window.innerHeight / 2,
        barWidthRef.current * freqArray.current.length,
        -HEIGHT,
      );
    canvasRef.current?.getContext("2d");

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
