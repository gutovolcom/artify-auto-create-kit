
export interface GeneratedImage {
  platform: string;
  format: string;
  url: string;
  bgImageUrl?: string;
}

export interface UseImageGeneratorReturn {
  generatedImages: GeneratedImage[];
  isGenerating: boolean;
  generationProgress: number;
  currentGeneratingFormat: string;
  error: string | null;
  generateImages: (eventData: any) => Promise<GeneratedImage[]>;
  downloadZip: () => Promise<boolean>;
}
