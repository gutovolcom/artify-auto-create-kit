
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { platformConfigs } from '@/lib/platformConfigs';

interface TemplateFormatValidatorProps {
  template: any;
  onAddMissingFormats?: (missingFormats: string[]) => void;
  showActions?: boolean;
}

export const TemplateFormatValidator: React.FC<TemplateFormatValidatorProps> = ({
  template,
  onAddMissingFormats,
  showActions = true
}) => {
  const allRequiredFormats = Object.keys(platformConfigs);
  const existingFormats = template.formats?.map((f: any) => f.format_name) || [];
  const missingFormats = allRequiredFormats.filter(format => !existingFormats.includes(format));
  
  const isComplete = missingFormats.length === 0;
  const completionPercentage = Math.round((existingFormats.length / allRequiredFormats.length) * 100);

  const formatLabels: Record<string, string> = {
    youtube: "YouTube",
    youtube_ao_vivo: "YouTube Ao Vivo", 
    youtube_pos_evento: "YouTube Pós Evento",
    feed: "Feed",
    stories: "Stories",
    bannerGCO: "Banner GCO",
    destaque: "Destaque",
    ledStudio: "LED Studio",
    LP: "LP"
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Status do Template</CardTitle>
          <Badge variant={isComplete ? "default" : "destructive"}>
            {isComplete ? (
              <><CheckCircle className="h-3 w-3 mr-1" />Completo</>
            ) : (
              <><AlertCircle className="h-3 w-3 mr-1" />{completionPercentage}% completo</>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isComplete ? (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="h-4 w-4" />
            Todos os formatos estão disponíveis neste template
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <Info className="h-4 w-4" />
              {missingFormats.length} formato{missingFormats.length > 1 ? 's' : ''} faltando
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Formatos faltando:</div>
              <div className="flex flex-wrap gap-1">
                {missingFormats.map(format => (
                  <Badge key={format} variant="outline" className="text-xs">
                    {formatLabels[format] || format}
                  </Badge>
                ))}
              </div>
            </div>

            {showActions && onAddMissingFormats && (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => onAddMissingFormats(missingFormats)}
                className="w-full"
              >
                Adicionar Formatos Faltando
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
