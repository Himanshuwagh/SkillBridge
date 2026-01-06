import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useSearchParams } from 'react-router-dom'
import './SocialHandles.css'

interface SocialHandlesProps {
  userId: number
}

interface OAuthConnection {
  username?: string
  name?: string
  profile_url?: string
  connected_at?: string
  connected: boolean
}

interface SocialData {
  github?: string
  linkedin?: string
  twitter?: string
  google_scholar?: string
}

const SocialHandles: React.FC<SocialHandlesProps> = ({ userId }) => {
  const [handles, setHandles] = useState<SocialData>({})
  const [connections, setConnections] = useState<Record<string, OAuthConnection>>({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    fetchSocialData()
    
    // Check for OAuth callback
    const connected = searchParams.get('connected')
    const error = searchParams.get('error')
    
    if (connected) {
      setMessage(`${connected.charAt(0).toUpperCase() + connected.slice(1)} connected successfully!`)
      fetchSocialData()
      // Remove query params
      setSearchParams({})
      setTimeout(() => setMessage(''), 3000)
    } else if (error) {
      setMessage('Failed to connect. Please try again.')
      setSearchParams({})
      setTimeout(() => setMessage(''), 3000)
    }
  }, [userId, searchParams])

  const fetchSocialData = async () => {
    try {
      // Fetch social handles
      const handlesRes = await axios.get(`/api/users/${userId}/social`)
      setHandles(handlesRes.data)
      
      // Fetch OAuth connections
      const connectionsRes = await axios.get(`/api/oauth/${userId}/connections`)
      setConnections(connectionsRes.data.connections || {})
    } catch (error) {
      console.error('Error fetching social data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (platform: string) => {
    try {
      // Redirect to OAuth authorization
      window.location.href = `/api/oauth/${platform}/authorize?user_id=${userId}`
    } catch (error: any) {
      setMessage(error.response?.data?.detail || `Failed to connect ${platform}`)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleDisconnect = async (platform: string) => {
    if (!confirm(`Are you sure you want to disconnect ${platform}?`)) {
      return
    }

    try {
      await axios.delete(`/api/oauth/${userId}/disconnect/${platform}`)
      setMessage(`${platform.charAt(0).toUpperCase() + platform.slice(1)} disconnected successfully`)
      fetchSocialData()
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      setMessage(error.response?.data?.detail || `Failed to disconnect ${platform}`)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const getDisplayUrl = (url: string | undefined) => {
    if (!url) return ''
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
      return urlObj.hostname.replace('www.', '') + urlObj.pathname
    } catch {
      return url
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  const platforms = [
    {
      key: 'github',
      name: 'GitHub',
      icon: 'github',
      color: '#24292e',
      oauthSupported: true
    },
    {
      key: 'linkedin',
      name: 'LinkedIn',
      icon: 'linkedin',
      color: '#0077b5',
      oauthSupported: true
    },
    {
      key: 'twitter',
      name: 'X (Twitter)',
      icon: 'twitter',
      color: '#1DA1F2',
      oauthSupported: true
    },
    {
      key: 'google_scholar',
      name: 'Google Scholar',
      icon: 'scholar',
      color: '#4285F4',
      oauthSupported: false
    }
  ]

  const hasAnyConnection = Object.values(connections).some(conn => conn.connected) || 
                          handles.github || handles.linkedin || handles.twitter || handles.google_scholar

  return (
    <div className="social-handles">
      <div className="card-header">
        <h2>Social Profiles</h2>
      </div>

      <div className="social-platforms">
        {platforms.map((platform) => {
          const connection = connections[platform.key]
          const isConnected = connection?.connected || !!handles[platform.key as keyof SocialData]
          const profileUrl = connection?.profile_url || handles[platform.key as keyof SocialData]

          return (
            <div key={platform.key} className="social-platform-item">
              <div className="platform-info">
                <span className="platform-icon" style={{ color: platform.color }}>
                  {platform.icon === 'github' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  )}
                  {platform.icon === 'linkedin' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  )}
                  {platform.icon === 'twitter' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  )}
                  {platform.icon === 'scholar' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                      <line x1="9" y1="7" x2="15" y2="7"></line>
                      <line x1="9" y1="11" x2="15" y2="11"></line>
                      <line x1="9" y1="15" x2="13" y2="15"></line>
                    </svg>
                  )}
                </span>
                <div className="platform-details">
                  <span className="platform-name">{platform.name}</span>
                  {isConnected && profileUrl && (
                    <span className="platform-url">{getDisplayUrl(profileUrl)}</span>
                  )}
                  {!isConnected && (
                    <span className="platform-status">Not connected</span>
                  )}
                </div>
              </div>
              
              <div className="platform-actions">
                {isConnected ? (
                  <>
                    {profileUrl && (
                      <a
                        href={profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-view"
                      >
                        View
                      </a>
                    )}
                    {platform.oauthSupported && connection?.connected && (
                      <button
                        type="button"
                        className="btn-disconnect"
                        onClick={() => handleDisconnect(platform.key)}
                      >
                        Disconnect
                      </button>
                    )}
                  </>
                ) : (
                  platform.oauthSupported ? (
                    <button
                      type="button"
                      className="btn-connect"
                      onClick={() => handleConnect(platform.key)}
                    >
                      Connect
                    </button>
                  ) : (
                    <span className="platform-note">Manual entry only</span>
                  )
                )}
              </div>
            </div>
          )
        })}
      </div>

      {!hasAnyConnection && (
        <div className="social-empty">
          <p>Connect your social profiles to enhance your profile visibility.</p>
        </div>
      )}

      {message && (
        <div className={`message-toast ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  )
}

export default SocialHandles
