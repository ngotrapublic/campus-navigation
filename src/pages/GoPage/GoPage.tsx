import { buildingRect } from '../../lib/site'
import { GoMap } from './GoMap'
import { useGoNavigation } from './useGoNavigation'
import './GoPage.css'

export function GoPage() {
  const {
    error,
    state,
    building,
    start,
    destinations,
    destId,
    setDestId,
    route,
    activeLeg,
    setActiveLeg,
    viewFloor,
    legPoints,
  } = useGoNavigation()

  const bounds = building ? buildingRect(building.site) : null

  if (error) {
    return (
      <div className="go-page">
        <header className="go-header">
          <h1>Campus Nav</h1>
        </header>
        <p className="go-error">{error}</p>
        <p className="go-hint">
          On the laptop: keep Map Studio open at the same Wi‑Fi address so the map
          syncs, then scan again.
        </p>
      </div>
    )
  }

  if (!state || !building || !start || !bounds) {
    return (
      <div className="go-page">
        <header className="go-header">
          <h1>Campus Nav</h1>
        </header>
        <p className="go-hint">
          {!state
            ? 'Loading map…'
            : !building
              ? 'Building not found in published map.'
              : 'QR marker not found. Re-print QR after placing the point.'}
        </p>
      </div>
    )
  }

  return (
    <div className="go-page">
      <header className="go-header">
        <h1>{building.name}</h1>
        <p>
          You are at <strong>{start.label}</strong> · Floor{' '}
          <strong>{start.floor.name}</strong>
        </p>
      </header>

      <label className="go-dest">
        Go to
        <select
          value={destId}
          onChange={(event) => setDestId(event.target.value)}
        >
          <option value="">Choose destination…</option>
          {destinations.map((item) => (
            <option key={`${item.type}:${item.id}`} value={`${item.type}:${item.id}`}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      {route ? (
        <p className="go-summary">{route.summary}</p>
      ) : (
        <p className="go-hint">Pick a room or elevator to see the path.</p>
      )}

      {route && route.legs.length > 1 ? (
        <div className="go-legs">
          {route.legs.map((leg, index) => (
            <button
              key={`${leg.floorId}-${index}`}
              type="button"
              className={index === activeLeg ? 'active' : ''}
              onClick={() => setActiveLeg(index)}
            >
              {index + 1}. {leg.floorName}
            </button>
          ))}
        </div>
      ) : null}

      {route?.legs[activeLeg]?.note ? (
        <p className="go-note">{route.legs[activeLeg].note}</p>
      ) : null}

      <GoMap
        bounds={bounds}
        building={building}
        viewFloor={viewFloor}
        legPoints={legPoints}
        startFloor={start.floor}
        startPoint={start.point}
      />

      <p className="go-legend">
        <span className="dot start" /> You
        <span className="dot end" /> Destination
      </p>
    </div>
  )
}
