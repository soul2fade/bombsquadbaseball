import React, { Suspense, useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { Asset } from 'expo-asset';
import * as THREE from 'three';

function SpinningCharacter({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.4;
  });

  return <primitive ref={ref} object={scene} />;
}

export function Character3DPreview() {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { width: windowW, height: windowH } = useWindowDimensions();
  // Approximate available space: window minus paddings/header/hint (~200px height, ~32px width).
  // Fall back to sensible defaults if the window reports unrealistic dims (some embeds report 1px).
  const w = Math.max(windowW > 100 ? windowW - 32 : 600, 320);
  const h = Math.max(windowH > 200 ? windowH - 200 : 500, 320);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const asset = Asset.fromModule(require('../../assets/models/character.glb'));
        await asset.downloadAsync();
        if (!cancelled) setUrl(asset.localUri ?? asset.uri);
      } catch (e: unknown) {
        if (!cancelled) setError(String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <View style={[styles.center, { width: w, height: h }]}>
        <Text style={styles.errorText}>Model load error: {error}</Text>
      </View>
    );
  }

  if (!url) {
    return (
      <View style={[styles.center, { width: w, height: h }]}>
        <ActivityIndicator size="large" color="#FFD23F" />
        <Text style={styles.loadingText}>Loading character…</Text>
      </View>
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 1.2, 3], fov: 50 }}
      style={{ width: w, height: h, backgroundColor: '#1a1a1a' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} />
      <Suspense fallback={null}>
        <SpinningCharacter url={url} />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#1a1a1a' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a1a' },
  loadingText: { color: '#999', marginTop: 12 },
  errorText: { color: '#ff6b6b', padding: 20, textAlign: 'center' },
});
