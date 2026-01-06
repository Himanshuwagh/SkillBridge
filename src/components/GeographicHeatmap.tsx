import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import './GeographicHeatmap.css'

interface LocationData {
  location: string
  country_code?: string
  total_jobs: number
  matching_jobs: number
  avg_competition_index: number
  total_applicants: number
}

interface CountryHeatmapData {
  country_code: string
  demand_score: number
  matching_jobs: number
  total_jobs: number
}

interface GeographicHeatmapProps {
  userId: number
}

// City coordinates mapping (major cities from sample data)
const CITY_COORDINATES: Record<string, [number, number]> = {
  'San Francisco, CA': [-122.4194, 37.7749],
  'New York, NY': [-74.0060, 40.7128],
  'Austin, TX': [-97.7431, 30.2672],
  'Seattle, WA': [-122.3321, 47.6062],
  'Boston, MA': [-71.0589, 42.3601],
  'Chicago, IL': [-87.6298, 41.8781],
  'Denver, CO': [-104.9903, 39.7392],
  'Atlanta, GA': [-84.3880, 33.7490],
  'Los Angeles, CA': [-118.2437, 34.0522],
  'London, UK': [-0.1278, 51.5074],
  'Berlin, DE': [13.4050, 52.5200],
  'Paris, FR': [2.3522, 48.8566],
  'Toronto, CA': [-79.3832, 43.6532],
  'Vancouver, CA': [-123.1216, 49.2827],
  'Sydney, AU': [151.2093, -33.8688],
  'Melbourne, AU': [144.9631, -37.8136],
  'Dublin, IE': [-6.2603, 53.3498],
  'Singapore, SG': [103.8198, 1.3521],
  'Bangalore, IN': [77.5946, 12.9716],
  'Cambridge, MA': [-71.1056, 42.3736],
  'San Diego, CA': [-117.1611, 32.7157],
}


