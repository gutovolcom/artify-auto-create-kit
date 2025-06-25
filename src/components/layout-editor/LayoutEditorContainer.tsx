// src/components/layout-editor/LayoutEditorContainer.tsx (ATUALIZADO)

import React from 'react';
import { CanvasArea } from './CanvasArea';
import { ElementToolbar } from './ElementToolbar';
import { PropertiesPanel } from './PropertiesPanel';
import { PerformancePanel } from './DebugPanel'; // Renomeei para ser mais claro
import { LayoutEditorProps } from './types';
import { useLayoutEditorState } from '@/hooks/useLayoutEditorState';
import { useCanvasManager } from '@/hooks/useCanvasManager';
import { useLayoutOperations } from '@/hooks/useLayoutOperations';
import { useLayoutEditor } from '@/hooks/useLayoutEditor';


export const LayoutEditorContainer: React.FC<LayoutEditorProps & { onSave: () => void }> = (props) => {
  const { templateId, formatName, backgroundImageUrl, formatDimensions, onSave } = props;

  // Lógica de estado e hooks que você já tem
  const { layoutElements, saveLayout, getLayout } = useLayoutEditor();
  const state = useLayoutEditorState();
  const { displayWidth, displayHeight, scale } = { displayWidth: 800, displayHeight: 450, scale: 0.41}; // Calcule isso como antes

  const manager = useCanvasManager({ ...state, displayWidth, displayHeight, scale, getLayout });
  const operations = useLayoutOperations({ ...props, ...state, ...manager, displayWidth, displayHeight, scale, layoutElements, saveLayout });
  
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Área Principal do Canvas com a barra de ferramentas flutuante */}
      <div className="flex-1 relative">
        <CanvasArea
          {...props}
          {...state}
          {...manager}
          {...operations}
          displayWidth={displayWidth}
          displayHeight={displayHeight}
          scale={scale}
          onCanvasReady={manager.handleCanvasReady}
          onSelectionChange={state.setSelectedObject}
          onDeleteSelected={operations.handleDeleteSelected}
          onBackgroundLoaded={() => manager.handleBackgroundLoaded(templateId, formatName)}
        />
        <ElementToolbar
          layoutElements={layoutElements}
          onAddElement={operations.handleAddElement}
        />
      </div>

      {/* Barra Lateral de Ferramentas */}
      <div className="w-full lg:w-72 space-y-4">
        {/* Painel de propriedades só aparece quando um objeto é selecionado */}
        {state.selectedObject && (
          <PropertiesPanel
            selectedObject={state.selectedObject}
            scale={scale}
            onDeleteSelected={operations.handleDeleteSelected}
          />
        )}
        
        {/* Painel de debug/performance só aparece em modo de desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <PerformancePanel
            loadingState={state.loadingState}
            layoutLoadAttempts={state.layoutLoadAttempts}
            loadingError={state.loadingError}
            onManualReload={() => manager.handleManualReload(templateId, formatName)}
          />
        )}
      </div>
    </div>
  );
};