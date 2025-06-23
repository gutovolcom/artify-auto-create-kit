
import React from 'react';
import { AdvancedCanvasArea } from './AdvancedCanvasArea';
import { AdvancedElementToolbar } from './AdvancedElementToolbar';
import { AdvancedPropertiesPanel } from './AdvancedPropertiesPanel';
import { AdvancedControlPanel } from './AdvancedControlPanel';
import { PerformancePanel } from '../layout-editor/PerformancePanel';
import { DebugPanel } from '../layout-editor/Debug Panel';

interface AdvancedEditorContentProps {
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
  canUndo: boolean;
  canRedo: boolean;
  historyStats: any;
  onCanvasReady: (fabricCanvas: any) => void;
  onSelectionChange: (object: any) => void;
  onSaveLayout: () => void;
  onDeleteSelected: () => void;
  onBackgroundLoaded: () => void;
  onAddElement: (elementType: string) => void;
  onManualReload: () => void;
  onToggleMonitoring?: () => void;
  onResetPerformance?: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSaveState: () => void;
}

export const AdvancedEditorContent: React.FC<AdvancedEditorContentProps> = ({
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
  canUndo,
  canRedo,
  historyStats,
  onCanvasReady,
  onSelectionChange,
  onSaveLayout,
  onDeleteSelected,
  onBackgroundLoaded,
  onAddElement,
  onManualReload,
  onToggleMonitoring = () => {},
  onResetPerformance = () => {},
  onUndo,
  onRedo,
  onSaveState
}) => {
  return (
    <div className="flex gap-6 h-full">
      {/* Main Canvas Area */}
      <div className="flex-1">
        <AdvancedCanvasArea
          formatName={formatName}
          formatDimensions={formatDimensions}
          displayWidth={displayWidth}
          displayHeight={displayHeight}
          backgroundImageUrl={backgroundImageUrl}
          scale={scale}
          canvas={canvas}
          selectedObject={selectedObject}
          canUndo={canUndo}
          canRedo={canRedo}
          onCanvasReady={onCanvasReady}
          onSelectionChange={onSelectionChange}
          onSave={onSaveLayout}
          onDeleteSelected={onDeleteSelected}
          onBackgroundLoaded={onBackgroundLoaded}
          onUndo={onUndo}
          onRedo={onRedo}
          onSaveState={onSaveState}
        />
      </div>

      {/* Right Sidebar */}
      <div className="w-80 space-y-4 max-h-screen overflow-y-auto">
        {/* Advanced Control Panel */}
        <AdvancedControlPanel
          canUndo={canUndo}
          canRedo={canRedo}
          historyStats={historyStats}
          onUndo={onUndo}
          onRedo={onRedo}
          onSave={onSaveLayout}
        />

        {/* Element Toolbar */}
        <AdvancedElementToolbar
          layoutElements={layoutElements}
          onAddElement={onAddElement}
        />

        {/* Properties Panel */}
        <AdvancedPropertiesPanel
          selectedObject={selectedObject}
          scale={scale}
          onUpdateObject={onSaveState}
          onDeleteSelected={onDeleteSelected}
        />

        {/* Performance Panel */}
        {performanceMetrics && (
          <PerformancePanel
            metrics={performanceMetrics}
            isMonitoring={isMonitoring}
            onToggleMonitoring={onToggleMonitoring}
            onReset={onResetPerformance}
          />
        )}

        {/* Debug Panel */}
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
