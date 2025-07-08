
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLayoutCache } from "./useLayoutCache";

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
  
  // Replace basic Map cache with sophisticated cache
  const layoutCache = useLayoutCache({
    maxAge: 10 * 60 * 1000, // 10 minutes
    maxSize: 100 // 100 cached layouts
  });

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
      
      // CRITICAL FIX: Ensure cache invalidation happens after database save
      // and add delay to prevent race conditions with generator cache access
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to ensure DB consistency
      
      layoutCache.invalidate(layoutConfig.template_id, layoutConfig.format_name);
      
      // Additional cache invalidation for related entries
      layoutCache.invalidate(); // Clear all to prevent stale data
      
      console.log('Layout saved successfully with enhanced cache invalidation');
      toast.success('Layout salvo com sucesso!');
    } catch (error) {
      console.error('Error saving layout:', error);
      toast.error('Erro ao salvar layout');
      throw error;
    }
  };

  const getLayout = async (templateId: string, formatName: string, forceRefresh: boolean = false): Promise<LayoutConfig | null> => {
    try {
      // CRITICAL FIX: When force refresh is true (from generator), ensure we get the absolute latest data
      if (forceRefresh) {
        console.log('Force refresh requested - bypassing cache and adding delay for DB consistency');
        
        // Small delay to ensure database has fully committed the save operation
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Clear specific cache entry to prevent any cached data
        layoutCache.invalidate(templateId, formatName);
      } else {
        // Try cache first for normal operations
        const cached = layoutCache.get(templateId, formatName);
        if (cached) {
          console.log('Returning cached layout for:', templateId, formatName);
          return cached;
        }
      }
      
      console.log(`Fetching fresh layout from DB for template: ${templateId}, format: ${formatName}, forceRefresh: ${forceRefresh}`);
      
      const { data, error } = await supabase
        .from('template_layouts')
        .select('*')
        .eq('template_id', templateId)
        .eq('format_name', formatName)
        .maybeSingle();

      if (error) {
        console.error('Error fetching layout:', error);
        return null;
      }
      
      let result: LayoutConfig | null = null;
      if (data) {
        console.log('Fresh layout fetched from DB:', data);
        result = {
          id: data.id,
          template_id: data.template_id,
          format_name: data.format_name,
          layout_config: data.layout_config as LayoutConfig['layout_config']
        };
      } else {
        console.log('No existing layout found in DB');
      }
      
      // Cache the fresh result (even if null)
      if (!forceRefresh) {
        layoutCache.set(templateId, formatName, result);
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching layout:', error);
      return null;
    }
  };

  const invalidateLayoutCache = (templateId?: string, formatName?: string) => {
    layoutCache.invalidate(templateId, formatName);
    console.log('Layout cache invalidated using sophisticated cache');
  };

  const refreshAllLayouts = async () => {
    console.log('Refreshing all layout data...');
    layoutCache.clear();
    toast.success('Cache de layouts atualizado!');
  };

  const getCacheStats = () => {
    return layoutCache.getStats();
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
    getCacheStats,
    refetch: fetchLayoutElements
  };
};
