
-- Create separate tables for advanced editor (completely isolated from main system)
CREATE TABLE public.advanced_editor_layouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  template_id TEXT NOT NULL,
  format_name TEXT NOT NULL,
  layout_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create separate table for advanced editor templates
CREATE TABLE public.advanced_editor_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security for advanced editor layouts
ALTER TABLE public.advanced_editor_layouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own advanced layouts" 
  ON public.advanced_editor_layouts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own advanced layouts" 
  ON public.advanced_editor_layouts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own advanced layouts" 
  ON public.advanced_editor_layouts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own advanced layouts" 
  ON public.advanced_editor_layouts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add Row Level Security for advanced editor templates
ALTER TABLE public.advanced_editor_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own advanced templates" 
  ON public.advanced_editor_templates 
  FOR SELECT 
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own advanced templates" 
  ON public.advanced_editor_templates 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own advanced templates" 
  ON public.advanced_editor_templates 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own advanced templates" 
  ON public.advanced_editor_templates 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_advanced_editor_layouts_user_id ON public.advanced_editor_layouts(user_id);
CREATE INDEX idx_advanced_editor_layouts_template_id ON public.advanced_editor_layouts(template_id);
CREATE INDEX idx_advanced_editor_templates_user_id ON public.advanced_editor_templates(user_id);
CREATE INDEX idx_advanced_editor_templates_public ON public.advanced_editor_templates(is_public) WHERE is_public = true;
