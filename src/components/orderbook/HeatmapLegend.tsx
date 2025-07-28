import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderBookData } from "@/types/orderbook";

interface HeatmapLegendProps {
  orderbookData: OrderBookData[];
}

export const HeatmapLegend = ({ orderbookData }: HeatmapLegendProps) => {
  const pressureStats = orderbookData.reduce((acc, data) => {
    const highPressure = [...data.bids, ...data.asks].filter(order => order.quantity > 20).length;
    const mediumPressure = [...data.bids, ...data.asks].filter(order => order.quantity > 10 && order.quantity <= 20).length;
    const lowPressure = [...data.bids, ...data.asks].filter(order => order.quantity > 5 && order.quantity <= 10).length;
    
    return {
      high: acc.high + highPressure,
      medium: acc.medium + mediumPressure,
      low: acc.low + lowPressure
    };
  }, { high: 0, medium: 0, low: 0 });

  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-border/50">
      <h4 className="text-sm font-semibold mb-3 text-foreground">Pressure Zone Heatmap</h4>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-trading-pressure-high animate-pulse-glow"></div>
            <span className="text-sm text-foreground">High Pressure</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {pressureStats.high} zones
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-trading-pressure-medium animate-pulse-glow"></div>
            <span className="text-sm text-foreground">Medium Pressure</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {pressureStats.medium} zones
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-trading-pressure-low animate-pulse-glow"></div>
            <span className="text-sm text-foreground">Low Pressure</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {pressureStats.low} zones
          </Badge>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          Heatmap overlay shows order concentration. Brighter areas indicate higher order density.
        </p>
      </div>
    </Card>
  );
};