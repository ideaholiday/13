'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  Plane, 
  Hotel, 
  MapPin, 
  FileText,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  Globe,
  Zap,
  Award,
  Heart,
  Sparkles,
  TrendingUp,
  Target,
  Lock,
  CreditCard,
  Headphones,
  Smartphone
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ServicesPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState('flights')
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const services = {
    flights: {
      icon: Plane,
      title: 'Flight Booking',
      subtitle: 'Domestic & International',
      description: 'Book domestic and international flights instantly with Idea Holiday. Compare fares from top airlines, explore flexible date options, and enjoy zero markup deals.',
      features: [
        'Zero Markup on Flights',
        'Real-time Fare Comparison',
        'Flexible Date Options',
        '24/7 Booking Support',
        'Instant Confirmation',
        'Best Price Guarantee'
      ],
      benefits: [
        'Save up to 30% on flight bookings',
        'Access to exclusive airline deals',
        'Multi-city flight options',
        'Group booking discounts'
      ],
      color: 'from-blue-500 to-blue-700',
      bgColor: 'from-blue-50 to-blue-100'
    },
    hotels: {
      icon: Hotel,
      title: 'Hotel Booking',
      subtitle: '10 Lakh+ Properties',
      description: 'Find your perfect stay with Idea Holiday\'s hotel booking platform, featuring over 10 lakh+ properties worldwide. Choose from budget hotels, luxury resorts, villas, and boutique stays.',
      features: [
        '10 Lakh+ Verified Properties',
        'Best Rate Guarantee',
        'Instant Confirmation',
        'Free Cancellation',
        '24/7 Customer Support',
        'Loyalty Rewards'
      ],
      benefits: [
        'Exclusive hotel partnerships',
        'Last-minute deals up to 50% off',
        'Free room upgrades',
        'Complimentary breakfast'
      ],
      color: 'from-green-500 to-green-700',
      bgColor: 'from-green-50 to-green-100'
    },
    packages: {
      icon: MapPin,
      title: 'Holiday Packages',
      subtitle: 'Custom & Fixed Departures',
      description: 'Turn your travel dreams into reality with custom and fixed departure packages designed by travel experts. From tropical islands to bustling cities, our curated experiences include everything.',
      features: [
        'Custom Package Design',
        'Fixed Departure Groups',
        'All-inclusive Pricing',
        'Expert Local Guides',
        'Flexible Itineraries',
        'Group Discounts'
      ],
      benefits: [
        'Save up to 40% on package deals',
        'Exclusive access to hidden gems',
        'VIP experiences included',
        'Travel insurance coverage'
      ],
      color: 'from-purple-500 to-purple-700',
      bgColor: 'from-purple-50 to-purple-100'
    },
    visa: {
      icon: FileText,
      title: 'Visa Assistance',
      subtitle: 'Complete Documentation',
      description: 'Complete visa support and documentation services. Our expert team handles everything from application forms to document verification, ensuring a smooth visa process.',
      features: [
        'Expert Visa Consultation',
        'Document Verification',
        'Fast Processing',
        'Success Guarantee',
        'Multiple Country Support',
        'Express Services'
      ],
      benefits: [
        '95% visa approval rate',
        'Express processing available',
        'Document preparation assistance',
        'Follow-up support'
      ],
      color: 'from-orange-500 to-orange-700',
      bgColor: 'from-orange-50 to-orange-100'
    }
  }

  const whyChooseUs = [
    {
      icon: Shield,
      title: 'Secure & Trusted',
      description: 'Your data and payments are protected with bank-level security',
      color: 'text-green-600'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer support for all your travel needs',
      color: 'text-blue-600'
    },
    {
      icon: Award,
      title: 'Best Price Guarantee',
      description: 'We guarantee the best prices or we\'ll match the difference',
      color: 'text-purple-600'
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Experienced travel professionals with local knowledge',
      color: 'text-orange-600'
    }
  ]

  const processSteps = [
    {
      step: '01',
      title: 'Search & Compare',
      description: 'Search for flights, hotels, or packages and compare options',
      icon: Globe,
      color: 'from-blue-500 to-blue-700'
    },
    {
      step: '02',
      title: 'Select & Customize',
      description: 'Choose your preferred option and customize as needed',
      icon: Target,
      color: 'from-green-500 to-green-700'
    },
    {
      step: '03',
      title: 'Secure Payment',
      description: 'Complete your booking with our secure payment system',
      icon: CreditCard,
      color: 'from-purple-500 to-purple-700'
    },
    {
      step: '04',
      title: 'Travel & Enjoy',
      description: 'Receive confirmations and enjoy your perfect trip',
      icon: Heart,
      color: 'from-orange-500 to-orange-700'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <motion.div 
          style={{ y }}
          className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10"
        />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: isLoaded ? 1 : 0.8 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Comprehensive Travel Solutions
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-display">
              <span className="bg-gradient-to-r from-blue-900 via-purple-900 to-emerald-900 bg-clip-text text-transparent">
                Our Services
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From flights to hotels, holiday packages to visa assistance - we provide comprehensive travel solutions 
              designed to make your journey seamless, affordable, and memorable.
            </p>
          </motion.div>

          {/* Service Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-12 bg-white/80 backdrop-blur-sm">
                {Object.entries(services).map(([key, service]) => (
                  <TabsTrigger 
                    key={key} 
                    value={key}
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                  >
                    <service.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{service.title}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(services).map(([key, service]) => (
                <TabsContent key={key} value={key} className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`bg-gradient-to-br ${service.bgColor} rounded-3xl p-8 lg:p-12`}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                      <div>
                        <div className={`w-20 h-20 mb-6 rounded-2xl bg-gradient-to-r ${service.color} flex items-center justify-center`}>
                          <service.icon className="w-10 h-10 text-white" />
                        </div>
                        
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">{service.title}</h2>
                        <p className="text-lg text-gray-600 mb-6">{service.subtitle}</p>
                        <p className="text-gray-700 leading-relaxed mb-8">{service.description}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                          {service.features.map((feature, index) => (
                            <motion.div
                              key={feature}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: index * 0.1 }}
                              className="flex items-center gap-3"
                            >
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </motion.div>
                          ))}
                        </div>
                        
                        <Button size="lg" className={`bg-gradient-to-r ${service.color} text-white hover:opacity-90 px-8 py-4 text-lg font-semibold`}>
                          Get Started
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                      
                      <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Benefits</h3>
                        {service.benefits.map((benefit, index) => (
                          <motion.div
                            key={benefit}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${service.color} flex items-center justify-center`}>
                                <TrendingUp className="w-6 h-6 text-white" />
                              </div>
                              <p className="text-gray-700 font-medium">{benefit}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display">
              <span className="bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent">
                Why Choose Idea Holiday?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to providing exceptional travel experiences with unmatched service quality.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="h-full bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-blue-50">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className={`w-8 h-8 ${item.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display">
              <span className="bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our simple 4-step process makes booking your perfect trip effortless and enjoyable.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative group"
              >
                {/* Connection Line */}
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 z-0" />
                )}
                
                <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:bg-white relative z-10">
                  <CardContent className="p-8 text-center">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className="w-10 h-10 text-white" />
                    </div>
                    
                    <div className={`text-3xl font-bold mb-4 bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                      {step.step}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-display">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-12">
              Experience the difference with Idea Holiday's comprehensive travel services. 
              Book now and enjoy personalized support, secure payments, and instant confirmations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold">
                <Plane className="w-5 h-5 mr-2" />
                Book Your Flight
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold">
                <Hotel className="w-5 h-5 mr-2" />
                Find Hotels
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold">
                <MapPin className="w-5 h-5 mr-2" />
                Explore Packages
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
