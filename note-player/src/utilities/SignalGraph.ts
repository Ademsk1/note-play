//tODO
// Decide on threshhold decibels... figure out why it goes to 255... whats the mapping?
// Decide on how much info to pass in to this class.... should we get everything in here
// and just offload all the logic from the tsx file... it sure makes sense to move it somewhere
import { standardDeviation, mean } from "./Math";
import { Notes } from "./Notes";

// based on indexRange, how much should we increment index wise 

const X_TICK_INCREMENTS = [
  [2000, 500],
  [1000, 250],
  [500, 100],
  [250, 25],
  [100, 10],
  [50, 5],
  [20, 2],
  [0, 1],


]


type Dimensions = {
  x: number[]
  y: number[]
}

export type SoundData = {
  decibel: number;
  frequency: number;
}[];

const MARGIN = 30//px
export class SignalGraph {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  decibels: Uint8Array<ArrayBuffer>;
  barWidth: number;
  mean: number
  stddev: number
  sampleRate: number;
  leftMargin: number;
  bottomMargin: number
  graphDimensions: Dimensions
  indexRange: number
  maxFreq: number;
  minimumDecibels: number;
  Notes: Notes;
  currentNote: string;
  newNote: boolean
  showStats: boolean
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
    this.indexRange = this.decibels.length
    this.sampleRate = sampleRate;
    this.leftMargin = MARGIN;
    this.bottomMargin = MARGIN  // for the ticks
    this.minimumDecibels = 20;
    this.Notes = new Notes();
    this.currentNote = "";
    this.newNote = false
    this.showStats = false
    this.mean = 0
    this.stddev = 0
    this.graphDimensions = {
      x: [this.leftMargin + 1, this.width - 1],
      y: [0, this.height - this.bottomMargin]
    }
    this.setBarWidth()
    this.maxFreq = this.sampleRate / 2;
  }
  getGraphSize() {
    return {
      width: this.graphDimensions.x[1] - this.graphDimensions.x[0],
      height: this.graphDimensions.y[1] - this.graphDimensions.y[0]
    }
  }
  getIndexFromFrequency(freq: number) {
    return (freq * this.decibels.length) / this.maxFreq;
  }
  getFrequencyFromIndex(i: number) {
    return (this.maxFreq * i) / this.decibels.length;
  }

  drawFrame() {
    // draw the surrounding frame
    const { width, height } = this.getGraphSize()
    this.ctx.strokeRect(this.graphDimensions.x[0] - 1, this.graphDimensions.y[0] + 1, width + 1, height + 1)
    // this.ctx.strokeRect(this.leftMargin, 0, this.width, this.height);
  }

  setRange(frequency: number) {
    this.indexRange = this.getIndexFromFrequency(frequency)
    this.setBarWidth()
    this.clearTicks()
    this.drawTicks()
  }

  setBarWidth() {
    this.barWidth = this.graphDimensions.x[1] / (this.indexRange);
  }
  setShowStats(draw: boolean) {
    this.showStats = draw
  }

  drawTicks() {
    // good number of ticks is around 10-15. Lets try 10
    const tickLength = 10
    const tickJump = X_TICK_INCREMENTS.find((v) => v[0] < this.indexRange)?.[1] ?? 500

    let x = 0
    let count = 0
    let currentStyle = this.ctx.fillStyle

    this.ctx.fillStyle = 'black'
    while (x < this.graphDimensions.x[1] - 50) {
      const tickIncrement = tickJump * count
      x = this.graphDimensions.x[0] + this.barWidth / 2 + this.barWidth * tickIncrement
      this.ctx.fillRect(x, this.graphDimensions.y[1] + 1, 2, tickLength)
      const freqRounded = Math.round(this.getFrequencyFromIndex(tickIncrement))
      this.ctx.fillText(`${freqRounded}`, x, this.graphDimensions.y[1] + 20)
      count++
    }
    this.ctx.fillStyle = currentStyle
  }
  execute() {
    this.clear();
    this.drawData();
    this.getNote();
    this.generateStats()
    if (this.showStats) {
      this.drawStats()
    }
  }

  clearTicks() {
    const currentStyle = this.ctx.fillStyle
    this.ctx.fillStyle = 'white'
    this.ctx.fillRect(0, this.graphDimensions.y[1] + 1, this.width, this.height - this.graphDimensions.y[1] + 1)
    this.ctx.fillStyle = currentStyle
  }

  drawData() {
    const freq = this.decibels.slice(0, this.indexRange);
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


  generateStats() {
    const data = this.decibels.slice(0, this.indexRange)
    this.mean = mean(data)
    this.stddev = standardDeviation(data, this.mean)
  }

  clear() {
    const [xStart, xEnd] = this.graphDimensions.x;
    const yEnd = this.graphDimensions.y[1];
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(xStart, 1, xEnd, yEnd);

  }
  drawStats() {
    if (!this.showStats) {
      return
    }
    let max = this.getPeakValue().decibel
    this.drawHorizontalLine(max)
    this.drawHorizontalLine(this.mean, 'green')
    this.drawStdDev()
  }

  drawStdDev() {
    const currentCol = this.ctx.fillStyle
    this.ctx.fillStyle = 'black'
    const centre = this.mean
    const xline = this.graphDimensions.y[1]
    this.ctx.fillRect(
      this.graphDimensions.x[1] - 5,
      xline - centre - this.stddev / 2,
      3,
      Math.min(this.stddev, centre + this.stddev / 2)
    )
    this.ctx.fillRect(
      this.graphDimensions.x[1] - 10,
      xline - centre - this.stddev / 2,
      10,
      3
    )
    this.ctx.fillRect(
      this.graphDimensions.x[1] - 10,
      Math.min(xline - centre + this.stddev / 2, xline),
      10,
      3
    )
  }

  drawHorizontalLine(decibels: number, style = 'black') {
    const currentCol = this.ctx.fillStyle
    this.ctx.fillStyle = style
    const y = this.graphDimensions.y[1] - decibels;
    this.ctx.strokeStyle = "black";
    this.ctx.fillRect(this.graphDimensions.x[0], y, this.width, 1);
    this.ctx.fillStyle = currentCol
  }

  drawMaxFrequency(decibels: number) {
    const y = this.graphDimensions.y[1] - decibels;
    this.ctx.strokeStyle = "black";
    this.ctx.fillRect(this.graphDimensions.x[0], y, this.width, 1);
  }
  getNote(peaks?: SoundData) {
    if (!peaks) peaks = this.getPeaksSimple()
    const note = this.Notes.guessNote(peaks.map((peak) => peak.frequency));
    if (note.length && note !== this.currentNote) {
      this.newNote = true
      this.currentNote = note
    }
  }

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
