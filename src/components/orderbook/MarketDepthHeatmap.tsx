import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { OrderBookData } from '@/types/orderbook';

interface MarketDepthHeatmapProps {
  orderbookData: OrderBookData[];
  priceRange: [number, number];
  enabled: boolean;
}

interface HeatmapCell {
  x: number;
  y: number;
  z: number;
  intensity: number;
  color: string;
}

const HeatmapMesh: React.FC<{ cells: HeatmapCell[] }> = ({ cells }) => {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(20, 20, 50, 50);
    const positions = geo.attributes.position;
    const colors = new Float32Array(positions.count * 3);
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      // Find closest cell for this vertex
      let minDistance = Infinity;
      let closestCell = cells[0];
      
      cells.forEach(cell => {
        const distance = Math.sqrt((x - cell.x) ** 2 + (y - cell.y) ** 2);
        if (distance < minDistance) {
          minDistance = distance;
          closestCell = cell;
        }
      });
      
      // Set color based on intensity
      const intensity = Math.min(closestCell?.intensity || 0, 1);
      const hue = intensity > 0.5 ? 0 : 240; // Red for high, blue for low
      const saturation = intensity;
      const lightness = 0.3 + intensity * 0.4;
      
      const color = new THREE.Color();
      color.setHSL(hue / 360, saturation, lightness);
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [cells]);

  return (
    <mesh geometry={geometry} position={[0, 0, -0.1]}>
      <meshBasicMaterial 
        vertexColors 
        transparent 
        opacity={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export const MarketDepthHeatmap: React.FC<MarketDepthHeatmapProps> = ({
  orderbookData,
  priceRange,
  enabled
}) => {
  const heatmapCells = useMemo(() => {
    if (!orderbookData.length) return [];
    
    const cells: HeatmapCell[] = [];
    const [minPrice, maxPrice] = priceRange;
    const priceStep = (maxPrice - minPrice) / 50;
    
    // Create grid of cells
    for (let x = 0; x < 50; x++) {
      for (let y = 0; y < 50; y++) {
        const price = minPrice + (y / 50) * (maxPrice - minPrice);
        
        // Calculate total volume at this price level across all venues
        let totalVolume = 0;
        orderbookData.forEach(data => {
          // Check bids
          data.bids.forEach(bid => {
            if (Math.abs(bid.price - price) < priceStep) {
              totalVolume += bid.quantity;
            }
          });
          
          // Check asks
          data.asks.forEach(ask => {
            if (Math.abs(ask.price - price) < priceStep) {
              totalVolume += ask.quantity;
            }
          });
        });
        
        const intensity = Math.min(totalVolume / 10000, 1); // Normalize
        
        cells.push({
          x: (x - 25) * 0.4,
          y: (y - 25) * 0.4,
          z: 0,
          intensity,
          color: intensity > 0.5 ? '#ff4444' : '#4444ff'
        });
      }
    }
    
    return cells;
  }, [orderbookData, priceRange]);

  if (!enabled) return null;

  return (
    <group>
      <HeatmapMesh cells={heatmapCells} />
    </group>
  );
};