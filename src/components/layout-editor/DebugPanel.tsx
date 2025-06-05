
import React from 'react';

interface DebugPanelProps {
  loadingState: string;
  layoutLoadAttempts: number;
  loadingError: string | null;
  onManualReload: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  loadingState,
  layoutLoadAttempts,
  loadingError,
  onManualReload
}) => {
  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <div className="text-sm text-gray-600 mb-2">
        <p><strong>Status:</strong> {loadingState}</p>
        <p><strong>Tentativas:</strong> {layoutLoadAttempts}</p>
        {loadingError && (
          <p className="text-red-600 mt-2">{loadingError}</p>
        )}
      </div>
      
      <button
        onClick={onManualReload}
        disabled={loadingState === 'loading-elements'}
        className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loadingState === 'loading-elements' ? 'Carregando...' : 'Recarregar Layout'}
      </button>
    </div>
  );
};
