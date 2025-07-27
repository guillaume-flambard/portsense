'use client'

import { motion } from 'framer-motion'
import { HeroSection } from '@/components/hero-section'
import { FeatureGrid } from '@/components/feature-grid'
import { TestimonialsSection } from '@/components/testimonials-section'
import { NewsletterSection } from '@/components/newsletter-section'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <HeroSection />
        <FeatureGrid />
        <TestimonialsSection />
        <NewsletterSection />
        <Footer />
      </motion.div>
    </main>
  )
}