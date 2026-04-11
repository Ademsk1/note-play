import {
  useEffect,
  useState,
  type ChangeEvent,
  type KeyboardEventHandler,
  type ChangeEventHandler,
} from 'react';
import { togglePlay } from '../utilities/playState';
import { Button } from './Button';
import { tv } from 'tailwind-variants';

type ControlProps = {
  range: number;
  setRange: (range: number) => void;
  onPlayStateChange: () => void;
  playState: 'Play' | 'Pause';
  setDrawStats: (e: boolean) => void;
};

const controlVariants = tv({
  base: 'border outline-none p-1',
  variants: {
    color: {
      primary: 'border-black focus:border-black focus-visible:border-black',
      error: 'border-red-500 outline-none bg-red-100',
    },
  },
});

export const Control = ({
  range,
  setRange,
  playState,
  onPlayStateChange,
  setDrawStats,
}: ControlProps) => {
  const [fRange, setFRange] = useState('');
  const [invalidRange, setInvalidRange] = useState(false);
  useEffect(() => {
    setFRange(`${range}`);
  }, [range]);

  const validInput = (freqInput: string) => {
    const f = parseInt(freqInput);
    return !isNaN(f) && f > 0 && f <= 24000;
  };

  const handleRangeChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    let n = e.currentTarget.value;
    setFRange(n);
    setInvalidRange(!validInput(n));
  };
  const onKeyDown: KeyboardEventHandler = (e) => {
    if (e.key === 'Enter') {
      if (validInput(fRange)) {
        setRange(parseInt(fRange));
      }
    }
  };

  const toggleStats = (e: ChangeEvent<HTMLInputElement>) => {
    setDrawStats(e.currentTarget.checked);
  };

  return (
    <div
      id="control"
      className="flex gap-1 **:justify-end border w-fit p-1"
    >
      <Button
        color={playState === 'Play' ? 'error' : 'success'}
        className={'text-white'}
        onClick={onPlayStateChange}
      >
        {togglePlay(playState)}
      </Button>
      <div className="flex flex-col">
        <label
          className="text-xs"
          htmlFor="frequency_range"
        >
          Max frequency range (Hz)
        </label>
        <input
          value={fRange}
          onChange={handleRangeChange}
          onKeyDown={onKeyDown}
          name="frequency_range"
          className={controlVariants({
            color: invalidRange ? 'error' : 'primary',
          })}
          type="text"
        />
      </div>
      <div className="flex flex-col">
        <input
          className="h-8"
          name="drawStats"
          type="checkbox"
          onChange={toggleStats}
        />
        <label
          className="text-xs"
          htmlFor="drawStats"
        >
          Statistics
        </label>
      </div>
    </div>
  );
};
