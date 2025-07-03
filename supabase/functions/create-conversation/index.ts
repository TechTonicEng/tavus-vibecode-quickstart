import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ConversationRequest {
  student_id: string
  mood_emoji: string
  mood_score: number
  sel_skill: string
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

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const body: ConversationRequest = await req.json()
    
    // Validate required fields
    if (!body.student_id || !body.mood_emoji || !body.sel_skill) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: student_id, mood_emoji, sel_skill' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create a new session record
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        student_id: body.student_id,
        mood_emoji: body.mood_emoji,
        mood_score: body.mood_score || 0,
        sel_skill: body.sel_skill,
        transcript: '',
        flags: [],
        duration: 0
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Database error:', sessionError)
      return new Response(
        JSON.stringify({ error: 'Failed to create session', details: sessionError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get Tavus configuration from environment
    const tavusApiKey = Deno.env.get('TAVUS_API_KEY')
    const tavusPersonaId = Deno.env.get('TAVUS_PERSONA_ID')
    const tavusReplicaId = Deno.env.get('TAVUS_REPLICA_ID')

    if (!tavusApiKey || !tavusPersonaId || !tavusReplicaId) {
      console.error('Missing Tavus configuration')
      return new Response(
        JSON.stringify({ error: 'Missing Tavus configuration' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create Tavus conversation
    try {
      const tavusResponse = await fetch('https://tavusapi.com/v2/conversations', {
        method: 'POST',
        headers: {
          'x-api-key': tavusApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          replica_id: tavusReplicaId,
          persona_id: tavusPersonaId,
          callback_url: `${supabaseUrl}/functions/v1/end-conversation`,
          properties: {
            max_call_duration: 300, // 5 minutes
            participant_left_timeout: 10,
            participant_absent_timeout: 30,
          },
        }),
      })

      if (!tavusResponse.ok) {
        const errorText = await tavusResponse.text()
        console.error('Tavus API error:', errorText)
        return new Response(
          JSON.stringify({ error: 'Failed to create Tavus conversation', details: errorText }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      const tavusData = await tavusResponse.json()

      return new Response(
        JSON.stringify({
          session_id: session.id,
          conversation_url: tavusData.conversation_url,
          conversation_id: tavusData.conversation_id,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } catch (tavusError) {
      console.error('Tavus request failed:', tavusError)
      return new Response(
        JSON.stringify({ error: 'Failed to connect to Tavus API', details: tavusError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

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