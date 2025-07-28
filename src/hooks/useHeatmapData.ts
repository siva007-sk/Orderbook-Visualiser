import { useMemo } from 'react';
import * as THREE from 'three';
import { OrderBookData } from '@/types/orderbook';

interface HeatmapData {
  x: number;
  y: number;
  intensity: number;
  color: THREE.Color;
}

export const useHeatmapData = (orderbookData: OrderBookData[], quantityThreshold: number) => {
  return useMemo(() => {
    const heatmapPoints: HeatmapData[] = [];
    const gridSize = 50;
    const cellSize = 2;
    
    // Initialize grid
    const grid: number[][] = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
    
    orderbookData.forEach((data, venueIndex) => {
      const venueOffset = venueIndex * 30;
      
      // Process bids
      data.bids.forEach((bid, index) => {
        if (bid.quantity > quantityThreshold) {
          const x = Math.floor((venueOffset - bid.price / 1000 + 25) / cellSize);
          const z = Math.floor(index * 0.5 / cellSize);
          
          if (x >= 0 && x < gridSize && z >= 0 && z < gridSize) {
            grid[x][z] += bid.quantity;
          }
        }
      });
      
      // Process asks
      data.asks.forEach((ask, index) => {
        if (ask.quantity > quantityThreshold) {
          const x = Math.floor((venueOffset + ask.price / 1000 + 25) / cellSize);
          const z = Math.floor(index * 0.5 / cellSize);
          
          if (x >= 0 && x < gridSize && z >= 0 && z < gridSize) {
            grid[x][z] += ask.quantity;
          }
        }
      });
    });
    
    // Find max intensity for normalization
    const maxIntensity = Math.max(...grid.flat());
    
    // Convert grid to heatmap points
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        if (grid[x][z] > 0) {
          const intensity = grid[x][z] / maxIntensity;
          const worldX = (x * cellSize) - 25;
          const worldZ = (z * cellSize);
          
          // Create color based on intensity
          const color = new THREE.Color();
          if (intensity < 0.3) {
            color.setHSL(0.17, 1, 0.5); // Yellow for low intensity
          } else if (intensity < 0.7) {
            color.setHSL(0.55, 1, 0.5); // Cyan for medium intensity
          } else {
            color.setHSL(0.83, 1, 0.5); // Purple for high intensity
          }
          
          heatmapPoints.push({
            x: worldX,
            y: intensity * 5, // Scale for visibility
            intensity,
            color
          });
        }
      }
    }
    
    return heatmapPoints;
  }, [orderbookData, quantityThreshold]);
};