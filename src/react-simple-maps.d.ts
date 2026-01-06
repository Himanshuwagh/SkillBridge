declare module 'react-simple-maps' {
  import { ReactNode, MouseEvent } from 'react'
  
  export interface ComposableMapProps {
    projectionConfig?: {
      scale?: number
      center?: [number, number]
    }
    style?: React.CSSProperties
    children?: ReactNode
  }
  
  export interface GeographyProps {
    geography: any
    style?: {
      default?: React.CSSProperties
      hover?: React.CSSProperties
      pressed?: React.CSSProperties
    }
    onClick?: (event: MouseEvent) => void
    onMouseEnter?: (event: MouseEvent) => void
  }
  
  export interface MarkerProps {
    coordinates: [number, number]
    onMouseEnter?: (event: MouseEvent) => void
    onMouseMove?: (event: MouseEvent) => void
    onMouseLeave?: () => void
    children?: ReactNode
  }
  
  export interface GeographiesProps {
    geography: string
    children: (args: { geographies: any[] }) => ReactNode
  }
  
  export const ComposableMap: React.FC<ComposableMapProps>
  export const Geographies: React.FC<GeographiesProps>
  export const Geography: React.FC<GeographyProps>
  export const Marker: React.FC<MarkerProps>
}

