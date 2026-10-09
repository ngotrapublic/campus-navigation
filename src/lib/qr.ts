import QRCode from 'qrcode'
import type { Building, QrMarker } from '../types'

export type QrStartPayload = {
  buildingId: string
  markerId: string
  floorId: string
  x: number
  y: number
  label?: string
}

export function buildQrUrl(baseUrl: string, payload: QrStartPayload): string {
  const root = baseUrl.replace(/\/$/, '')
  const params = new URLSearchParams({
    b: payload.buildingId,
    q: payload.markerId,
    f: payload.floorId,
    x: String(Math.round(payload.x * 100) / 100),
    y: String(Math.round(payload.y * 100) / 100),
  })
  if (payload.label) {
    params.set('n', payload.label)
  }
  return `${root}/go?${params.toString()}`
}

export async function renderQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: 'M',
  })
}

export function markerDisplayName(
  building: Building,
  floorName: string,
  marker: QrMarker,
): string {
  return `${building.name} · ${floorName} · ${marker.label}`
}
