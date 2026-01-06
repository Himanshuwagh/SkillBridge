import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Recommendations from './Recommendations'
import GeographicHeatmap from './GeographicHeatmap'
import MarketInsights from './MarketInsights'
import './Dashboard.css'

interface DashboardProps {
  userId: number
}

interface Analytics {
  skill_count: number
  recommendations_count: number
  average_match_score: number
  matching_jobs: number
  top_skills_to_learn: Array<{name: string, demand_score: number, job_count: number}>
  profile_completion: number
}

const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const userName = localStorage.getItem('userName') || 'User'

  useEffect(() => {
    fetchAnalytics()
  }, [userId])

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`/api/analytics/${userId}/stats`)
      setAnalytics(res.data)
    } catch (err) {
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      await axios.post(`/api/recommendations/${userId}/refresh`)
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      console.error('Error refreshing recommendations:', error)
    }
  }

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {userName}</h1>
        <p>Your personalized job matching dashboard</p>
      </div>

      {analytics && (
        <div className="dashboard-layout">
          <div className="dashboard-main">
            <div className="card">
              <div className="card-header-with-action">
                <h2>Personalized Top Recommendations</h2>
                <button className="btn" onClick={handleRefresh}>
                  Refresh
                </button>
              </div>
              <p className="card-subtitle">Roles based on your skills</p>
              <Recommendations key={refreshKey} userId={userId} limit={20} showSidebar={false} />
            </div>

            <div className="card">
              <GeographicHeatmap userId={userId} />
            </div>
          </div>

          <div className="dashboard-sidebar">
            <MarketInsights />
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard

