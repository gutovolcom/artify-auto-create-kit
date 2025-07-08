-- Create template_tags table for the tagging system
-- Run this SQL script in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS template_tags (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id uuid NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    tag_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    
    -- Ensure no duplicate tags per template
    UNIQUE(template_id, tag_name)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_template_tags_template_id ON template_tags(template_id);
CREATE INDEX IF NOT EXISTS idx_template_tags_tag_name ON template_tags(tag_name);

-- Enable Row Level Security (RLS)
ALTER TABLE template_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Allow users to read all tags
CREATE POLICY "Users can read all template tags" ON template_tags
    FOR SELECT USING (true);

-- Allow authenticated users to insert tags
CREATE POLICY "Authenticated users can insert template tags" ON template_tags
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update tags they created
CREATE POLICY "Users can update their own template tags" ON template_tags
    FOR UPDATE USING (auth.uid() = created_by);

-- Allow users to delete tags they created
CREATE POLICY "Users can delete their own template tags" ON template_tags
    FOR DELETE USING (auth.uid() = created_by);

-- Optional: Grant permissions (if needed)
-- GRANT ALL ON template_tags TO authenticated;
-- GRANT ALL ON template_tags TO service_role;