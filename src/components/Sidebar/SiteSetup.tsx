import type { Building, BuildingSite } from '../../types'
import { formatArea, siteAreas } from '../../lib/site'

type SiteSetupProps = {
  activeBuilding: Building
  areas: ReturnType<typeof siteAreas> | null
  updateSite: (patch: Partial<BuildingSite>) => void
  enterInterior: () => void
}

export function SiteSetup({
  activeBuilding,
  areas,
  updateSite,
  enterInterior,
}: SiteSetupProps) {
  return (
    <section className="panel">
      <h2>Site setup</h2>
      <p className="hint">
        Set yard and building sizes first. Floors only exist inside the building.
      </p>

      <p className="site-subtitle">Yard</p>
      <div className="site-grid">
        <label>
          Width (m)
          <input
            className="text-input"
            type="number"
            min={1}
            step={1}
            value={activeBuilding.site.yardWidthM}
            onChange={(event) =>
              updateSite({ yardWidthM: Number(event.target.value) || 1 })
            }
          />
        </label>
        <label>
          Height (m)
          <input
            className="text-input"
            type="number"
            min={1}
            step={1}
            value={activeBuilding.site.yardHeightM}
            onChange={(event) =>
              updateSite({ yardHeightM: Number(event.target.value) || 1 })
            }
          />
        </label>
      </div>

      <p className="site-subtitle">Building</p>
      <div className="site-grid">
        <label>
          Width (m)
          <input
            className="text-input"
            type="number"
            min={1}
            step={1}
            value={activeBuilding.site.buildingWidthM}
            onChange={(event) =>
              updateSite({ buildingWidthM: Number(event.target.value) || 1 })
            }
          />
        </label>
        <label>
          Height (m)
          <input
            className="text-input"
            type="number"
            min={1}
            step={1}
            value={activeBuilding.site.buildingHeightM}
            onChange={(event) =>
              updateSite({ buildingHeightM: Number(event.target.value) || 1 })
            }
          />
        </label>
      </div>

      <div className="segmented">
        <button
          type="button"
          className={
            activeBuilding.site.splitAxis === 'horizontal'
              ? 'segment active'
              : 'segment'
          }
          onClick={() => updateSite({ splitAxis: 'horizontal' })}
        >
          Top / Bottom
        </button>
        <button
          type="button"
          className={
            activeBuilding.site.splitAxis === 'vertical'
              ? 'segment active'
              : 'segment'
          }
          onClick={() => updateSite({ splitAxis: 'vertical' })}
        >
          Left / Right
        </button>
      </div>

      <div className="segmented">
        <button
          type="button"
          className={activeBuilding.site.yardFirst ? 'segment active' : 'segment'}
          onClick={() => updateSite({ yardFirst: true })}
        >
          Yard first
        </button>
        <button
          type="button"
          className={!activeBuilding.site.yardFirst ? 'segment active' : 'segment'}
          onClick={() => updateSite({ yardFirst: false })}
        >
          Building first
        </button>
      </div>

      {areas ? (
        <ul className="summary-list site-areas">
          <li>
            Yard: {formatArea(areas.yardM2)} ({activeBuilding.site.yardWidthM}×
            {activeBuilding.site.yardHeightM} m)
          </li>
          <li>
            Building: {formatArea(areas.buildingM2)} (
            {activeBuilding.site.buildingWidthM}×
            {activeBuilding.site.buildingHeightM} m)
          </li>
          <li>
            Plot: {areas.plotWidthM}×{areas.plotHeightM} m ·{' '}
            {formatArea(areas.totalM2)}
          </li>
        </ul>
      ) : null}

      <button type="button" className="primary stage-cta" onClick={enterInterior}>
        Enter building →
      </button>
    </section>
  )
}
