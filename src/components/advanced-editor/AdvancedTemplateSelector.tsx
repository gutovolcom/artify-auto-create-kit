import React from 'react';
import { useAdvancedTemplateFormats } from '@/hooks/useAdvancedTemplateFormats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Image, Palette } from 'lucide-react';

interface AdvancedTemplateSelectorProps {
  onSelectTemplate: (template: {
    id: string;
    name: string;
    formatName: string;
    backgroundImageUrl: string;
    formatDimensions: { width: number; height: number };
  }) => void;
}

export const AdvancedTemplateSelector: React.FC<AdvancedTemplateSelectorProps> = ({
  onSelectTemplate
}) => {
  const { templates, templateFormats, loading, error } = useAdvancedTemplateFormats();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full mb-4" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Templates
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!templates?.length) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Templates Available
          </h3>
          <p className="text-gray-600 mb-6">
            Create templates in the main app to use in the Advanced Editor
          </p>
        </CardContent>
      </Card>
    );
  }

  const getFormatsForTemplate = (templateId: string) => {
    return templateFormats?.filter(format => format.template_id === templateId) || [];
  };

  const getFormatDimensions = (formatName: string) => {
    const dimensions: Record<string, { width: number; height: number }> = {
      'Instagram Square': { width: 1080, height: 1080 },
      'Instagram Story': { width: 1080, height: 1920 },
      'Facebook Post': { width: 1200, height: 630 },
      'LinkedIn Post': { width: 1200, height: 627 },
      'Twitter Post': { width: 1200, height: 675 },
      'A4 Print': { width: 2480, height: 3508 },
    };
    return dimensions[formatName] || { width: 1080, height: 1080 };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Select Template & Format
          </CardTitle>
          <p className="text-sm text-gray-600">
            Choose a template and format to start editing in the Advanced Editor
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {templates.map((template) => {
          const formats = getFormatsForTemplate(template.id);
          
          return (
            <Card key={template.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="truncate">{template.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {formats.length} format{formats.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {formats.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">
                        No formats available for this template
                      </p>
                    </div>
                  ) : (
                    formats.map((format) => (
                      <div 
                        key={format.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 bg-cover bg-center rounded border border-gray-200"
                            style={{ backgroundImage: `url(${format.image_url})` }}
                          />
                          <div>
                            <p className="font-medium text-sm">{format.format_name}</p>
                            <p className="text-xs text-gray-500">
                              {getFormatDimensions(format.format_name).width} × {getFormatDimensions(format.format_name).height}
                            </p>
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          onClick={() => onSelectTemplate({
                            id: template.id,
                            name: template.name,
                            formatName: format.format_name,
                            backgroundImageUrl: format.image_url,
                            formatDimensions: getFormatDimensions(format.format_name)
                          })}
                        >
                          Edit
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
