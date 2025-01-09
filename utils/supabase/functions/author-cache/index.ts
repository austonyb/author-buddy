// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { Redis } from "https://deno.land/x/upstash_redis@v1.22.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Initialize Supabase client
const supabaseUrl = Deno.env.get('E_SUPABASE_URL') ?? ''
const supabaseKey = Deno.env.get('E_SUPABASE_ANON_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Initialize Redis client
const redisUrl = Deno.env.get('KV_REST_API_URL')
const redisToken = Deno.env.get('KV_REST_API_TOKEN')

if (!redisUrl || !redisToken) {
  console.error('Missing Redis credentials:', { 
    hasUrl: !!redisUrl, 
    hasToken: !!redisToken 
  })
}

const redis = new Redis({
  url: redisUrl || '',
  token: redisToken || '',
})

// Log available environment variables (names only, not values)
console.log('Available environment variables:', Object.keys(Deno.env.toObject()))

interface Book {
  asin: string
  author: string
  rating: string
  type: string
  title: string
  url: string
  price: number | null
}

interface AuthorData {
  url: string
  products: Book[]
}

Deno.serve(async (req) => {
  try {
    // Check for valid bearer token
    const authHeader = req.headers.get('Authorization')
    const expectedToken = Deno.env.get('AUTHOR_CACHE_API_KEY')

    console.log('Auth check:', { 
      hasAuthHeader: !!authHeader,
      hasExpectedToken: !!expectedToken,
      headerMatch: authHeader === `Bearer ${expectedToken}`
    })

    if (!authHeader || !expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return new Response('Unauthorized', { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const authorData: AuthorData = await req.json()
    
    if (!authorData.products || authorData.products.length === 0) {
      return new Response('No products data provided', { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const author = authorData.products[0].author
    const authorUrl = authorData.url
    console.log('Processing author data:', { author, productCount: authorData.products.length })

    try {
      // Store in Redis with 24-hour expiration
      await redis.set(
        `author:${authorUrl}`,
        JSON.stringify(authorData),
        { ex: 24 * 60 * 60 } // 24 hours in seconds
      )
      console.log('Successfully stored in Redis')
    } catch (redisError) {
      console.error('Redis error:', redisError)
      throw redisError
    }

    try {
      // Store books in Supabase
      const { error } = await supabase
        .from('books')
        .upsert(
          authorData.products.map(book => ({
            ...book,
            price: typeof book.price === "string" && book.price === "N/A" ? null : Number(book.price),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })),
          { onConflict: 'asin' }
        )

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      console.log('Successfully stored in Supabase')
    } catch (dbError) {
      console.error('Database error:', dbError)
      throw dbError
    }

    return new Response(
      JSON.stringify({ 
        message: 'Author data cached and books stored successfully',
        author,
        bookCount: authorData.products.length
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/author-cache' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"products":[{"asin":"123","author":"Functions","rating":"5","type":"book","title":"Book Title","url":"https://example.com","price":19.99}]}'

*/
