import { useEffect, useState } from 'react'
import type { Building, Floor, QrMarker } from '../../types'
import { buildQrUrl, markerDisplayName, renderQrDataUrl } from '../../lib/qr'

export function useQrPreview(
  selectedQr: QrMarker | null | undefined,
  activeBuilding: Building | null,
  activeFloor: Floor | null,
) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadQr() {
      if (!selectedQr || !activeBuilding || !activeFloor) {
        setQrDataUrl(null)
        setQrUrl(null)
        return
      }
      const url = buildQrUrl(window.location.origin, {
        buildingId: activeBuilding.id,
        markerId: selectedQr.id,
        floorId: activeFloor.id,
        x: selectedQr.x,
        y: selectedQr.y,
        label: selectedQr.label,
      })
      setQrUrl(url)
      const dataUrl = await renderQrDataUrl(url)
      if (!cancelled) {
        setQrDataUrl(dataUrl)
      }
    }

    void loadQr()
    return () => {
      cancelled = true
    }
  }, [selectedQr, activeBuilding, activeFloor])

  function printQr() {
    if (!qrDataUrl || !selectedQr || !activeBuilding || !activeFloor) {
      return
    }
    const title = markerDisplayName(activeBuilding, activeFloor.name, selectedQr)
    const popup = window.open('', '_blank', 'width=480,height=640')
    if (!popup) {
      window.alert('Popup blocked. Allow popups to print QR.')
      return
    }
    popup.document.write(`<!doctype html>
<html>
<head>
  <title>${title}</title>
  <style>
    body { font-family: Georgia, serif; text-align: center; padding: 32px; color: #1c2d26; }
    img { width: 320px; height: 320px; }
    h1 { font-size: 20px; margin: 0 0 8px; }
    p { margin: 4px 0; color: #4d5f57; font-size: 13px; word-break: break-all; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <img src="${qrDataUrl}" alt="QR code" />
  <p>${qrUrl ?? ''}</p>
  <script>window.onload = () => window.print()</script>
</body>
</html>`)
    popup.document.close()
  }

  return { qrDataUrl, qrUrl, printQr }
}
