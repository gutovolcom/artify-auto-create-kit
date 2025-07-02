import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GenerateButtonProps {
  onGenerate: () => void;
  isGenerating: boolean;
  disabled: boolean;
  missingFields: string[];
  generationProgress?: number;
  currentGeneratingFormat?: string;
}

export const GenerateButton = ({ 
  onGenerate, 
  isGenerating, 
  disabled, 
  missingFields,
  generationProgress = 0,
  currentGeneratingFormat = ""
}: GenerateButtonProps) => {
  return (
    <div className="space-y-4">
      {missingFields.length > 0 && (
        <Alert className="max-w-md">
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
        <div className="space-y-3 max-w-md">
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Gerando artes... {generationProgress}%
            </p>
            {currentGeneratingFormat && (
              <p className="text-xs text-muted-foreground">
                {currentGeneratingFormat}
              </p>
            )}
          </div>
          <Progress value={generationProgress} className="w-full h-2" />
        </div>
      )}
      
      <Button
        onClick={onGenerate}
        disabled={disabled || isGenerating}
        size="lg"
        className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-primary-foreground px-8 py-3 text-lg font-semibold"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Gerando Artes...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Gerar Artes
          </>
        )}
      </Button>
      
      {!disabled && !isGenerating && (
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Clique para gerar suas artes automaticamente. Você será redirecionado para a aba de exportação quando as imagens estiverem prontas.
        </p>
      )}
    </div>
  );
};
