'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { sanityClient } from '@/lib/sanity.client'
import { footerLinksQuery } from '@/lib/sanity.queries'
import { TrustBadges } from '@/components/shared/TrustBadges'
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Plane,
  Shield,
  Award,
  Users
} from 'lucide-react'

type FooterLink = {
  title: string
  slug: string
  footerCategory: 'company' | 'services' | 'support' | 'legal'
}

type FooterLinks = {
  company: FooterLink[]
  services: FooterLink[]
  support: FooterLink[]
  legal: FooterLink[]
}

const socialLinks = [
  { href: 'https://www.facebook.com/ideaholiday.in', icon: Facebook, label: 'Facebook' },
  { href: 'https://twitter.com/ideaholiday', icon: Twitter, label: 'Twitter' },
  { href: 'https://www.instagram.com/ideaholiday1/', icon: Instagram, label: 'Instagram' },
  { href: 'https://youtube.com/ideaholiday', icon: Youtube, label: 'YouTube' },
]

const trustIndicators = [
  {
    icon: Shield,
    title: 'Secure Payments',
    description: '256-bit SSL encryption'
  },
  {
    icon: Award,
    title: 'Award Winning',
    description: 'Best travel platform 2024'
  },
  {
    icon: Users,
    title: '1M+ Customers',
    description: 'Trusted by millions'
  },
  {
    icon: Plane,
    title: '24/7 Support',
    description: 'Round the clock assistance'
  },
]

export default function Footer() {
  const [footerLinks, setFooterLinks] = useState<FooterLinks>({
    company: [],
    services: [],
    support: [],
    legal: []
  })

  useEffect(() => {
    let mounted = true
    sanityClient
      .fetch(footerLinksQuery)
      .then((links: FooterLink[]) => {
        if (!mounted) return
        const grouped: FooterLinks = { company: [], services: [], support: [], legal: [] }
        links.forEach(link => {
          if (grouped[link.footerCategory]) grouped[link.footerCategory].push(link)
        })
        setFooterLinks(grouped)
      })
      .catch((err) => {
        console.error('Failed to load footer links from Sanity:', err)
        // Fail soft: keep empty links if Sanity is unavailable
        setFooterLinks({ company: [], services: [], support: [], legal: [] })
      })
    return () => { mounted = false }
  }, [])

  return (
    <footer className="bg-slate-900 text-white">
      {/* Trust Indicators */}
      <div className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustIndicators.map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="flex items-center space-x-3 text-center md:text-left">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sapphire-900/50 text-emerald-400 flex-shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{item.title}</div>
                    <div className="text-xs text-slate-400">{item.description}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 group mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sapphire-900 to-emerald-900 text-white font-bold text-xl shadow-lg">
                IH
              </div>
              <div>
                <div className="text-xl font-bold font-display">
                  Idea Holiday
                </div>
                <div className="text-sm text-slate-400 -mt-1">
                  Your Travel Partner
                </div>
              </div>
            </Link>
            
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Discover amazing destinations with Idea Holiday. We provide the best travel experiences 
              with carefully curated packages, competitive prices, and 24/7 customer support.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3 text-sm text-slate-400">
                <MapPin className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div>Delhi, Rishikesh, Mumbai, Lucknow</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-sm text-slate-400">
                <Phone className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span>+91 9696 777 391</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-slate-400">
                <Mail className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span>support@ideaholiday.com</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.slug}>
                  <Link
                    href={`/${link.slug}`}
                    className="text-slate-400 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.slug}>
                  <Link
                    href={`/${link.slug}`}
                    className="text-slate-400 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.slug}>
                  <Link
                    href={`/${link.slug}`}
                    className="text-slate-400 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.slug}>
                  <Link
                    href={`/${link.slug}`}
                    className="text-slate-400 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Trust Badges Section */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-8">
          <TrustBadges variant="footer" showPaymentLogos className="opacity-90" />
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-slate-400">
              © {new Date().getFullYear()} Idea Holiday Pvt Ltd. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-400 mr-2">Follow us:</span>
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-sapphire-900 hover:text-white transition-all duration-200 transform hover:-translate-y-0.5"
                    title={social.label}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                )
              })}
            </div>

            {/* Payment Methods */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-400">We accept:</span>
              <div className="flex space-x-1">
                {['VISA', 'MC', 'AMEX', 'UPI'].map((method) => (
                  <div
                    key={method}
                    className="bg-white text-slate-900 px-2 py-1 rounded text-xs font-medium"
                  >
                    {method}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}