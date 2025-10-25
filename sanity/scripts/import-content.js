#!/usr/bin/env node

const { createClient } = require('@sanity/client')
const fs = require('fs')
const path = require('path')

// Initialize Sanity client
const client = createClient({
  projectId: '32zq1f7y',
  dataset: 'production',
  apiVersion: '2023-01-01',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN || 'your_token_here'
})

// Content directory
const contentDir = path.join(__dirname, 'content')

// Function to import content
async function importContent() {
  try {
    console.log('🚀 Starting Sanity content import...')
    
    // Import pages
    console.log('📄 Importing pages...')
    const pages = [
      'about-us-page.json',
      'services-page.json',
      'contact-page.json'
    ]
    
    for (const pageFile of pages) {
      const pagePath = path.join(contentDir, pageFile)
      if (fs.existsSync(pagePath)) {
        const pageData = JSON.parse(fs.readFileSync(pagePath, 'utf8'))
        await client.createOrReplace(pageData)
        console.log(`✅ Imported page: ${pageData.title}`)
      }
    }
    
    // Import authors
    console.log('👤 Importing authors...')
    const authors = [
      'author-sarah-johnson.json',
      'author-priya-sharma.json'
    ]
    
    for (const authorFile of authors) {
      const authorPath = path.join(contentDir, authorFile)
      if (fs.existsSync(authorPath)) {
        const authorData = JSON.parse(fs.readFileSync(authorPath, 'utf8'))
        await client.createOrReplace(authorData)
        console.log(`✅ Imported author: ${authorData.name}`)
      }
    }
    
    // Import tags
    console.log('🏷️ Importing tags...')
    const tagsPath = path.join(contentDir, 'tags.json')
    if (fs.existsSync(tagsPath)) {
      const tagsData = JSON.parse(fs.readFileSync(tagsPath, 'utf8'))
      for (const tag of tagsData) {
        await client.createOrReplace(tag)
        console.log(`✅ Imported tag: ${tag.title}`)
      }
    }
    
    // Import destinations
    console.log('🌍 Importing destinations...')
    const destinations = [
      'destination-dubai.json',
      'destination-bali.json'
    ]
    
    for (const destFile of destinations) {
      const destPath = path.join(contentDir, destFile)
      if (fs.existsSync(destPath)) {
        const destData = JSON.parse(fs.readFileSync(destPath, 'utf8'))
        await client.createOrReplace(destData)
        console.log(`✅ Imported destination: ${destData.title}`)
      }
    }
    
    // Import packages
    console.log('📦 Importing packages...')
    const packages = [
      'package-dubai-luxury.json',
      'package-bali-cultural.json'
    ]
    
    for (const pkgFile of packages) {
      const pkgPath = path.join(contentDir, pkgFile)
      if (fs.existsSync(pkgPath)) {
        const pkgData = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
        await client.createOrReplace(pkgData)
        console.log(`✅ Imported package: ${pkgData.title}`)
      }
    }
    
    // Import blog posts
    console.log('📝 Importing blog posts...')
    const blogPosts = [
      'blog-dubai-guide.json',
      'blog-bali-budget.json'
    ]
    
    for (const blogFile of blogPosts) {
      const blogPath = path.join(contentDir, blogFile)
      if (fs.existsSync(blogPath)) {
        const blogData = JSON.parse(fs.readFileSync(blogPath, 'utf8'))
        await client.createOrReplace(blogData)
        console.log(`✅ Imported blog post: ${blogData.title}`)
      }
    }
    
    // Import FAQs
    console.log('❓ Importing FAQs...')
    const faqsPath = path.join(contentDir, 'faqs.json')
    if (fs.existsSync(faqsPath)) {
      const faqsData = JSON.parse(fs.readFileSync(faqsPath, 'utf8'))
      for (const faq of faqsData) {
        await client.createOrReplace(faq)
        console.log(`✅ Imported FAQ: ${faq.question}`)
      }
    }
    
    console.log('🎉 Content import completed successfully!')
    console.log('📊 Summary:')
    console.log(`   - Pages: ${pages.length}`)
    console.log(`   - Authors: ${authors.length}`)
    console.log(`   - Tags: ${JSON.parse(fs.readFileSync(path.join(contentDir, 'tags.json'), 'utf8')).length}`)
    console.log(`   - Destinations: ${destinations.length}`)
    console.log(`   - Packages: ${packages.length}`)
    console.log(`   - Blog Posts: ${blogPosts.length}`)
    console.log(`   - FAQs: ${JSON.parse(fs.readFileSync(path.join(contentDir, 'faqs.json'), 'utf8')).length}`)
    
  } catch (error) {
    console.error('❌ Error importing content:', error)
    process.exit(1)
  }
}

// Run the import
if (require.main === module) {
  importContent()
}

module.exports = { importContent }
