import { cn } from "@/lib/utils";
import { GeneratedImage } from "@/hooks/useImageGenerator/types";
import { EventData } from "@/pages/Index";
import { GeneratedGallery } from "@/components/GeneratedGallery";
import { ExportButton } from "@/components/ExportButton";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Image as ImageIcon } from "lucide-react";

interface MainContentProps {
  generatedImages: GeneratedImage[];
  eventData: EventData;
  onExport: () => void;
  hasStartedGeneration: boolean;
  isGenerating?: boolean;
  generationProgress?: number;
  currentGeneratingFormat?: string;
  className?: string;
}

export const MainContent = ({
  generatedImages,
  eventData,
  onExport,
  hasStartedGeneration,
  isGenerating = false,
  generationProgress = 0,
  currentGeneratingFormat = "",
  className,
}: MainContentProps) => {
  if (!hasStartedGeneration && generatedImages.length === 0) {
    return (
      <div className={cn("h-full w-full flex flex-col items-center justify-center bg-background", className)}>
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Nenhuma arte gerada
        </h2>

        <p className="text-muted-foreground text-center max-w-md">
          Preencha os campos ao lado e clique em "Gerar Artes" para criar suas artes.
        </p>
      </div>
    );
  }

  if (isGenerating && generatedImages.length === 0) {
    return (
      <div className={cn("h-full w-full flex flex-col items-center justify-center bg-background", className)}>
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Gerando suas artes...
            </h2>
            <p className="text-muted-foreground mb-6">
              Aguarde enquanto processamos suas imagens
            </p>
          </div>
          
          <div className="space-y-3">
            <Progress value={generationProgress} className="w-full h-3" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {generationProgress}% concluído
              </p>
              {currentGeneratingFormat && (
                <p className="text-xs text-muted-foreground mt-1">
                  Processando: {currentGeneratingFormat}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full w-full p-8 space-y-8 bg-background", className)}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Artes Geradas</h2>
          <ExportButton 
            onClick={onExport} 
            disabled={generatedImages.length === 0} 
          />
        </div>
        
        <GeneratedGallery 
          images={generatedImages} 
          eventData={eventData} 
        />
      </div>
    </div>
  );
};
