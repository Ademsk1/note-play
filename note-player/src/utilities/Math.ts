

const mean = (arr: Uint8Array | number[]) => {
  let sum = 0
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i]
  }
  return sum / arr.length
}

const standardDeviation = (arr: Uint8Array | number[], m: number | undefined = undefined) => {
  if (m === undefined) {
    m = mean(arr)
  }
  let variance = 0
  const size = arr.length
  for (let i = 0; i < size; i++) {
    variance += (arr[i] - m) ** 2
  }
  return Math.sqrt(variance / size)

}


export { mean, standardDeviation }
