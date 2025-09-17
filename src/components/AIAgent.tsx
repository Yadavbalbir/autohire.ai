import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Volume2, VolumeX } from 'lucide-react';

interface AIAgentProps {
  isSpeaking: boolean;
}

const AIAgent: React.FC<AIAgentProps> = ({ isSpeaking }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const agentRef = useRef<THREE.Group | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1f2937); // Gray-800
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Create AI Agent
    const agentGroup = new THREE.Group();
    agentRef.current = agentGroup;

    // Head (sphere with gradient material)
    const headGeometry = new THREE.SphereGeometry(1, 32, 32);
    const headMaterial = new THREE.MeshPhongMaterial({
      color: 0x4f46e5, // Indigo-600
      shininess: 100,
      transparent: true,
      opacity: 0.9
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.5;
    head.castShadow = true;
    agentGroup.add(head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 0.7, 0.8);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3, 0.7, 0.8);
    
    agentGroup.add(leftEye, rightEye);

    // Mouth (for speaking animation)
    const mouthGeometry = new THREE.RingGeometry(0.1, 0.2, 8);
    const mouthMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8
    });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, 0.3, 0.9);
    mouth.name = 'mouth';
    agentGroup.add(mouth);

    // Body (cylinder with glow effect)
    const bodyGeometry = new THREE.CylinderGeometry(0.8, 1.2, 2, 16);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0x374151, // Gray-700
      transparent: true,
      opacity: 0.8
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = -1;
    body.castShadow = true;
    agentGroup.add(body);

    // Floating particles around the agent
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 50;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    scene.add(agentGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Point light for accent
    const pointLight = new THREE.PointLight(0x00ffff, 1, 10);
    pointLight.position.set(0, 2, 2);
    scene.add(pointLight);

    setIsLoaded(true);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (agentRef.current) {
        // Gentle rotation
        agentRef.current.rotation.y += 0.005;

        // Breathing effect
        const breathingScale = 1 + Math.sin(Date.now() * 0.003) * 0.05;
        agentRef.current.scale.y = breathingScale;

        // Speaking animation
        const mouth = agentRef.current.getObjectByName('mouth') as THREE.Mesh;
        if (mouth && isSpeaking) {
          const speakingScale = 1 + Math.sin(Date.now() * 0.05) * 0.3;
          mouth.scale.setScalar(speakingScale);
          (mouth.material as THREE.MeshBasicMaterial).opacity = 0.8 + Math.sin(Date.now() * 0.05) * 0.2;
        } else if (mouth) {
          mouth.scale.setScalar(1);
          (mouth.material as THREE.MeshBasicMaterial).opacity = 0.5;
        }
      }

      // Animate particles
      if (particlesMesh) {
        particlesMesh.rotation.y += 0.002;
        particlesMesh.rotation.x += 0.001;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update speaking animation when isSpeaking changes
  useEffect(() => {
    if (agentRef.current) {
      const mouth = agentRef.current.getObjectByName('mouth') as THREE.Mesh;
      if (mouth) {
        if (isSpeaking) {
          // Start speaking animation with more intensity
          (mouth.material as THREE.MeshBasicMaterial).color.setHex(0x00ff00);
        } else {
          // Reset to normal state
          (mouth.material as THREE.MeshBasicMaterial).color.setHex(0x00ffff);
        }
      }
    }
  }, [isSpeaking]);

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative w-full h-full bg-gray-800 overflow-hidden">
      {/* 3D Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-white text-sm">Loading AI Agent...</p>
          </div>
        </div>
      )}

      {/* Agent Controls */}
      <div className="absolute bottom-0 right-0 p-4">
        <button
          onClick={handleMuteToggle}
          className="p-1 rounded hover:bg-white/10 transition-colors text-white"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Speaking Indicator */}
      {isSpeaking && (
        <div className="absolute top-4 left-4">
          <div className="flex items-center space-x-2 bg-green-600 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white text-xs font-medium">AI SPEAKING</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default AIAgent;