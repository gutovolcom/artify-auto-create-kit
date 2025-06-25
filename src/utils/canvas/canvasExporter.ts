// SUGESTÃO DE CORREÇÃO
import { Canvas as FabricCanvas } from 'fabric';

export const exportCanvasToDataURL = (
  fabricCanvas: FabricCanvas
  // O parâmetro tempCanvas foi removido daqui
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Aumentamos um pouco o timeout para garantir que renderizações complexas terminem
    setTimeout(() => {
      try {
        const dataURL = fabricCanvas.toDataURL({
          format: 'png',
          quality: 1.0,
          multiplier: 1
        });
        
        // A LÓGICA DE LIMPEZA FOI REMOVIDA DAQUI
        
        resolve(dataURL);
      } catch (exportError) {
        console.error('Error exporting canvas:', exportError);
        reject(exportError);
      }
    }, 250); // Um timeout de 250ms é mais seguro que 500ms para performance
  });
};
