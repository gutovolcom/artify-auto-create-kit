import { Canvas as FabricCanvas, FabricImage } from 'fabric';

// Passo 1: Definir uma constante para o ID do container.
// Isso garante que sempre procuramos e removemos o mesmo elemento.
const CONTAINER_ID = 'temp-canvas-generation-container';

export const createFabricCanvas = (
  tempCanvas: HTMLCanvasElement,
  width: number,
  height: number
): FabricCanvas => {
  return new FabricCanvas(tempCanvas, {
    width: width,
    height: height,
    backgroundColor: '#ffffff'
  });
};

export const loadBackgroundImageToCanvas = async (
  fabricCanvas: FabricCanvas,
  backgroundImageUrl: string,
  width: number,
  height: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    FabricImage.fromURL(backgroundImageUrl, {
      crossOrigin: 'anonymous'
    }).then((bgImg) => {
      const scaleX = width / bgImg.width!;
      const scaleY = height / bgImg.height!;
      
      bgImg.set({
        scaleX: scaleX,
        scaleY: scaleY,
        left: 0,
        top: 0,
        selectable: false,
        evented: false
      });

      fabricCanvas.backgroundImage = bgImg;
      resolve();
    }).catch((error) => {
      console.error('Error loading background image:', error);
      reject(error);
    });
  });
};

// Passo 2: A função de setup agora é mais simples e confiável.
export const setupCanvasContainer = (width: number, height: number): HTMLCanvasElement => {
  // Sempre remove o container antigo antes de criar um novo.
  const existingContainer = document.getElementById(CONTAINER_ID);
  if (existingContainer) {
    document.body.removeChild(existingContainer);
  }

  // Cria o container com o ID constante.
  const container = document.createElement('div');
  container.id = CONTAINER_ID;
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  
  container.appendChild(tempCanvas);
  document.body.appendChild(container);
  
  return tempCanvas;
};

// Passo 3: A função de limpeza agora é extremamente simples e segura.
export const cleanupCanvas = (fabricCanvas: FabricCanvas, tempCanvas: HTMLCanvasElement): void => {
  try {
    // Deixa o Fabric.js limpar seus próprios listeners.
    fabricCanvas.dispose();
    
    // Remove o container pelo ID. Não há como errar.
    const container = document.getElementById(CONTAINER_ID);
    if (container && container.parentElement) {
      container.parentElement.removeChild(container);
      console.log('✅ Canvas container successfully removed.');
    }
  } catch (error) {
    console.error('❌ Failed to cleanup canvas container:', error);
  }
};
```

### Resumo das Mudanças e Próximo Passo

1.  **Simplificação:** As lógicas complexas e os fallbacks na função `cleanupCanvas` foram removidos. Agora ela tem uma única responsabilidade: encontrar o container pelo `id` e removê-lo.
2.  **Segurança:** A função `setupCanvasContainer` também foi simplificada para sempre remover um container antigo (se existir) antes de criar um novo. Isso previne qualquer acúmulo de elementos no DOM, mesmo que uma execução anterior tenha falhado.

Agora, com os três arquivos (`canvasExporter.ts`, `canvasRenderer.tsx`, e `fabricCanvasSetup.ts`) corrigidos, o seu processo de geração de artes deve funcionar sem erros e sem quebrar o layout. Por favor, teste novamen