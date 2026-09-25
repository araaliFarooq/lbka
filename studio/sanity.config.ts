import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'missing-project-id'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineConfig({
  name: 'labaika',
  title: 'LABAIKA',
  projectId,
  dataset,
  plugins: [
    structureTool({structure}),
    visionTool({defaultApiVersion: '2025-02-19'}),
  ],
  schema: {
    types: schemaTypes,
  },
})
