import { CameraMetadataType, CameraMetadataZod } from '@shared/datalogTypes'
import { z } from 'zod'

export const alexaAleZod = z
  .object({
    name: z.string(),
    source_file: z.string().optional(),
    clip: z.string().optional(),
    duration: z.string().optional(),
    tracks: z.string().optional(),
    start: z.string().optional(),
    end: z.string().optional(),
    fps: z.coerce.number(),
    original_video: z.string().optional(),
    audio_format: z.string().optional(),
    audio_sr: z.string().optional(),
    audio_bit: z.string().optional(),
    frame_width: z.string().optional(),
    frame_height: z.string().optional(),
    uuid: z.string().optional(),
    sup_version: z.string().optional(),
    exposure_index: z.string().optional(),
    gamma: z.string().optional(),
    white_balance: z.string().optional(),
    cc_shift: z.string().optional(),
    look_name: z.string().optional(),
    look_burned_in: z.string().optional(),
    sensor_fps: z.string().optional(),
    shutter_angle: z.string().optional(),
    manufacturer: z.string().optional(),
    camera_model: z.string().optional(),
    camera_sn: z.string().optional(),
    camera_id: z.string().optional(),
    camera_index: z.string().optional(),
    project_fps: z.string().optional(),
    storage_sn: z.string().optional(),
    production: z.string().optional(),
    cinematographer: z.string().optional(),
    operator: z.string().optional(),
    director: z.string().optional(),
    location: z.string().optional(),
    company: z.string().optional(),
    user_info1: z.string().optional(),
    user_info2: z.string().optional(),
    date_camera: z.string().optional(),
    time_camera: z.string().optional(),
    reel_name: z.string().optional(),
    scene: z.string().optional(),
    take: z.string().optional(),
    asc_sat: z.string().optional(),
    asc_sop: z.string().optional(),
    look_user_lut: z.string().optional(),
    lut_file_name: z.string().optional(),
    nd_filterdensity: z.string().optional(),
    focus_distance_unit: z.string().optional(),
    lens_sn: z.string().optional(),
    lens_type: z.string().optional(),
    image_orientation: z.string().optional(),
    image_sharpness: z.string().optional(),
    image_detail: z.string().optional(),
    image_denoising: z.string().optional()
  })
  .transform((ale) => {
    const obj: Partial<CameraMetadataType> = {
      clip: ale.name,
      tc_start: ale.start,
      tc_end: ale.end,
      duration: ale.duration,
      camera_model:
        ale.manufacturer && ale.camera_model && `${ale.manufacturer} ${ale.camera_model}`,
      camera_id: ale.camera_id,
      reel: ale.reel_name,
      fps: ale.fps,
      sensor_fps: ale.sensor_fps,
      shutter: ale.shutter_angle,
      lens: ale.lens_type,
      resolution: `${ale.frame_width}x${ale.frame_height}`,
      codec: ale.original_video?.replace(/\(.*?\)/g, '').trim(),
      gamma: ale.gamma,
      ei: ale.exposure_index,
      wb: ale.white_balance,
      tint: ale.cc_shift,
      lut: ale.look_name
    }

    return Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null))
  })
  .pipe(CameraMetadataZod)

export type alexaAleType = z.infer<typeof alexaAleZod>
