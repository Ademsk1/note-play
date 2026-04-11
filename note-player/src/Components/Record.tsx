import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Button } from './Button';

type RecorderControlProps = {
  stream: MediaStream;
  audioElement: React.RefObject<HTMLAudioElement | null>;
  setSource: (source: 'live' | 'recording') => void;
  audioUrls: string[];
  setAudioUrls: React.Dispatch<React.SetStateAction<string[]>>;
};

export const RecordControl = ({
  stream,
  audioElement,
  setSource,
  audioUrls,
  setAudioUrls,
}: RecorderControlProps) => {
  const [recording, setRecording] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const recordingRef = useRef(new MediaRecorder(stream));
  const chunks = useRef<BlobPart[]>([]);
  const [url, setUrl] = useState<string>('');
  useEffect(() => {
    if (!recordingRef.current) return;
    if (!audioElement.current) return;
    if (recording) {
      chunks.current = [];
    }
    recordingRef.current.addEventListener('dataavailable', (e) => {
      chunks.current.push(e.data);
    });
    recordingRef.current.addEventListener('stop', () => {
      const blob = new Blob(chunks.current, { type: 'audio/ogg; codecs=opus' });
      const audioURL = window.URL.createObjectURL(blob);
      setUrl(audioURL);
      audioElement.current!.src = audioURL;
      setHasAudio(true);
    });
    return () => {
      setHasAudio(false);
      chunks.current = [];
    };
  }, []);

  const handleRecording = () => {
    setRecording(true);
    chunks.current = [];
  };
  const toggleSource = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.checked) {
      setSource('recording');
    } else {
      setSource('live');
    }
  };

  const saveAudio = () => {
    setHasAudio(false);
    setAudioUrls((audioUrls) => [...audioUrls, url]);
  };

  useEffect(() => {
    console.log('test here');
    if (recording) {
      recordingRef.current.start();
    } else {
      recordingRef.current.stop();
    }
  }, [recording]);
  return (
    <div
      id="record"
      className="w-fit flex border p-1 gap-1"
    >
      <Button
        onClick={handleRecording}
        disabled={recording}
      >
        Record
      </Button>
      <Button
        onClick={() => {
          setRecording(false);
        }}
        disabled={!recording}
        color={'secondary'}
      >
        Stop
      </Button>
      <div className="flex flex-col">
        <input
          onChange={toggleSource}
          name="toggle-source"
          type="checkbox"
          className="h-8"
        />
        <label
          className="text-xs"
          htmlFor="toggle-source"
        >
          Live Audio
        </label>
      </div>
      <audio
        className=""
        ref={audioElement}
        controls
      ></audio>
      <Button
        onClick={saveAudio}
        disabled={!hasAudio}
      >
        Save Audio
      </Button>
    </div>
  );
};
