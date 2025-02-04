export type EditingCellType = {
  rowIndex: number
  colId: string
} | null

export type TempValue = {
  rowIndex: number
  colId: string
  value: string
} | null

/*type tupleString = { id: string; path: string; edit: boolean; value: string }
type tupleNumber = { id: string; path: string; edit: boolean; value: number }
type tupleArray = { id: string; path: string; edit: boolean; value: string[] }

export type valueTypes = tupleString | tupleNumber | tupleArray

export interface MergedClip {
  clip: tupleString
  size: tupleNumber
  tc_start: tupleString
  tc_end: tupleString
  duration: tupleString
  camera_model: tupleString
  camera_id: tupleString
  reel: tupleString
  fps: tupleNumber
  sensor_fps: tupleString
  lens: tupleString
  resolution: tupleString
  codec: tupleString
  gamma: tupleString
  wb: tupleString
  tint: tupleString
  lut: tupleString
  hash: tupleArray

  // Merged Sound references
  sound: tupleArray // the names of overlapping sound clips

  // proxy
  proxy_size: tupleNumber
  proxy_format: tupleString
  proxy_codec: tupleString
  proxy_resolution: tupleString

  // Additional fields from custom, appended at the top level
  [key: string]: valueTypes
} */
