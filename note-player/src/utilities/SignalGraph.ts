//tODO
// Decide on threshhold decibels... figure out why it goes to 255... whats the mapping?
// Decide on how much info to pass in to this class.... should we get everything in here
// and just offload all the logic from the tsx file... it sure makes sense to move it somewhere
import { standardDeviation, mean } from "./Math";
import { Notes } from "./Notes";

export type SoundData = {
  decibel: number;
  frequency: number;
}[];
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
  dimensions: { x: number[]; y: number[] };
  maxFreq: number;
  minimumDecibels: number;
  Notes: Notes;
  currentNote: string;
  constructor(
    width: number,
    height: number,
    context: CanvasRenderingContext2D,
    decibels: Uint8Array<ArrayBuffer>,
    sampleRate: number,
  ) {
    this.ctx = context;
    this.width = width;
    this.height = height;
    this.decibels = decibels;
    this.barWidth = this.width / (this.decibels.length * 2);
    this.sampleRate = sampleRate;
    this.leftMargin = 10;
    this.topMargin = 0;
    this.minimumDecibels = 20;
    this.Notes = new Notes();
    this.currentNote = "";
    this.dimensions = {
      x: [this.leftMargin + 1, this.width / 2 - 1],
      y: [this.topMargin + 1, this.height / 2 - 1],
    };
    this.maxFreq = this.sampleRate / 2;
  }

  getIndexFromFrequency(freq: number) {
    return (freq * this.decibels.length) / this.maxFreq;
  }

  clear() {
    this.clearData();
  }

  getFrequencyFromIndex(i: number) {
    return (this.maxFreq * i) / this.decibels.length;
  }
  drawTicks(freqJump: number = 250) {
    const tickSize = 10;
    const frequencyIncrement = this.getIndexFromFrequency(freqJump);
    const decibelIncrement = 10;
    for (let i = 0; i < this.width / 2; i += frequencyIncrement) {
      // x axis
      this.ctx.moveTo(this.leftMargin + i, this.height / 2);
      this.ctx.lineTo(this.leftMargin + i, this.height / 2 + tickSize);
      this.ctx.stroke();
    }
    for (let j = 0; j < 256; j += decibelIncrement) {
      this.ctx.moveTo(this.leftMargin, this.height / 2 - j);
      this.ctx.lineTo(this.leftMargin - tickSize, this.height / 2 - j);
    }
  }
  drawFrame() {
    // draw the surrounding frame
    this.ctx.strokeRect(this.leftMargin, 0, this.width / 2, this.height / 2);
  }
  drawData() {
    const freq = this.decibels;
    const barWidth = this.barWidth;
    const xStart = this.dimensions.x[0];
    for (let i = 0; i < freq.length; i++) {
      this.ctx!.fillStyle = `rgb(${freq[i] + 100} 0 ${256 - (freq[i] + 100)})`;
      this.ctx?.fillRect(
        i * barWidth + xStart,
        this.dimensions.y[1],
        barWidth,
        -freq[i],
      );
    }
  }
  clearData() {
    const [xStart, xEnd] = this.dimensions.x;
    const yEnd = this.dimensions.y[1];
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(xStart, 1, xEnd, yEnd);
  }
  clearNote() {
    const originalFillStyle = this.ctx.fillStyle;
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(
      0,
      this.height / 2 + 10,
      this.width,
      this.height / 2 - 10,
    );
    this.ctx.fillStyle = originalFillStyle;
  }

  drawMaxFrequency(decibels: number | undefined = undefined) {
    if (!decibels) {
      decibels = this.getPeakValue().decibel;
    }
    const y = this.dimensions.y[1] - decibels;
    this.ctx.strokeStyle = "black";
    this.ctx.font = "30px Arial";
    this.ctx.fillRect(this.dimensions.x[0], y, this.width / 2, 1);
  }

  drawPeaks = (peaks: undefined | SoundData = undefined) => {
    if (!peaks) peaks = this.getPeaksSimple()
    for (const peak of peaks) {
      this.drawMaxFrequency(peak.decibel);
    }
    const note = this.Notes.guessNote(peaks.map((peak) => peak.frequency));
    if (note.length && note !== this.currentNote) {
      this.currentNote = note;
      this.clearNote();
      this.ctx.fillText(this.currentNote, 0, this.height / 2 + 80);
      this.ctx.fillText(
        peaks.map((peak) => peak.frequency).join("Hz "),
        0,
        this.height / 2 + 50,
      );
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
