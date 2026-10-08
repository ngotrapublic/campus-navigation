import type { BuildingSite, Rect } from '../../types'
import { buildingRect } from './rects'

export type YardDirection = 'top' | 'bottom' | 'left' | 'right'

export function yardDirection(site: BuildingSite): YardDirection {
  if (site.splitAxis === 'horizontal') {
    return site.yardFirst ? 'top' : 'bottom'
  }
  return site.yardFirst ? 'left' : 'right'
}

export function yardDirectionLabel(direction: YardDirection): string {
  switch (direction) {
    case 'top':
      return 'Yard is above'
    case 'bottom':
      return 'Yard is below'
    case 'left':
      return 'Yard is to the left'
    case 'right':
      return 'Yard is to the right'
  }
}

export function interiorViewBox(site: BuildingSite, pad = 48): Rect {
  const bounds = buildingRect(site)
  return {
    x: bounds.x - pad,
    y: bounds.y - pad,
    width: bounds.width + pad * 2,
    height: bounds.height + pad * 2,
  }
}
