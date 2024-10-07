export type PathType = {
  full: string
  volume: string | null
  relativePath: string
}

export type CopyType = {
  paths: PathType[]
  clips: string[]
  count: [number, number]
}
