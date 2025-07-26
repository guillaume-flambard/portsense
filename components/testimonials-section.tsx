'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Supply Chain Director',
    company: 'Global Logistics Corp',
    content: 'PortSense has revolutionized how we track our containers. The AI insights helped us reduce delays by 40% and improve customer satisfaction significantly.',
    avatar: 'SC',
  },
  {
    name: 'Michael Rodriguez',
    role: 'Operations Manager',
    company: 'Pacific Shipping Co',
    content: 'The real-time tracking and proactive alerts have been game-changers. We now catch issues before they become problems.',
    avatar: 'MR',
  },
  {
    name: 'Emma Thompson',
    role: 'Logistics Coordinator',
    company: 'International Trade Solutions',
    content: 'The platform is incredibly intuitive and the customer support is outstanding. Our team was up and running within hours.',
    avatar: 'ET',
  },
]

const brandLogos = [
  { name: 'Maersk', logo: '🚢' },
  { name: 'MSC', logo: '⚓' },
  { name: 'CMA CGM', logo: '🌊' },
  { name: 'COSCO', logo: '🚛' },
  { name: 'Hapag-Lloyd', logo: '📦' },
  { name: 'Evergreen', logo: '🌍' },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-sky-50 via-slate-50 to-blue-100">
      <div className="container mx-auto px-4">
        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-700 to-blue-700 bg-clip-text text-transparent mb-6">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Join thousands of companies that rely on PortSense for their container logistics.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src="" alt={testimonial.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-slate-800">{testimonial.name}</div>
                      <div className="text-sm text-slate-600">{testimonial.role}</div>
                      <div className="text-sm text-blue-600 font-medium">{testimonial.company}</div>
                    </div>
                  </div>
                  <blockquote className="text-slate-700 italic leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Brand Logos */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-slate-500 mb-8 text-lg">Integrated with leading shipping companies</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {brandLogos.map((brand, index) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                  {brand.logo}
                </div>
                <div className="text-sm text-slate-600 font-medium">{brand.name}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}