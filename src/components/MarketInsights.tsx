import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './MarketInsights.css'

interface MarketInsight {
  skill: string
  country: string
  state?: string | null
  job_postings_last_10d: number
  job_postings_prev_30d: number
  local_candidates: number
  global_candidates_est: number
  region_competition_index: string
  demand_trend: string
  title_focus: string
  insight: string
  generated_at: string
}

interface InsightFilters {
  keywords: string[]
  skills: string[]
  job_titles: string[]
  companies: string[]
  countries: string[]
  states: string[]
  country_states: { [country: string]: string[] }
}

interface MarketInsightsProps {
  fullWidth?: boolean
}

// Helper function to generate competition level tooltip
const getCompetitionTooltip = (competitionLevel: string): string => {
  const level = competitionLevel.toLowerCase()
  if (level.includes('very low')) {
    return 'Very Low Competition: Exceptionally favorable market conditions with very few candidates competing for roles. This represents the top 10-20% of opportunities where demand significantly outweighs supply. Excellent opportunity to stand out.'
  } else if (level.includes('low')) {
    return 'Low Competition: Favorable market conditions with relatively few candidates per job opening. This indicates good opportunities where your skills can make a strong impact. Lower competition means better chances of landing interviews and offers.'
  } else if (level.includes('moderate')) {
    return 'Moderate Competition: Standard market conditions with balanced supply and demand. There are opportunities available, but you\'ll need to differentiate yourself through skills, experience, and strong applications.'
  } else if (level.includes('high')) {
    return 'High Competition: More candidates are competing for each role. Consider building additional specialized skills or targeting niche areas to stand out. Focus on demonstrating unique value and expertise.'
  } else if (level.includes('very high')) {
    return 'Very High Competition: Highly competitive market with many candidates per opening. Consider upskilling in specialized areas, building a strong portfolio, or exploring adjacent roles with better market conditions.'
  }
  return 'Competition Level: Indicates how many candidates are competing for similar roles in this location. Lower competition means better opportunities and higher chances of success.'
}

