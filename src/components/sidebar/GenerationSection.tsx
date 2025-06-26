
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { AlertCircle } from "lucide-react";

interface GenerationSectionProps {
  isGenerating: boolean;
  generationProgress: number;
  currentGeneratingFormat: string;
  isFormReady: boolean;
  missingFields: string[]; // ✅ apenas uma vez
  onGenerate: () => void;
}

export const GenerationSection = ({
  isGenerating,
  missingFields,
  isFormReady,
  onGenerate
}: GenerationSectionProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="space-y-4">
        {missingFields.length > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="font-medium mb-2">Campos obrigatórios:</div>
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
        
        <Button
          onClick={onGenerate}
          disabled={!isFormReady || isGenerating}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Gerando...
            </>
          ) : (
            "Gerar artes"
          )}
        </Button>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
