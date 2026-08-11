import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// Jerry Mouse - 体素风格的3D杰瑞模型
function JerryModel({ isHovered, isIdle }: { isHovered: boolean; isIdle: boolean }) {
  const mouseRef = useRef<any>(null);
  const tailRef = useRef<any>(null);
  const eyeLRef = useRef<any>(null);
  const eyeRRef = useRef<any>(null);
  const headRef = useRef<any>(null);
  const earLRef = useRef<any>(null);
  const earRRef = useRef<any>(null);

  useFrame((state, delta) => {
    if (mouseRef.current) {
      mouseRef.current.rotation.y += delta * 0.3;
      if (isHovered) {
        mouseRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.15 + 0.2;
        mouseRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 3) * 0.1;
      } else if (isIdle && Math.random() > 0.98) {
        mouseRef.current.position.y = Math.sin(state.clock.elapsedTime * 8) * 0.05;
      } else {
        mouseRef.current.position.y = 0;
        mouseRef.current.rotation.x = 0;
      }
    }
    // 长尾巴摇摆动画
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 4) * 0.5;
      tailRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
    // 眨眼动画
    if (eyeLRef.current && eyeRRef.current) {
      const blink = Math.sin(state.clock.elapsedTime * 6);
      const eyeScale = blink > 0.95 ? 0.1 : 1;
      eyeLRef.current.scale.y = eyeScale;
      eyeRRef.current.scale.y = eyeScale;
    }
    // 头部晃动
    if (headRef.current && isHovered) {
      headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
      headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
    // 耳朵抖动
    if (earLRef.current && earRRef.current) {
      earLRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 5) * 0.1 + 0.3;
      earRRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 5) * 0.1 - 0.3;
    }
  });

  // 杰瑞的颜色：棕色身体、粉色耳朵内部、粉色鼻子
  const bodyColor = "#A0522D"; // 更暖的棕色
  const bellyColor = "#FFE4C4"; // 更温暖的米色
  const pinkColor = "#FF69B4"; // 更鲜艳的粉色
  const darkBrown = "#5D4037"; // 深棕色

  return (
    <group ref={mouseRef}>
      {/* 发光效果 */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.65, 16, 16]} />
        <meshBasicMaterial 
          color={bodyColor} 
          transparent 
          opacity={isHovered ? 0.12 : 0.04}
        />
      </mesh>

      {/* 身体 - 更圆润的形状 */}
      <mesh position={[0, 0.22, 0]} scale={[1, 0.9, 1.1]}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color={bodyColor} metalness={0.05} roughness={0.75} />
      </mesh>

      {/* 肚子 - 更柔和的颜色 */}
      <mesh position={[0, 0.22, 0.25]}>
        <sphereGeometry args={[0.24, 16, 16]} />
        <meshStandardMaterial color={bellyColor} metalness={0.05} roughness={0.85} />
      </mesh>

      {/* 头部 - 圆形 */}
      <mesh ref={headRef} position={[0, 0.58, 0.12]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={bodyColor} metalness={0.05} roughness={0.75} />
      </mesh>

      {/* 脸部白色区域 */}
      <mesh position={[0, 0.52, 0.35]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={bellyColor} metalness={0.05} roughness={0.85} />
      </mesh>

      {/* 粉色鼻子 - 更可爱的形状 */}
      <mesh position={[0, 0.5, 0.45]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={pinkColor} metalness={0.2} roughness={0.4} />
      </mesh>

      {/* 鼻子高光 */}
      <mesh position={[0.01, 0.51, 0.48]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color="white" metalness={0.3} />
      </mesh>

      {/* 大圆耳朵 - 左 */}
      <mesh ref={earLRef} position={[-0.22, 0.75, -0.05]} rotation={[0, 0, 0.3]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={bodyColor} metalness={0.1} roughness={0.7} />
      </mesh>
      {/* 耳朵内部粉色 - 左 */}
      <mesh position={[-0.22, 0.75, 0.02]} rotation={[0, 0, 0.3]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={pinkColor} metalness={0.1} roughness={0.6} />
      </mesh>

      {/* 大圆耳朵 - 右 */}
      <mesh ref={earRRef} position={[0.22, 0.75, -0.05]} rotation={[0, 0, -0.3]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={bodyColor} metalness={0.1} roughness={0.7} />
      </mesh>
      {/* 耳朵内部粉色 - 右 */}
      <mesh position={[0.22, 0.75, 0.02]} rotation={[0, 0, -0.3]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={pinkColor} metalness={0.1} roughness={0.6} />
      </mesh>

      {/* 大眼睛 - 左 */}
      <mesh position={[-0.12, 0.62, 0.3]} ref={eyeLRef}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="white" metalness={0.05} roughness={0.8} />
      </mesh>
      {/* 眼珠 - 左 */}
      <mesh position={[-0.12, 0.62, 0.36]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.2} roughness={0.5} />
      </mesh>
      {/* 眼睛高光 - 左 */}
      <mesh position={[-0.1, 0.64, 0.37]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="white" metalness={0.4} roughness={0.2} />
      </mesh>
      {/* 眼睛第二高光 - 左 */}
      <mesh position={[-0.13, 0.61, 0.37]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshStandardMaterial color="white" metalness={0.4} roughness={0.2} />
      </mesh>

      {/* 大眼睛 - 右 */}
      <mesh position={[0.12, 0.62, 0.3]} ref={eyeRRef}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="white" metalness={0.05} roughness={0.8} />
      </mesh>
      {/* 眼珠 - 右 */}
      <mesh position={[0.12, 0.62, 0.36]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.2} roughness={0.5} />
      </mesh>
      {/* 眼睛高光 - 右 */}
      <mesh position={[0.14, 0.64, 0.37]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="white" metalness={0.4} roughness={0.2} />
      </mesh>
      {/* 眼睛第二高光 - 右 */}
      <mesh position={[0.11, 0.61, 0.37]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshStandardMaterial color="white" metalness={0.4} roughness={0.2} />
      </mesh>

      {/* 微笑嘴巴 */}
      <mesh position={[0, 0.45, 0.42]} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[0.07, 0.018, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#3d3d3d" roughness={0.8} />
      </mesh>

      {/* 腮红 - 左 */}
      <mesh position={[-0.18, 0.52, 0.32]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#FFB6C1" transparent opacity={0.5} />
      </mesh>
      {/* 腮红 - 右 */}
      <mesh position={[0.18, 0.52, 0.32]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#FFB6C1" transparent opacity={0.5} />
      </mesh>

      {/* 长尾巴 - 棕色弯曲造型 */}
      <group ref={tailRef} position={[0, 0.15, -0.35]}>
        {/* 尾巴根部 */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
          <cylinderGeometry args={[0.04, 0.03, 0.15, 8]} />
          <meshStandardMaterial color={bodyColor} metalness={0.1} roughness={0.7} />
        </mesh>
        {/* 尾巴中部 - 向上弯曲 */}
        <mesh position={[0.04, -0.08, 0]} rotation={[0.3, 0, Math.PI / 3]}>
          <cylinderGeometry args={[0.03, 0.025, 0.18, 8]} />
          <meshStandardMaterial color={bodyColor} metalness={0.1} roughness={0.7} />
        </mesh>
        {/* 尾巴上部 - 继续弯曲 */}
        <mesh position={[0.12, -0.18, 0]} rotation={[0.5, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.02, 0.15, 8]} />
          <meshStandardMaterial color={bodyColor} metalness={0.1} roughness={0.7} />
        </mesh>
        {/* 尾巴末端 - 卷曲 */}
        <mesh position={[0.18, -0.25, 0]} rotation={[0.3, 0, Math.PI * 1.2]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={bodyColor} metalness={0.1} roughness={0.7} />
        </mesh>
      </group>

      {/* 前爪 - 左 */}
      <mesh position={[-0.12, 0.05, 0.2]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color={bodyColor} metalness={0.1} roughness={0.7} />
      </mesh>
      {/* 前爪 - 右 */}
      <mesh position={[0.12, 0.05, 0.2]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color={bodyColor} metalness={0.1} roughness={0.7} />
      </mesh>

      {/* 后爪 - 左 */}
      <mesh position={[-0.12, 0.05, -0.15]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color={bodyColor} metalness={0.1} roughness={0.7} />
      </mesh>
      {/* 后爪 - 右 */}
      <mesh position={[0.12, 0.05, -0.15]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color={bodyColor} metalness={0.1} roughness={0.7} />
      </mesh>
    </group>
  );
}

function Pet3DScene({ isHovered, isIdle }: { isHovered: boolean; isIdle: boolean }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 3, 3]} intensity={1.2} color="#8B4513" />
      <pointLight position={[-3, -2, -3]} intensity={0.5} color="#FFB6C1" />
      <JerryModel isHovered={isHovered} isIdle={isIdle} />
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        maxPolarAngle={Math.PI / 2} 
        enableRotate={false}
      />
    </>
  );
}

export function DesktopPet3D() {
  const [position, setPosition] = useState({ x: window.innerWidth - 180, y: window.innerHeight - 225 });
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isIdle, setIsIdle] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 120),
        y: Math.min(prev.y, window.innerHeight - 150)
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    setIsIdle(false);
    setTimeout(() => setIsIdle(true), 3000);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 180, e.clientX - dragOffset.x)),
        y: Math.max(0, Math.min(window.innerHeight - 225, e.clientY - dragOffset.y)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`fixed z-50 cursor-grab select-none ${isDragging ? 'cursor-grabbing' : ''}`}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: 180,
        height: 225,
        transform: 'translate(0, 0)',
        zIndex: 9999,
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={(e) => {
        handleMouseUp();
        setIsHovered(false);
      }}
      onMouseEnter={() => setIsHovered(true)}
    >
      <Canvas 
        camera={{ position: [0, 0.1, 2.8], fov: 65 }} 
        style={{ 
          background: 'transparent',
          width: '100%',
          height: '100%',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          padding: '0',
          margin: '0',
          overflow: 'visible',
        }}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      >
        <Pet3DScene isHovered={isHovered} isIdle={isIdle} />
      </Canvas>
    </div>
  );
}