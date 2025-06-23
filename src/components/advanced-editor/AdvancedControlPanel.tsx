
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Undo2, Redo2, Save, History, Clock } from 'lucide-react';

interface AdvancedControlPanelProps {
  canUndo: boolean;
  canRedo: boolean;
  historyStats: any;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
}

export const AdvancedControlPanel: React.FC<AdvancedControlPanelProps> = ({
  canUndo,
  canRedo,
  historyStats,
  onUndo,
  onRedo,
  onSave
}) => {
  const getHistoryProgress = () => {
    if (!historyStats.maxSize) return 0;
    return (historyStats.currentSize / historyStats.maxSize) * 100;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <History className="w-4 h-4" />
          Advanced Controls
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* History Controls */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>History ({historyStats.currentSize}/{historyStats.maxSize})</span>
            <Badge variant={canUndo || canRedo ? "default" : "secondary"} className="text-xs">
              {canUndo || canRedo ? "Active" : "Empty"}
            </Badge>
          </div>
          
          <Progress value={getHistoryProgress()} className="h-1" />
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="flex-1"
            >
              <Undo2 className="w-3 h-3 mr-1" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="flex-1"
            >
              <Redo2 className="w-3 h-3 mr-1" />
              Redo
            </Button>
          </div>
        </div>

        {/* Save Control */}
        <div className="space-y-2">
          <Button
            onClick={onSave}
            className="w-full"
            size="sm"
          >
            <Save className="w-3 h-3 mr-1" />
            Save Layout
          </Button>
        </div>

        {/* Stats */}
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last Action
            </span>
            <span>{historyStats.lastActionTime || 'Never'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
