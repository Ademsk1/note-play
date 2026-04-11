import { useEffect, useRef, useState } from 'react';
import { SignalGraph } from '../utilities/SignalGraph';
import { Control } from '../Components/Control';
import { togglePlay } from '../utilities/playState';
import { RecordControl } from '../Components/Record';
import { Recordings } from '../Components/Recordings';
const HEIGHT = 400;
const WIDTH = window.innerWidth / 2;

export const AudioDetector = () => {
  const [stream, setStream] = useState<null | MediaStream>(null);
  const audioRef = useRef(new AudioContext());
  const analyserRef = useRef<null | AnalyserNode>(null);
  const rafRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graphRef = useRef<null | SignalGraph>(null);
  const audioElement = useRef<HTMLMediaElement>(null);
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [playState, setPlayState] = useState<'Play' | 'Pause'>('Pause');
  const [visualFrequencyRange, setVisualFrequencyRange] = useState(0);
  const [drawStats, setDrawStats] = useState(false);
  const [recordingsReady, setRecordingsReady] = useState(false);
  const [source, setSource] = useState<'live' | 'recording'>('live');
  const animate = () => {
    analyserRef.current!.getByteFrequencyData(graphRef.current!.decibels);
    const graph = graphRef.current as SignalGraph;
    graph.execute();
    if (graph.newNote) {
      setNote(graph.currentNote);
      graph.newNote = false;
    }
    rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (playState === 'Pause') {
      cancelAnimationFrame(rafRef.current);
    } else {
      rafRef.current = requestAnimationFrame(animate);
    }
  }, [playState]);

  useEffect(() => {
    // cancelAnimationFrame(rafRef.current)
    graphRef.current?.setRange(visualFrequencyRange);
    // rafRe
  }, [visualFrequencyRange]);

  useEffect(() => {
    graphRef.current?.setShowStats(drawStats);
  }, [drawStats]);

  useEffect(() => {
    const requestStream = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(stream);
    };
    if (source === 'live') {
      requestStream();
    } else {
      const mediaElement = audioRef.current.createMediaElementSource(
        audioElement.current!,
      );
      // mediaElement.connect(audioRef.current.destination)
      const mediaStreamDest = audioRef.current.createMediaStreamDestination();
      mediaElement.connect(mediaStreamDest);
      mediaElement.connect(audioRef.current.destination);
      setStream(mediaStreamDest.stream);
    }
    return () => {};
  }, [source]);
  useEffect(() => {
    if (!stream) {
      return;
    }
    const audioContext = audioRef.current;
    const canvasContext = (canvasRef.current as HTMLCanvasElement).getContext(
      '2d',
    )!;
    console.log('Creating analyser');
    analyserRef.current = audioRef.current.createAnalyser();
    analyserRef.current.fftSize = 8192;
    const freqs = new Uint8Array(analyserRef.current.frequencyBinCount);
    audioContext.createMediaStreamSource(stream).connect(analyserRef.current);
    graphRef.current = new SignalGraph(
      WIDTH,
      HEIGHT,
      canvasContext,
      freqs,
      audioContext.sampleRate,
    );
    setVisualFrequencyRange(graphRef.current.maxFreq);
    graphRef.current.drawFrame();
    setPlayState('Play');
  }, [stream?.id]);
  return (
    <div className="p-2">
      <div
        id="visuals"
        className="flex gap-2"
      >
        <canvas
          className="border border-r-2 resize"
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
        ></canvas>
        <div>
          <p>
            hello. Here is an audio analyser website. Below the graph, you have
            controls for the visuals, and also a recording section, for
            recording your notes. You can save the audio, tag it with a note,
            and the program will try and use statistical methods for identifying
            a note.
          </p>
          <Recordings
            audioUrls={audioUrls}
            setIsComplete={setRecordingsReady}
            setPlayState={setPlayState}
          />
          <p>Ready for analysis: {`${recordingsReady}`}</p>
        </div>
      </div>
      <div id="metadata">
        <p>Note: {note}</p>
      </div>
      <div className="flex flex-col gap-1">
        <Control
          range={visualFrequencyRange}
          setRange={(range) => setVisualFrequencyRange(range)}
          playState={playState}
          onPlayStateChange={() => {
            setPlayState((prev) => togglePlay(prev));
          }}
          setDrawStats={(e: boolean) => {
            setDrawStats(e);
          }}
        />
        {stream && (
          <RecordControl
            setPlayState={setPlayState}
            stream={stream}
            audioElement={audioElement}
            setSource={(source: 'live' | 'recording') => {
              setSource(source);
            }}
            audioUrls={audioUrls}
            setAudioUrls={setAudioUrls}
          />
        )}
      </div>
    </div>
  );
};
