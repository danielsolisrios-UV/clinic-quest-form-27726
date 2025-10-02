import { supabase as baseSupabase } from '@/integrations/supabase/client';

// Temporary workaround for Supabase types not being regenerated
// This allows us to use the database tables without TypeScript errors
export const supabase = baseSupabase as any;
