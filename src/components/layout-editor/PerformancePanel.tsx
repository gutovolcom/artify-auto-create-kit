
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  canvasOperations: number;
  frameRate: number;
  isLagging: boolean;
}

interface PerformancePanelProps {
  metrics: PerformanceMetrics;
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
  onReset: () => void;
}

export const PerformancePanel: React.FC<PerformancePanelProps> = ({
  metrics,
  isMonitoring,
  onToggleMonitoring,
  onReset
}) => {
  const formatMemoryUsage = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getPerformanceColor = (value: number, threshold: number, inverse = false) => {
    const isGood = inverse ? value < threshold : value > threshold;
    return isGood ? 'text-green-600' : value > threshold * 0.8 ? 'text-yellow-600' : 'text-red-600';
  };

  const getFrameRateProgress = () => {
    return Math.min((metrics.frameRate / 60) * 100, 100);
  };

  const getRenderTimeProgress = () => {
    return Math.min((metrics.renderTime / 16) * 100, 100);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Performance</CardTitle>
          <div className="flex gap-2">
            <Badge variant={isMonitoring ? 'default' : 'secondary'}>
              {isMonitoring ? 'Monitoring' : 'Paused'}
            </Badge>
            {metrics.isLagging && (
              <Badge variant="destructive">Lagging</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Frame Rate */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Frame Rate</span>
            <span className={getPerformanceColor(metrics.frameRate, 30)}>
              {metrics.frameRate} fps
            </span>
          </div>
          <Progress value={getFrameRateProgress()} className="h-1" />
        </div>

        {/* Render Time */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Render Time</span>
            <span className={getPerformanceColor(metrics.renderTime, 16, true)}>
              {metrics.renderTime.toFixed(1)}ms
            </span>
          </div>
          <Progress value={getRenderTimeProgress()} className="h-1" />
        </div>

        {/* Memory Usage */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Memory</span>
            <span className="text-gray-600">
              {formatMemoryUsage(metrics.memoryUsage)}
            </span>
          </div>
        </div>

        {/* Canvas Operations */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Operations</span>
            <span className="text-gray-600">
              {metrics.canvasOperations}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onToggleMonitoring}
            className="flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            {isMonitoring ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={onReset}
            className="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
