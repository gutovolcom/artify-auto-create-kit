
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Teacher {
  id: string;
  name: string;
  image_url: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useSupabaseTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Erro ao carregar professores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const uploadTeacherImage = async (file: File, teacherId: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${teacherId}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('teachers')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('teachers')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading teacher image:', error);
      throw error;
    }
  };

  const createTeacher = async (name: string, imageFile: File) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Create teacher record first to get ID
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .insert({ 
          name, 
          image_url: 'temp', // temporary URL
          created_by: user.id 
        })
        .select()
        .single();

      if (teacherError) throw teacherError;

      // Upload image and update record
      const imageUrl = await uploadTeacherImage(imageFile, teacherData.id);
      
      const { error: updateError } = await supabase
        .from('teachers')
        .update({ image_url: imageUrl })
        .eq('id', teacherData.id);

      if (updateError) throw updateError;

      await fetchTeachers();
      toast.success('Professor criado com sucesso!');
      return teacherData.id;
    } catch (error) {
      console.error('Error creating teacher:', error);
      toast.error('Erro ao criar professor');
      throw error;
    }
  };

  const deleteTeacher = async (id: string) => {
    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchTeachers();
      toast.success('Professor excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast.error('Erro ao excluir professor');
    }
  };

  return {
    teachers,
    loading,
    createTeacher,
    deleteTeacher,
    refetch: fetchTeachers
  };
};
