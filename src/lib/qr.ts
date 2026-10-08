import QRCode from 'qrcode'
import type { Building, QrMarker } from '../types'

export function buildQrUrl(
  baseUrl: string,
  buildingId: string,
  markerId: string,
): string {
  const root = baseUrl.replace(/\/$/, '')
  return `${root}/go?b=${encodeURIComponent(buildingId)}&q=${encodeURIComponent(markerId)}`
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
