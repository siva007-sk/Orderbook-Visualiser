import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { OrderBookData } from "@/types/orderbook";
import { Search, Target, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { useState } from "react";

interface PriceLevelSearchProps {
  orderbookData: OrderBookData[];
  onPriceLevelSelect: (price: number, venue: string) => void;
}

export const PriceLevelSearch = ({ orderbookData, onPriceLevelSelect }: PriceLevelSearchProps) => {
  const [searchPrice, setSearchPrice] = useState("");
  const [searchResults, setSearchResults] = useState<{
    price: number;
    venue: string;
    side: 'bid' | 'ask';
    quantity: number;
    total: number;
  }[]>([]);

  const handlePriceSearch = () => {
    const targetPrice = Number(searchPrice);
    if (!targetPrice) return;

    const results: typeof searchResults = [];

    orderbookData.forEach(data => {
      // Search in bids
      data.bids.forEach(bid => {
        if (Math.abs(bid.price - targetPrice) <= targetPrice * 0.001) { // Within 0.1%
          results.push({
            price: bid.price,
            venue: data.venue,
            side: 'bid',
            quantity: bid.quantity,
            total: bid.total
          });
        }
      });

      // Search in asks
      data.asks.forEach(ask => {
        if (Math.abs(ask.price - targetPrice) <= targetPrice * 0.001) { // Within 0.1%
          results.push({
            price: ask.price,
            venue: data.venue,
            side: 'ask',
            quantity: ask.quantity,
            total: ask.total
          });
        }
      });
    });

    setSearchResults(results.sort((a, b) => Math.abs(a.price - targetPrice) - Math.abs(b.price - targetPrice)));
  };

  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-border/50">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4" />
          <Label className="text-sm font-semibold">Price Level Search</Label>
        </div>
        
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Enter price level (e.g. 65000)"
            value={searchPrice}
            onChange={(e) => setSearchPrice(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handlePriceSearch()}
          />
          <Button size="sm" onClick={handlePriceSearch}>
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-2">
            <Separator />
            <Label className="text-xs font-medium text-muted-foreground">
              Found {searchResults.length} matching levels:
            </Label>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded border border-border/50 bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
                  onClick={() => onPriceLevelSelect(result.price, result.venue)}
                >
                  <div className="flex items-center gap-2">
                    {result.side === 'bid' ? 
                      <TrendingUp className="w-3 h-3 text-trading-bid" /> : 
                      <TrendingDown className="w-3 h-3 text-trading-ask" />
                    }
                    <span className="text-sm font-mono">
                      ${result.price.toFixed(2)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {result.venue.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {result.quantity.toFixed(4)} BTC
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};