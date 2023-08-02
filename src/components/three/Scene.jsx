import * as Cesium from 'cesium'
import * as THREE from 'three'
import { useEffect, useCallback } from 'react';
import { useFrame, useThree} from '@react-three/fiber'

import Lathe from './Lathe'
import Dodecahedron from './Dodecahedron'

import { useStoreObjs, useStoreCesium } from '../../store'
import { cartToVec } from '../../utils'

const ThreeScene = () => {
  const objArray = useStoreObjs((state) => state.objs)
  const cesiumRef = useStoreCesium((state) => state.cesium)

  const canvas = useThree().scene
  
  const eventTypes = ["contextmenu", "selectstart", "pointerdown", "pointerup", "pointermove", "pointercancel", "dblclick", "wheel"]
  
  const propagateEvent = useCallback(
    function propagateEvent(e) {
      let event

      if (e instanceof PointerEvent) {
        event = new PointerEvent(e.type, e)
      } else  if (e instanceof WheelEvent) {
        event = new WheelEvent(e.type, e)
      } else  if (e instanceof MouseEvent) {
        event = new MouseEvent(e.type, e)
      }

      cesiumRef.cesiumElement._container.querySelector("canvas").dispatchEvent(event);
    },
    [cesiumRef]
  )

  useEffect(() => {
    eventTypes.forEach(type => {
      canvas.addEventListener(type, propagateEvent) 
    })

    return () => {
      eventTypes.forEach(type => {
        canvas.removeEventListener(type, propagateEvent) 
      })
    }
  }, [canvas, eventTypes, propagateEvent])

  useFrame(
    ({ gl, scene, camera: threeCamera }) => {

      if (!cesiumRef) return

      const { camera: cesiumCamera } = cesiumRef.cesiumElement

      threeCamera.fov = Cesium.Math.toDegrees(cesiumCamera.frustum.fovy) // ThreeJS FOV는 수직입니다.
      threeCamera.updateProjectionMatrix()

      objArray.forEach((obj) => {
        const { mesh, minWGS84, maxWGS84 } = obj

        // 위도/경도 중심 위치를 Cartesian3으로 변환
        const center = cartToVec(
          Cesium.Cartesian3.fromDegrees((minWGS84[0] + maxWGS84[0]) / 2, (minWGS84[1] + maxWGS84[1]) / 2)
        )

        
        // 방향 모델을 위한 정방향 가져오기
        const centerHigh = cartToVec(
          Cesium.Cartesian3.fromDegrees((minWGS84[0] + maxWGS84[0]) / 2, (minWGS84[1] + maxWGS84[1]) / 2, 1)
        )

        // 왼쪽 아래에서 왼쪽 위 방향을 상향 벡터로 사용
        const bottomLeft = cartToVec(Cesium.Cartesian3.fromDegrees(minWGS84[0], minWGS84[1]))
        const topLeft = cartToVec(Cesium.Cartesian3.fromDegrees(minWGS84[0], maxWGS84[1]))
        const latDir = new THREE.Vector3().subVectors(bottomLeft, topLeft).normalize()

        // 엔터티 위치 및 방향 구성
        mesh.position.set(center.x, center.y, center.z)
        mesh.lookAt(centerHigh)
        mesh.up.copy(latDir)
      })

      
      // Cesium 카메라 프로젝션 위치를 복제하여
      // Three.js 객체는 Cesium Globe 위와 같은 위치에 있는 것처럼 보입니다.
      threeCamera.matrixAutoUpdate = false
      const cvm = cesiumCamera.viewMatrix
      const civm = cesiumCamera.inverseViewMatrix
      threeCamera.matrixWorld.set(
        civm[0],
        civm[4],
        civm[8],
        civm[12],
        civm[1],
        civm[5],
        civm[9],
        civm[13],
        civm[2],
        civm[6],
        civm[10],
        civm[14],
        civm[3],
        civm[7],
        civm[11],
        civm[15]
      )
      threeCamera.matrixWorldInverse.set(
        cvm[0],
        cvm[4],
        cvm[8],
        cvm[12],
        cvm[1],
        cvm[5],
        cvm[9],
        cvm[13],
        cvm[2],
        cvm[6],
        cvm[10],
        cvm[14],
        cvm[3],
        cvm[7],
        cvm[11],
        cvm[15]
      )

      const cesiumCanvas = cesiumRef.cesiumElement.canvas;
      const width = cesiumCanvas.width;
      const height = cesiumCanvas.height;
      const aspect = width / height
      threeCamera.aspect = aspect
      threeCamera.updateProjectionMatrix()

      gl.setSize(width, height)
      gl.render(scene, threeCamera)
    },
    false,
    [objArray, cesiumRef]
  )

  return (
    <>
      <ambientLight color="lightblue" />
      <pointLight color="white" intensity={1} position={[10, 10, 10]} />
      <Lathe />
      <Dodecahedron />
    </>
  )
}

export default ThreeScene
