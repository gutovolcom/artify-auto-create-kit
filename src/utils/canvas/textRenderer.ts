
import { Canvas as FabricCanvas, FabricText } from 'fabric';

export const renderRegularText = (
  canvas: FabricCanvas,
  textContent: string,
  field: string,
  formatStyle: any,
  elementX: number,
  elementY: number
) => {
  const text = new FabricText(textContent, {
    left: elementX,
    top: elementY,
    fontSize: formatStyle.fontSize,
    fontFamily: formatStyle.fontFamily,
    fill: formatStyle.color,
    selectable: false,
    evented: false
  });

  canvas.add(text);
  console.log(`✅ Added regular text element: ${field}`);
};
