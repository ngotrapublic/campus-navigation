import type { BuildingSite, Point } from '../../types'
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DEFAULT_SITE,
  MIN_ZONE_M,
} from '../../types'
import { clamp } from '../geometry'

type LegacySite = Partial<BuildingSite> & {
  widthM?: number
  heightM?: number
  splitRatio?: number
}

export function plotSizeM(site: BuildingSite): { widthM: number; heightM: number } {
  if (site.splitAxis === 'horizontal') {
    return {
      widthM: Math.max(site.yardWidthM, site.buildingWidthM),
      heightM: site.yardHeightM + site.buildingHeightM,
    }
  }
  return {
    widthM: site.yardWidthM + site.buildingWidthM,
    heightM: Math.max(site.yardHeightM, site.buildingHeightM),
  }
}

export function normalizeSite(site?: LegacySite | null): BuildingSite {
  if (
    site &&
    typeof site.yardWidthM === 'number' &&
    typeof site.yardHeightM === 'number' &&
    typeof site.buildingWidthM === 'number' &&
    typeof site.buildingHeightM === 'number'
  ) {
    return {
      splitAxis: site.splitAxis ?? DEFAULT_SITE.splitAxis,
      yardFirst: site.yardFirst ?? DEFAULT_SITE.yardFirst,
      yardWidthM: Math.max(MIN_ZONE_M, site.yardWidthM),
      yardHeightM: Math.max(MIN_ZONE_M, site.yardHeightM),
      buildingWidthM: Math.max(MIN_ZONE_M, site.buildingWidthM),
      buildingHeightM: Math.max(MIN_ZONE_M, site.buildingHeightM),
    }
  }

  const widthM = Math.max(MIN_ZONE_M, site?.widthM ?? DEFAULT_SITE.yardWidthM)
  const heightM = Math.max(
    MIN_ZONE_M * 2,
    site?.heightM ?? DEFAULT_SITE.yardHeightM + DEFAULT_SITE.buildingHeightM,
  )
  const ratio = clamp(site?.splitRatio ?? 0.35, 0.15, 0.85)
  const axis = site?.splitAxis ?? DEFAULT_SITE.splitAxis
  const yardFirst = site?.yardFirst ?? DEFAULT_SITE.yardFirst

  if (axis === 'horizontal') {
    const firstH = Math.max(MIN_ZONE_M, heightM * ratio)
    const secondH = Math.max(MIN_ZONE_M, heightM - firstH)
    return {
      splitAxis: 'horizontal',
      yardFirst,
      yardWidthM: widthM,
      yardHeightM: yardFirst ? firstH : secondH,
      buildingWidthM: widthM,
      buildingHeightM: yardFirst ? secondH : firstH,
    }
  }

  const firstW = Math.max(MIN_ZONE_M, widthM * ratio)
  const secondW = Math.max(MIN_ZONE_M, widthM - firstW)
  return {
    splitAxis: 'vertical',
    yardFirst,
    yardWidthM: yardFirst ? firstW : secondW,
    yardHeightM: heightM,
    buildingWidthM: yardFirst ? secondW : firstW,
    buildingHeightM: heightM,
  }
}

export function siteScale(site: BuildingSite): number {
  const { widthM, heightM } = plotSizeM(site)
  const pad = 48
  const usableW = CANVAS_WIDTH - pad * 2
  const usableH = CANVAS_HEIGHT - pad * 2
  return Math.min(usableW / widthM, usableH / heightM)
}

export function siteOrigin(site: BuildingSite, scale: number): Point {
  const { widthM, heightM } = plotSizeM(site)
  return {
    x: (CANVAS_WIDTH - widthM * scale) / 2,
    y: (CANVAS_HEIGHT - heightM * scale) / 2,
  }
}
