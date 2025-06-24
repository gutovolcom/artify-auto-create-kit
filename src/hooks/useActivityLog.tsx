
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { EventData } from "@/pages/Index";

export const useActivityLog = () => {
  const { user } = useAuth();

  const logActivity = async (
    eventData: EventData,
    generatedFormats: string[]
  ) => {
    if (!user) return;

    try {
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          event_title: eventData.classTheme || 'Event', // Use classTheme instead of title
          event_date: eventData.date,
          template_id: eventData.kvImageId,
          teacher_ids: eventData.teacherImages || [],
          generated_formats: generatedFormats
        });

      console.log('Activity logged successfully');
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  return { logActivity };
};
