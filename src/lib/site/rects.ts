import type { BuildingSite, Point, Rect } from '../../types'
import { clamp } from '../geometry'
import { MIN_ZONE_M } from '../../types'
import { plotSizeM, siteOrigin, siteScale } from './normalize'

export function sitePlotRect(site: BuildingSite): Rect {
  const scale = siteScale(site)
  const origin = siteOrigin(site, scale)
  const { widthM, heightM } = plotSizeM(site)
  return {
    x: origin.x,
    y: origin.y,
    width: widthM * scale,
    height: heightM * scale,
  }
}

export function yardRect(site: BuildingSite): Rect {
  return zoneRect(site, 'yard')
}

export function buildingRect(site: BuildingSite): Rect {
  return zoneRect(site, 'building')
}

function zoneRect(site: BuildingSite, kind: 'yard' | 'building'): Rect {
  const scale = siteScale(site)
  const plot = sitePlotRect(site)
  const yardW = site.yardWidthM * scale
  const yardH = site.yardHeightM * scale
  const buildingW = site.buildingWidthM * scale
  const buildingH = site.buildingHeightM * scale
  const isYard = kind === 'yard'
  const firstIsYard = site.yardFirst
  const isFirst = isYard === firstIsYard

  if (site.splitAxis === 'horizontal') {
    const width = isYard ? yardW : buildingW
    const height = isYard ? yardH : buildingH
    const firstH = firstIsYard ? yardH : buildingH
    return {
      x: plot.x + (plot.width - width) / 2,
      y: isFirst ? plot.y : plot.y + firstH,
      width,
      height,
    }
  }

  const width = isYard ? yardW : buildingW
  const height = isYard ? yardH : buildingH
  const firstW = firstIsYard ? yardW : buildingW
  return {
    x: isFirst ? plot.x : plot.x + firstW,
    y: plot.y + (plot.height - height) / 2,
    width,
    height,
  }
}

export function siteAreas(site: BuildingSite): {
  totalM2: number
  yardM2: number
  buildingM2: number
  plotWidthM: number
  plotHeightM: number
} {
  const yardM2 = site.yardWidthM * site.yardHeightM
  const buildingM2 = site.buildingWidthM * site.buildingHeightM
  const plot = plotSizeM(site)
  return {
    yardM2,
    buildingM2,
    totalM2: yardM2 + buildingM2,
    plotWidthM: plot.widthM,
    plotHeightM: plot.heightM,
  }
}

export function dividerLine(site: BuildingSite): {
  x1: number
  y1: number
  x2: number
  y2: number
} {
  const plot = sitePlotRect(site)
  const scale = siteScale(site)
  const firstAlong =
    (site.yardFirst
      ? site.splitAxis === 'horizontal'
        ? site.yardHeightM
        : site.yardWidthM
      : site.splitAxis === 'horizontal'
        ? site.buildingHeightM
        : site.buildingWidthM) * scale

  if (site.splitAxis === 'horizontal') {
    const y = plot.y + firstAlong
    return { x1: plot.x, y1: y, x2: plot.x + plot.width, y2: y }
  }

  const x = plot.x + firstAlong
  return { x1: x, y1: plot.y, x2: x, y2: plot.y + plot.height }
}

export function sitePatchFromDivider(
  site: BuildingSite,
  point: Point,
): Partial<BuildingSite> {
  const plot = sitePlotRect(site)
  const scale = siteScale(site)
  const minPx = MIN_ZONE_M * scale

  if (site.splitAxis === 'horizontal') {
    const totalH = site.yardHeightM + site.buildingHeightM
    const firstPx = clamp(point.y - plot.y, minPx, plot.height - minPx)
    const firstM = firstPx / scale
    const secondM = Math.max(MIN_ZONE_M, totalH - firstM)
    if (site.yardFirst) {
      return { yardHeightM: firstM, buildingHeightM: secondM }
    }
    return { buildingHeightM: firstM, yardHeightM: secondM }
  }

  const totalW = site.yardWidthM + site.buildingWidthM
  const firstPx = clamp(point.x - plot.x, minPx, plot.width - minPx)
  const firstM = firstPx / scale
  const secondM = Math.max(MIN_ZONE_M, totalW - firstM)
  if (site.yardFirst) {
    return { yardWidthM: firstM, buildingWidthM: secondM }
  }
  return { buildingWidthM: firstM, yardWidthM: secondM }
}
