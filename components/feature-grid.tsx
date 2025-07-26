'use client'

import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: '🚢',
    title: 'Real-Time Tracking',
    description: 'Monitor your containers in real-time with live location updates and status changes across global shipping routes.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Insights',
    description: 'Get intelligent analysis of delays, risks, and optimization recommendations powered by advanced machine learning.',
  },
  {
    icon: '🔔',
    title: 'Smart Alerts',
    description: 'Receive proactive notifications about delays, route changes, and potential issues before they impact your supply chain.',
  },
  {
    icon: '📊',
    title: 'Advanced Analytics',
    description: 'Comprehensive dashboards and reports to help you make data-driven decisions and optimize your logistics operations.',
  },
  {
    icon: '🌍',
    title: 'Global Coverage',
    description: 'Track shipments across all major shipping lanes with partnerships covering 95% of global container traffic.',
  },
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description: 'Sub-second response times and real-time updates ensure you always have the latest information at your fingertips.',
  },
]

export function FeatureGrid() {
  return (
    <section className="py-24 bg-gradient-to-b from-indigo-50 via-blue-50 to-sky-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-6">
            Powerful Features
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Everything you need to manage your container logistics with confidence and precision.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl group hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-800 mb-2">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}