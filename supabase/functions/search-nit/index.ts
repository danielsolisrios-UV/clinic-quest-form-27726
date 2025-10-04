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

    // Construct Google search query
    const searchQuery = `nit ${companyName}`;
    const encodedQuery = encodeURIComponent(searchQuery);
    const googleUrl = `https://www.google.com/search?q=${encodedQuery}`;

    console.log(`Google search URL: ${googleUrl}`);

    // Make request to Google
    const response = await fetch(googleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      }
    });

    if (!response.ok) {
      throw new Error(`Google search failed with status: ${response.status}`);
    }

    const htmlText = await response.text();
    console.log(`Received HTML response (length: ${htmlText.length})`);

    // Extract NIT using regex pattern similar to Python script
    // Pattern: NIT followed by optional colon/period, then digits with optional commas/periods and a dash
    const nitPattern = /NIT\s*[:.]?\s*([\d,\.]+\-\d+)/gi;
    const matches = htmlText.match(nitPattern);

    if (!matches || matches.length === 0) {
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

    // Extract the actual NIT value from the first match
    const firstMatch = matches[0];
    const nitValueMatch = firstMatch.match(/([\d,\.]+\-\d+)/);
    
    if (!nitValueMatch) {
      console.log('Could not extract NIT value from match');
      return new Response(
        JSON.stringify({ 
          error: 'No se pudo extraer el valor del NIT',
          nit: null 
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const nitValue = nitValueMatch[1];
    console.log(`Successfully extracted NIT: ${nitValue}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        nit: nitValue,
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
