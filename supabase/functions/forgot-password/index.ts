import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const resendApiKey = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ForgotPasswordRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: ForgotPasswordRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email es requerido" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if email exists in profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, nombre_completo")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      // Don't reveal if email exists or not for security
      console.log("Email not found:", email);
      return new Response(
        JSON.stringify({ 
          message: "Si el correo existe, recibirás un código de recuperación" 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration to 10 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Save code to database
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        reset_code: resetCode,
        reset_code_expires: expiresAt.toISOString(),
      })
      .eq("id", profile.id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      throw new Error("Error al procesar la solicitud");
    }

    // Send email with code using Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Artemis <onboarding@resend.dev>",
        to: [email],
        subject: "Código de Recuperación de Contraseña",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2E3B82;">Recuperación de Contraseña</h2>
            <p>Hola ${profile.nombre_completo || "Usuario"},</p>
            <p>Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código de 6 dígitos:</p>
            <div style="background-color: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <h1 style="color: #2E3B82; font-size: 32px; letter-spacing: 8px; margin: 0;">${resetCode}</h1>
            </div>
            <p><strong>Este código expirará en 10 minutos.</strong></p>
            <p>Si no solicitaste este código, puedes ignorar este correo de forma segura.</p>
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
            <p style="color: #6B7280; font-size: 12px;">Este es un correo automático, por favor no respondas.</p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json().catch(() => ({ message: "Unknown error" }));
      console.error("Resend API error:", errorData);
      
      // Check if it's a domain verification error
      if (errorData.statusCode === 403 && errorData.message?.includes("verify a domain")) {
        throw new Error("Configuración de email pendiente. Verifica tu dominio en Resend para enviar correos.");
      }
      
      throw new Error("Error al enviar el correo. Verifica la configuración de Resend.");
    }

    const emailData = await emailResponse.json();
    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ 
        message: "Código de recuperación enviado al correo" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in forgot-password function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error al procesar la solicitud" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
