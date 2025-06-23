
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/LoginForm';
import { Navbar } from '@/components/Navbar';
import { AdvancedEditorContainer } from '@/components/advanced-editor/AdvancedEditorContainer';
import { AdvancedTemplateSelector } from '@/components/advanced-editor/AdvancedTemplateSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const AdvancedEditor = () => {
  const { user, loading } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<{
    id: string;
    name: string;
    formatName: string;
    backgroundImageUrl: string;
    formatDimensions: { width: number; height: number };
  } | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Advanced Editor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <Palette className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Advanced Editor Access</CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Please sign in to access the Advanced Layout Editor
                </p>
              </CardHeader>
              <CardContent>
                <LoginForm onLogin={(userType) => {
                  toast.success(`Logged in as ${userType}`);
                }} />
                <div className="mt-4 text-center">
                  <Link to="/">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Main App
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Palette className="w-8 h-8 text-indigo-600" />
              Advanced Layout Editor
            </h1>
            <p className="text-gray-600 mt-1">
              Professional layout editor with advanced features
            </p>
          </div>
          
          <div className="flex gap-2">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Main App
              </Button>
            </Link>
          </div>
        </div>

        {!selectedTemplate ? (
          <AdvancedTemplateSelector onSelectTemplate={setSelectedTemplate} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Editing: {selectedTemplate.name} - {selectedTemplate.formatName}
                </h2>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setSelectedTemplate(null)}
              >
                Change Template
              </Button>
            </div>
            
            <AdvancedEditorContainer
              templateId={selectedTemplate.id}
              formatName={selectedTemplate.formatName}
              backgroundImageUrl={selectedTemplate.backgroundImageUrl}
              formatDimensions={selectedTemplate.formatDimensions}
              onSave={(layoutData) => {
                console.log('Advanced layout saved:', layoutData);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedEditor;
