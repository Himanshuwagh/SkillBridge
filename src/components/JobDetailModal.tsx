import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './JobDetailModal.css'

interface JobDetailModalProps {
  roleName: string
  userId: number
  onClose: () => void
}

interface CompetitionData {
  role_name: string
  demand: number
  candidates: number
  total_applicants: number
  total_clicks: number
  avg_competition_index: number
  competition_ratio: number
}

const JobDetailModal: React.FC<JobDetailModalProps> = ({ roleName, userId, onClose }) => {
  const [competitionData, setCompetitionData] = useState<CompetitionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)

  useEffect(() => {
    fetchCompetitionData()
  }, [roleName, userId])

  const fetchCompetitionData = async () => {
    try {
      const res = await axios.get(`/api/analytics/${userId}/job-competition/${encodeURIComponent(roleName)}`)
      setCompetitionData(res.data)
    } catch (error) {
      console.error('Error fetching competition data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="loading">Loading competition data...</div>
        </div>
      </div>
    )
  }

  if (!competitionData) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="error">No data available for this role</div>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    )
  }

  const handleTooltipShow = (e: React.MouseEvent, text: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top - 10
    setTooltip({
      text,
      x: Math.max(160, Math.min(x, window.innerWidth - 160)),
      y: Math.max(50, y)
    })
  }

  const handleTooltipHide = () => {
    setTooltip(null)
  }

  // Prepare data for bar chart
  const chartData = [
    {
      name: 'Demand vs Competition',
      'Job Openings': competitionData.demand,
      'Estimated Candidates': competitionData.candidates,
    }
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content job-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Competition Analysis: {competitionData.role_name}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="competition-stats">
            <div className="stat-item">
              <span 
                className="stat-label"
                onMouseEnter={(e) => handleTooltipShow(e, "Job Openings (Demand): The total number of active job postings available for this role. This represents market demand - how many positions employers are actively trying to fill. Higher demand means more opportunities available.")}
                onMouseLeave={handleTooltipHide}
              >
                Job Openings (Demand)
                <svg className="label-info-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </span>
              <span className="stat-value">{competitionData.demand}</span>
            </div>
            <div className="stat-item">
              <span 
                className="stat-label"
                onMouseEnter={(e) => handleTooltipShow(e, "Estimated Candidates (Supply): The estimated number of candidates actively looking for similar roles. This represents market supply - how many people are competing for these positions. Calculated based on profile data, job applications, and market trends.")}
                onMouseLeave={handleTooltipHide}
              >
                Estimated Candidates (Supply)
                <svg className="label-info-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </span>
              <span className="stat-value">{competitionData.candidates.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span 
                className="stat-label"
                onMouseEnter={(e) => handleTooltipShow(e, "Competition Ratio: The number of candidates per job opening (Supply ÷ Demand). Lower ratios indicate better opportunities. For example, a ratio of 5x means 5 candidates are competing for each opening. Ratios below 5 are considered low competition, 5-15 is moderate, and above 15 is high competition.")}
                onMouseLeave={handleTooltipHide}
              >
                Competition Ratio
                <svg className="label-info-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </span>
              <span className="stat-value">{competitionData.competition_ratio}x</span>
            </div>
            <div className="stat-item">
              <span 
                className="stat-label"
                onMouseEnter={(e) => handleTooltipShow(e, "Avg Competition Index: A normalized score (0-100) that measures overall market saturation and competition intensity. Lower scores (0-30) indicate low saturation with favorable conditions. Moderate scores (30-60) show standard market conditions. High scores (60-100) indicate highly competitive markets with many candidates per opportunity.")}
                onMouseLeave={handleTooltipHide}
              >
                Avg Competition Index
                <svg className="label-info-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </span>
              <span className="stat-value">{competitionData.avg_competition_index}/100</span>
            </div>
          </div>

          <div className="chart-container">
            <h3>Demand vs. Candidate Supply</h3>
            <p className="chart-subtitle">
              Comparing the number of job openings (demand) against estimated candidates (supply)
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => value.toLocaleString()}
                />
                <Legend />
                <Bar dataKey="Job Openings" fill="#4CAF50" />
                <Bar dataKey="Estimated Candidates" fill="#FF9800" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="insights">
            <h3>Insights</h3>
            <ul>
              <li>
                <strong>Competition Level:</strong>{' '}
                {competitionData.competition_ratio < 5 
                  ? 'Low - Good opportunity with fewer candidates per opening'
                  : competitionData.competition_ratio < 15
                  ? 'Moderate - Competitive but manageable'
                  : 'High - Many candidates competing for each opening'}
              </li>
              <li>
                <strong>Market Saturation:</strong>{' '}
                {competitionData.avg_competition_index < 30
                  ? 'Low saturation - favorable market conditions'
                  : competitionData.avg_competition_index < 60
                  ? 'Moderate saturation - standard market conditions'
                  : 'High saturation - highly competitive market'}
              </li>
              <li>
                <strong>Total Applicants:</strong> {competitionData.total_applicants.toLocaleString()} across all postings
              </li>
              <li>
                <strong>Total Views:</strong> {competitionData.total_clicks.toLocaleString()} clicks on job postings
              </li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>

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

export default JobDetailModal

