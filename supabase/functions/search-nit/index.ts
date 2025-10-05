import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyName } = await req.json();
    
    if (!companyName || companyName.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'El nombre de la empresa es requerido' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Searching NIT for company: ${companyName}`);

    // Get SerpApi API key from environment
    const serpApiKey = Deno.env.get('SERPAPI_API_KEY');
    if (!serpApiKey) {
      throw new Error('SERPAPI_API_KEY not configured');
    }

    // Construct SerpApi search query
    const searchQuery = `nit ${companyName}`;
    const serpApiUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(searchQuery)}&api_key=${serpApiKey}`;

    console.log(`Calling SerpApi for query: ${searchQuery}`);

    // Make request to SerpApi
    const response = await fetch(serpApiUrl);

    if (!response.ok) {
      throw new Error(`SerpApi request failed with status: ${response.status}`);
    }

    const searchResults = await response.json();
    console.log(`Received SerpApi response`);

    // Extract NIT from organic results
    // Pattern: NIT followed by optional colon/period, then digits with optional commas/periods and a dash
    const nitPattern = /NIT\s*[:.]?\s*([\d,\.]+\-\d+)/gi;
    
    let rawNitValue = null;

    // Search in organic results
    if (searchResults.organic_results) {
      for (const result of searchResults.organic_results) {
        // Check in snippet
        if (result.snippet) {
          const match = result.snippet.match(nitPattern);
          if (match) {
            const valueMatch = match[0].match(/([\d,\.]+\-\d+)/);
            if (valueMatch) {
              rawNitValue = valueMatch[1];
              console.log(`Found NIT in snippet: ${rawNitValue}`);
              break;
            }
          }
        }
        
        // Check in title if not found in snippet
        if (!rawNitValue && result.title) {
          const match = result.title.match(nitPattern);
          if (match) {
            const valueMatch = match[0].match(/([\d,\.]+\-\d+)/);
            if (valueMatch) {
              rawNitValue = valueMatch[1];
              console.log(`Found NIT in title: ${rawNitValue}`);
              break;
            }
          }
        }
      }
    }

    // Check answer box if not found in organic results
    if (!rawNitValue && searchResults.answer_box) {
      const answerText = JSON.stringify(searchResults.answer_box);
      const match = answerText.match(nitPattern);
      if (match) {
        const valueMatch = match[0].match(/([\d,\.]+\-\d+)/);
        if (valueMatch) {
          rawNitValue = valueMatch[1];
          console.log(`Found NIT in answer box: ${rawNitValue}`);
        }
      }
    }

    if (!rawNitValue) {
      console.log('No NIT found in search results');
      return new Response(
        JSON.stringify({ 
          error: 'No se encontró el NIT en los resultados de búsqueda',
          nit: null 
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Clean NIT: remove dots and dashes to get clean number
    // Example: "890.306-950" becomes "890306950" or "890.306.950-6" becomes "8903069506"
    const cleanNit = rawNitValue.replace(/[.,\-]/g, '');
    
    // Validate NIT has at least 9 digits
    if (cleanNit.length < 9) {
      console.log(`NIT too short: ${cleanNit} (${cleanNit.length} digits)`);
      return new Response(
        JSON.stringify({ 
          error: 'El NIT encontrado no tiene al menos 9 dígitos',
          nit: null 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Successfully extracted and cleaned NIT: ${cleanNit} (from ${rawNitValue})`);

    return new Response(
      JSON.stringify({ 
        success: true,
        nit: cleanNit,
        companyName: companyName
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in search-nit function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        nit: null 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
