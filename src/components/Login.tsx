import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Login.css'

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [identifier, setIdentifier] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // Login
        const res = await axios.post('/api/auth/login', { identifier, password })
        localStorage.setItem('userId', res.data.user_id.toString())
        localStorage.setItem('userName', res.data.name)
        localStorage.setItem('userEmail', res.data.email)
        navigate('/dashboard')
      } else {
        // Signup
        const res = await axios.post('/api/auth/register', {
          email,
          password,
          name
        })
        localStorage.setItem('userId', res.data.user_id.toString())
        localStorage.setItem('userName', res.data.name)
        localStorage.setItem('userEmail', res.data.email)
        navigate('/profile/setup')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Left Side - Platform Information */}
      <div className="login-hero">
        <div className="hero-content">
          <div className="hero-logo">
            <h1 className="hero-title">SkillBridge</h1>
            <div className="hero-badge">AI-Powered</div>
          </div>
          
          <h2 className="hero-tagline">
            Discover Global Career Opportunities with AI-Powered Insights
          </h2>
          
          <p className="hero-description">
            SkillBridge helps professionals <strong>navigate international job markets</strong> with transparent, 
            data-driven insights. Our AI analyzes labor markets across <strong>50+ countries</strong>, matches your 
            skills to opportunities, and provides <strong>real-time competition analysis</strong> to help you make 
            informed career decisions—whether you're exploring remote work or international relocation.
          </p>

          <div className="hero-features">
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
              </div>
              <div>
                <h3>AI-Powered Career Analysis</h3>
                <p>Resume analysis with career trajectory, skill gaps, and strategic pivot recommendations</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </div>
              <div>
                <h3>Real-Time Market Insights</h3>
                <p>Competition analysis and demand trends across 50+ countries with transparent metrics</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
              <div>
                <h3>Transparent Recommendations</h3>
                <p>AI-generated explanations that cite real metrics—no black-box recommendations</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div>
                <h3>Global Mobility</h3>
                <p>Discover opportunities worldwide and make data-driven decisions about international careers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login/Signup Form */}
      <div className="login-form-section">
        <div className="form-container">
          <div className="form-header">
            <h2>{isLogin ? 'Welcome Back' : 'Get Started'}</h2>
              <p>{isLogin ? 'Sign in to continue to SkillBridge' : 'Create your account to discover global opportunities'}</p>
        </div>

        <div className="login-tabs">
          <button
              className={`tab-button ${isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(true)
                setError('')
              }}
          >
            Login
          </button>
          <button
              className={`tab-button ${!isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(false)
                setError('')
              }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="form-group">
                <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                  placeholder="John Doe"
              />
            </div>
          )}

          <div className="form-group">
              <label>{isLogin ? 'Email or Name' : 'Email Address'}</label>
            <input
                type={isLogin ? 'text' : 'email'}
                value={isLogin ? identifier : email}
                onChange={(e) => (isLogin ? setIdentifier(e.target.value) : setEmail(e.target.value))}
              required
                placeholder={isLogin ? 'Enter your email or name' : 'you@example.com'}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
                placeholder="••••••••"
                minLength={3}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
          </button>
        </form>

          <div className="form-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
            >
                {isLogin ? 'Sign up for free' : 'Sign in'}
            </button>
          </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

