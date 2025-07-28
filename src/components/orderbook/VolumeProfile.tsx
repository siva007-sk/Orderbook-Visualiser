import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { OrderBookData } from "@/types/orderbook";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { useMemo } from "react";

interface VolumeProfileProps {
  orderbookData: OrderBookData[];
}

interface VolumeLevel {
  price: number;
  bidVolume: number;
  askVolume: number;
  totalVolume: number;
  venues: string[];
}

export const VolumeProfile = ({ orderbookData }: VolumeProfileProps) => {
  const volumeProfile = useMemo(() => {
    const priceMap = new Map<number, VolumeLevel>();

    orderbookData.forEach(data => {
      // Process bids
      data.bids.forEach(bid => {
        const roundedPrice = Math.round(bid.price / 10) * 10; // Round to nearest $10
        const existing = priceMap.get(roundedPrice) || {
          price: roundedPrice,
          bidVolume: 0,
          askVolume: 0,
          totalVolume: 0,
          venues: []
        };

        existing.bidVolume += bid.quantity;
        existing.totalVolume += bid.quantity;
        if (!existing.venues.includes(data.venue)) {
          existing.venues.push(data.venue);
        }
        priceMap.set(roundedPrice, existing);
      });

      // Process asks
      data.asks.forEach(ask => {
        const roundedPrice = Math.round(ask.price / 10) * 10; // Round to nearest $10
        const existing = priceMap.get(roundedPrice) || {
          price: roundedPrice,
          bidVolume: 0,
          askVolume: 0,
          totalVolume: 0,
          venues: []
        };

        existing.askVolume += ask.quantity;
        existing.totalVolume += ask.quantity;
        if (!existing.venues.includes(data.venue)) {
          existing.venues.push(data.venue);
        }
        priceMap.set(roundedPrice, existing);
      });
    });

    return Array.from(priceMap.values())
      .sort((a, b) => b.price - a.price) // Sort by price descending
      .slice(0, 20); // Show top 20 levels
  }, [orderbookData]);

  const maxVolume = Math.max(...volumeProfile.map(level => level.totalVolume));

  const getVolumeCategory = (volume: number) => {
    const ratio = volume / maxVolume;
    if (ratio > 0.8) return { label: "Very High", color: "bg-red-500" };
    if (ratio > 0.6) return { label: "High", color: "bg-orange-500" };
    if (ratio > 0.4) return { label: "Medium", color: "bg-yellow-500" };
    if (ratio > 0.2) return { label: "Low", color: "bg-green-500" };
    return { label: "Very Low", color: "bg-blue-500" };
  };

  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-border/50">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          <Label className="text-sm font-semibold">Volume Profile</Label>
          <Badge variant="outline" className="text-xs">
            {volumeProfile.length} levels
          </Badge>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {volumeProfile.map((level, index) => {
            const category = getVolumeCategory(level.totalVolume);
            const bidRatio = (level.bidVolume / level.totalVolume) * 100;
            const askRatio = (level.askVolume / level.totalVolume) * 100;

            return (
              <div key={level.price} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-foreground">
                      ${level.price.toFixed(0)}
                    </span>
                    <Badge variant="outline" className={`text-xs ${category.color} text-white`}>
                      {category.label}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {level.totalVolume.toFixed(2)} BTC
                  </div>
                </div>

                {/* Volume bars */}
                <div className="space-y-1">
                  {/* Bid volume */}
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-trading-bid" />
                    <div className="flex-1">
                      <Progress 
                        value={(level.bidVolume / maxVolume) * 100} 
                        className="h-2 bg-muted/30"
                      />
                    </div>
                    <span className="text-xs text-trading-bid font-mono">
                      {bidRatio.toFixed(0)}%
                    </span>
                  </div>

                  {/* Ask volume */}
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-3 h-3 text-trading-ask" />
                    <div className="flex-1">
                      <Progress 
                        value={(level.askVolume / maxVolume) * 100} 
                        className="h-2 bg-muted/30"
                      />
                    </div>
                    <span className="text-xs text-trading-ask font-mono">
                      {askRatio.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Venue indicators */}
                <div className="flex gap-1">
                  {level.venues.map(venue => (
                    <Badge key={venue} variant="secondary" className="text-xs">
                      {venue.toUpperCase()}
                    </Badge>
                  ))}
                </div>

                {index < volumeProfile.length - 1 && (
                  <div className="border-b border-border/30" />
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="pt-3 border-t border-border/50">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <Label className="text-muted-foreground">Total Volume</Label>
              <div className="font-mono">
                {volumeProfile.reduce((sum, level) => sum + level.totalVolume, 0).toFixed(2)} BTC
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Price Range</Label>
              <div className="font-mono">
                ${Math.min(...volumeProfile.map(l => l.price)).toFixed(0)} - 
                ${Math.max(...volumeProfile.map(l => l.price)).toFixed(0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};