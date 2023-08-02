import { useRef, useEffect } from 'react'
import { Viewer } from 'resium'
import { Canvas } from '@react-three/fiber'

import ThreeScene from './components/three/Scene'
import CesiumScene from './components/cesium/Scene'

import { removeCesiumMenu } from './utils'
import { useStoreCesium, useStoreThree } from './store'

function CesiumContainer() {
  const add = useStoreCesium((state) => state.add)
  const remove = useStoreCesium((state) => state.remove)
  const cesiumRef = useRef()

  useEffect(() => {
    let timeOut = setTimeout(() => {
      if (cesiumRef.current && cesiumRef.current.cesiumElement) {
        removeCesiumMenu()
        add(cesiumRef.current)
  
        return () => { 
          clearTimeout(timeOut)
          remove()
        }
      }
    }, 1);
  }, [add, remove])

  return (
    <>
      <Viewer ref={cesiumRef}
        selectionIndicator={false}
        full>
        <CesiumScene />
      </Viewer>
    </>
  )
}

function ThreeContainer() {
  const add = useStoreThree((state) => state.add)
  const remove = useStoreThree((state) => state.remove)

  const threeRef = useRef()

  useEffect(() => {
    if (threeRef.current) {
      add(threeRef.current)

      return () => remove()
    }
  }, [add, remove])

  const cameraProps = {
    fov: 45,
    width: window.innerWidth,
    height: window.innerHeight,
    aspect: window.innerWidth / window.innerHeight,
    near: 1,
    far: 10 * 1000 * 1000 // Cesium의 세계적 규모 렌더링을 지원하려면 멀리 떨어져 있어야 합니다.
  }

  return (
    <>
      <Canvas ref={threeRef} style={{ pointerEvents: 'none' }} gl={{ alpha: true }} camera={{ ...cameraProps }}>
        <ThreeScene />
      </Canvas>
    </>
  )
}

const Viewers = () => {
  return (
    <>
      <CesiumContainer />
      <ThreeContainer />
    </>
  )
}

export default Viewers
