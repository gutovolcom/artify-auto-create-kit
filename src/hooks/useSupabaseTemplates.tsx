
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  formats: TemplateFormat[];
  layouts?: TemplateLayout[];
}

interface TemplateFormat {
  id: string;
  template_id: string;
  format_name: string;
  image_url: string;
  created_at: string;
}

interface TemplateLayout {
  id: string;
  template_id: string;
  format_name: string;
  layout_config: any;
  created_at: string;
  updated_at: string;
}

export const useSupabaseTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data: templatesData, error: templatesError } = await supabase
        .from('templates')
        .select(`
          *,
          formats:template_formats(*),
          layouts:template_layouts(*)
        `)
        .order('updated_at', { ascending: false });

      if (templatesError) throw templatesError;

      console.log('Fetched templates with layouts:', templatesData);
      setTemplates(templatesData || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Erro ao carregar templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const uploadImage = async (file: File, templateId: string, formatName: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${templateId}/${formatName}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('templates')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('templates')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const createTemplate = async (name: string, formatFiles: Record<string, File>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Create template record
      const { data: templateData, error: templateError } = await supabase
        .from('templates')
        .insert({ name, created_by: user.id })
        .select()
        .single();

      if (templateError) throw templateError;

      // Upload images and create format records
      const formatPromises = Object.entries(formatFiles).map(async ([formatName, file]) => {
        const imageUrl = await uploadImage(file, templateData.id, formatName);
        
        return supabase
          .from('template_formats')
          .insert({
            template_id: templateData.id,
            format_name: formatName,
            image_url: imageUrl
          });
      });

      await Promise.all(formatPromises);
      
      // Refresh templates to get the latest data
      await fetchTemplates();
      toast.success('Template criado com sucesso!');
      return templateData.id;
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Erro ao criar template');
      throw error;
    }
  };

  const updateTemplateFormat = async (templateId: string, formatName: string, file: File) => {
    try {
      // Upload new image
      const imageUrl = await uploadImage(file, templateId, formatName);
      
      // Update the format record and template updated_at
      const { error: formatError } = await supabase
        .from('template_formats')
        .update({ image_url: imageUrl })
        .eq('template_id', templateId)
        .eq('format_name', formatName);

      if (formatError) throw formatError;

      // Update template's updated_at timestamp
      const { error: templateError } = await supabase
        .from('templates')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', templateId);

      if (templateError) throw templateError;

      // Refresh templates to get the latest data
      await fetchTemplates();
      console.log('Template format updated, refreshing data');
      return imageUrl;
    } catch (error) {
      console.error('Error updating template format:', error);
      throw error;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchTemplates();
      toast.success('Template excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Erro ao excluir template');
    }
  };

  return {
    templates,
    loading,
    createTemplate,
    updateTemplateFormat,
    deleteTemplate,
    refetch: fetchTemplates
  };
};
