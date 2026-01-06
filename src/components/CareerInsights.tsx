import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './CareerInsights.css'

interface CareerInsightsProps {
  userId: number
}

interface CareerAnalysis {
  role_trajectory: string[]
  detected_specialties: string[]
  recommended_pivot: {
    role: string
    location: string
    growth: string
    competition: string
    reasoning: string
  }
  skill_gaps: Array<{
    skill: string
    role: string
    priority: string
    demand_score: number
  }>
  ai_explanation: string
}

const CareerInsights: React.FC<CareerInsightsProps> = ({ userId }) => {
  const [analysis, setAnalysis] = useState<CareerAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalysis = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post(`/api/resume/${userId}/analyze`)
      setAnalysis(res.data.analysis)
    } catch (error: any) {
      console.error('Error fetching career analysis:', error)
      setError(error.response?.data?.detail || 'Failed to analyze career. Please upload a resume first.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalysis()
  }, [userId])

  if (loading) {
    return (
      <div className="career-insights-loading">
        <div className="loading-spinner"></div>
        <p>Analyzing your career trajectory...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="career-insights-error">
        <p>{error}</p>
        <button onClick={fetchAnalysis} className="btn-retry">Try Again</button>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="career-insights-empty">
        <p>Upload a resume to get AI-powered career insights</p>
        <button onClick={fetchAnalysis} className="btn-analyze">Analyze Career</button>
      </div>
    )
  }

  return (
    <div className="career-insights">
      <div className="insights-header">
        <h2>Career Trajectory Analysis</h2>
        <button onClick={fetchAnalysis} className="btn-refresh">Refresh Analysis</button>
      </div>

      {/* AI Explanation - Top */}
      <div className="insight-card explanation full-width">
        <div className="card-content">
          <h3>AI Explanation</h3>
          <p className="explanation-text">{analysis.ai_explanation}</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="insights-two-column">
        {/* Role Trajectory - Left */}
        <div className="insight-card trajectory">
          <div className="card-content">
            <h3>Role Trajectory</h3>
            <div className="trajectory-path">
              {analysis.role_trajectory.map((role, idx) => (
                <React.Fragment key={idx}>
                  <span className="role-badge">{role}</span>
                  {idx < analysis.role_trajectory.length - 1 && (
                    <span className="arrow">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Detected Specialties - Right */}
        <div className="insight-card specialties">
          <div className="card-content">
            <h3>Detected Specialties</h3>
            <div className="specialties-list">
              {analysis.detected_specialties.map((spec, idx) => (
                <span key={idx} className="specialty-tag">{spec}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Pivot */}
      <div className="insight-card pivot">
        <div className="card-content">
          <h3>Recommended Pivot</h3>
          <div className="pivot-details">
            <div className="pivot-role">{analysis.recommended_pivot.role}</div>
            <div className="pivot-location">{analysis.recommended_pivot.location}</div>
            <div className="pivot-metrics">
              <span className="metric growth">{analysis.recommended_pivot.growth} growth</span>
              <span className={`metric competition ${analysis.recommended_pivot.competition}`}>
                {analysis.recommended_pivot.competition} competition
              </span>
            </div>
            <p className="pivot-reasoning">{analysis.recommended_pivot.reasoning}</p>
          </div>
        </div>
      </div>

      {/* Skill Gaps */}
      {analysis.skill_gaps.length > 0 && (
        <div className="insight-card gaps">
          <div className="card-content">
            <h3>Skill Gap Analysis</h3>
            <div className="gaps-list">
              {analysis.skill_gaps.map((gap, idx) => (
                <div key={idx} className="gap-item">
                  <span className="gap-skill">{gap.skill}</span>
                  <span className="gap-role">for {gap.role}</span>
                  <span className={`gap-priority ${gap.priority}`}>{gap.priority}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CareerInsights

