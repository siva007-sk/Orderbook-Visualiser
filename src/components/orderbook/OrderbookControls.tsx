import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Venue, VisualizationSettings } from "@/types/orderbook";
import { Play, Pause, RotateCcw, Settings, Filter, Zap, Search, DollarSign, Clock } from "lucide-react";
import { HeatmapLegend } from "./HeatmapLegend";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { PriceLevelSearch } from "./PriceLevelSearch";

interface OrderbookControlsProps {
  venues: Venue[];
  settings: VisualizationSettings;
  isPlaying: boolean;
  orderbookData: any[];
  onVenueToggle: (venueId: string) => void;
  onSettingsChange: (settings: Partial<VisualizationSettings>) => void;
  onPlayPause: () => void;
  onReset: () => void;
  onPriceLevelSelect?: (price: number, venue: string) => void; // Add this
}

export const OrderbookControls = ({
  venues,
  settings,
  isPlaying,
  orderbookData,
  onVenueToggle,
  onSettingsChange,
  onPlayPause,
  onReset,
  onPriceLevelSelect = () => {} // Add this
}: OrderbookControlsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceMin, setPriceMin] = useState(settings.priceRange[0]);
  const [priceMax, setPriceMax] = useState(settings.priceRange[1]);

  const filteredVenues = venues.filter(venue => 
    venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePriceRangeChange = () => {
    onSettingsChange({ priceRange: [priceMin, priceMax] });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Visualization Controls
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onPlayPause}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={onReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="filters" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="venues">Venues</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>

          <TabsContent value="filters" className="space-y-4 mt-4">
            {/* Search Functionality */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search Venues & Price Levels
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search venues or enter price level..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Separator />

            {/* Price Range Controls */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Price Range Filter
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Min Price</Label>
                  <Input
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(Number(e.target.value))}
                    onBlur={handlePriceRangeChange}
                    placeholder="60000"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Max Price</Label>
                  <Input
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    onBlur={handlePriceRangeChange}
                    placeholder="70000"
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Current range: ${priceMin.toLocaleString()} - ${priceMax.toLocaleString()}
              </div>
            </div>

            <Separator />

            {/* Time Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Historical Data Range
              </Label>
              <Select
                value={settings.timeRange}
                onValueChange={(value: any) => onSettingsChange({ timeRange: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1 minute</SelectItem>
                  <SelectItem value="5m">5 minutes</SelectItem>
                  <SelectItem value="15m">15 minutes</SelectItem>
                  <SelectItem value="1h">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quantity Threshold */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Quantity Threshold: {settings.quantityThreshold.toFixed(2)}
              </Label>
              <Slider
                value={[settings.quantityThreshold]}
                onValueChange={([value]) => onSettingsChange({ quantityThreshold: value })}
                min={0.1}
                max={50}
                step={0.1}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground">
                Only show orders above this quantity
              </div>
            </div>
          </TabsContent>

          <TabsContent value="venues" className="space-y-4 mt-4">
            {/* Venue Search Results */}
            {searchTerm && (
              <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                <div className="text-sm font-medium text-foreground mb-2">
                  Search Results: {filteredVenues.length} venues found
                </div>
                {filteredVenues.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No venues match "{searchTerm}"
                  </div>
                )}
              </div>
            )}

            {/* Venue Filters */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Trading Venues ({filteredVenues.filter(v => v.enabled).length}/{filteredVenues.length} active)
              </Label>
              <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                {filteredVenues.map((venue) => (
                  <div key={venue.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: venue.color }}
                      />
                      <div>
                        <Label htmlFor={venue.id} className="font-medium">
                          {venue.name}
                        </Label>
                        <div className="text-xs text-muted-foreground">
                          {venue.id.toUpperCase()}
                        </div>
                      </div>
                      {venue.enabled && <Badge variant="secondary" className="text-xs">Active</Badge>}
                    </div>
                    <Switch
                      id={venue.id}
                      checked={venue.enabled}
                      onCheckedChange={() => onVenueToggle(venue.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="display" className="space-y-4 mt-4">
            {/* Visualization Modes */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Visualization Modes</Label>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30">
                  <div>
                    <Label htmlFor="real-time" className="font-medium">Real-time Mode</Label>
                    <div className="text-xs text-muted-foreground">
                      Live data updates every 100ms
                    </div>
                  </div>
                  <Switch
                    id="real-time"
                    checked={settings.realTimeMode}
                    onCheckedChange={(checked) => onSettingsChange({ realTimeMode: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30">
                  <div>
                    <Label htmlFor="pressure-zones" className="font-medium">Pressure Zone Heatmap</Label>
                    <div className="text-xs text-muted-foreground">
                      Show order concentration overlay
                    </div>
                  </div>
                  <Switch
                    id="pressure-zones"
                    checked={settings.showPressureZones}
                    onCheckedChange={(checked) => onSettingsChange({ showPressureZones: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Historical Data Controls */}
            {!settings.realTimeMode && (
              <div className="space-y-3">
                <Separator />
                <Label className="text-sm font-medium">Historical Data Navigation</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Time Position</span>
                    <span className="text-xs font-mono">Now - {settings.timeRange}</span>
                  </div>
                  <Slider
                    value={[0]}
                    onValueChange={([value]) => {
                      // This would control historical data playback
                      console.log('Historical position:', value);
                    }}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Earliest</span>
                    <span>Latest</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm">
                    ⏮ Start
                  </Button>
                  <Button variant="outline" size="sm">
                    ⏸ Pause
                  </Button>
                  <Button variant="outline" size="sm">
                    ⏭ End
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            {/* Rotation Speed */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Rotation Speed: {settings.rotationSpeed.toFixed(1)}x
              </Label>
              <Slider
                value={[settings.rotationSpeed]}
                onValueChange={([value]) => onSettingsChange({ rotationSpeed: value })}
                min={0}
                max={5}
                step={0.1}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground">
                Control 3D visualization rotation speed
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Quick Actions</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onSettingsChange({ quantityThreshold: 0.1 })}
                >
                  Show All Orders
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onSettingsChange({ quantityThreshold: 10 })}
                >
                  Large Orders Only
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onSettingsChange({ rotationSpeed: 0 })}
                >
                  Stop Rotation
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onSettingsChange({ rotationSpeed: 2 })}
                >
                  Fast Rotation
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-4 mt-4">
            {/* Price Level Search */}
            <PriceLevelSearch 
              orderbookData={orderbookData} 
              onPriceLevelSelect={onPriceLevelSelect}
            />

            {/* Venue Quick Search */}
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-border/50">
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Quick Venue Actions
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => venues.forEach(v => !v.enabled && onVenueToggle(v.id))}
                  >
                    Enable All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => venues.forEach(v => v.enabled && onVenueToggle(v.id))}
                  >
                    Disable All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Enable only Binance
                      venues.forEach(v => {
                        if (v.id === 'binance' && !v.enabled) onVenueToggle(v.id);
                        else if (v.id !== 'binance' && v.enabled) onVenueToggle(v.id);
                      });
                    }}
                  >
                    Binance Only
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Enable major exchanges only
                      venues.forEach(v => {
                        const isMajor = ['binance', 'coinbase'].includes(v.id);
                        if (isMajor && !v.enabled) onVenueToggle(v.id);
                        else if (!isMajor && v.enabled) onVenueToggle(v.id);
                      });
                    }}
                  >
                    Major Only
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Heatmap Legend */}
      <HeatmapLegend orderbookData={orderbookData} />
    </div>
  );
};