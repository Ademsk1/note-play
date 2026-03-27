import { togglePlay } from "../utilities/playState"
import { Button } from "./Button"


type ControlProps = {
  onPlayStateChange: () => void
  playState: 'Play' | 'Pause'
}

export const Control = ({ playState, onPlayStateChange }: ControlProps) => {

  return (
    <div id="control" className="flex">
      <Button className="w-12" onClick={onPlayStateChange}>{togglePlay(playState)}</Button>
      <input type="text" />
    </div>
  )

}