const MarketInsights: React.FC<MarketInsightsProps> = ({ fullWidth = false }) => {
  const [insights, setInsights] = useState<MarketInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [availableFilters, setAvailableFilters] = useState<InsightFilters>({ 
    keywords: [], 
    skills: [], 
    job_titles: [], 
    companies: [], 
    countries: [], 
    states: [],
    country_states: {}
  })
  const [selectedKeyword, setSelectedKeyword] = useState<string>('')
  const [keywordInput, setKeywordInput] = useState<string>('')
  const [showKeywordDropdown, setShowKeywordDropdown] = useState<boolean>(false)
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [selectedState, setSelectedState] = useState<string>('')
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)

  useEffect(() => {
    fetchFilters()
    fetchInsights()
  }, [])

  useEffect(() => {
    fetchInsights()
  }, [selectedKeyword, selectedCountry, selectedState])

  // Filter keywords based on input
  const filteredKeywords = availableFilters.keywords.filter(keyword =>
    keyword.toLowerCase().includes(keywordInput.toLowerCase())
  ).slice(0, 10) // Limit to 10 suggestions

  const fetchFilters = async () => {
    try {
      const res = await axios.get('/api/insights/market-insights/filters')
      setAvailableFilters(res.data)
    } catch (error) {
      console.error('Error fetching filters:', error)
    }
  }

  const fetchInsights = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (selectedKeyword) params.keyword = selectedKeyword
      if (selectedCountry) params.country = selectedCountry
      if (selectedState) params.state = selectedState
      
      const res = await axios.get('/api/insights/market-insights', { params })
      setInsights(res.data)
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeywordSelect = (keyword: string) => {
    setSelectedKeyword(keyword)
    setKeywordInput(keyword)
    setShowKeywordDropdown(false)
  }

  const clearFilters = () => {
    setSelectedKeyword('')
    setKeywordInput('')
    setSelectedCountry('')
    setSelectedState('')
  }

  // Get available states for selected country
  const availableStates = selectedCountry && availableFilters.country_states[selectedCountry]
    ? availableFilters.country_states[selectedCountry]
    : []

  const handleTooltipShow = (e: React.MouseEvent, text: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top - 10
    setTooltip({
      text,
      x: Math.max(160, Math.min(x, window.innerWidth - 160)), // Keep tooltip within screen bounds
      y: Math.max(50, y) // Keep tooltip within screen bounds
    })
  }

  const handleTooltipHide = () => {
    setTooltip(null)
  }

  return (
    <div className={`market-insights-sidebar${fullWidth ? ' full-width' : ''}`}>
      <div className="insights-header">
        <div className="insights-title-section">
          <svg className="insights-title-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <h2>Market Insights</h2>
        </div>
        <p className="insights-subtitle">AI-powered labor market analysis</p>
      </div>

      <div className="insights-filters">
        <div className="filter-group">
          <label className="filter-label">Skill / Job Profile / Keyword</label>
          <div className="autocomplete-wrapper">
            <input
              type="text"
              className="filter-input"
              placeholder="Type to search skills, job titles, companies..."
              value={keywordInput}
              onChange={(e) => {
                setKeywordInput(e.target.value)
                setShowKeywordDropdown(true)
                if (!e.target.value) {
                  setSelectedKeyword('')
                }
              }}
              onFocus={() => setShowKeywordDropdown(true)}
              onBlur={() => {
                // Delay to allow click on dropdown item
                setTimeout(() => setShowKeywordDropdown(false), 200)
              }}
            />
            {showKeywordDropdown && keywordInput && filteredKeywords.length > 0 && (
              <div className="autocomplete-dropdown">
                {filteredKeywords.map((keyword, idx) => (
                  <div
                    key={idx}
                    className="autocomplete-item"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleKeywordSelect(keyword)
                    }}
                  >
                    {keyword}
                  </div>
                ))}
              </div>
            )}
            {selectedKeyword && (
              <button
                className="clear-keyword-btn"
                onClick={() => {
                  setSelectedKeyword('')
                  setKeywordInput('')
                }}
                type="button"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Country</label>
          <select
            className="filter-select"
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value)
              setSelectedState('') // Reset state when country changes
            }}
          >
            <option value="">All Countries</option>
            {availableFilters.countries.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">State/Province</label>
          <select
            className="filter-select"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            disabled={!selectedCountry || availableStates.length === 0}
          >
            <option value="">All States/Provinces</option>
            {availableStates.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          {selectedCountry && availableStates.length === 0 && (
            <span className="filter-hint">No states/provinces available for this country</span>
          )}
        </div>

        {(selectedKeyword || selectedCountry || selectedState) && (
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="insights-loading">Loading insights...</div>
      ) : insights.length === 0 ? (
        <div className="insights-empty">
          <p>No insights available for selected filters.</p>
        </div>
      ) : (
        <div className="insights-list">
          {insights.map((insight, idx) => (
            <div key={idx} className="insight-card">
              <div className="insight-header">
                <div className="insight-skill-region">
                  <span className="insight-skill">{insight.skill}</span>
                  <span className="insight-location">
                    {insight.country === 'Unknown' || !insight.country 
                      ? 'Global' 
                      : insight.state 
                        ? `${insight.state}, ${insight.country}` 
                        : insight.country}
                  </span>
                </div>
                <span 
                  className={`competition-badge ${insight.region_competition_index.replace(' ', '-')}`}
                  onMouseEnter={(e) => handleTooltipShow(e, getCompetitionTooltip(insight.region_competition_index))}
                  onMouseLeave={handleTooltipHide}
                >
                  {insight.region_competition_index}
                  <svg 
                    className="badge-info-icon" 
                    width="10" 
                    height="10" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5"
                    onMouseEnter={(e) => handleTooltipShow(e, getCompetitionTooltip(insight.region_competition_index))}
                    onMouseLeave={handleTooltipHide}
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </span>
              </div>

              <p className="insight-text">{insight.insight}</p>

              <div className="insight-metrics">
                <div className="insight-metric">
                  <span 
                    className="metric-label"
                    onMouseEnter={(e) => handleTooltipShow(e, "Demand Trend: Shows the percentage change in job postings over the last 30 days. A positive value (+) indicates growing demand and increasing opportunities. A negative value (-) indicates declining demand. This metric helps identify trending skills in the market.")}
                    onMouseLeave={handleTooltipHide}
                  >
                    Trend
                    <svg 
                      className="label-info-icon" 
                      width="9" 
                      height="9" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5"
                      onMouseEnter={(e) => handleTooltipShow(e, "Demand Trend: Shows the percentage change in job postings over the last 30 days. A positive value (+) indicates growing demand and increasing opportunities. A negative value (-) indicates declining demand. This metric helps identify trending skills in the market.")}
                      onMouseLeave={handleTooltipHide}
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </span>
                  <span className={`metric-value trend-${insight.demand_trend.startsWith('+') ? 'up' : 'down'}`}>
                    {insight.demand_trend}
                  </span>
                </div>
                <div className="insight-metric">
                  <span 
                    className="metric-label"
                    onMouseEnter={(e) => handleTooltipShow(e, "Job Postings: The total number of active job postings in the last 10 days for this specific skill and location combination. Higher numbers indicate more opportunities available. This is a key metric for assessing market activity and job availability.")}
                    onMouseLeave={handleTooltipHide}
                  >
                    Postings
                    <svg 
                      className="label-info-icon" 
                      width="9" 
                      height="9" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5"
                      onMouseEnter={(e) => handleTooltipShow(e, "Job Postings: The total number of active job postings in the last 10 days for this specific skill and location combination. Higher numbers indicate more opportunities available. This is a key metric for assessing market activity and job availability.")}
                      onMouseLeave={handleTooltipHide}
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </span>
                  <span className="metric-value">{insight.job_postings_last_10d}</span>
                </div>
                <div className="insight-metric">
                  <span 
                    className="metric-label"
                    onMouseEnter={(e) => handleTooltipShow(e, "Primary Role: The most common job title or role that requires this skill in the specified location. This helps you understand which specific positions are actively hiring for this skill set. Useful for targeting your job search and resume optimization.")}
                    onMouseLeave={handleTooltipHide}
                  >
                    Role
                    <svg 
                      className="label-info-icon" 
                      width="9" 
                      height="9" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5"
                      onMouseEnter={(e) => handleTooltipShow(e, "Primary Role: The most common job title or role that requires this skill in the specified location. This helps you understand which specific positions are actively hiring for this skill set. Useful for targeting your job search and resume optimization.")}
                      onMouseLeave={handleTooltipHide}
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </span>
                  <span className="metric-value-small">
                    {insight.title_focus}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tooltip && (
        <div
          className="info-tooltip"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}

export default MarketInsights

