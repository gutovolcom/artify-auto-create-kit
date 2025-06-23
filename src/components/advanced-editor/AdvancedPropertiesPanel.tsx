
import React from 'react';
import { PropertiesPanel } from '../layout-editor/PropertiesPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Sliders } from 'lucide-react';

interface AdvancedPropertiesPanelProps {
  selectedObject: any;
  scale: number;
  onUpdateObject: () => void;
  onDeleteSelected: () => void;
}

export const AdvancedPropertiesPanel: React.FC<AdvancedPropertiesPanelProps> = ({
  selectedObject,
  scale,
  onUpdateObject,
  onDeleteSelected
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Properties
          </CardTitle>
          <Badge variant={selectedObject ? "default" : "secondary"}>
            {selectedObject ? "Selected" : "None"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {selectedObject ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
              <Sliders className="w-3 h-3" />
              <span>Editing: {selectedObject.type || 'Object'}</span>
            </div>
            
            <PropertiesPanel
              selectedObject={selectedObject}
              scale={scale}
              onUpdateObject={onUpdateObject}
              onDeleteSelected={onDeleteSelected}
            />
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select an element to edit its properties</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
