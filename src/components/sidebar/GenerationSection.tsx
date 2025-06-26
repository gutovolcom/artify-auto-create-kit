
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar";
import { Sparkles, AlertCircle } from "lucide-react";

interface GenerationSectionProps {
  isGenerating: boolean;
  generationProgress: number;
  currentGeneratingFormat: string;
  missingFields: string[];
  isFormReady: boolean;
  onGenerate: () => void;
}

export const GenerationSection = ({
  isGenerating,
  generationProgress,
  currentGeneratingFormat,
  missingFields,
  isFormReady,
  onGenerate
}: GenerationSectionProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Geração</SidebarGroupLabel>
      <SidebarGroupContent className="space-y-4">
        {missingFields.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">Campos obrigatórios pendentes:</div>
              <ul className="text-sm space-y-1">
                {missingFields.map((field, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-current rounded-full"></span>
                    {field}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {isGenerating && (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Gerando artes... {generationProgress}%
              </p>
              {currentGeneratingFormat && (
                <p className="text-xs text-gray-500">
                  {currentGeneratingFormat}
                </p>
              )}
            </div>
            <Progress value={generationProgress} className="w-full h-2" />
          </div>
        )}
        
        <Button
          onClick={onGenerate}
          disabled={!isFormReady || isGenerating}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Gerando...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Gerar Artes
            </>
          )}
        </Button>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
