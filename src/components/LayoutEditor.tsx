
import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useLayoutEditor } from '@/hooks/useLayoutEditor';
import { toast } from 'sonner';

interface LayoutEditorProps {
  templateId: string;
  formatName: string;
  backgroundImageUrl: string;
  formatDimensions: { width: number; height: number };
  onSave?: () => void;
}

export const LayoutEditor: React.FC<LayoutEditorProps> = ({
  templateId,
  formatName,
  backgroundImageUrl,
  formatDimensions,
  onSave
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const { layoutElements, saveLayout, getLayout } = useLayoutEditor();
  
  // Calculate scale to fit canvas in viewport
  const maxCanvasWidth = 800;
  const maxCanvasHeight = 600;
  const scale = Math.min(
    maxCanvasWidth / formatDimensions.width,
    maxCanvasHeight / formatDimensions.height
  );
  
  const displayWidth = formatDimensions.width * scale;
  const displayHeight = formatDimensions.height * scale;

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: displayWidth,
      height: displayHeight,
      backgroundColor: '#f5f5f5'
    });

    // Load background image
    fabric.Image.fromURL(backgroundImageUrl, (img) => {
      img.set({
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false
      });
      fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas));
    }, { crossOrigin: 'anonymous' });

    // Load existing layout if it exists
    loadExistingLayout(fabricCanvas);

    fabricCanvas.on('selection:created', (e) => {
      setSelectedObject(e.target);
    });

    fabricCanvas.on('selection:updated', (e) => {
      setSelectedObject(e.target);
    });

    fabricCanvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, [templateId, formatName, backgroundImageUrl, displayWidth, displayHeight, scale]);

  const loadExistingLayout = async (fabricCanvas: fabric.Canvas) => {
    try {
      const existingLayout = await getLayout(templateId, formatName);
      if (existingLayout?.layout_config?.elements) {
        existingLayout.layout_config.elements.forEach((element) => {
          addElementToCanvas(fabricCanvas, element);
        });
      }
    } catch (error) {
      console.error('Error loading existing layout:', error);
    }
  };

  const addElementToCanvas = (fabricCanvas: fabric.Canvas, elementConfig?: any) => {
    const config = elementConfig || {
      position: { x: 50, y: 50 },
      style: { fontSize: 24, color: '#000000' }
    };

    if (config.type === 'image') {
      // Add placeholder for image elements
      const rect = new fabric.Rect({
        left: (config.position.x || 50) * scale,
        top: (config.position.y || 50) * scale,
        width: (config.style.width || 200) * scale,
        height: (config.style.height || 200) * scale,
        fill: 'rgba(0,0,0,0.1)',
        stroke: '#666',
        strokeWidth: 2,
        strokeDashArray: [5, 5]
      });
      
      rect.set({
        elementId: config.id || `image_${Date.now()}`,
        elementType: 'image',
        fieldMapping: config.field || 'professorPhotos'
      });
      
      fabricCanvas.add(rect);
    } else {
      // Add text elements
      const text = new fabric.Text(getPreviewText(config.field || 'title'), {
        left: (config.position.x || 50) * scale,
        top: (config.position.y || 50) * scale,
        fontSize: (config.style.fontSize || 24) * scale,
        fill: config.style.color || config.style.textColor || '#000000',
        fontFamily: config.style.fontFamily || 'Arial',
        fontWeight: config.style.fontWeight || 'normal'
      });

      text.set({
        elementId: config.id || `text_${Date.now()}`,
        elementType: config.type || 'text',
        fieldMapping: config.field || 'title'
      });

      // Add background box for text_box elements
      if (config.type === 'text_box') {
        const padding = (config.style.padding || 10) * scale;
        const bbox = text.getBoundingRect();
        
        const background = new fabric.Rect({
          left: bbox.left - padding,
          top: bbox.top - padding,
          width: bbox.width + (padding * 2),
          height: bbox.height + (padding * 2),
          fill: config.style.backgroundColor || '#dd303e',
          rx: (config.style.borderRadius || 0) * scale,
          ry: (config.style.borderRadius || 0) * scale
        });

        const group = new fabric.Group([background, text], {
          left: (config.position.x || 50) * scale,
          top: (config.position.y || 50) * scale
        });

        group.set({
          elementId: config.id || `textbox_${Date.now()}`,
          elementType: 'text_box',
          fieldMapping: config.field || 'classTheme'
        });

        fabricCanvas.add(group);
      } else {
        fabricCanvas.add(text);
      }
    }
  };

  const getPreviewText = (field: string): string => {
    const previewData: Record<string, string> = {
      title: 'Título do Evento',
      classTheme: 'Tema da Aula',
      teacherName: 'Nome do Professor',
      date: '25/01/2024',
      time: '19:00'
    };
    return previewData[field] || 'Texto de Exemplo';
  };

  const addElement = (elementType: string) => {
    if (!canvas) return;
    
    const element = layoutElements.find(el => el.field_mapping === elementType);
    if (!element) return;

    addElementToCanvas(canvas, {
      type: element.element_type,
      field: element.field_mapping,
      position: { x: 50, y: 50 },
      style: element.default_style
    });
  };

  const updateSelectedObject = (property: string, value: any) => {
    if (!selectedObject || !canvas) return;

    if (property === 'fontSize') {
      selectedObject.set({ fontSize: value * scale });
    } else if (property === 'fill' || property === 'color') {
      selectedObject.set({ fill: value });
    } else if (property === 'fontFamily') {
      selectedObject.set({ fontFamily: value });
    }

    canvas.renderAll();
  };

  const saveCurrentLayout = async () => {
    if (!canvas) return;

    try {
      const elements = canvas.getObjects().map((obj: any) => {
        const position = {
          x: obj.left / scale,
          y: obj.top / scale
        };

        if (obj.elementType === 'image') {
          return {
            id: obj.elementId,
            type: 'image',
            field: obj.fieldMapping,
            position,
            style: {
              width: obj.width / scale,
              height: obj.height / scale
            }
          };
        } else if (obj.elementType === 'text_box') {
          return {
            id: obj.elementId,
            type: 'text_box',
            field: obj.fieldMapping,
            position,
            style: {
              fontSize: obj.fontSize / scale,
              fontFamily: obj.fontFamily,
              textColor: obj.fill,
              backgroundColor: '#dd303e', // Default for now
              padding: 20,
              borderRadius: 10
            }
          };
        } else {
          return {
            id: obj.elementId,
            type: 'text',
            field: obj.fieldMapping,
            position,
            style: {
              fontSize: obj.fontSize / scale,
              fontFamily: obj.fontFamily,
              color: obj.fill
            }
          };
        }
      });

      await saveLayout({
        template_id: templateId,
        format_name: formatName,
        layout_config: { elements }
      });

      onSave?.();
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <div className="flex gap-6">
      {/* Canvas Area */}
      <div className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle>
              Layout Editor - {formatName} ({formatDimensions.width}x{formatDimensions.height})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-gray-50">
              <canvas ref={canvasRef} className="border" />
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={saveCurrentLayout}>
                Salvar Layout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties Panel */}
      <div className="w-80">
        <Card>
          <CardHeader>
            <CardTitle>Elementos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {layoutElements.map((element) => (
              <Button
                key={element.id}
                variant="outline"
                className="w-full"
                onClick={() => addElement(element.field_mapping)}
              >
                Adicionar {element.name}
              </Button>
            ))}
          </CardContent>
        </Card>

        {selectedObject && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Propriedades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tamanho da Fonte</Label>
                <Input
                  type="number"
                  value={Math.round((selectedObject as any).fontSize / scale) || 24}
                  onChange={(e) => updateSelectedObject('fontSize', parseInt(e.target.value))}
                />
              </div>
              
              <div>
                <Label>Cor</Label>
                <Input
                  type="color"
                  value={(selectedObject as any).fill || '#000000'}
                  onChange={(e) => updateSelectedObject('fill', e.target.value)}
                />
              </div>

              <div>
                <Label>Fonte</Label>
                <Select
                  value={(selectedObject as any).fontFamily || 'Arial'}
                  onValueChange={(value) => updateSelectedObject('fontFamily', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Arial Black">Arial Black</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
