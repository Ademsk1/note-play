import { useEffect, useRef, useState } from "react"
import { Button } from "./Button"



// #trustmebro
export interface HTMLAudioElement2 extends HTMLAudioElement {
  captureStream(): MediaStream;
}

type RecorderControlProps = {
  stream: MediaStream | null
  audioElement: React.RefObject<HTMLAudioElement2 | null>
  setStream: (stream: MediaStream) => void
}


export const RecordControl = ({ stream, audioElement, setStream }: RecorderControlProps) => {
  if (!stream) {
    return <p>No stream</p>
  }
  const [recording, setRecording] = useState(false)
  const recordingRef = useRef(new MediaRecorder(stream))
  const chunks: BlobPart[] = []
  useEffect(() => {
    if (!recordingRef.current) return
    if (!audioElement.current) return
    console.log('setting up')
    console.log(stream)
    recordingRef.current.addEventListener('dataavailable', (e) => {
      console.log('pushing!')
      chunks.push(e.data)
    })
    audioElement.current.addEventListener('play', (e) => {

    })
    recordingRef.current.addEventListener('stop', (e) => {
      const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
      const audioURL = window.URL.createObjectURL(blob);
      audioElement.current!.src = audioURL
    })
  }, [])


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
      <Button onClick={() => { setRecording(true) }} disabled={recording}>Record</Button>
      <Button onClick={() => { setRecording(false) }} disabled={!recording} color={"secondary"}>Stop</Button>
      <audio className="" ref={audioElement} controls></audio>
    </div>
  )
}