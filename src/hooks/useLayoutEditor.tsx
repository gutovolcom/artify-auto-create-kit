
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
  const [layoutCache, setLayoutCache] = useState<Map<string, LayoutConfig | null>>(new Map());

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
      
      // Invalidate cache for this specific layout
      const cacheKey = `${layoutConfig.template_id}-${layoutConfig.format_name}`;
      setLayoutCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(cacheKey);
        return newCache;
      });
      
      console.log('Layout saved successfully and cache invalidated');
      toast.success('Layout salvo com sucesso!');
    } catch (error) {
      console.error('Error saving layout:', error);
      toast.error('Erro ao salvar layout');
      throw error;
    }
  };

  const getLayout = async (templateId: string, formatName: string, forceRefresh: boolean = false): Promise<LayoutConfig | null> => {
    try {
      const cacheKey = `${templateId}-${formatName}`;
      
      // Return cached result if available and not forcing refresh
      if (!forceRefresh && layoutCache.has(cacheKey)) {
        console.log('Returning cached layout for:', templateId, formatName);
        return layoutCache.get(cacheKey) || null;
      }
      
      console.log('Fetching fresh layout for template:', templateId, 'format:', formatName);
      
      const { data, error } = await supabase
        .from('template_layouts')
        .select('*')
        .eq('template_id', templateId)
        .eq('format_name', formatName)
        .maybeSingle();

      if (error) {
        console.error('Error fetching layout:', error);
        // Cache null result to avoid repeated failed requests
        setLayoutCache(prev => new Map(prev).set(cacheKey, null));
        return null;
      }
      
      let result: LayoutConfig | null = null;
      if (data) {
        console.log('Layout found:', data);
        result = {
          id: data.id,
          template_id: data.template_id,
          format_name: data.format_name,
          layout_config: data.layout_config as LayoutConfig['layout_config']
        };
      } else {
        console.log('No existing layout found');
      }
      
      // Cache the result
      setLayoutCache(prev => new Map(prev).set(cacheKey, result));
      return result;
    } catch (error) {
      console.error('Error fetching layout:', error);
      return null;
    }
  };

  const invalidateLayoutCache = (templateId?: string, formatName?: string) => {
    if (templateId && formatName) {
      // Invalidate specific layout
      const cacheKey = `${templateId}-${formatName}`;
      setLayoutCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(cacheKey);
        console.log('Invalidated layout cache for:', cacheKey);
        return newCache;
      });
    } else {
      // Invalidate all cached layouts
      setLayoutCache(new Map());
      console.log('Invalidated all layout cache');
    }
  };

  const refreshAllLayouts = async () => {
    console.log('Refreshing all layout data...');
    setLayoutCache(new Map());
    toast.success('Cache de layouts atualizado!');
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
    invalidateLayoutCache,
    refreshAllLayouts,
    refetch: fetchLayoutElements
  };
};
