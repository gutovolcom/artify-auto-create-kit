
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Bug, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'ready': return 'default';
      case 'error': return 'destructive';
      case 'loading-background':
      case 'loading-elements': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusLabel = (state: string) => {
    switch (state) {
      case 'idle': return 'Inativo';
      case 'initializing': return 'Inicializando';
      case 'loading-background': return 'Carregando fundo';
      case 'loading-elements': return 'Carregando elementos';
      case 'ready': return 'Pronto';
      case 'error': return 'Erro';
      default: return state;
    }
  };

  return (
    <Card className="w-full shadow-sm border-gray-200">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="h-4 w-4 text-muted-foreground" />
                Debug
                <Badge variant={getStatusColor(loadingState)} className="text-xs h-5">
                  {getStatusLabel(loadingState)}
                </Badge>
              </div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-3">
            {/* Status Info */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tentativas:</span>
                <span className="font-mono">{layoutLoadAttempts}</span>
              </div>
            </div>

            {/* Error Display */}
            {loadingError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2">
                <p className="text-xs text-destructive font-medium mb-1">Erro:</p>
                <p className="text-xs text-destructive/80">{loadingError}</p>
              </div>
            )}

            {/* Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={onManualReload}
              className="w-full h-8 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Recarregar Layout
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
