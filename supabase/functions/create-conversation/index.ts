/*
  # Create Conversation Edge Function

  1. Purpose
    - Creates a new conversation session with Tavus API
    - Handles authentication with Tavus using API keys
    - Returns conversation details for frontend integration

  2. Environment Variables Required
    - TAVUS_API_KEY: API key for Tavus authentication
    - TAVUS_PERSONA_ID: Persona identifier for the conversation
    - TAVUS_REPLICA_ID: Replica identifier for the conversation

  3. Security
    - Uses Supabase secrets for secure API key storage
    - Validates input parameters
    - Handles errors gracefully
*/

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface CreateConversationRequest {
  student_id: string;
  mood: string;
  sel_skill: string;
}

interface TavusConversationResponse {
  conversation_id: string;
  conversation_url: string;
  status: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const body: CreateConversationRequest = await req.json();
    const { student_id, mood, sel_skill } = body;

    // Validate required fields
    if (!student_id || !mood || !sel_skill) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: student_id, mood, sel_skill" 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get environment variables
    const tavusApiKey = Deno.env.get("TAVUS_API_KEY");
    const tavusPersonaId = Deno.env.get("TAVUS_PERSONA_ID");
    const tavusReplicaId = Deno.env.get("TAVUS_REPLICA_ID");

    if (!tavusApiKey || !tavusPersonaId || !tavusReplicaId) {
      console.error("Missing Tavus environment variables");
      return new Response(
        JSON.stringify({ 
          error: "Server configuration error: Missing Tavus credentials" 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create conversation with Tavus API
    const tavusResponse = await fetch("https://tavusapi.com/v2/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": tavusApiKey,
      },
      body: JSON.stringify({
        replica_id: tavusReplicaId,
        persona_id: tavusPersonaId,
        callback_url: null, // Optional webhook URL
        properties: {
          max_call_duration: 600, // 10 minutes
          participant_left_timeout: 60,
          participant_absent_timeout: 30,
          enable_recording: false,
          enable_transcription: true,
          language: "en",
        },
        context: {
          student_id,
          mood,
          sel_skill,
          session_type: "sel_practice"
        }
      }),
    });

    if (!tavusResponse.ok) {
      const errorText = await tavusResponse.text();
      console.error("Tavus API error:", errorText);
      return new Response(
        JSON.stringify({ 
          error: "Failed to create conversation with Tavus API",
          details: errorText 
        }),
        {
          status: tavusResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const conversationData: TavusConversationResponse = await tavusResponse.json();

    // Return the conversation details
    return new Response(
      JSON.stringify({
        conversation_id: conversationData.conversation_id,
        conversation_url: conversationData.conversation_url,
        status: conversationData.status || "created"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in create-conversation function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});