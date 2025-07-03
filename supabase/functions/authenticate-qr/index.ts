import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface QRAuthRequest {
  qr_data: string
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
    const body: QRAuthRequest = await req.json()
    
    // Validate required fields
    if (!body.qr_data) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: qr_data' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // For demo purposes, extract student ID from QR data
    // In production, you'd validate the QR signature and decrypt the data
    let studentId: string
    
    if (body.qr_data.startsWith('student_qr_')) {
      // Demo QR format: student_qr_timestamp
      // Create a demo student if it doesn't exist
      studentId = '550e8400-e29b-41d4-a716-446655440000'
      
      // Check if demo student exists, create if not
      const { data: existingStudent, error: fetchError } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
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

      if (!existingStudent) {
        // Create demo student
        const { data: newStudent, error: insertError } = await supabase
          .from('students')
          .insert({
            id: studentId,
            name: 'Alex Johnson',
            grade: 3,
            class_id: 'class-456'
          })
          .select()
          .single()

        if (insertError) {
          console.error('Failed to create demo student:', insertError)
          return new Response(
            JSON.stringify({ error: 'Failed to create student', details: insertError.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
      }
    } else {
      // In production, decode and validate the QR data
      return new Response(
        JSON.stringify({ error: 'Invalid QR code format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get student data
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      return new Response(
        JSON.stringify({ error: 'Student not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Generate auth token (in production, use proper JWT)
    const token = `student_${studentId}_${Date.now()}`
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 hours

    return new Response(
      JSON.stringify({
        student,
        token,
        expires_at: expiresAt
      }),
      { 
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