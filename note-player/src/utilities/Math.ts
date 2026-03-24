

const mean = (arr: Uint8Array) => {
  let sum = 0
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i]
  }
  return sum / arr.length
}

const standardDeviation = (arr: Uint8Array, m: number | undefined = undefined) => {
  if (m === undefined) {
    m = mean(arr)
  }
  return (
    Math.sqrt(
      mean(
        arr.map((value) => (value - (m as number)) ** 2)
      )
    )
  )
}


export { mean, standardDeviation }

