import { createClient } from 'next-sanity'
import { env } from './env'

export const sanityClient = createClient({
  projectId: env.sanity.projectId,
  dataset: env.sanity.dataset,
  apiVersion: env.sanity.apiVersion,
  useCdn: true,
  token: env.sanity.readToken,
})
