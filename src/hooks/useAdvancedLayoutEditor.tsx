
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface LayoutElement {
  id: string;
  name: string;
  element_type: string;
  field_mapping: string;
  default_style?: any;
}

export const useAdvancedLayoutEditor = () => {
  const { user } = useAuth();
  const [layoutElements, setLayoutElements] = useState<LayoutElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch layout elements (reuse from main system)
  useEffect(() => {
    const fetchLayoutElements = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('layout_elements')
          .select('*')
          .order('name');

        if (error) throw error;
        setLayoutElements(data || []);
      } catch (err: any) {
        console.error('Error fetching layout elements:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLayoutElements();
  }, []);

  // Save advanced layout to isolated table
  const saveAdvancedLayout = async (templateId: string, formatName: string, layoutData: any[]) => {
    if (!user) {
      throw new Error('User must be authenticated to save layouts');
    }

    try {
      console.log('💾 Saving advanced layout:', { templateId, formatName, layoutCount: layoutData.length });

      const { data, error } = await supabase
        .from('advanced_editor_layouts')
        .upsert({
          user_id: user.id,
          template_id: templateId,
          format_name: formatName,
          layout_data: layoutData,
          metadata: {
            version: '1.0',
            editor: 'advanced',
            savedAt: new Date().toISOString(),
            elementCount: layoutData.length
          },
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,template_id,format_name'
        })
        .select();

      if (error) throw error;

      console.log('✅ Advanced layout saved successfully:', data);
      return data;
    } catch (err: any) {
      console.error('❌ Error saving advanced layout:', err);
      throw err;
    }
  };

  // Get advanced layout from isolated table
  const getAdvancedLayout = async (templateId: string, formatName: string) => {
    if (!user) {
      console.log('⚠️ No user authenticated, returning empty layout');
      return [];
    }

    try {
      console.log('📖 Loading advanced layout:', { templateId, formatName });

      const { data, error } = await supabase
        .from('advanced_editor_layouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('template_id', templateId)
        .eq('format_name', formatName)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        console.log('✅ Advanced layout loaded:', {
          id: data.id,
          elementCount: Array.isArray(data.layout_data) ? data.layout_data.length : 0,
          metadata: data.metadata
        });
        return Array.isArray(data.layout_data) ? data.layout_data : [];
      } else {
        console.log('📭 No advanced layout found, returning empty layout');
        return [];
      }
    } catch (err: any) {
      console.error('❌ Error loading advanced layout:', err);
      return [];
    }
  };

  return {
    layoutElements,
    loading,
    error,
    saveAdvancedLayout: saveAdvancedLayout,
    getAdvancedLayout: getAdvancedLayout
  };
};
