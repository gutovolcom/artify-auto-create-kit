
import { GeneratedImage } from "@/hooks/useImageGenerator/types";
import { EventData } from "@/pages/Index";
import { GeneratedGallery } from "@/components/GeneratedGallery";
import { ExportButton } from "@/components/ExportButton";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Image as ImageIcon } from "lucide-react";

interface MainContentProps {
  generatedImages: GeneratedImage[];
  eventData: EventData;
  onExport: () => void;
  hasStartedGeneration: boolean;
}

export const MainContent = ({
  generatedImages,
  eventData,
  onExport,
  hasStartedGeneration,
}: MainContentProps) => {
  if (!hasStartedGeneration && generatedImages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="max-w-md text-center">
          <CardContent className="p-8">
            <div className="rounded-full bg-gradient-to-r from-blue-100 to-purple-100 p-6 mx-auto mb-6 w-fit">
              <Sparkles className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">
              Bem-vindo ao Gerador de Artes
            </h3>
            <p className="text-gray-600 mb-4">
              Configure as informações do seu evento na barra lateral e clique em "Gerar Artes" para começar.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Para começar:</h4>
              <ul className="text-sm text-gray-600 space-y-1 text-left">
                <li>• Selecione um template</li>
                <li>• Preencha o tema da aula</li>
                <li>• Defina a data do evento</li>
                <li>• Escolha os professores</li>
                <li>• Selecione os formatos desejados</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (generatedImages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="max-w-md text-center">
          <CardContent className="p-8">
            <div className="rounded-full bg-gray-100 p-6 mx-auto mb-6 w-fit">
              <ImageIcon className="h-12 w-12 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3">
              Processando...
            </h3>
            <p className="text-gray-600">
              Suas artes estão sendo geradas. Aguarde alguns instantes.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 space-y-8 overflow-auto">
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
