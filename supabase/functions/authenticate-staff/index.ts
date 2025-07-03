import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface StaffAuthRequest {
  email: string
  password: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const body: StaffAuthRequest = await req.json()
    
    // Validate required fields
    if (!body.email || !body.password) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // For demo purposes, create a demo educator if using demo credentials
    if (body.email === 'demo@school.edu' && body.password === 'demo123') {
      const demoEducatorId = '660e8400-e29b-41d4-a716-446655440001'
      
      // Check if demo educator exists, create if not
      const { data: existingEducator, error: fetchError } = await supabase
        .from('educators')
        .select('*')
        .eq('id', demoEducatorId)
        .maybeSingle()

      if (fetchError) {
        console.error('Database error:', fetchError)
        return new Response(
          JSON.stringify({ error: 'Database error', details: fetchError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      if (!existingEducator) {
        // Create demo educator
        const { data: newEducator, error: insertError } = await supabase
          .from('educators')
          .insert({
            id: demoEducatorId,
            name: 'Ms. Sarah Wilson',
            email: 'demo@school.edu',
            class_ids: ['class-456', 'class-789']
          })
          .select()
          .single()

        if (insertError) {
          console.error('Failed to create demo educator:', insertError)
          return new Response(
            JSON.stringify({ error: 'Failed to create educator', details: insertError.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
      }

      // Get educator data
      const { data: educator, error: educatorError } = await supabase
        .from('educators')
        .select('*')
        .eq('id', demoEducatorId)
        .single()

      if (educatorError || !educator) {
        return new Response(
          JSON.stringify({ error: 'Educator not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Generate auth token (in production, use proper JWT)
      const token = `staff_${demoEducatorId}_${Date.now()}`
      const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 hours

      return new Response(
        JSON.stringify({
          educator,
          token,
          expires_at: expiresAt
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // In production, validate credentials against your auth system
    // For now, return invalid credentials for non-demo accounts
    return new Response(
      JSON.stringify({ error: 'Invalid credentials' }),
      { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})