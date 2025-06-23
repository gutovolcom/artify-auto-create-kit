
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Template {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface TemplateFormat {
  id: string;
  template_id: string;
  format_name: string;
  image_url: string;
  created_at: string;
}

export const useAdvancedTemplateFormats = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateFormats, setTemplateFormats] = useState<TemplateFormat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplatesAndFormats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch templates
        const { data: templatesData, error: templatesError } = await supabase
          .from('templates')
          .select('*')
          .order('created_at', { ascending: false });

        if (templatesError) throw templatesError;

        // Fetch template formats
        const { data: formatsData, error: formatsError } = await supabase
          .from('template_formats')
          .select('*')
          .order('created_at', { ascending: false });

        if (formatsError) throw formatsError;

        setTemplates(templatesData || []);
        setTemplateFormats(formatsData || []);
      } catch (err: any) {
        console.error('Error fetching templates and formats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplatesAndFormats();
  }, []);

  return {
    templates,
    templateFormats,
    loading,
    error
  };
};
