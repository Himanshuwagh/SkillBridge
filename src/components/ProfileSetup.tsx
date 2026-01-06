import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './ProfileSetup.css'

const ProfileSetup: React.FC = () => {
  const [step, setStep] = useState(1)
  const [preferredLocations, setPreferredLocations] = useState<string[]>([])
  const [preferredIndustries, setPreferredIndustries] = useState<string[]>([])
  const [openToRemote, setOpenToRemote] = useState(true)
  const [skills, setSkills] = useState<Array<{name: string, level: string, years: number}>>([])
  const [newSkill, setNewSkill] = useState('')
  const [skillLevel, setSkillLevel] = useState('intermediate')
  const [skillYears, setSkillYears] = useState(0)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const userId = localStorage.getItem('userId')

  const locations = ['San Francisco', 'New York', 'Remote', 'Boston', 'Seattle', 'Austin', 'London', 'Berlin']
  const industries = ['Technology', 'Data', 'AI', 'Web Development', 'Cloud', 'DevOps', 'Research']

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.find(s => s.name.toLowerCase() === newSkill.toLowerCase())) {
      setSkills([...skills, { name: newSkill, level: skillLevel, years: skillYears }])
      setNewSkill('')
      setSkillYears(0)
    }
  }

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

  const handleComplete = async () => {
    if (!userId) {
      navigate('/login')
      return
    }

    setLoading(true)
    try {
      // Update profile preferences
      await axios.put(`/api/users/${userId}`, {
        id: parseInt(userId),
        email: localStorage.getItem('userEmail') || '',
        name: localStorage.getItem('userName') || '',
        preferred_locations: preferredLocations,
        preferred_industries: preferredIndustries,
        open_to_remote: openToRemote
      })

      // Add skills
      for (const skill of skills) {
        await axios.post(`/api/users/${userId}/skills`, {
          skill_name: skill.name,
          proficiency_level: skill.level,
          years_experience: skill.years
        })
      }

      navigate('/dashboard')
    } catch (error) {
      console.error('Error completing profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!userId) {
    return <div>Please login first</div>
  }

  return (
    <div className="profile-setup">
      <div className="setup-container">
        <div className="setup-header">
          <h1>Complete Your Profile</h1>
          <p>Help us personalize your job recommendations</p>
        </div>

        <div className="progress-bar">
          <div className="progress-step" data-active={step >= 1}>
            <div className="step-number">1</div>
            <div className="step-label">Preferences</div>
          </div>
          <div className="progress-line" data-active={step >= 2}></div>
          <div className="progress-step" data-active={step >= 2}>
            <div className="step-number">2</div>
            <div className="step-label">Skills</div>
          </div>
        </div>

        {step === 1 && (
          <div className="setup-step">
            <h2>Job Preferences</h2>
            
            <div className="form-section">
              <label>Preferred Locations (select all that apply)</label>
              <div className="checkbox-group">
                {locations.map(loc => (
                  <label key={loc} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={preferredLocations.includes(loc)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPreferredLocations([...preferredLocations, loc])
                        } else {
                          setPreferredLocations(preferredLocations.filter(l => l !== loc))
                        }
                      }}
                    />
                    <span>{loc}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label>Preferred Industries</label>
              <div className="checkbox-group">
                {industries.map(ind => (
                  <label key={ind} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={preferredIndustries.includes(ind)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPreferredIndustries([...preferredIndustries, ind])
                        } else {
                          setPreferredIndustries(preferredIndustries.filter(i => i !== ind))
                        }
                      }}
                    />
                    <span>{ind}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label className="switch-label">
                <input
                  type="checkbox"
                  checked={openToRemote}
                  onChange={(e) => setOpenToRemote(e.target.checked)}
                />
                <span>Open to remote work</span>
              </label>
            </div>

            <button className="btn btn-primary" onClick={() => setStep(2)}>
              Next: Add Skills
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="setup-step">
            <h2>Your Skills</h2>
            <p className="step-description">Add your technical skills to get personalized recommendations</p>

            <div className="add-skill-section">
              <div className="skill-input-group">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="e.g., Python, React, AWS"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                />
                <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <input
                  type="number"
                  value={skillYears}
                  onChange={(e) => setSkillYears(parseFloat(e.target.value) || 0)}
                  placeholder="Years"
                  min="0"
                  step="0.5"
                  style={{ width: '100px' }}
                />
                <button type="button" className="btn btn-secondary" onClick={handleAddSkill}>
                  Add
                </button>
              </div>
            </div>

            <div className="skills-list">
              {skills.length === 0 ? (
                <p className="empty-state">No skills added yet. Add at least one skill to continue.</p>
              ) : (
                skills.map((skill, index) => (
                  <div key={index} className="skill-item">
                    <div className="skill-info">
                      <span className="skill-name">{skill.name}</span>
                      <span className="skill-badge">{skill.level}</span>
                      {skill.years > 0 && (
                        <span className="skill-years">{skill.years} years</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => handleRemoveSkill(index)}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="setup-actions">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={handleComplete}
                disabled={skills.length === 0 || loading}
              >
                {loading ? 'Saving...' : 'Complete Profile'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileSetup

