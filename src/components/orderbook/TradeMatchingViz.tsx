import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrderBookData } from '@/types/orderbook';

interface TradeMatchingVizProps {
  orderbookData: OrderBookData[];
  enabled: boolean;
}

interface TradeMatch {
  id: string;
  bidPrice: number;
  askPrice: number;
  quantity: number;
  venue: string;
  startTime: number;
  duration: number;
  progress: number;
}

export const TradeMatchingViz = ({ orderbookData, enabled }: TradeMatchingVizProps) => {
  const [activeMatches, setActiveMatches] = useState<TradeMatch[]>([]);
  const meshRefs = useRef<THREE.Mesh[]>([]);

  // Simulate trade matches based on overlapping bid/ask prices
  useEffect(() => {
    if (!enabled || !orderbookData.length) return;

    const interval = setInterval(() => {
      const newMatches: TradeMatch[] = [];

      orderbookData.forEach(data => {
        const topBid = data.bids[0];
        const topAsk = data.asks[0];

        // Simulate trade when bid/ask spread is tight
        if (topBid && topAsk && (topAsk.price - topBid.price) / topBid.price < 0.001) {
          const matchPrice = (topBid.price + topAsk.price) / 2;
          const matchQuantity = Math.min(topBid.quantity, topAsk.quantity, Math.random() * 2 + 0.5);

          newMatches.push({
            id: `${data.venue}-${Date.now()}-${Math.random()}`,
            bidPrice: topBid.price,
            askPrice: topAsk.price,
            quantity: matchQuantity,
            venue: data.venue,
            startTime: Date.now(),
            duration: 2000, // 2 seconds
            progress: 0
          });
        }
      });

      if (newMatches.length > 0) {
        setActiveMatches(prev => [...prev, ...newMatches]);
      }
    }, 1000 + Math.random() * 2000); // Random interval 1-3 seconds

    return () => clearInterval(interval);
  }, [orderbookData, enabled]);

  useFrame((state, delta) => {
    if (!enabled) return;

    const now = Date.now();
    
    // Update match progress and remove completed matches
    setActiveMatches(prev => 
      prev.map(match => ({
        ...match,
        progress: Math.min((now - match.startTime) / match.duration, 1)
      })).filter(match => match.progress < 1)
    );

    // Update mesh animations
    meshRefs.current.forEach((mesh, index) => {
      const match = activeMatches[index];
      if (mesh && match) {
        // Animate scale and rotation
        const scale = 1 + Math.sin(match.progress * Math.PI) * 0.5;
        mesh.scale.setScalar(scale);
        mesh.rotation.z += delta * 2;
        
        // Fade out
        if (mesh.material instanceof THREE.MeshBasicMaterial) {
          mesh.material.opacity = 1 - match.progress;
        }
      }
    });
  });

  if (!enabled) return null;

  return (
    <group>
      {activeMatches.map((match, index) => {
        const basePrice = 65000;
        const x = ((match.bidPrice + match.askPrice) / 2 - basePrice) / basePrice * 20;
        const y = match.quantity * 2;
        const z = 0;

        return (
          <group key={match.id} position={[x, y, z]}>
            {/* Explosion effect */}
            <mesh
              ref={el => { if (el) meshRefs.current[index] = el; }}
              position={[0, 0, 0]}
            >
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshBasicMaterial
                color={0xffff00}
                transparent
                opacity={0.8}
              />
            </mesh>

            {/* Connecting line between bid and ask */}
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([
                    -1, 0, 0,  // Bid side
                    1, 0, 0    // Ask side
                  ])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color={0x00ffff} linewidth={2} />
            </line>

            {/* Particles radiating outward */}
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const distance = match.progress * 2;
              const px = Math.cos(angle) * distance;
              const py = Math.sin(angle) * distance;

              return (
                <mesh key={i} position={[px, py, 0]}>
                  <sphereGeometry args={[0.05, 4, 4]} />
                  <meshBasicMaterial
                    color={i % 2 === 0 ? 0x00ff00 : 0xff0000}
                    transparent
                    opacity={1 - match.progress}
                  />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
};