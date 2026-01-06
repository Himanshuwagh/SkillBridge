import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './ResumeUpload.css'

interface ResumeUploadProps {
  userId: number
}

interface ResumeData {
  has_resume: boolean
  resume_file?: string
  resume_data?: {
    skills: Array<{
      name: string
      proficiency_level: string
      years_experience: number
    }>
    experience: Array<{
      title?: string
      company?: string
      total_years?: number
    }>
    education: Array<{
      degree: string
    }>
    summary: string
  }
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ userId }) => {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchResumeData()
  }, [userId])

  const fetchResumeData = async () => {
    try {
      const res = await axios.get(`/api/resume/${userId}`)
      setResumeData(res.data)
    } catch (error) {
      console.error('Error fetching resume data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type !== 'application/pdf') {
        setMessage('Please upload a PDF file')
        setUploadStatus('error')
        return
      }
      setFile(selectedFile)
      setMessage('')
      setUploadStatus('idle')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file')
      setUploadStatus('error')
      return
    }

    setUploading(true)
    setMessage('')
    setUploadStatus('idle')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await axios.post(`/api/resume/${userId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setMessage(`Resume uploaded successfully! Extracted ${res.data.extracted_data.skills_count} skills. Career analysis will be available shortly.`)
      setUploadStatus('success')
      setFile(null)
      
      // Reset file input
      const fileInput = document.getElementById('resume-file-input') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }

      // Refresh resume data
      await fetchResumeData()
      
      // Refresh page to update profile and trigger career analysis
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Error uploading resume. Please try again.')
      setUploadStatus('error')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your resume?')) {
      return
    }

    try {
      await axios.delete(`/api/resume/${userId}`)
      setMessage('Resume deleted successfully')
      setUploadStatus('success')
      setResumeData(null)
      
      // Refresh page
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Error deleting resume')
      setUploadStatus('error')
    }
  }

  if (loading) {
    return <div className="loading">Loading resume data...</div>
  }

  return (
    <div className="resume-upload">
      <div className="resume-header">
        <h2>Resume</h2>
        {resumeData?.has_resume && (
          <span className="resume-status-indicator">Uploaded</span>
        )}
      </div>

      {resumeData?.has_resume ? (
        <div className="resume-uploaded">
          <div className="resume-file-info">
            <div className="file-icon">📄</div>
            <div className="file-details">
              <span className="file-name">{resumeData.resume_file}</span>
              {resumeData.resume_data && (
                <span className="file-stats">
                  {resumeData.resume_data.skills.length} skills extracted
                </span>
              )}
            </div>
          </div>

          {resumeData.resume_data && (
            <>
              <button
                type="button"
                className="toggle-details-btn"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide' : 'Show'} Details
                <span className="toggle-icon">{showDetails ? '▲' : '▼'}</span>
              </button>

              {showDetails && (
                <div className="resume-details-collapsed">
                  {resumeData.resume_data.skills.length > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">Skills:</span>
                      <div className="skills-preview">
                        {resumeData.resume_data.skills.slice(0, 5).map((skill, idx) => (
                          <span key={idx} className="skill-chip">{skill.name}</span>
                        ))}
                        {resumeData.resume_data.skills.length > 5 && (
                          <span className="skill-more">+{resumeData.resume_data.skills.length - 5}</span>
                        )}
                      </div>
                    </div>
                  )}
                  {resumeData.resume_data.experience.length > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">Experience:</span>
                      <span className="detail-value">{resumeData.resume_data.experience.length} position(s)</span>
                    </div>
                  )}
                  {resumeData.resume_data.education.length > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">Education:</span>
                      <span className="detail-value">{resumeData.resume_data.education.length} degree(s)</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div className="resume-actions-compact">
            <label htmlFor="resume-file-input" className="btn-replace">
              Replace
            </label>
            <button
              type="button"
              className="btn-delete"
              onClick={handleDelete}
            >
              Delete
            </button>
            <input
              id="resume-file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      ) : (
        <div className="resume-upload-empty">
          <div className="upload-zone" onClick={() => document.getElementById('resume-file-input')?.click()}>
            <input
              id="resume-file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div className="upload-icon">📄</div>
            <div className="upload-text">
              <strong>Upload PDF Resume</strong>
              <span>Click or drag to upload</span>
            </div>
          </div>
          {file && (
            <div className="file-selected">
              <span className="file-name-small">{file.name}</span>
              <button
                type="button"
                className="remove-btn"
                onClick={() => {
                  setFile(null)
                  const fileInput = document.getElementById('resume-file-input') as HTMLInputElement
                  if (fileInput) fileInput.value = ''
                }}
              >
                ×
              </button>
            </div>
          )}
          <button
            type="button"
            className="btn-upload"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}

      {message && (
        <div className={`message-toast ${uploadStatus}`}>
          {message}
        </div>
      )}
    </div>
  )
}

export default ResumeUpload

