import type { QrMarker } from '../../types'

type QrPropertiesProps = {
  selectedQr: QrMarker
  qrDataUrl: string | null
  qrUrl: string | null
  updateQrMarker: (markerId: string, patch: Partial<QrMarker>) => void
  onPrintQr: () => void
}

export function QrProperties({
  selectedQr,
  qrDataUrl,
  qrUrl,
  updateQrMarker,
  onPrintQr,
}: QrPropertiesProps) {
  return (
    <div className="stack">
      <label>
        QR label
        <input
          className="text-input"
          value={selectedQr.label}
          onChange={(event) =>
            updateQrMarker(selectedQr.id, { label: event.target.value })
          }
        />
      </label>
      <p className="hint">ID: {selectedQr.id}</p>
      {qrDataUrl ? (
        <div className="qr-preview">
          <img src={qrDataUrl} alt="QR preview" />
          <p className="hint break">{qrUrl}</p>
          <button type="button" className="primary" onClick={onPrintQr}>
            Print / save QR
          </button>
        </div>
      ) : null}
    </div>
  )
}
