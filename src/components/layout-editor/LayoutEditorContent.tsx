
import React from 'react';
import { CanvasArea } from './CanvasArea';
import { ElementToolbar } from './ElementToolbar';
import { PropertiesPanel } from './PropertiesPanel';
import { DebugPanel } from './DebugPanel';
import { PerformancePanel } from './PerformancePanel';

interface LayoutEditorContentProps {
  templateId: string;
  formatName: string;
  formatDimensions: { width: number; height: number };
  backgroundImageUrl: string;
  displayWidth: number;
  displayHeight: number;
  scale: number;
  canvas: any;
  selectedObject: any;
  loadingState: string;
  layoutLoadAttempts: number;
  loadingError: string | null;
  layoutElements: any[];
  performanceMetrics?: any;
  isMonitoring?: boolean;
  onCanvasReady: (fabricCanvas: any) => void;
  onSelectionChange: (object: any) => void;
  onSaveLayout: () => void;
  onDeleteSelected: () => void;
  onBackgroundLoaded: () => void;
  onAddElement: (elementType: string) => void;
  onManualReload: () => void;
  onToggleMonitoring?: () => void;
  onResetPerformance?: () => void;
}

export const LayoutEditorContent: React.FC<LayoutEditorContentProps> = ({
  templateId,
  formatName,
  formatDimensions,
  backgroundImageUrl,
  displayWidth,
  displayHeight,
  scale,
  canvas,
  selectedObject,
  loadingState,
  layoutLoadAttempts,
  loadingError,
  layoutElements,
  performanceMetrics,
  isMonitoring = false,
  onCanvasReady,
  onSelectionChange,
  onSaveLayout,
  onDeleteSelected,
  onBackgroundLoaded,
  onAddElement,
  onManualReload,
  onToggleMonitoring = () => {},
  onResetPerformance = () => {}
}) => {
  return (
    <div className="flex gap-6">
      <CanvasArea
        formatName={formatName}
        formatDimensions={formatDimensions}
        displayWidth={displayWidth}
        displayHeight={displayHeight}
        backgroundImageUrl={backgroundImageUrl}
        scale={scale}
        canvas={canvas}
        selectedObject={selectedObject}
        onCanvasReady={onCanvasReady}
        onSelectionChange={onSelectionChange}
        onSave={onSaveLayout}
        onDeleteSelected={onDeleteSelected}
        onBackgroundLoaded={onBackgroundLoaded}
      />

      <div className="w-80 space-y-4">
        <ElementToolbar
          layoutElements={layoutElements}
          onAddElement={onAddElement}
        />

        <PropertiesPanel
          selectedObject={selectedObject}
          scale={scale}
          onUpdateObject={() => {}}
          onDeleteSelected={onDeleteSelected}
        />

        {performanceMetrics && (
          <PerformancePanel
            metrics={performanceMetrics}
            isMonitoring={isMonitoring}
            onToggleMonitoring={onToggleMonitoring}
            onReset={onResetPerformance}
          />
        )}

        <DebugPanel
          loadingState={loadingState}
          layoutLoadAttempts={layoutLoadAttempts}
          loadingError={loadingError}
          onManualReload={onManualReload}
        />
      </div>
    </div>
  );
};
