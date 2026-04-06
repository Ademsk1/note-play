import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { Button } from "./Button"



type RecorderControlProps = {
  stream: MediaStream | null
  audioElement: React.RefObject<HTMLAudioElement | null>
  setSource: (source: 'live' | 'recording') => void
}


export const RecordControl = ({ stream, audioElement, setSource }: RecorderControlProps) => {
  if (!stream) {
    return <p>No stream</p>
  }
  console.log({ stream })
  const [recording, setRecording] = useState(false)
  const recordingRef = useRef(new MediaRecorder(stream))
  const chunks = useRef<BlobPart[]>([])
  useEffect(() => {
    if (!recordingRef.current) return
    if (!audioElement.current) return
    if (recording) {
      chunks.current = []
    }
    recordingRef.current.addEventListener('dataavailable', (e) => {
      console.log('pushing!')
      chunks.current.push(e.data)
    })
    audioElement.current.addEventListener('play', (e) => {
    })
    recordingRef.current.addEventListener('stop', (e) => {
      const blob = new Blob(chunks.current, { type: "audio/ogg; codecs=opus" });
      const audioURL = window.URL.createObjectURL(blob);
      audioElement.current!.src = audioURL
    })
    return () => {
      chunks.current = []
    }
  }, [recording])

  const handleRecording = () => {
    setRecording(true)
    chunks.current = []
  }
  const toggleSource = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.checked) {
      setSource('recording')
    } else {
      setSource('live')
    }
  }


  useEffect(() => {
    if (recording) {
      console.log('starting')
      recordingRef.current.start()
    } else {
      console.log('stopping')
      recordingRef.current.stop()
    }
  }, [recording])
  return (
    <div id="record" className="w-fit flex border p-1 gap-1">
      <Button onClick={handleRecording} disabled={recording}>Record</Button>
      <Button onClick={() => { setRecording(false) }} disabled={!recording} color={"secondary"}>Stop</Button>
      <div className="flex flex-col">
        <input onChange={toggleSource} name="toggle-source" type="checkbox" className="h-8" />
        <label className="text-xs" htmlFor="toggle-source">Live Audio</label>
      </div>
      <audio className="" ref={audioElement} controls></audio>
    </div>
  )
}