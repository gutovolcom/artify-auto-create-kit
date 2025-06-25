// src/components/LayoutEditor.tsx (CORRIGIDO)

import React from 'react';
import { LayoutEditorProps } from './layout-editor/types';
import { LayoutEditorContainer } from './layout-editor/LayoutEditorContainer';
import { ErrorBoundary } from './ErrorBoundary';

export const LayoutEditor: React.FC<LayoutEditorProps> = (props) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg">
          Ocorreu um erro ao carregar o Editor de Layout.
        </div>
      }
      onError={(error, errorInfo) => console.error('LayoutEditor Error:', error, errorInfo)}
    >
      {/* CORREÇÃO: a prop onSave agora é passada corretamente */}
      <LayoutEditorContainer {...props} onSave={props.onSave || (() => {})} />
    </ErrorBoundary>
  );
};