const GeographicHeatmap: React.FC<GeographicHeatmapProps> = ({ userId }) => {
  const [locations, setLocations] = useState<LocationData[]>([])
  const [countryHeatmap, setCountryHeatmap] = useState<Record<string, CountryHeatmapData>>({})
  const [loading, setLoading] = useState(true)
  const [hoveredCity, setHoveredCity] = useState<LocationData | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null)
  const [filterType, setFilterType] = useState<'skills' | 'job_profile'>('skills')
  const [searchQuery, setSearchQuery] = useState('')
  const [position, setPosition] = useState({ coordinates: [0, 20] as [number, number], zoom: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    fetchGeographicData()
  }, [userId, filterType, searchQuery])

  // Prevent page scroll when interacting with map
  useEffect(() => {
    const mapElement = document.querySelector('.map-container')
    if (!mapElement) return

    const preventScroll = (e: Event) => {
      const wheelEvent = e as WheelEvent
      // Always prevent scroll when on map container
      wheelEvent.preventDefault()
      wheelEvent.stopPropagation()
      wheelEvent.stopImmediatePropagation()
    }

    const preventTouchScroll = (e: Event) => {
      const touchEvent = e as TouchEvent
      if (mapElement.contains(touchEvent.target as Node)) {
        touchEvent.preventDefault()
        touchEvent.stopPropagation()
      }
    }

    // Use passive: false to allow preventDefault
    mapElement.addEventListener('wheel', preventScroll as EventListener, { passive: false, capture: true })
    mapElement.addEventListener('touchmove', preventTouchScroll as EventListener, { passive: false })

    return () => {
      mapElement.removeEventListener('wheel', preventScroll as EventListener, { capture: true } as any)
      mapElement.removeEventListener('touchmove', preventTouchScroll as EventListener)
    }
  }, [])

  const fetchGeographicData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        filter_type: filterType,
        search_query: searchQuery
      })
      const res = await axios.get(`/api/analytics/${userId}/geographic-demand?${params}`)
      setLocations(res.data.locations || [])
      
      // Convert country heatmap array to object for easy lookup
      const heatmapObj: Record<string, CountryHeatmapData> = {}
      if (res.data.country_heatmap) {
        res.data.country_heatmap.forEach((item: CountryHeatmapData) => {
          heatmapObj[item.country_code] = item
        })
      }
      setCountryHeatmap(heatmapObj)
    } catch (error) {
      console.error('Error fetching geographic data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getHeatmapColor = (demandScore: number): string => {
    // Red (high demand) -> Yellow -> Green/White (low demand)
    if (demandScore >= 70) return '#F44336' // Red - High demand
    if (demandScore >= 50) return '#FF9800' // Orange
    if (demandScore >= 30) return '#FFC107' // Yellow
    if (demandScore >= 10) return '#8BC34A' // Light green
    return '#E8F5E9' // Very light green/white - Low demand
  }

  const getMarkerSize = (matchingJobs: number, maxJobs: number) => {
    if (maxJobs === 0) return 4
    const ratio = matchingJobs / maxJobs
    return Math.max(6, Math.min(20, 6 + ratio * 14))
  }

  const getMarkerColor = (matchingJobs: number, maxJobs: number) => {
    if (maxJobs === 0) return '#9e9e9e'
    const intensity = matchingJobs / maxJobs
    if (intensity > 0.7) return '#4CAF50'
    if (intensity > 0.4) return '#FFC107'
    if (intensity > 0.1) return '#FF9800'
    return '#9e9e9e'
  }

  const handleMarkerMouseEnter = (location: LocationData, event: React.MouseEvent) => {
    setHoveredCity(location)
    setTooltipPosition({ x: event.clientX, y: event.clientY })
  }

  const handleMarkerMouseMove = (event: React.MouseEvent) => {
    if (hoveredCity) {
      setTooltipPosition({ x: event.clientX, y: event.clientY })
    }
  }

  const handleMarkerMouseLeave = () => {
    setHoveredCity(null)
    setTooltipPosition(null)
  }

  const handleGeographyClick = useCallback((geo: any) => {
    // Center map on clicked country with smooth zoom
    const [x, y] = geo.properties.centroid || [0, 0]
    setPosition(prev => ({
      coordinates: [x, y],
      zoom: Math.min(prev.zoom * 1.8, 6)
    }))
  }, [])

  // Mouse wheel zoom - prevent page scroll
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setPosition(prev => ({
      ...prev,
      zoom: Math.max(0.5, Math.min(8, prev.zoom * delta))
    }))
  }, [])

  // Drag/pan functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && dragStart) {
      e.preventDefault()
      e.stopPropagation()
      const dx = (e.clientX - dragStart.x) / (150 * position.zoom)
      const dy = (e.clientY - dragStart.y) / (150 * position.zoom)
      setPosition(prev => ({
        ...prev,
        coordinates: [
          prev.coordinates[0] - dx,
          prev.coordinates[1] + dy
        ] as [number, number]
      }))
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }, [isDragging, dragStart, position.zoom])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragStart(null)
  }, [])

  // Touch support for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging && dragStart && e.touches.length === 1) {
      e.preventDefault()
      e.stopPropagation()
      const dx = (e.touches[0].clientX - dragStart.x) / (150 * position.zoom)
      const dy = (e.touches[0].clientY - dragStart.y) / (150 * position.zoom)
      setPosition(prev => ({
        ...prev,
        coordinates: [
          prev.coordinates[0] - dx,
          prev.coordinates[1] + dy
        ] as [number, number]
      }))
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
    }
  }, [isDragging, dragStart, position.zoom])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    setDragStart(null)
  }, [])

  const maxMatchingJobs = Math.max(...locations.map(l => l.matching_jobs), 1)

  if (loading) {
    return (
      <div className="geographic-heatmap">
        <h2>Geographic Demand Heatmap</h2>
        <div className="loading">Loading geographic data...</div>
      </div>
    )
  }

  return (
    <div className="geographic-heatmap">
      <div className="heatmap-header">
        <h2>Geographic Demand Heatmap</h2>
        <p className="subtitle">
          Hover over cities to see job demand analytics • 
          Scroll to zoom • Drag to pan • Click countries to zoom in
        </p>
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        <div className="toggle-group">
          <button
            className={`toggle-btn ${filterType === 'skills' ? 'active' : ''}`}
            onClick={() => {
              setFilterType('skills')
              setSearchQuery('')
            }}
          >
            Skills Based
          </button>
          <button
            className={`toggle-btn ${filterType === 'job_profile' ? 'active' : ''}`}
            onClick={() => {
              setFilterType('job_profile')
              setSearchQuery('')
            }}
          >
            Job Profile Based
          </button>
        </div>

        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder={filterType === 'skills' 
              ? 'Search by skills (e.g., Python, React, AWS)' 
              : 'Search by job profile (e.g., Data Engineer, ML Engineer)'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="clear-btn"
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="legend">
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#F44336' }}></span>
          <span>High Demand (70-100)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#FF9800' }}></span>
          <span>Medium-High (50-70)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#FFC107' }}></span>
          <span>Medium (30-50)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#8BC34A' }}></span>
          <span>Low-Medium (10-30)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#E8F5E9' }}></span>
          <span>Low Demand (0-10)</span>
        </div>
      </div>


      <div 
        className="map-container"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={(e) => e.preventDefault()} // Prevent right-click menu
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <ComposableMap
          projectionConfig={{
            scale: 150 * position.zoom,
            center: position.coordinates as [number, number]
          }}
          style={{ 
            width: '100%', 
            height: '500px',
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
          }}
        >
          <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                // Try ISO_A3 first (3-letter), then ISO_A2 (2-letter)
                const isoA3 = geo.properties.ISO_A3
                const isoA2 = geo.properties.ISO_A2
                const countryData = countryHeatmap[isoA3] || countryHeatmap[isoA2] || {}
                const demandScore = countryData.demand_score || 0
                const fillColor = getHeatmapColor(demandScore)
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: { 
                        outline: 'none',
                        fill: fillColor,
                        stroke: '#FFFFFF',
                        strokeWidth: 0.5,
                        transition: 'fill 0.2s ease, stroke 0.2s ease'
                      },
                      hover: { 
                        fill: '#2196F3',
                        stroke: '#1976D2',
                        strokeWidth: 1.5,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      },
                      pressed: { 
                        outline: 'none',
                        fill: '#1976D2',
                        stroke: '#1565C0',
                        strokeWidth: 2
                      }
                    }}
                    onClick={() => handleGeographyClick(geo)}
                  />
                )
              })
            }
          </Geographies>
          
          {locations
            .filter(loc => CITY_COORDINATES[loc.location])
            .map((location, idx) => {
              const coordinates = CITY_COORDINATES[location.location] as [number, number]
              const markerSize = getMarkerSize(location.matching_jobs, maxMatchingJobs)
              const markerColor = getMarkerColor(location.matching_jobs, maxMatchingJobs)
              
              return (
                <Marker
                  key={idx}
                  coordinates={coordinates}
                  onMouseEnter={(e: React.MouseEvent) => handleMarkerMouseEnter(location, e)}
                  onMouseMove={(e: React.MouseEvent) => handleMarkerMouseMove(e)}
                  onMouseLeave={handleMarkerMouseLeave}
                >
                  <g>
                    <circle
                      r={markerSize * 1.3}
                      fill={markerColor}
                      opacity={0.2}
                      style={{ 
                        cursor: 'pointer',
                        transition: 'r 0.2s ease, opacity 0.2s ease'
                      }}
                    />
                    <circle
                      r={markerSize}
                      fill={markerColor}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      style={{ 
                        cursor: 'pointer',
                        transition: 'r 0.2s ease, fill 0.2s ease',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                      }}
                      onMouseEnter={(e: React.MouseEvent<SVGCircleElement>) => {
                        e.currentTarget.setAttribute('r', String(markerSize * 1.2))
                        e.currentTarget.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                      }}
                      onMouseLeave={(e: React.MouseEvent<SVGCircleElement>) => {
                        e.currentTarget.setAttribute('r', String(markerSize))
                        e.currentTarget.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                      }}
                    />
                  </g>
                </Marker>
              )
            })}
        </ComposableMap>

        {hoveredCity && tooltipPosition && (
          <div
            className="city-tooltip"
            style={{
              left: `${tooltipPosition.x + 10}px`,
              top: `${tooltipPosition.y - 10}px`,
            }}
          >
            <div className="tooltip-header">
              <h3>{hoveredCity.location}</h3>
              <div className="tooltip-badge">
                {hoveredCity.matching_jobs} matching jobs
              </div>
            </div>
            <div className="tooltip-stats">
              <div className="tooltip-stat">
                <span className="tooltip-label">Total Jobs:</span>
                <span className="tooltip-value">{hoveredCity.total_jobs}</span>
              </div>
              <div className="tooltip-stat">
                <span className="tooltip-label">Matching Jobs:</span>
                <span className="tooltip-value highlight">{hoveredCity.matching_jobs}</span>
              </div>
              <div className="tooltip-stat">
                <span className="tooltip-label">Avg Competition:</span>
                <span className="tooltip-value">
                  {hoveredCity.avg_competition_index.toFixed(1)}/100
                </span>
              </div>
              <div className="tooltip-stat">
                <span className="tooltip-label">Total Applicants:</span>
                <span className="tooltip-value">
                  {hoveredCity.total_applicants.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="cities-list">
        <h3>All Locations ({locations.length})</h3>
        <div className="cities-grid">
          {locations.map((location, idx) => {
            const markerColor = getMarkerColor(location.matching_jobs, maxMatchingJobs)
            const compColor = location.avg_competition_index < 30 ? '#4CAF50' 
              : location.avg_competition_index < 60 ? '#FFC107' : '#F44336'
            
            return (
              <div
                key={idx}
                className="city-card"
                style={{ borderLeftColor: markerColor }}
              >
                <div className="city-card-header">
                  <h4>{location.location}</h4>
                  <span className="city-badge" style={{ background: markerColor }}>
                    {location.matching_jobs}
                  </span>
                </div>
                <div className="city-card-stats">
                  <span>Jobs: {location.total_jobs}</span>
                  <span style={{ color: compColor }}>
                    Comp: {location.avg_competition_index.toFixed(1)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default GeographicHeatmap
