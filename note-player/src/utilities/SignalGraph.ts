
//tODO
// Decide on threshhold decibels... figure out why it goes to 255... whats the mapping?
// Decide on how much info to pass in to this class.... should we get everything in here
// and just offload all the logic from the tsx file... it sure makes sense to move it somewhere
import { standardDeviation, mean } from "./Math"

// need it to be much cleaner
export class SignalGraph {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  decibels: Uint8Array
  barWidth: number
  sampleRate: number
  leftMargin: number
  topMargin: number
  dimensions: { x: number[], y: number[] }
  maxFreq: number
  constructor(width: number, height: number, context: CanvasRenderingContext2D, decibels: Uint8Array, sampleRate: number) {
    this.ctx = context
    this.width = width
    this.height = height
    this.decibels = decibels
    this.barWidth = this.width / (this.decibels.length * 2)
    this.sampleRate = sampleRate
    this.leftMargin = 10
    this.topMargin = 0
    this.dimensions = {
      x: [this.leftMargin + 1, this.width / 2 - 1],
      y: [this.topMargin + 1, this.height / 2 - 1]
    }
    this.maxFreq = this.getMaxFreq()
  }

  getMaxFreq() {
    const maxFrequency = this.sampleRate / 2
    return maxFrequency
  }
  getIndexFromFrequency(freq: number) {
    return freq * this.decibels.length / this.maxFreq
  }

  getFrequencyFromIndex(i: number) {
    return this.maxFreq * (i) / this.decibels.length
  }
  drawTicks(freqJump: number = 250) {
    const tickSize = 10
    const frequencyIncrement = this.getIndexFromFrequency(freqJump)
    const decibelIncrement = 10
    for (let i = 0; i < this.width / 2; i += frequencyIncrement) {
      // x axis
      this.ctx.moveTo(this.leftMargin + i, this.height / 2)
      this.ctx.lineTo(this.leftMargin + i, this.height / 2 + tickSize)
      this.ctx.stroke()

    }
    for (let j = 0; j < 256; j += decibelIncrement) {
      this.ctx.moveTo(this.leftMargin, this.height / 2 - j)
      this.ctx.lineTo(this.leftMargin - tickSize, this.height / 2 - j)
    }
  }
  drawFrame() {
    // draw the surrounding frame
    this.ctx.strokeRect(this.leftMargin, 0, this.width / 2, this.height / 2)

  }
  drawData() {
    const freq = this.decibels
    const barWidth = this.barWidth
    const xStart = this.dimensions.x[0]
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
    const [xStart, xEnd] = this.dimensions.x
    const [_, yEnd] = this.dimensions.y
    this.ctx.fillStyle = 'white'
    this.ctx.fillRect(
      xStart, 1, xEnd, yEnd
    )
  }


  drawMaxFrequency(decibels: number | undefined = undefined) {
    if (!decibels) {
      decibels = this.getPeakValue().decibels

    }
    const y = this.dimensions.y[1] - decibels
    this.ctx.strokeStyle = 'black'
    this.ctx.fillRect(this.dimensions.x[0], y, this.width / 2, 1)
  }

  drawPeaks = () => {
    const peaks = this.getPeaks()
    for (const peak of peaks) {
      this.drawMaxFrequency(peak.decibel)
    }

  }



  getPeakValue() {
    let maxDecibel = this.decibels[0]
    let maxIndex = 0
    for (let i = 0; i < this.decibels.length; i++) {
      if (this.decibels[i] > maxDecibel) {
        maxDecibel = this.decibels[i]
        maxIndex = i
      }
    }
    return {
      decibels: maxDecibel,
      frequency: this.getFrequencyFromIndex(maxIndex)
    }
  }

  getPeaks() {
    let k = 0
    const m = mean(this.decibels)
    const stddev = standardDeviation(this.decibels, m)
    const stdev2 = m + 15 * stddev
    let maximas = []
    let tmp = []
    while (k < this.decibels.length) {
      while (this.decibels[k] > stdev2) {
        tmp.push({ decibel: this.decibels[k], frequency: this.getFrequencyFromIndex(k) })
        k++
      }
      if (tmp.length) {
        maximas.push(tmp.reduce((acc, val) => {
          if (acc.decibel > val.decibel) return acc
          return val
        }, tmp[0]))
      }
      tmp = []
      k++
    }

    return maximas
  }
}