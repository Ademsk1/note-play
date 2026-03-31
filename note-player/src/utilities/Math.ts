

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

const covariance = (arr1: Uint8Array | number[], m1: number | undefined, arr2: Uint8Array | number[], m2: number | undefined) => {
  if (!m1) {
    m1 = mean(arr1)
  }
  if (!m2) {
    m2 = mean(arr2)
  }
  let s = 0
  for (let i = 0; i < arr1.length; i++) {
    s += (arr1[i] - m1) * (arr2[i] - m2)
  }
  return s / arr1.length
}


export { mean, standardDeviation, covariance }
