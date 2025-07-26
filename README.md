# PortSense - Complete Maritime Container Tracking SaaS

A comprehensive B2B SaaS platform for real-time container tracking enhanced by AI-powered insights.

## 🚀 Features

- **Real-time Container Tracking**: Monitor maritime shipping containers with live updates
- **AI-Powered Insights**: Claude-generated summaries, delay analysis, and predictive reports
- **Multi-Channel Alerts**: Email, SMS, and Slack notifications for critical events
- **Interactive Dashboard**: Visual tracking with maps and analytics
- **Client Sharing**: Generate secure, public tracking links for customers
- **Risk Assessment**: Automated risk scoring and delay predictions
- **Weekly Reports**: AI-generated performance summaries

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **AI Integration**: Claude (Anthropic API)
- **Maps**: React Leaflet
- **Notifications**: Resend (Email), Twilio (SMS), Slack Webhooks
- **Deployment**: Vercel (recommended)

## 📦 Installation

1. **Clone and Install**
```bash
git clone <repository-url>
cd portsense
npm install
```

2. **Environment Setup**
Create `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Claude AI
ANTHROPIC_API_KEY=your_anthropic_api_key

# Notifications
RESEND_API_KEY=your_resend_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone

# Marine APIs (optional)
MARINE_TRAFFIC_API_KEY=your_marine_traffic_key

# Security
MONITORING_SECRET=your_monitoring_secret_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Database Setup**
Run the SQL schema from the Supabase section in your Supabase dashboard.

4. **Development**
```bash
npm run dev
```

## 🚢 Core Workflow

1. **User Registration**: Sign up with email/password
2. **Add Container**: Enter container ID to start tracking
3. **AI Enhancement**: Claude generates summaries and insights
4. **Real-time Updates**: Background monitoring updates container status
5. **Smart Alerts**: Automatic notifications for delays and issues
6. **Client Sharing**: Generate public tracking links
7. **Analytics**: Weekly AI-generated performance reports

## 📋 API Endpoints

### Containers
- `GET /api/containers` - List user's containers
- `POST /api/containers` - Add new container
- `GET /api/containers/[id]` - Get container details
- `PUT /api/containers/[id]` - Update container
- `POST /api/containers/[id]/insights` - Generate AI insights

### Reports
- `GET /api/reports/weekly` - Generate weekly report

### User Management
- `PUT /api/user/preferences` - Update user settings

### Monitoring
- `POST /api/monitoring/run` - Trigger monitoring cycle

## 🤖 AI Integration

Claude is used for:
- **Status Summaries**: Convert technical data into business-friendly updates
- **Delay Analysis**: Explain causes and predict impacts
- **Weekly Reports**: Comprehensive performance overviews
- **Alert Messages**: Professional notification content

## 🔄 Background Monitoring

The monitoring system:
1. Polls marine APIs for container updates
2. Detects significant status changes
3. Calculates delays and risk levels
4. Generates alerts and notifications
5. Updates AI summaries

### Running Monitoring

**Manual**: `npm run monitor`

**Automated**: Set up cron job or use Vercel Cron
```bash
# Every 30 minutes
*/30 * * * * curl -X POST https://your-app.vercel.app/api/monitoring/run \
  -H "Authorization: Bearer your_monitoring_secret"
```

## 🔧 Deployment

### Vercel (Recommended)

1. **Deploy to Vercel**
```bash
npm install -g vercel
vercel --prod
```

2. **Environment Variables**
Add all `.env.local` variables in Vercel dashboard

3. **Database Migration**
Ensure Supabase schema is applied

4. **Cron Jobs**
Set up Vercel Cron for background monitoring

### Manual Deployment

1. **Build**
```bash
npm run build
npm start
```

2. **Background Process**
Set up separate process for monitoring:
```bash
# Run every 30 minutes
node scripts/monitor-containers.js
```

## 📊 Database Schema

Key tables:
- `containers`: Main container tracking data
- `container_history`: Change tracking
- `alerts`: Notification system
- `user_preferences`: User settings

## 🚨 Error Handling

// components/error-boundary.tsx
'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-4">
                We encountered an unexpected error. Please try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// components/loading-spinner.tsx
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
  )
}

// components/container-skeleton.tsx
export function ContainerSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 rounded w-32"></div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  )
}

// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">🌊</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Container Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The container you're looking for seems to have sailed away.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}

// app/error.tsx
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            System Error
          </h1>
          <p className="text-gray-600 mb-4">
            An unexpected error occurred while processing your request.
          </p>
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// app/loading.tsx
import { LoadingSpinner } from '@/components/loading-spinner'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading PortSense...</p>
      </div>
    </div>
  )
}

// vercel.json (for deployment configuration)
{
  "functions": {
    "app/api/monitoring/run/route.ts": {
      "maxDuration": 60
    }
  },
  "crons": [
    {
      "path": "/api/monitoring/run",
      "schedule": "*/30 * * * *"
    }
  ]
}

// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

// scripts/seed-data.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedData() {
  console.log('🌱 Seeding sample data...')

  // Sample containers for demo
  const sampleContainers = [
    {
      container_id: 'MSCU1234567',
      user_id: 'user-id-placeholder',
      carrier: 'Maersk',
      vessel_name: 'Maersk Chicago',
      status: 'In Transit',
      current_location: 'Port of Singapore',
      origin_port: 'Shanghai',
      destination_port: 'Rotterdam',
      latitude: 1.2966,
      longitude: 103.8558,
      delay_hours: 0,
      risk_level: 'Low',
    },
    {
      container_id: 'CMAU9876543',
      user_id: 'user-id-placeholder',
      carrier: 'CMA CGM',
      vessel_name: 'CMA CGM Marco Polo',
      status: 'Delayed',
      current_location: 'Port Klang',
      origin_port: 'Busan',
      destination_port: 'Hamburg',
      latitude: 3.0319,
      longitude: 101.3841,
      delay_hours: 18,
      risk_level: 'Medium',
      issues: ['Port congestion', 'Weather'],
    },
  ]

  console.log('Sample data prepared. Replace user_id_placeholder with actual user IDs.')
  console.log('Data:', JSON.stringify(sampleContainers, null, 2))
}

if (require.main === module) {
  seedData().catch(console.error)
}

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Container creation and tracking
- [ ] AI summary generation
- [ ] Alert creation and notifications
- [ ] Map visualization
- [ ] Weekly report generation
- [ ] Client sharing links
- [ ] Settings management
- [ ] Mobile responsiveness

### Test Data

Use these container IDs for testing:
- `MSCU1234567` - Normal container
- `MSCU404TEST` - Not found (test error handling)
- `MSCUDELAYTEST` - Delayed container

## 🚀 Production Considerations

### Performance
- Implement Redis caching for marine API responses
- Use CDN for static assets
- Optimize database queries with proper indexing

### Security
- Rate limiting on APIs
- Input validation and sanitization
- Secure sharing token generation
- Environment variable validation

### Monitoring
- Set up error tracking (Sentry)
- Database performance monitoring
- API response time tracking
- User analytics

### Scaling
- Consider moving to dedicated marine API providers
- Implement job queues for heavy operations
- Database read replicas for high load
- Microservices architecture for larger deployments

## 📞 Support

For technical support or feature requests:
1. Check the documentation
2. Review error logs
3. Contact system administrator

## 📄 License

Proprietary - All rights reserved

---

**PortSense** - Intelligent Maritime Container Tracking
Built with ❤️ using Next.js, Supabase, and Claude AI