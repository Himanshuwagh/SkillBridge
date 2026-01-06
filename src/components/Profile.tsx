import React, { useEffect, useState } from 'react'
import axios from 'axios'
import ResumeUpload from './ResumeUpload'
import SocialHandles from './SocialHandles'
import CareerInsights from './CareerInsights'
import MarketInsights from './MarketInsights'
import './Profile.css'

interface Skill {
  skill_name: string
  proficiency_level: string
  years_experience: number
}

interface ProfileProps {
  userId: number
}

const Profile: React.FC<ProfileProps> = ({ userId }) => {
  const [skills, setSkills] = useState<Skill[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAllSkills, setShowAllSkills] = useState(false)
  const [showAddSkill, setShowAddSkill] = useState(false)

  useEffect(() => {
    fetchSkills()
  }, [userId])

  const fetchSkills = async () => {
    try {
      const res = await axios.get(`/api/users/${userId}/skills`)
      setSkills(res.data)
    } catch (error) {
      console.error('Error fetching skills:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSkill.trim()) {
      setShowAddSkill(false)
      return
    }

    try {
      await axios.post(`/api/users/${userId}/skills`, {
        skill_name: newSkill,
        proficiency_level: 'intermediate',
        years_experience: 0
      })
      setNewSkill('')
      setShowAddSkill(false)
      fetchSkills()
      // Refresh page to update analytics
      window.location.reload()
    } catch (error) {
      console.error('Error adding skill:', error)
      alert('Error adding skill. Please try again.')
    }
  }

  const handleCancelAdd = () => {
    setNewSkill('')
    setShowAddSkill(false)
  }

  if (loading) {
    return <div className="loading">Loading profile...</div>
  }

  return (
    <div className="profile">
      <div className="profile-header">
        <h1>Profile</h1>
        <p>Manage your skills and resume</p>
      </div>

      {/* Career Trajectory Analysis - Top Section */}
      <div className="profile-card career-insights-card">
        <CareerInsights userId={userId} />
      </div>

      {/* AI Powered Labor Market Insights */}
      <div className="profile-card market-insights-card">
        <div className="market-insights-header">
          <h2>AI Powered Labor Market</h2>
          <p className="market-insights-subtitle">Real-time analysis of skills demand, competition, and opportunities</p>
        </div>
        <MarketInsights fullWidth={true} />
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <ResumeUpload userId={userId} />
        </div>

        <div className="profile-card">
          <div className="card-header">
            <h2>Skills</h2>
            <span className="skill-count">{skills.length}</span>
          </div>
          
        {skills.length === 0 ? (
            <div className="empty-state">
              <p>No skills yet. Add skills manually or upload your resume.</p>
            </div>
        ) : (
            <>
              <div className="skills-grid">
                {(showAllSkills ? skills : skills.slice(0, 10)).map((skill, idx) => (
                  <div key={idx} className="skill-badge">
                    <span className="skill-name">{skill.skill_name}</span>
                    <span className="skill-meta">
                      <span className="skill-level-badge">{skill.proficiency_level}</span>
                  {skill.years_experience > 0 && (
                        <span className="skill-years-badge">{skill.years_experience}y</span>
                      )}
                    </span>
              </div>
            ))}
          </div>
              {skills.length > 10 && (
                <button
                  type="button"
                  className="show-more-btn"
                  onClick={() => setShowAllSkills(!showAllSkills)}
                >
                  {showAllSkills ? `Show Less` : `Show All (${skills.length})`}
                </button>
              )}
            </>
        )}

          {showAddSkill ? (
        <form onSubmit={handleAddSkill} className="add-skill-form">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Enter skill name and press Enter..."
            className="skill-input"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    handleCancelAdd()
                  }
                }}
          />
              <div className="add-skill-actions">
                <button type="button" className="btn-cancel-skill" onClick={handleCancelAdd}>
                  Cancel
                </button>
              </div>
        </form>
          ) : (
            <button
              type="button"
              className="btn-show-add-skill"
              onClick={() => setShowAddSkill(true)}
            >
              + Add Skill
            </button>
          )}
        </div>

        <div className="profile-card">
          <SocialHandles userId={userId} />
        </div>
      </div>
    </div>
  )
}

export default Profile

