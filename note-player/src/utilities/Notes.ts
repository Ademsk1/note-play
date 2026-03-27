export const NOTES = {
  C: {
    frequencies: [16.35, 32.7, 65.41, 130.81, 261.63, 523.25, 1046.5],
    above: "C#",
    below: "B",
  },
  "C#": {
    frequencies: [17.32, 34.65, 69.3, 138.59, 277.18, 554.37, 1108.73],
    above: "D",
    below: "C",
  },
  D: {
    frequencies: [18.35, 36.71, 73.42, 146.83, 293.66, 587.33, 1174.66],
    above: "D#",
    below: "C#",
  },
  "D#": {
    frequencies: [19.45, 38.89, 77.78, 155.56, 311.13, 622.25, 1244.51],
    above: "E",
    below: "D",
  },
  E: {
    frequencies: [20.6, 41.2, 82.41, 164.81, 329.63, 659.25, 1318.51],
    above: "F",
    below: "D#",
  },
  F: {
    frequencies: [21.83, 43.65, 87.31, 174.61, 349.23, 698.46, 1396.91],
    above: "F#",
    below: "E",
  },
  "F#": {
    frequencies: [23.12, 46.25, 92.5, 185, 369.99, 739.99, 1479.98],
    above: "G",
    below: "F",
  },
  G: {
    frequencies: [24.5, 49, 98, 196, 392, 783.99, 1567.98],
    above: "G#",
    below: "F#",
  },
  "G#": {
    frequencies: [25.96, 51.91, 103.83, 207.65, 415.3, 830.61, 1661.22],
    above: "A",
    below: "G",
  },
  A: {
    frequencies: [27.5, 55, 110, 220, 440, 880, 1760],
    above: "A#",
    below: "G#",
  },
  "A#": {
    frequencies: [29.14, 58.27, 116.54, 233.08, 466.16, 932.33, 1864.66],
    above: "B",
    below: "A",
  },
  B: {
    frequencies: [30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53],
    above: "C",
    below: "A#",
  },
};

const MAX_NUM_NOTES = Object.keys(NOTES).length;

export class Notes {
  notes: {
    [key: string]: { frequencies: number[]; above: string; below: string };
  };
  constructor() {
    this.notes = NOTES;
  }
  getFrequencyWindow(note: string, index: number) {
    const { frequencies, above, below } = this.notes[note];
    const frequency = frequencies[index];
    let incrementOctave = 0
    let decrementOctave = 0
    if (above === 'C') {
      incrementOctave = 1
    }
    if (below === 'B') {
      decrementOctave = 1
    }
    const fUp = this.notes[above].frequencies[index + incrementOctave]
    const fBelow = this.notes[below].frequencies[index + decrementOctave];
    const halfUp = frequency + (fUp - frequency) / 2;
    const halfDown = frequency - (frequency - fBelow) / 2;
    return {
      above: halfUp,
      below: halfDown,
    };
  }
  getClosest(
    noteBelow: string,
    noteBelowFreq: number,
    noteAbove: string,
    noteAboveFreq: number,
    frequency: number,
  ) {
    const differenceAbove = Math.abs(noteAboveFreq - frequency);
    const differenceBelow = Math.abs(frequency - noteBelowFreq);

    if (differenceAbove > differenceBelow) {
      return noteBelow;
    } else {
      return noteAbove;
    }
  }
  getNote(frequency: number) {
    let currentNote = "C";
    const cAboveNoteIndex = this.notes[currentNote].frequencies.findIndex(
      (value) => value > frequency,
    );
    let minIndex = Math.max(cAboveNoteIndex - 1, 0);
    let currentFrequency = this.notes[currentNote].frequencies[minIndex];
    let priorNote = currentNote;
    let priorFrequency = currentFrequency;
    let noteIncrement = 0;
    while (currentFrequency < frequency && noteIncrement < MAX_NUM_NOTES + 1) {
      if (currentNote === "B") minIndex++;
      priorNote = currentNote;
      priorFrequency = currentFrequency;
      currentNote = this.notes[currentNote].above;
      currentFrequency = this.notes[currentNote].frequencies[minIndex];
      noteIncrement++;
    }
    const closestNote = this.getClosest(
      priorNote,
      priorFrequency,
      currentNote,
      currentFrequency,
      frequency,
    );
    return `${closestNote}${minIndex}`
  }
  guessNote(frequencies: number[]) {
    const counter: Record<string, number> = {};
    let maxCount = 0;
    let maxCountNote = "";
    for (const frequency of frequencies) {
      const note = this.getNote(frequency);
      counter[note] = counter[note] || 0;
      counter[note]++;
      if (counter[note] > maxCount) {
        maxCountNote = note;
        maxCount = counter[note];
      }
    }
    return maxCountNote;
  }
}