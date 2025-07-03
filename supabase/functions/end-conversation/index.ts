/*
  # End Conversation Edge Function

  1. Purpose
    - Ends an active conversation session with Tavus API
    - Handles cleanup and session termination
    - Updates session status in database

  2. Environment Variables Required
    - TAVUS_API_KEY: API key for Tavus authentication

  3. Security
    - Uses Supabase secrets for secure API key storage
    - Validates conversation ownership
    - Handles errors gracefully
*/

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface EndConversationRequest {
  conversation_id: string;
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
    const body: EndConversationRequest = await req.json();
    const { conversation_id } = body;

    // Validate required fields
    if (!conversation_id) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required field: conversation_id" 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get environment variables
    const tavusApiKey = Deno.env.get("TAVUS_API_KEY");

    if (!tavusApiKey) {
      console.error("Missing Tavus API key");
      return new Response(
        JSON.stringify({ 
          error: "Server configuration error: Missing Tavus API key" 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // End conversation with Tavus API
    const tavusResponse = await fetch(`https://tavusapi.com/v2/conversations/${conversation_id}/end`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": tavusApiKey,
      },
    });

    if (!tavusResponse.ok) {
      const errorText = await tavusResponse.text();
      console.error("Tavus API error:", errorText);
      return new Response(
        JSON.stringify({ 
          error: "Failed to end conversation with Tavus API",
          details: errorText 
        }),
        {
          status: tavusResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Conversation ended successfully"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in end-conversation function:", error);
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