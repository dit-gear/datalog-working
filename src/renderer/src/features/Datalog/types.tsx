export type PathType = {
  full: string
  volume: string | null
  relativePath: string
}

export type CopyType = {
  path: PathType | PathType[]
  clips: string[]
  count: [number, number]
}
