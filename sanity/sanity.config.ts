import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { schemaTypes } from './schemas/schema'
import React from 'react'

export default defineConfig({
  name: 'default',
  title: 'Idea Holiday Studio',
  projectId: '32zq1f7y',
  dataset: 'production',
  plugins: [deskTool()],
  schema: { types: schemaTypes },
  studio: {
    components: {
      logo: () => React.createElement('div', {
        style: { padding: '1rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }
      }, '🏖️ Idea Holiday CMS')
    }
  }
})
