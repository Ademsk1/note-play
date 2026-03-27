//tODO
// Decide on threshhold decibels... figure out why it goes to 255... whats the mapping?
// Decide on how much info to pass in to this class.... should we get everything in here
// and just offload all the logic from the tsx file... it sure makes sense to move it somewhere
import { standardDeviation, mean } from "./Math";
import { Notes } from "./Notes";

type Dimensions = {
  x: number[]
  y: number[]
}

export type SoundData = {
  decibel: number;
  frequency: number;
}[];

const MARGIN = 10//px
// need it to be much cleaner
export class SignalGraph {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  decibels: Uint8Array<ArrayBuffer>;
  barWidth: number;
  sampleRate: number;
  leftMargin: number;
  topMargin: number;
  graphDimensions: Dimensions
  maxFreq: number;
  minimumDecibels: number;
  Notes: Notes;
  currentNote: string;
  newNote: boolean
  constructor(
    width: number,
    height: number,
    context: CanvasRenderingContext2D,
    decibels: Uint8Array<ArrayBuffer>,
    sampleRate: number,
  ) {
    this.ctx = context;
    // width 
    this.width = width;
    this.height = height;
    this.decibels = decibels;
    this.barWidth = this.width / (this.decibels.length * 2);
    this.sampleRate = sampleRate;
    this.leftMargin = MARGIN;
    this.topMargin = MARGIN;
    this.minimumDecibels = 20;
    this.Notes = new Notes();
    this.currentNote = "";
    this.newNote = false
    this.graphDimensions = {
      x: [this.leftMargin + 1, this.width - 1],
      y: [this.topMargin + 1, this.height - 1]
    }
    this.maxFreq = this.sampleRate / 2;
  }

  getIndexFromFrequency(freq: number) {
    return (freq * this.decibels.length) / this.maxFreq;
  }
  getFrequencyFromIndex(i: number) {
    return (this.maxFreq * i) / this.decibels.length;
  }

  drawFrame() {
    // draw the surrounding frame
    this.ctx.strokeRect(this.leftMargin, 0, this.width, this.height);
  }
  drawData() {
    const freq = this.decibels;
    const barWidth = this.barWidth;
    const xStart = this.graphDimensions.x[0];
    for (let i = 0; i < freq.length; i++) {
      this.ctx!.fillStyle = `rgb(${freq[i] + 100} 0 ${256 - (freq[i] + 100)})`;
      this.ctx?.fillRect(
        i * barWidth + xStart,
        this.graphDimensions.y[1],
        barWidth,
        -freq[i],
      );
    }
  }
  clear() {
    const [xStart, xEnd] = this.graphDimensions.x;
    const yEnd = this.graphDimensions.y[1];
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(xStart, 1, xEnd, yEnd);
  }
  clearNote() {
    const originalFillStyle = this.ctx.fillStyle;
    this.ctx.fillStyle = "white";

    this.ctx.fillRect(
      0,
      this.height + 10,
      this.width,
      this.height - 10,
    );
    this.ctx.fillStyle = originalFillStyle;
  }

  drawMaxFrequency(decibels: number | undefined = undefined) {
    if (!decibels) {
      decibels = this.getPeakValue().decibel;
    }
    const y = this.graphDimensions.y[1] - decibels;
    this.ctx.strokeStyle = "black";
    this.ctx.fillRect(this.graphDimensions.x[0], y, this.width, 1);
  }

  drawPeaks = (peaks: undefined | SoundData = undefined) => {
    if (!peaks) peaks = this.getPeaksSimple()
    for (const peak of peaks) {
      this.drawMaxFrequency(peak.decibel);
    }
    const note = this.Notes.guessNote(peaks.map((peak) => peak.frequency));
    if (note.length && note !== this.currentNote) {
      this.newNote = true
      this.currentNote = note
    }
  };

  getPeakValue(): SoundData[0] {
    let maxDecibel = this.decibels[0];
    let maxIndex = 0;
    for (let i = 0; i < this.decibels.length; i++) {
      if (this.decibels[i] > maxDecibel) {
        maxDecibel = this.decibels[i];
        maxIndex = i;
      }
    }
    return {
      decibel: maxDecibel,
      frequency: this.getFrequencyFromIndex(maxIndex),
    };
  }

  getPeaksSimple() {
    // works off the idea that in a piano, there will most likely be 2 peaks of frequency
    // need to clear the vicinity once a peaks been found ....
    // but seems to work pretty well for tone generator reading! 

    let max = this.decibels[0]
    let secondMax = this.decibels[0]
    let maxFreq = 0
    let secondMaxFreq = 0
    for (let i = 1; i < this.decibels.length; i++) {
      if (max < this.decibels[i]) {
        secondMax = max
        secondMaxFreq = maxFreq
        max = this.decibels[i]
        maxFreq = this.getFrequencyFromIndex(i)
      } else if (secondMax < this.decibels[i]) {
        secondMax = this.decibels[i]
        secondMaxFreq = this.getFrequencyFromIndex(i)
      }
    }
    return [
      { frequency: maxFreq, decibel: max },
      { frequency: secondMaxFreq, decibel: secondMax }
    ]
  }

  getRollingPeaks(lag: number = 20, threshold = 1) {
    // rolling standard deviation and mean
    // restart when at a baseline of some kind
    // doesnt really work very well...
    const lastDataPoints = []
    let maximas: SoundData = []
    let goingUp = false

    let k = 0
    while (k < this.decibels.length) {
      const decibel = this.decibels[k]
      lastDataPoints.push(decibel)
      if (k > lag) {
        lastDataPoints.shift()
        const m = mean(lastDataPoints)
        const stddev = standardDeviation(lastDataPoints, m)
        if (decibel > m + stddev * threshold) {
          goingUp = this.decibels[k + 1] > decibel
          while (goingUp) {
            k++
            goingUp = this.decibels[k + 1] > decibel
          }
          maximas.push({ decibel: decibel, frequency: this.getFrequencyFromIndex(k) })
        }
      }
      k++
    }

    for (let i = 0; i < this.decibels.length; i++) {
      const decibel = this.decibels[i]
      lastDataPoints.push(decibel)
      if (i > lag) {
        lastDataPoints.shift()
        const m = mean(lastDataPoints)
        const stddev = standardDeviation(lastDataPoints, m)
        if (decibel > m + stddev * threshold) {
          goingUp = this.decibels[i + 1] > decibel
          if (goingUp) {

          }
        }
      }
    }
    return maximas
  }


  getPeaks() {
    // works not too badly! Need to configure fftSize with it to properly get the peaks. 
    let k = 0;
    const filteredDecibels = this.decibels.filter(
      (decibel: number) => decibel > this.minimumDecibels,
    );
    const m = mean(filteredDecibels);
    const stddev = standardDeviation(filteredDecibels, m);
    const stdev2 = m + 5 * stddev;
    const maximas = [];
    let tmp = [];
    while (k < this.decibels.length) {
      while (this.decibels[k] > stdev2) {
        tmp.push({
          decibel: this.decibels[k],
          frequency: this.getFrequencyFromIndex(k),
        });
        k++;
      }
      if (tmp.length) {
        maximas.push(
          tmp.reduce((acc, val) => {
            if (acc.decibel > val.decibel) return acc;
            return val;
          }, tmp[0]),
        );
      }
      tmp = [];
      k++;
    }

    return maximas;
  }
}
