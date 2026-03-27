import { type MouseEventHandler } from 'react';
type GetStartedProps = {
  handleStart: MouseEventHandler<HTMLButtonElement>;
};

export const GetStarted = ({ handleStart }: GetStartedProps) => {
  return (
    <div className="h-full flex items-center justify-center">
      <button
        onClick={handleStart}
        className="bg-blue-500 text-2xl rounded px-3 py-4 text-xl hover:bg-blue-700 outline-2 outline-offset-1 focus:outline-offset-4 focus:opacity-0 transition duration-300 ease-in outline-blue-400 text-white"
      >
        Get started
      </button>
    </div>
  );
};
