import { useEffect, useState } from 'react';
import { NOTES } from '../utilities/Notes';

type RecordingProps = {
  audioUrls: string[];
  setIsComplete: React.Dispatch<React.SetStateAction<boolean>>;
};

const validateNotes = (selectedNotes: string[]) => {
  const notes = new Set(Object.keys(NOTES));
  const selected = new Set(selectedNotes);

  if (notes.difference(selected).size > 0) {
    return false;
  }
  return true;
};

export const Recordings = ({ audioUrls, setIsComplete }: RecordingProps) => {
  const [notesSelected, setNotesSelected] = useState<string[]>([]);
  useEffect(() => {
    setIsComplete(validateNotes(notesSelected));
  }, [audioUrls, notesSelected]);

  return (
    <div>
      {audioUrls.map((url) => {
        return (
          <div className="flex gap-1">
            <audio
              controls
              src={url}
            ></audio>
            <select
              onSelect={() => {}} //something here
              className="border"
              name="pets"
              id="pet-select"
            >
              <option value="">--Please label the note--</option>
              {Object.keys(NOTES).map((note) => {
                return <option value={note}>{note}</option>;
              })}
            </select>
          </div>
        );
      })}
    </div>
  );
};
