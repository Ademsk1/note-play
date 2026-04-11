import { createContext, useContext } from 'react';

export const RecordingContext = createContext(null);
//Maybe consider redux/zustand for managing this state instead
export const useRecording = () => {
  return useContext(RecordingContext);
};
