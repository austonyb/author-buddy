// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Redis } from "https://deno.land/x/upstash_redis@v1.22.0/mod.ts"
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

import { getAuthorPage } from './helpers/get-author-page.ts';
import { extractProductsFromHtml } from './helpers/extract-products-from-html.ts';
import type { Product } from './types.ts';

// Initialize Redis client
const redisUrl = Deno.env.get('KV_REST_API_URL')
const redisToken = Deno.env.get('KV_REST_API_TOKEN')

const redis = new Redis({
  url: redisUrl || '',
  token: redisToken || '',
})

async function scrapeAuthorPage(url: string): Promise<Product[] | null> {
  // Strip everything after '?' from the URL and extract author ID
  const cleanUrl = url.split('?')[0].trim();
  const authorId = cleanUrl.split('/author/')[1]?.split('/')[0];
  
  if (!authorId) {
    console.error('Could not extract author ID from URL:', cleanUrl);
    return null;
  }

  // Check if processed data exists in Redis
  const redisKey = `author:${authorId}`;
  console.log('Redis key:', JSON.stringify(redisKey));
  console.log('Attempting Redis get for key:', redisKey);
  const cachedData = await redis.get(redisKey);
  
  if (cachedData) {
    console.log('Cache data structure:', JSON.stringify(cachedData));
    if (typeof cachedData === 'string') {
      try {
        const parsed = JSON.parse(cachedData) as Product[] | null;
        if (parsed) {
          console.log('Cache hit for author ID:', authorId, 'Found', parsed.length, 'products');
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing cached string data:', e);
      }
    } else if (Array.isArray(cachedData)) {
      console.log('Cache hit for author ID:', authorId, 'Found', cachedData.length, 'products');
      return cachedData as Product[];
    } else if (typeof cachedData === 'object' && cachedData !== null) {
      // Check if it's our processedData structure
      const data = cachedData as { products: Product[] };
      if (data.products && Array.isArray(data.products)) {
        console.log('Cache hit for author ID:', authorId, 'Found', data.products.length, 'products');
        return data.products;
      }
      console.log('Cached object does not contain products array');
    }
  }

  console.log('Cache miss for author ID:', authorId);
  const html = await getAuthorPage(cleanUrl);
  const $ = cheerio.load(html);
  const products = await extractProductsFromHtml($);

  if (!products) {
    return null;
  }

  // Deduplicate products by ASIN
  const uniqueProducts = Array.from(
    products.reduce((map: Map<string, Product>, product: Product) => {
      if (!map.has(product.asin)) {
        map.set(product.asin, product);
      }
      return map;
    }, new Map()).values()
  ) as Product[];

  // Create the processed data structure
  const processedData = {
    url: cleanUrl,
    products: uniqueProducts
  };

  // Store the processed data in Redis with 24 hour expiration
  console.log('Storing in Redis with key:', redisKey);
  await redis.set(redisKey, JSON.stringify(processedData), { ex: 24 * 60 * 60 }); // 24 hours expiration
  console.log('Redis set completed');

  return uniqueProducts;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function checkUserPlanAndUsage(supabaseClient: any, userId: string): Promise<{ allowed: boolean; error?: string }> {
  try {
    console.log('Checking plan for user:', userId);

    // Get user's current active plan with plan details and usage
    const { data: userPlan, error: planError } = await supabaseClient
      .from('user_plans')
      .select(`
        id,
        total_usage,
        plan_id,
        plans!inner (
          id,
          name,
          max_usage
        )
      `)
      .eq('user_id', userId)
      .is('end_date', null)
      .single();

    if (planError) {
      console.error('Plan error details:', {
        error: planError,
        message: planError.message,
        details: planError.details,
        hint: planError.hint
      });
      return { allowed: false, error: `Error checking user plan: ${planError.message}` };
    }

    console.log('User plan data:', userPlan);

    if (!userPlan) {
      console.log('No active plan found for user');
      return { allowed: false, error: 'No active plan found' };
    }

    if (!userPlan.plans) {
      console.error('Plan details missing:', userPlan);
      return { allowed: false, error: 'Plan configuration not found' };
    }

    const maxUsage = userPlan.plans?.max_usage;
    const totalUsage = userPlan.total_usage || 0;

    console.log('Usage calculation:', {
      totalUsage,
      maxUsage,
      planDetails: userPlan.plans
    });

    if (!maxUsage && maxUsage !== 0) {
      console.error('No max usage found for plan:', {
        planId: userPlan.plan_id,
        planDetails: userPlan.plans
      });
      return { allowed: false, error: 'Invalid plan configuration' };
    }

    if (totalUsage >= maxUsage) {
      console.log('Usage limit exceeded:', {
        current: totalUsage,
        limit: maxUsage
      });
      return { allowed: false, error: `Monthly usage limit exceeded (${totalUsage}/${maxUsage})` };
    }

    console.log('Usage check passed:', {
      current: totalUsage,
      limit: maxUsage
    });
    return { allowed: true };
  } catch (error) {
    console.error('Unexpected error in checkUserPlanAndUsage:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return { allowed: false, error: 'Unexpected error checking user plan' };
  }
}

async function recordUsage(supabaseClient: any, userId: string): Promise<{ error?: string }> {
  try {
    // Get user's current plan ID
    const { data: userPlan, error: planError } = await supabaseClient
      .from('user_plans')
      .select('id, total_usage')
      .eq('user_id', userId)
      .is('end_date', null)
      .single();

    if (planError) {
      console.error('Plan error in recordUsage:', planError);
      return { error: 'Error finding user plan' };
    }

    if (!userPlan) {
      return { error: 'No active plan found' };
    }

    // Record usage in both tables
    const { error: usageError } = await supabaseClient
      .from('usage')
      .insert({
        user_plan_id: userPlan.id,
        usage_amount: 1
      });

    if (usageError) {
      console.error('Usage error in recordUsage:', usageError);
      return { error: 'Error recording usage' };
    }

    // Update total_usage and last_usage_date in user_plans
    const { error: updateError } = await supabaseClient
      .from('user_plans')
      .update({ 
        total_usage: (userPlan.total_usage || 0) + 1,
        last_usage_date: new Date().toISOString()
      })
      .eq('id', userPlan.id);

    if (updateError) {
      console.error('Error updating user_plans:', updateError);
      return { error: 'Error updating usage totals' };
    }

    return {};
  } catch (error) {
    console.error('Unexpected error in recordUsage:', error);
    return { error: 'Unexpected error recording usage' };
  }
}

async function recordDownload(supabaseClient: any, userId: string, data: any): Promise<{ error?: string }> {
  try {
    // Get user's current plan ID
    const { data: userPlan, error: planError } = await supabaseClient
      .from('user_plans')
      .select('id')
      .eq('user_id', userId)
      .is('end_date', null)
      .single();

    if (planError) {
      console.error('Plan error in recordDownload:', planError);
      return { error: 'Error finding user plan' };
    }

    if (!userPlan) {
      return { error: 'No active plan found' };
    }

    // Record the download
    const { error: downloadError } = await supabaseClient
      .from('downloads')
      .insert({
        user_id: userId,
        user_plan_id: userPlan.id,
        data: data
      });

    if (downloadError) {
      console.error('Error recording download:', downloadError);
      return { error: 'Error recording download' };
    }

    return {};
  } catch (error) {
    console.error('Unexpected error in recordDownload:', error);
    return { error: 'Unexpected error recording download' };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get auth token from request header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false }
      }
    );

    // Get user from auth header
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check user's plan and usage
    const { allowed, error: usageError } = await checkUserPlanAndUsage(supabaseClient, user.id);
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: usageError || 'Usage check failed' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { url } = await req.json();
    
    // Validate request
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Scrape the author page
    const products = await scrapeAuthorPage(url);
    
    if (!products) {
      return new Response(
        JSON.stringify({ error: 'Failed to scrape author page' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record the usage
    const { error: recordError } = await recordUsage(supabaseClient, user.id);
    if (recordError) {
      console.error('Failed to record usage:', recordError);
    }

    // Record the download
    const { error: downloadError } = await recordDownload(supabaseClient, user.id, products);
    if (downloadError) {
      console.error('Failed to record download:', downloadError);
    }

    // Parse the products into JSON format
    const productsData: Product[] = products.map((product) => ({
      asin: product.asin,
      title: product.title,
      author: product.author,
      rating: product.rating,
      type: product.type,
      url: product.url,
      price: product.price
    }));

    return new Response(
      JSON.stringify({ products: productsData }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/asin-gather' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
