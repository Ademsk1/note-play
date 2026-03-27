

export const togglePlay = (playState: string) => {
  if (playState === 'Pause') return 'Play'
  return 'Pause'
}