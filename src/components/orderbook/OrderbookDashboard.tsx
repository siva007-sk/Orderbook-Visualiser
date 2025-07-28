import { useState, useCallback } from "react";
import { OrderbookViz3D } from "./OrderbookViz3D";
import { OrderbookControls } from "./OrderbookControls";
import { OrderbookStats } from "./OrderbookStats";
import { useOrderbookData } from "@/hooks/useOrderbookData";
import { VisualizationSettings } from "@/types/orderbook";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap, Eye } from "lucide-react";
import { VolumeProfile } from "./VolumeProfile";
import { SpreadAnalysis } from "./SpreadAnalysis";
import { OrderbookImbalance } from "./OrderbookImbalance";
import { ThemeToggle } from "./ThemeToggle";
import { ExportControls } from "./ExportControls";
import { PressureZonePrediction } from "./PressureZonePrediction";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

export const OrderbookDashboard = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [settings, setSettings] = useState<VisualizationSettings>({
    timeRange: "5m",
    priceRange: [60000, 70000],
    quantityThreshold: 1.0,
    showPressureZones: true,
    realTimeMode: true,
    rotationSpeed: 1.0,
    venues: [],
  });
  const [isHistoricalMode, setIsHistoricalMode] = useState(false);

  // Pass settings to hook for filtering
  const {
    orderbookData,
    venues,
    isConnected,
    toggleVenue,
    historicalData,
    getHistoricalSnapshot,
  } = useOrderbookData({
    priceRange: settings.priceRange,
    quantityThreshold: settings.quantityThreshold,
    timeRange: settings.timeRange,
    realTimeMode: settings.realTimeMode && isPlaying,
  });

  const handleSettingsChange = useCallback(
    (newSettings: Partial<VisualizationSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));

      // Toggle historical mode when realTimeMode changes
      if ("realTimeMode" in newSettings) {
        setIsHistoricalMode(!newSettings.realTimeMode);
      }
    },
    []
  );

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handlePriceLevelSelect = useCallback((price: number, venue: string) => {
    // Focus camera on specific price level in 3D view
    console.log(`Focusing on price level $${price} at ${venue}`);
    // This could be implemented to move camera to specific coordinates
  }, []);

  const handleReset = useCallback(() => {
    setSettings({
      timeRange: "5m",
      priceRange: [60000, 70000],
      quantityThreshold: 1.0,
      showPressureZones: true,
      realTimeMode: true,
      rotationSpeed: 1.0,
      venues: venues.filter((v) => v.enabled).map((v) => v.id),
    });
    setIsPlaying(true);
    setIsHistoricalMode(false);
  }, [venues]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Orderbook Depth 3D Visualizer
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Real-time cryptocurrency orderbook analysis with AI-powered
              predictions
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <ThemeToggle />
            <div className="hidden sm:block">
              <ExportControls
                orderbookData={orderbookData}
                historicalData={historicalData}
              />
            </div>
            <Button
              onClick={handlePlayPause}
              variant={isPlaying ? "default" : "outline"}
              size="sm"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span className="hidden sm:inline ml-1">
                {isPlaying ? "Pause" : "Play"}
              </span>
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Reset</span>
            </Button>
            <Badge
              variant={isConnected ? "default" : "destructive"}
              className="flex items-center gap-1 sm:gap-2"
            >
              <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">
                {isConnected ? "Live" : "Off"}
              </span>
            </Badge>
            <Badge
              variant={isPlaying ? "default" : "secondary"}
              className="flex items-center gap-1 sm:gap-2"
            >
              {isPlaying ? (
                <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span className="text-xs sm:text-sm">
                {isHistoricalMode
                  ? "Historical"
                  : isPlaying
                  ? "Real-time"
                  : "Paused"}
              </span>
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
          <OrderbookStats
            orderbookData={orderbookData}
            isConnected={isConnected}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* 3D Visualization */}
          <div className="lg:col-span-2">
            <Card className="h-[400px] sm:h-[600px] lg:h-[800px] overflow-hidden bg-card/30 backdrop-blur-sm border-border/50">
              <OrderbookViz3D
                orderbookData={orderbookData}
                settings={settings}
                isPlaying={isPlaying}
              />
            </Card>
          </div>

          {/* Visualization Guide */}
          <div className="lg:col-span-1">
            <Card className="h-[400px] sm:h-[600px] lg:h-[800px] p-4 sm:p-6 bg-card/30 backdrop-blur-sm border-border/50 overflow-y-auto">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Visualization Guide</h3>
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <h4 className="font-medium text-trading-bid text-sm sm:text-base">
                    Bid Orders (Green)
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Buy orders positioned on the left side. Height represents
                    quantity.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-trading-ask text-sm sm:text-base">Ask Orders (Red)</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Sell orders positioned on the right side. Height represents
                    quantity.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-trading-pressure-high text-sm sm:text-base">
                    Pressure Zones
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Spherical indicators showing high order concentration areas.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-yellow-500 text-sm sm:text-base">Advanced Features</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Order flow particles, trade matching explosions, volume profile,
                    and spread analysis.
                  </p>
                </div>
                
                <div className="pt-4 border-t border-border/50">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <h5 className="font-medium text-xs sm:text-sm">3D Navigation</h5>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div><strong>X-axis:</strong> Price levels</div>
                        <div><strong>Y-axis:</strong> Order quantity</div>
                        <div><strong>Z-axis:</strong> Time depth</div>
                        <div className="hidden sm:block"><strong>Mouse:</strong> Drag to rotate, scroll to zoom</div>
                        <div className="sm:hidden"><strong>Touch:</strong> Pinch to zoom, drag to rotate</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-xs sm:text-sm">Visual Elements</h5>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div><strong>Particles:</strong> Order flow activity</div>
                        <div><strong>Explosions:</strong> Trade executions</div>
                        <div><strong>Heatmap:</strong> Pressure zone overlay</div>
                        <div className="hidden sm:block"><strong>Side panels:</strong> Volume & spread analytics</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <OrderbookControls
            venues={venues}
            settings={settings}
            isPlaying={isPlaying}
            orderbookData={orderbookData}
            onVenueToggle={toggleVenue}
            onSettingsChange={handleSettingsChange}
            onPlayPause={handlePlayPause}
            onReset={handleReset}
            onPriceLevelSelect={handlePriceLevelSelect}
          />
        </div>

        {/* Mobile Export Controls */}
        <div className="sm:hidden">
          <ExportControls
            orderbookData={orderbookData}
            historicalData={historicalData}
          />
        </div>

        {/* Analytics and Predictions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <OrderbookImbalance
            orderbookData={orderbookData}
            historicalData={historicalData}
          />
          <PressureZonePrediction
            orderbookData={orderbookData}
            historicalData={historicalData}
          />
        </div>

        {/* Advanced Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <VolumeProfile orderbookData={orderbookData} />
          <SpreadAnalysis orderbookData={orderbookData} />
        </div>
      </div>
    </div>
  );
};
