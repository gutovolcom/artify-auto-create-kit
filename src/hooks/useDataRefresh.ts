
import { useState } from "react";
import { useSupabaseTemplates } from "@/hooks/useSupabaseTemplates";
import { useLayoutEditor } from "@/hooks/useLayoutEditor";
import { useNotifications } from "@/hooks/useNotifications";

export const useDataRefresh = () => {
  const { refetch: refetchTemplates } = useSupabaseTemplates();
  const { refreshAllLayouts } = useLayoutEditor();
  const notifications = useNotifications();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAll = async () => {
    setIsRefreshing(true);
    try {
      console.log('🔄 Starting complete refresh: templates + layouts');
      
      // Refresh templates first
      await refetchTemplates();
      
      // Then refresh all layout caches
      await refreshAllLayouts();
      
      notifications.success.templatesUpdated();
      return true;
    } catch (error) {
      console.error('💥 Error during refresh:', error);
      notifications.error.updateFailed("dados");
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    refreshAll,
    isRefreshing
  };
};
