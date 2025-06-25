// src/components/LayoutEditor.tsx (CORRIGIDO)

import React from 'react';
import { LayoutEditorProps } from './layout-editor/types';
import { LayoutEditorContainer } from './layout-editor/LayoutEditorContainer';
import { ErrorBoundary } from './ErrorBoundary';

export const LayoutEditor: React.FC<LayoutEditorProps> = (props) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-orange-50 rounded-lg border border-orange-200">
          <h3 className="text-lg font-semibold text-orange-700 mb-2">Layout Editor Error</h3>
          <p className="text-orange-600 text-center">
            There was an issue loading the layout editor. Please try refreshing the page.
          </p>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error('LayoutEditor error:', error, errorInfo);
      }}
    >
      {/* A prop onSave agora é passada corretamente */}
      <LayoutEditorContainer {...props} onSave={props.onSave || (() => {})} />
    </ErrorBoundary>
  );
};