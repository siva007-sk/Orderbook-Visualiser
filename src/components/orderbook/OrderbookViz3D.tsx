import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Grid, Stats } from '@react-three/drei';
import * as THREE from 'three';
import { OrderBookData, VisualizationSettings } from '@/types/orderbook';
import { useHeatmapData } from '@/hooks/useHeatmapData';
import { OrderFlowViz } from './OrderFlowViz';
import { TradeMatchingViz } from './TradeMatchingViz';
import { MarketDepthHeatmap } from './MarketDepthHeatmap';

interface OrderbookViz3DProps {
  orderbookData: OrderBookData[];
  settings: VisualizationSettings;
  isPlaying: boolean;
}

interface OrderBarProps {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  opacity?: number;
}

const OrderBar = ({ position, scale, color, opacity = 0.8 }: OrderBarProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
};

interface PressureZoneProps {
  position: [number, number, number];
  intensity: 'low' | 'medium' | 'high';
}

const PressureZone = ({ position, intensity }: PressureZoneProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const color = intensity === 'high' ? '#A855F7' : 
                intensity === 'medium' ? '#3B82F6' : '#F59E0B';
  
  const size = intensity === 'high' ? 2 : intensity === 'medium' ? 1.5 : 1;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime;
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      if (material.opacity !== undefined) {
        material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial color={color} transparent opacity={0.3} />
    </mesh>
  );
};

interface HeatmapOverlayProps {
  orderbookData: OrderBookData[];
  settings: VisualizationSettings;
}

const HeatmapOverlay = ({ orderbookData, settings }: HeatmapOverlayProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { scene } = useThree();
  const heatmapData = useHeatmapData(orderbookData, settings.quantityThreshold);
  
  const heatmapTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    const size = 512;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, size, size);
    
    // Create gradient for each heatmap point
    heatmapData.forEach(point => {
      const x = ((point.x + 50) / 100) * size;
      const y = (1 - point.intensity) * size;
      const radius = point.intensity * 30 + 10;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      
      if (point.intensity < 0.3) {
        gradient.addColorStop(0, `rgba(245, 158, 11, ${point.intensity * 0.8})`); // Yellow
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
      } else if (point.intensity < 0.7) {
        gradient.addColorStop(0, `rgba(59, 130, 246, ${point.intensity * 0.8})`); // Blue
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      } else {
        gradient.addColorStop(0, `rgba(168, 85, 247, ${point.intensity * 0.8})`); // Purple
        gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
      }
      
      ctx.fillStyle = gradient;
      ctx.globalCompositeOperation = 'screen';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [heatmapData]);
  
  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });
  
  if (!settings.showPressureZones) return null;
  
  return (
    <mesh 
      ref={meshRef} 
      position={[0, 0.1, 10]} 
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[100, 40]} />
      <meshBasicMaterial 
        map={heatmapTexture} 
        transparent 
        opacity={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const OrderbookScene = ({ orderbookData, settings, isPlaying }: OrderbookViz3DProps) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current && isPlaying) {
      groupRef.current.rotation.y += settings.rotationSpeed * 0.01;
    }
  });

  const { bidBars, askBars, pressureZones } = useMemo(() => {
    const bidBars: JSX.Element[] = [];
    const askBars: JSX.Element[] = [];
    const pressureZones: JSX.Element[] = [];

    orderbookData.forEach((data, venueIndex) => {
      const venueOffset = venueIndex * 30; // Separate venues along X-axis

      // Process bids (green bars, negative side)
      data.bids.forEach((bid, index) => {
        if (bid.quantity > settings.quantityThreshold) {
          const x = venueOffset - bid.price / 1000; // Scale price for visualization
          const y = bid.quantity * 2; // Scale quantity
          const z = index * 0.5; // Time depth

          bidBars.push(
            <OrderBar
              key={`bid-${data.venue}-${index}`}
              position={[x, y / 2, z]}
              scale={[0.5, y, 0.3]}
              color="#10B981"
            />
          );

          // Add pressure zone for high quantity orders
          if (bid.quantity > 20) {
            const intensity = bid.quantity > 40 ? 'high' : bid.quantity > 30 ? 'medium' : 'low';
            pressureZones.push(
              <PressureZone
                key={`pressure-bid-${data.venue}-${index}`}
                position={[x, y + 2, z]}
                intensity={intensity}
              />
            );
          }
        }
      });

      // Process asks (red bars, positive side)
      data.asks.forEach((ask, index) => {
        if (ask.quantity > settings.quantityThreshold) {
          const x = venueOffset + ask.price / 1000; // Scale price for visualization
          const y = ask.quantity * 2; // Scale quantity
          const z = index * 0.5; // Time depth

          askBars.push(
            <OrderBar
              key={`ask-${data.venue}-${index}`}
              position={[x, y / 2, z]}
              scale={[0.5, y, 0.3]}
              color="#EF4444"
            />
          );

          // Add pressure zone for high quantity orders
          if (ask.quantity > 20) {
            const intensity = ask.quantity > 40 ? 'high' : ask.quantity > 30 ? 'medium' : 'low';
            pressureZones.push(
              <PressureZone
                key={`pressure-ask-${data.venue}-${index}`}
                position={[x, y + 2, z]}
                intensity={intensity}
              />
            );
          }
        }
      });
    });

    return { bidBars, askBars, pressureZones };
  }, [orderbookData, settings]);

  return (
    <group ref={groupRef}>
      {/* Grid */}
      <Grid
        position={[0, 0, 0]}
        args={[100, 100]}
        cellSize={2}
        cellThickness={0.5}
        cellColor="#374151"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#6B7280"
        fadeDistance={50}
        fadeStrength={1}
      />

      {/* Axes Labels */}
      <Text
        position={[0, 0, -15]}
        fontSize={2}
        color="#9CA3AF"
        anchorX="center"
        anchorY="middle"
      >
        Time →
      </Text>
      
      <Text
        position={[-25, 0, 0]}
        fontSize={2}
        color="#9CA3AF"
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI / 2, 0]}
      >
        ← Bids | Price | Asks →
      </Text>
      
      <Text
        position={[0, 25, 0]}
        fontSize={2}
        color="#9CA3AF"
        anchorX="center"
        anchorY="middle"
        rotation={[Math.PI / 2, 0, 0]}
      >
        Quantity ↑
      </Text>

      {/* Market Depth Heatmap */}
      <MarketDepthHeatmap
        orderbookData={orderbookData}
        priceRange={settings.priceRange}
        enabled={settings.showPressureZones}
      />

      {/* Heatmap overlay */}
      <HeatmapOverlay orderbookData={orderbookData} settings={settings} />

      {/* Order flow visualization */}
      <OrderFlowViz orderbookData={orderbookData} enabled={settings.realTimeMode} />
      
      {/* Trade matching visualization */}
      <TradeMatchingViz orderbookData={orderbookData} enabled={settings.realTimeMode} />

      {/* Orderbook bars */}
      {bidBars}
      {askBars}

      {/* Pressure zones */}
      {settings.showPressureZones && pressureZones}

      {/* Center line */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.1, 50, 20]} />
        <meshStandardMaterial color="#F59E0B" transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

export const OrderbookViz3D = ({ orderbookData, settings, isPlaying }: OrderbookViz3DProps) => {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [30, 20, 30], fov: 75 }}
        style={{ background: 'hsl(220, 13%, 9%)' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        <OrderbookScene
          orderbookData={orderbookData}
          settings={settings}
          isPlaying={isPlaying}
        />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={100}
          minDistance={10}
        />
      </Canvas>
      
    </div>
  );
};