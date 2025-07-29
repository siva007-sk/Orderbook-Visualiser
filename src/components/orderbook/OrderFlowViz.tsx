import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrderBookData } from '@/types/orderbook';

interface OrderFlowVizProps {
  orderbookData: OrderBookData[];
  enabled: boolean;
}

interface FlowParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  side: 'bid' | 'ask';
  size: number;
  action: 'add' | 'cancel';
}

export const OrderFlowViz = ({ orderbookData, enabled }: OrderFlowVizProps) => {
  const particlesRef = useRef<THREE.Points>(null);
  const particlesData = useRef<FlowParticle[]>([]);
  const previousData = useRef<OrderBookData[]>([]);

  const maxParticles = 1000;
  
  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(maxParticles * 3);
    const colors = new Float32Array(maxParticles * 3);
    const sizes = new Float32Array(maxParticles);
    
    return { positions, colors, sizes };
  }, []);

  // Detect order changes and create particles
  useEffect(() => {
    if (!enabled || !orderbookData.length) return;

    orderbookData.forEach((current, venueIndex) => {
      const previous = previousData.current[venueIndex];
      if (!previous) return;

      // Check for new/cancelled bids
      current.bids.forEach((bid, index) => {
        const prevBid = previous.bids[index];
        if (!prevBid || Math.abs(bid.quantity - prevBid.quantity) > 0.01) {
          const action = !prevBid || bid.quantity > prevBid.quantity ? 'add' : 'cancel';
          createParticle(bid.price, bid.quantity, 'bid', action, venueIndex);
        }
      });

      // Check for new/cancelled asks
      current.asks.forEach((ask, index) => {
        const prevAsk = previous.asks[index];
        if (!prevAsk || Math.abs(ask.quantity - prevAsk.quantity) > 0.01) {
          const action = !prevAsk || ask.quantity > prevAsk.quantity ? 'add' : 'cancel';
          createParticle(ask.price, ask.quantity, 'ask', action, venueIndex);
        }
      });
    });

    previousData.current = [...orderbookData];
  }, [orderbookData, enabled]);

  const createParticle = (price: number, quantity: number, side: 'bid' | 'ask', action: 'add' | 'cancel', venueIndex: number) => {
    if (particlesData.current.length >= maxParticles) {
      particlesData.current.shift(); // Remove oldest particle
    }

    const basePrice = 65000;
    const x = ((price - basePrice) / basePrice) * 20;
    const y = Math.min(quantity * 2, 10);
    const z = (venueIndex - 1) * 5;

    const particle: FlowParticle = {
      position: new THREE.Vector3(x, y, z),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.05, // Slower horizontal movement
        action === 'add' ? 0.02 : -0.02, // Slower vertical movement
        (Math.random() - 0.5) * 0.05 // Slower depth movement
      ),
      life: 2.0, // Longer life for smoother fade
      maxLife: 2.0,
      side,
      size: Math.min(quantity * 0.3, 1.5), // Smaller particles
      action
    };

    particlesData.current.push(particle);
  };

  useFrame((state, delta) => {
    if (!enabled || !particlesRef.current) return;

    // Update particles with smoother movement
    particlesData.current = particlesData.current.filter(particle => {
      particle.life -= delta * 0.5; // Slower fade
      particle.position.add(particle.velocity.clone().multiplyScalar(delta * 5)); // Slower movement
      return particle.life > 0;
    });

    // Update geometry
    const geometry = particlesRef.current.geometry;
    
    for (let i = 0; i < maxParticles; i++) {
      const particle = particlesData.current[i];
      
      if (particle) {
        // Position
        positions[i * 3] = particle.position.x;
        positions[i * 3 + 1] = particle.position.y;
        positions[i * 3 + 2] = particle.position.z;

        // Color based on side and action
        const alpha = particle.life / particle.maxLife;
        if (particle.side === 'bid') {
          colors[i * 3] = particle.action === 'add' ? 0.2 : 0.8; // Green for add, red for cancel
          colors[i * 3 + 1] = particle.action === 'add' ? 0.8 : 0.2;
          colors[i * 3 + 2] = 0.2;
        } else {
          colors[i * 3] = 0.8;
          colors[i * 3 + 1] = particle.action === 'add' ? 0.4 : 0.2;
          colors[i * 3 + 2] = particle.action === 'add' ? 0.2 : 0.2;
        }

        // Size with fade
        sizes[i] = particle.size * alpha;
      } else {
        // Hide unused particles
        positions[i * 3] = 0;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = 0;
        sizes[i] = 0;
      }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
  });

  if (!enabled) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={maxParticles}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={maxParticles}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={maxParticles}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};