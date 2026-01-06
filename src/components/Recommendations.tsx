import React, { useEffect, useState } from 'react'
import axios from 'axios'
import JobDetailModal from './JobDetailModal'
import MarketInsights from './MarketInsights'
import './Recommendations.css'

interface JobDetails {
  company?: string | null
  location?: string | null
  is_remote?: boolean | null
  posted_date?: string | null
  days_posted_ago?: number | null
  industry?: string | null
  url?: string | null
  source?: string | null
  salary_min?: number | null
  salary_max?: number | null
  experience_required?: string | null
  employment_type?: string | null
  experience_level?: string | null
}

interface Recommendation {
  id: number
  role_name: string
  region: string | null
  match_score: number
  demand_score: number
  competition_score: number
  overall_score: number
  explanation: string
  key_skills: string[]
  matched_skills: string[]
  job_details?: JobDetails | null
}

interface RecommendationsProps {
  userId: number
  limit?: number
  showSidebar?: boolean
}

const Recommendations: React.FC<RecommendationsProps> = ({ userId, limit = 10, showSidebar = true }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    fetchRecommendations()
  }, [userId])

  const fetchRecommendations = async () => {
    try {
      const res = await axios.get(`/api/recommendations/${userId}?limit=${limit}`)
      setRecommendations(res.data)
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  // Pagination logic
  const totalPages = Math.ceil(recommendations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRecommendations = recommendations.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      await axios.post(`/api/recommendations/${userId}/refresh`)
      await fetchRecommendations()
    } catch (error) {
      console.error('Error refreshing recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading recommendations...</div>
  }

  if (recommendations.length === 0) {
    return (
      <div className="no-recommendations">
        <p>No recommendations yet. Add skills to your profile to get personalized recommendations!</p>
        <button className="btn" onClick={handleRefresh}>Generate Recommendations</button>
      </div>
    )
  }

  return (
    <div className="recommendations">
      <div className={showSidebar ? "recommendations-layout" : ""}>
        <div className={showSidebar ? "recommendations-main" : ""}>

          <div className="recommendations-list">
        {currentRecommendations.map((rec) => (
          <div 
            key={rec.id} 
            className="recommendation-card clickable"
            onClick={() => setSelectedRole(rec.role_name)}
          >
            {/* Job Posting Section - Most Prominent */}
            {rec.job_details && (
              <div className="job-posting-section">
                <div className="job-posting-header">
                  <div className="job-title-row">
                    <h3 className="job-title">{rec.role_name}</h3>
                    <div className="title-badges">
                      <span className="match-score-badge" title="Match Score: How well your skills and experience align with this role. Higher score means better fit. Based on skill overlap, demand, and competition analysis.">
                        Match: {rec.overall_score.toFixed(0)}%
                        <svg className="badge-info-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </span>
                      {rec.job_details.days_posted_ago !== null && rec.job_details.days_posted_ago !== undefined && (
                        <span className="job-posted-badge">
                          {rec.job_details.days_posted_ago === 0 ? 'Today' :
                           rec.job_details.days_posted_ago === 1 ? '1 day ago' :
                           rec.job_details.days_posted_ago < 7 ? `${rec.job_details.days_posted_ago} days ago` :
                           `${Math.floor(rec.job_details.days_posted_ago / 7)} weeks ago`}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {rec.job_details.company && (
                    <div className="job-company-row">
                      <span className="company-name">{rec.job_details.company}</span>
                      {rec.job_details.industry && (
                        <>
                          <span className="separator-dot">·</span>
                          <span className="company-industry">{rec.job_details.industry}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="job-specs-container">
                  <div className="job-specs-grid">
                    {rec.job_details.location && (
                      <div className="job-spec-item">
                        <svg className="job-spec-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>{rec.job_details.location}</span>
                      </div>
                    )}
                    
                    <div className="job-spec-item">
                      <svg className="job-spec-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {rec.job_details.is_remote ? (
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        ) : (
                          <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                        )}
                      </svg>
                      <span>{rec.job_details.is_remote ? 'Remote' : 'On-site'}</span>
                    </div>

                    {rec.job_details.employment_type && (
                      <div className="job-spec-item">
                        <svg className="job-spec-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>{rec.job_details.employment_type}</span>
                      </div>
                    )}

                    {rec.job_details.experience_level && (
                      <div className="job-spec-item">
                        <svg className="job-spec-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                        </svg>
                        <span>{rec.job_details.experience_level}</span>
                      </div>
                    )}

                    {rec.job_details.salary_min && rec.job_details.salary_max && (
                      <div className="job-spec-item">
                        <svg className="job-spec-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="1" x2="12" y2="23"></line>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        <span>${(rec.job_details.salary_min / 1000).toFixed(0)}K - ${(rec.job_details.salary_max / 1000).toFixed(0)}K/yr</span>
                      </div>
                    )}

                    {rec.job_details.experience_required && (
                      <div className="job-spec-item">
                        <svg className="job-spec-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>{rec.job_details.experience_required}</span>
                      </div>
                    )}
                  </div>
                  {rec.job_details.url && (
                    <a
                      href={rec.job_details.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="job-apply-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                      Apply
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* AI Insight Section - Clearly Labeled */}
            <div className="ai-insight-section">
              <div className="insight-header">
                <span className="insight-label" title="AI Insight: Generated explanation based on your skills, market demand trends, and competition analysis for this specific role.">
                  Why This Role?
                  <svg className="label-info-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </span>
              </div>
              <p className="insight-text">{rec.explanation}</p>
            </div>

            {/* Skills Section */}
            <div className="skills-section">
              <div className="skills-grid">
                <div className="skills-group">
                  <span className="skills-group-label">Your Skills</span>
                  <div className="skills-tags">
                    {rec.matched_skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag matched">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="skills-group">
                  <span className="skills-group-label">Required Skills</span>
                  <div className="skills-tags">
                    {rec.key_skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag required">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                className="pagination-btn"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}

          {selectedRole && (
            <JobDetailModal
              roleName={selectedRole}
              userId={userId}
              onClose={() => setSelectedRole(null)}
            />
          )}
        </div>

        {showSidebar && (
          <div className="recommendations-sidebar">
            <MarketInsights />
          </div>
        )}
      </div>
    </div>
  )
}

export default Recommendations

