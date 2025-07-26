'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the email to your backend
    console.log('Newsletter signup:', email)
    setIsSubmitted(true)
    setEmail('')
    
    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
    }, 3000)
  }

  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.5))]" />
      
      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl rounded-3xl">
            <CardContent className="p-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Stay in the Loop
                </h2>
                <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                  Get the latest insights on container logistics, AI innovations, and industry trends 
                  delivered straight to your inbox.
                </p>
              </motion.div>

              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
              >
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-white/90 border-0 text-slate-900 placeholder:text-slate-500 rounded-xl px-6 py-4 text-lg focus:ring-2 focus:ring-white/50 focus:bg-white"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  disabled={isSubmitted}
                >
                  {isSubmitted ? '✓ Subscribed!' : 'Subscribe'}
                </Button>
              </motion.form>

              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-green-200 font-medium"
                >
                  Thank you for subscribing! Check your email for confirmation.
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                className="mt-8 flex flex-wrap justify-center gap-8 text-blue-200"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  <span>Weekly Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚀</span>
                  <span>Product Updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  <span>Industry Insights</span>
                </div>
              </motion.div>

              <p className="text-blue-200 text-sm mt-6">
                No spam, unsubscribe at any time. We respect your privacy.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}