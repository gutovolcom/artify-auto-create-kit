
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LayoutElement {
  id: string;
  name: string;
  field_mapping: string;
  element_type: string;
  default_style: any;
}

interface LayoutConfig {
  id?: string;
  template_id: string;
  format_name: string;
  layout_config: {
    elements: Array<{
      id: string;
      type: string;
      field: string;
      position: { x: number; y: number };
      style?: any;
      size?: { width: number; height: number };
      constraints?: any;
    }>;
  };
}

export const useLayoutEditor = () => {
  const [layoutElements, setLayoutElements] = useState<LayoutElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLayoutElements = async () => {
    try {
      setError(null);
      console.log('Fetching layout elements...');
      
      const { data, error } = await supabase
        .from('layout_elements')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching layout elements:', error);
        throw error;
      }
      
      console.log('Layout elements fetched successfully:', data);
      setLayoutElements(data || []);
    } catch (error) {
      console.error('Error fetching layout elements:', error);
      setError('Erro ao carregar elementos de layout');
      toast.error('Erro ao carregar elementos de layout');
    } finally {
      setLoading(false);
    }
  };

  const saveLayout = async (layoutConfig: LayoutConfig) => {
    try {
      console.log('Saving layout configuration:', layoutConfig);
      
      const { error } = await supabase
        .from('template_layouts')
        .upsert({
          template_id: layoutConfig.template_id,
          format_name: layoutConfig.format_name,
          layout_config: layoutConfig.layout_config,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'template_id,format_name'
        });

      if (error) {
        console.error('Error saving layout:', error);
        throw error;
      }
      
      console.log('Layout saved successfully');
      toast.success('Layout salvo com sucesso!');
    } catch (error) {
      console.error('Error saving layout:', error);
      toast.error('Erro ao salvar layout');
      throw error;
    }
  };

  const getLayout = async (templateId: string, formatName: string): Promise<LayoutConfig | null> => {
    try {
      console.log('Fetching layout for template:', templateId, 'format:', formatName);
      
      const { data, error } = await supabase
        .from('template_layouts')
        .select('*')
        .eq('template_id', templateId)
        .eq('format_name', formatName)
        .maybeSingle();

      if (error) {
        console.error('Error fetching layout:', error);
        throw error;
      }
      
      if (data) {
        console.log('Layout found:', data);
        return {
          id: data.id,
          template_id: data.template_id,
          format_name: data.format_name,
          layout_config: data.layout_config as LayoutConfig['layout_config']
        };
      }
      
      console.log('No existing layout found');
      return null;
    } catch (error) {
      console.error('Error fetching layout:', error);
      toast.error('Erro ao carregar layout existente');
      return null;
    }
  };

  useEffect(() => {
    fetchLayoutElements();
  }, []);

  return {
    layoutElements,
    loading,
    error,
    saveLayout,
    getLayout,
    refetch: fetchLayoutElements
  };
};
