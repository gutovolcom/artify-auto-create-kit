// src/hooks/useImageGenerator/types.ts

import { platformConfigs } from "@/lib/platformConfigs";


// 1. Criamos um tipo chamado 'Platform' que contém exatamente
//    as chaves do seu objeto platformConfigs.
//    Ex: "youtube" | "feed" | "stories" | etc.
export type Platform = keyof typeof platformConfigs;

// 2. Usamos esse novo tipo na interface GeneratedImage.
export interface GeneratedImage {
  platform: Platform; // Agora, a plataforma deve ser um dos tipos válidos.
  format: string;
  url: string;
  bgImageUrl: any;
}

// ADICIONE ESTA NOVA INTERFACE NO FINAL DO ARQUIVO
export interface UseImageGeneratorReturn {
  isGenerating: boolean;
  generationProgress: number;
  currentGeneratingFormat: string; // ADICIONADO: Expõe o formato atual para a UI
  generatedImages: GeneratedImage[];
  generateImages: (eventData: any) => Promise<GeneratedImage[]>; // Ajuste o tipo 'any' se tiver um tipo para EventData
  downloadZip: (imagesToZip: GeneratedImage[], zipName: string) => Promise<boolean>; // ✅ IMPORTANTE
  error: string | null; // ✅ adicione esta linha
}