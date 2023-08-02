import { create } from 'zustand'

const useStoreObjs = create((set) => ({
  objs: [],
  add: ({ mesh, minWGS84, maxWGS84 }) => set(state => ({ objs: [...state.objs, { mesh, minWGS84, maxWGS84 }] })),
  remove: ({ mesh }) => set(state => ({ objs: state.objs.filter(obj => obj.mesh.uuid !== mesh.uuid) }))
}));

const useStoreThree = create((set) => ({
  three: null,
  add: (three) => set({ three }),
  remove: () => set({ three: null })
}));
  
const useStoreCesium = create((set) => ({
  cesium: null,
  add: (cesium) => set({ cesium }),
  remove: () => set({ cesium: null })
}));

const useBoundingBox = create(() => ({
  minWGS84: [115.23, 39.55],
  maxWGS84: [116.23, 41.55],
}));

export {
  useBoundingBox,
  useStoreObjs,
  useStoreCesium,
  useStoreThree
};