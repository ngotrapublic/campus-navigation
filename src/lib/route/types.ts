import type { Point } from '../../types'

export type RouteDestination =
  | { type: 'room'; id: string; label: string; floorId: string }
  | { type: 'elevator'; id: string; label: string }

export type RouteLeg = {
  floorId: string
  floorName: string
  points: Point[]
  note?: string
}

export type NavRoute = {
  legs: RouteLeg[]
  summary: string
}
