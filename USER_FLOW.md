# User Flow Documentation

## Complete User Journey

### 1. Sign Up / Login

**Route:** `/login`

Users can either:
- **Sign Up**: Create a new account with email, name, and password
- **Login**: Use existing credentials

**What happens:**
- New users are saved to `data/sample_users.json`
- User ID is stored in localStorage
- Redirects to profile setup (new users) or dashboard (existing users)

### 2. Profile Setup (New Users Only)

**Route:** `/profile/setup`

Two-step process:

**Step 1: Preferences**
- Select preferred locations (multiple selection)
- Select preferred industries
- Toggle remote work preference

**Step 2: Skills**
- Add technical skills
- Set proficiency level (beginner/intermediate/advanced)
- Add years of experience
- Must add at least one skill to continue

**What happens:**
- Preferences saved to user profile
- Skills added to user profile
- All data saved to `data/sample_users.json`
- Redirects to dashboard

### 3. Dashboard

**Route:** `/dashboard`

**Analytics Displayed:**
- 🎯 **Your Skills**: Count of skills in profile
- 💼 **Matching Jobs**: Number of jobs matching user skills
- ⭐ **Match Score**: Average match percentage
- 📊 **Profile Completion**: Percentage complete

**Additional Features:**
- 💡 **Skills to Learn**: Top 5 high-demand skills user doesn't have
- 🎯 **Top Recommendations**: Personalized role recommendations

**Data Source:**
- Analytics from `/api/analytics/{user_id}/stats`
- Recommendations from `/api/recommendations/{user_id}`

### 4. Recommendations

**Route:** `/recommendations`

Shows personalized job role recommendations with:
- Match score
- Demand score
- Competition score
- AI-generated explanations
- Required vs matched skills

### 5. Profile Management

**Route:** `/profile`

Users can:
- View their current skills
- Add new skills
- Skills are saved to `data/sample_users.json`

## Data Persistence

All user data is saved to `data/sample_users.json`:
- New signups are appended
- Profile updates modify existing entries
- Skills are added to user's skill array

**File Format:**
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "password_hash": "hashed_password",
  "preferred_locations": ["Location1", "Location2"],
  "preferred_industries": ["Industry1"],
  "open_to_remote": true,
  "skills": [
    {
      "name": "Python",
      "proficiency_level": "advanced",
      "years_experience": 5
    }
  ]
}
```

## Authentication

- **Login**: Validates email and password hash
- **Session**: Uses localStorage (userId, userName, userEmail)
- **Protected Routes**: Redirects to login if not authenticated
- **Logout**: Clears localStorage and redirects to login

## Analytics Calculation

The analytics endpoint calculates:
1. **Skill Count**: Number of skills in user profile
2. **Matching Jobs**: Jobs that require user's skills
3. **Average Match Score**: From recommendations
4. **Profile Completion**: Based on skill count (10 skills = 100%)
5. **Top Skills to Learn**: High-demand skills user doesn't have

## Recommendation Generation

When user views recommendations:
1. System finds jobs matching user skills
2. Groups by role
3. Calculates match/demand/competition scores
4. Generates AI explanations
5. Ranks by overall score

