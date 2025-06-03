
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GenerateButtonProps {
  onGenerate: () => void;
  isGenerating: boolean;
  disabled: boolean;
  missingFields: string[];
}

export const GenerateButton = ({ onGenerate, isGenerating, disabled, missingFields }: GenerateButtonProps) => {
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
      
      <Button
        onClick={onGenerate}
        disabled={disabled || isGenerating}
        size="lg"
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold"
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
        <p className="text-sm text-gray-600 text-center max-w-md">
          Clique para gerar suas artes automaticamente. Você será redirecionado para a aba de exportação quando as imagens estiverem prontas.
        </p>
      )}
    </div>
  );
};
