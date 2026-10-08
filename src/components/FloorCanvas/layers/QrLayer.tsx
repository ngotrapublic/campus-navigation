import type { QrMarker } from '../../../types'
import type { CampusStore } from '../../../store/useCampusStore'

type QrLayerProps = {
  qrMarkers: QrMarker[]
  selected: CampusStore['selected']
}

export function QrLayer({ qrMarkers, selected }: QrLayerProps) {
  return qrMarkers.map((marker) => {
    const isSelected = selected?.type === 'qr' && selected.id === marker.id
    return (
      <g key={marker.id} transform={`translate(${marker.x}, ${marker.y})`}>
        <circle
          r={16}
          fill={isSelected ? '#1f4f43' : '#2f6f5e'}
          stroke="#fff"
          strokeWidth="3"
          data-entity="qr"
          data-id={marker.id}
        />
        <text
          y={5}
          textAnchor="middle"
          className="qr-label"
          data-entity="qr"
          data-id={marker.id}
        >
          QR
        </text>
        <text
          y={34}
          textAnchor="middle"
          className="qr-caption"
          data-entity="qr"
          data-id={marker.id}
        >
          {marker.label}
        </text>
      </g>
    )
  })
}
