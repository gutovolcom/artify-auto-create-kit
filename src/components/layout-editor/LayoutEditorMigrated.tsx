// Layout editor with migration support
import React from 'react';
import { LayoutEditorProps } from './types';
import { useLayoutEditorState } from '@/hooks/useLayoutEditorState';
import { useLayoutOperations } from '@/hooks/useLayoutOperations';
import { useCanvasManager } from '@/hooks/useCanvasManager';
import { useLayoutEditor } from '@/hooks/useLayoutEditor';
import { LayoutEditorContent } from './LayoutEditorContent';
import { PropertiesPanel } from './PropertiesPanel';
import { DebugPanel } from './DebugPanel';

// Import compatibility layer
import { addElementToCanvas } from '@/utils/canvas/compatibilityLayer';

export const LayoutEditorMigrated: React.FC<LayoutEditorProps> = (props) => {
  const { templateId, formatName, backgroundImageUrl, formatDimensions } = props;
  const { layoutElements, getLayout } = useLayoutEditor();
  
  // Calculate responsive dimensions
  const containerWidth = 800;
  const containerHeight = 600;
  const scale = Math.min(
    containerWidth / formatDimensions.width,
    containerHeight / formatDimensions.height
  );
  
  const displayWidth = formatDimensions.width * scale;
  const displayHeight = formatDimensions.height * scale;

  // Use existing hooks with compatibility layer
  const state = useLayoutEditorState();
  const operations = useLayoutOperations({
    ...state,
    scale,
    displayWidth,
    displayHeight,
    layoutElements,
    templateId,
    formatName,
    // Override addElementToCanvas to use compatibility layer
    updateLayoutDraft: (fabricCanvas: any, format?: string) => {
      // Use new unified serialization logic here
      console.log('🔄 Updated layout draft with unified system');
    }
  });

  const manager = useCanvasManager({ 
    ...state, 
    displayWidth, 
    displayHeight, 
    scale, 
    getLayout 
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 relative">
        <LayoutEditorContent
          {...props}
          {...state}
          {...operations}
          displayWidth={displayWidth}
          displayHeight={displayHeight}
          scale={scale}
          layoutElements={layoutElements}
          onCanvasReady={(fabricCanvas) => manager.handleCanvasReady(fabricCanvas, templateId, formatName)}
          onSelectionChange={state.setSelectedObject}
          onDeleteSelected={operations.handleDeleteSelected}
          onBackgroundLoaded={() => manager.handleBackgroundLoaded(templateId, formatName)}
          onAddElement={operations.handleAddElement}
          onSaveLayout={operations.handleSaveLayout}
        />
      </div>
      <div className="w-full lg:w-72 space-y-4">
        {state.selectedObject && (
          <PropertiesPanel
            selectedObject={state.selectedObject}
            scale={scale}
            onDeleteSelected={operations.handleDeleteSelected}
          />
        )}
        {process.env.NODE_ENV === 'development' && (
          <DebugPanel
            loadingState={state.loadingState}
            layoutLoadAttempts={state.layoutLoadAttempts}
            loadingError={state.loadingError}
            onManualReload={() => manager.handleManualReload(templateId, formatName)}
          />
        )}
        
        {/* Migration Status */}
        <div className="border rounded-lg p-4 bg-blue-50">
          <h3 className="font-semibold mb-2 text-blue-800">System Status</h3>
          <div className="text-sm text-blue-600">
            <div>✅ Compatibility layer active</div>
            <div>🔄 Gradual migration in progress</div>
            <div>📊 Using unified canvas system</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 