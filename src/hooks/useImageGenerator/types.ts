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