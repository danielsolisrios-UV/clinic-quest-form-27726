// Temporary database types until Supabase types are regenerated
export interface FormData {
  id: string;
  user_id: string;
  form_content: {
    formData: any;
    completedSections: string[];
    totalPoints: number;
    achievements: number[];
    lastSaved: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  nombre_completo: string;
  email: string;
  created_at: string;
  updated_at: string;
}
