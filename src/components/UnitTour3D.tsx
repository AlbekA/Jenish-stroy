import {
  ChevronDown,
  ChevronUp,
  Eye,
  Moon,
  RotateCcw,
  Sun,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { formatArea } from '../data/realEstateData';
import {
  CameraRoomId,
  FinishPreset,
  LightingMode,
  Unit,
} from '../types/realEstate';

interface UnitTour3DProps {
  unit: Unit;
  compact?: boolean;
}

interface CameraPreset {
  id: CameraRoomId;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
}

const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'overview',
    label: 'Общий вид',
    position: [11.5, 11.2, 12.0],
    target: [0, 0.6, 0],
  },
  {
    id: 'living',
    label: 'Гостиная',
    position: [-1.2, 3.6, 6.2],
    target: [-2.4, 0.9, 1.8],
  },
  {
    id: 'kitchen',
    label: 'Кухня',
    position: [1.8, 3.5, 3.6],
    target: [-0.8, 1.0, -2.1],
  },
  {
    id: 'bedroom',
    label: 'Спальня',
    position: [5.4, 4.0, 4.8],
    target: [2.8, 0.8, -1.0],
  },
  {
    id: 'bath',
    label: 'Санузел',
    position: [-5.8, 4.5, 0.8],
    target: [-3.9, 0.8, -2.5],
  },
  {
    id: 'balcony',
    label: 'Балкон',
    position: [-5.6, 3.0, 8.0],
    target: [-1.4, 0.9, 4.7],
  },
];

// Reusable math objects at module scope (zero GC in animation loop)
const _targetPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();
const _mouseVec = new THREE.Vector2();

function createWoodPlankTexture(
  baseHex: string,
  grainHex: string,
  anisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 512, 512);

  const plankH = 64;
  for (let row = 0; row < 8; row++) {
    const y = row * plankH;
    const offset = (row % 2) * 128;
    ctx.strokeStyle = grainHex;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();

    for (let x = offset; x < 512; x += 256) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + plankH);
      ctx.stroke();
    }

    // Subtle organic wood grain streaks
    ctx.fillStyle = grainHex;
    ctx.globalAlpha = 0.16;
    for (let g = 0; g < 18; g++) {
      const gy = y + ((g * 19 + row * 7) % (plankH - 4)) + 2;
      ctx.fillRect(0, gy, 512, 1.2);
    }
    ctx.globalAlpha = 1;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  return tex;
}

function createTileTexture(
  bgHex: string,
  groutHex: string,
  anisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = groutHex;
  ctx.lineWidth = 3;
  for (let i = 0; i <= 256; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 256);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(256, i);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  return tex;
}

function createRugTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#EAE6DF';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#CFC8BC';
  ctx.lineWidth = 2;
  for (let y = 8; y < 256; y += 12) {
    ctx.beginPath();
    ctx.moveTo(12, y);
    ctx.lineTo(244, y);
    ctx.stroke();
  }
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, 224, 224);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  return tex;
}

export function UnitTour3D({ unit, compact = false }: UnitTour3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [activeRoom, setActiveRoom] = useState<CameraRoomId>('overview');
  const [finishPreset, setFinishPreset] = useState<FinishPreset>('turnkey');
  const [lightingMode, setLightingMode] = useState<LightingMode>('day');
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [hoveredZoneLabel, setHoveredZoneLabel] = useState<string | null>(null);
  const [contextLost, setContextLost] = useState(false);
  const [webglUnsupported, setWebglUnsupported] = useState(false);

  // Refs bridging React controls into stable WebGL engine
  const stateRef = useRef({
    activeRoom: 'overview' as CameraRoomId,
    finishPreset: 'turnkey' as FinishPreset,
    lightingMode: 'day' as LightingMode,
    transitionActive: false,
  });

  const engineCallbacksRef = useRef<{
    applyRoomCamera: (roomId: CameraRoomId) => void;
    applyFinish: (preset: FinishPreset) => void;
    applyLighting: (mode: LightingMode) => void;
    rebuildLayout: (u: Unit) => void;
  } | null>(null);

  // Sync unit changes without tearing down WebGL context
  useEffect(() => {
    engineCallbacksRef.current?.rebuildLayout(unit);
    setActiveRoom('overview');
    engineCallbacksRef.current?.applyRoomCamera('overview');
  }, [unit]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect WebGL2/WebGL support and software WebGL once
    const probeCanvas = document.createElement('canvas');
    const probeGl =
      probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!probeGl) {
      setWebglUnsupported(true);
      return;
    }

    const debugExt = probeGl.getExtension('WEBGL_debug_renderer_info');
    const rendererParam = debugExt
      ? debugExt.UNMASKED_RENDERER_WEBGL
      : probeGl.RENDERER;
    const gpuName = String(probeGl.getParameter(rendererParam));
    probeGl.getExtension('WEBGL_lose_context')?.loseContext();
    const isSoftwareGl =
      /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpuName);

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 360);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const dayBgColor = new THREE.Color('#EEF3F9');
    const nightBgColor = new THREE.Color('#131A26');
    scene.background = dayBgColor.clone();
    scene.fog = new THREE.Fog('#EEF3F9', 26, 58);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 120);
    camera.position.set(11.5, 11.2, 12.0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.minDistance = 2.8;
    controls.maxDistance = 24;
    controls.maxPolarAngle = Math.PI / 2 - 0.06;
    controls.minPolarAngle = 0.18;
    controls.target.set(0, 0.6, 0);

    // Three-point + Interior lighting rig (<= 3 shadow casters)
    const hemiLight = new THREE.HemisphereLight('#DCEBFF', '#94A3B8', 0.72);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight('#FFF5E4', 1.85);
    sunLight.position.set(10, 16, 11);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 2;
    sunLight.shadow.camera.far = 42;
    sunLight.shadow.camera.left = -10;
    sunLight.shadow.camera.right = 10;
    sunLight.shadow.camera.top = 10;
    sunLight.shadow.camera.bottom = -10;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight('#B7D4FF', 0.45);
    rimLight.position.set(-10, 8, -9);
    scene.add(rimLight);

    // Interior evening warm bulbs (toggled in evening mode)
    const interiorLights: THREE.PointLight[] = [];
    const livingBulb = new THREE.PointLight('#FFCF8B', 0, 9, 1.8);
    livingBulb.position.set(-2.3, 2.2, 2.1);
    scene.add(livingBulb);
    interiorLights.push(livingBulb);

    const kitchenBulb = new THREE.PointLight('#FFE2B8', 0, 8, 1.8);
    kitchenBulb.position.set(-0.7, 2.2, -1.6);
    scene.add(kitchenBulb);
    interiorLights.push(kitchenBulb);

    const bedroomBulb = new THREE.PointLight('#FFBE78', 0, 8, 1.8);
    bedroomBulb.position.set(2.9, 2.1, -0.8);
    scene.add(bedroomBulb);
    interiorLights.push(bedroomBulb);

    // Procedural Textures & Shared Material Palette
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const oakTex = createWoodPlankTexture('#C9A57B', '#9D7B54', maxAniso);
    const scandiOakTex = createWoodPlankTexture('#DFCDB4', '#BFB09A', maxAniso);
    const bathTileTex = createTileTexture('#DCE3EA', '#B4BFC9', maxAniso);
    const rugTex = createRugTexture(maxAniso);

    const disposables: {
      geometries: THREE.BufferGeometry[];
      materials: THREE.Material[];
      textures: THREE.Texture[];
    } = {
      geometries: [],
      materials: [],
      textures: [oakTex, scandiOakTex, bathTileTex, rugTex, envRT.texture],
    };

    const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      disposables.geometries.push(g);
      return g;
    };
    const trackMat = <T extends THREE.Material>(m: T): T => {
      disposables.materials.push(m);
      return m;
    };

    // Core Finish-Aware Materials
    const mainFloorMat = trackMat(
      new THREE.MeshStandardMaterial({
        map: oakTex,
        roughness: 0.55,
        metalness: 0.04,
      })
    );
    const wallMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#F4F5F7',
        roughness: 0.85,
        metalness: 0.02,
      })
    );
    const accentWallMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#DDE5EE',
        roughness: 0.82,
        metalness: 0.02,
      })
    );
    const bathFloorMat = trackMat(
      new THREE.MeshStandardMaterial({
        map: bathTileTex,
        roughness: 0.35,
        metalness: 0.06,
      })
    );
    const balconyFloorMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#9AA5B4',
        roughness: 0.78,
        metalness: 0.05,
      })
    );
    const slabMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#D5DCE4',
        roughness: 0.9,
        metalness: 0.05,
      })
    );
    const glassMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: '#CFE6FF',
        roughness: 0.08,
        metalness: 0.05,
        transmission: isSoftwareGl ? 0 : 0.72,
        transparent: true,
        opacity: isSoftwareGl ? 0.38 : 0.92,
        ior: 1.5,
        depthWrite: false,
      })
    );
    const mullionMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#1E293B',
        roughness: 0.32,
        metalness: 0.75,
      })
    );
    const brassMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#D4AF37',
        roughness: 0.25,
        metalness: 0.88,
      })
    );
    const chromeMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#E2E8F0',
        roughness: 0.16,
        metalness: 0.92,
      })
    );
    const sofaFabricMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#46586F',
        roughness: 0.88,
        metalness: 0.02,
      })
    );
    const cushionMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#E09F5A',
        roughness: 0.82,
        metalness: 0.02,
      })
    );
    const walnutWoodMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#7C5A3C',
        roughness: 0.52,
        metalness: 0.05,
      })
    );
    const whiteLacquerMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#FAFBFD',
        roughness: 0.32,
        metalness: 0.05,
      })
    );
    const stoneTopMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#ECEFF3',
        roughness: 0.22,
        metalness: 0.08,
      })
    );
    const bedLinenMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#F2F4F8',
        roughness: 0.9,
        metalness: 0.0,
      })
    );
    const duvetMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#6E88A6',
        roughness: 0.86,
        metalness: 0.02,
      })
    );
    const rugMat = trackMat(
      new THREE.MeshStandardMaterial({
        map: rugTex,
        roughness: 0.95,
        metalness: 0.0,
      })
    );
    const screenMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#111827',
        emissive: '#1D4ED8',
        emissiveIntensity: 0.25,
        roughness: 0.12,
        metalness: 0.6,
      })
    );
    const leafMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#4D7C5A',
        roughness: 0.72,
        metalness: 0.02,
      })
    );
    const lampShadeMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#FFF6E5',
        emissive: '#FFBE6B',
        emissiveIntensity: 0.08,
        roughness: 0.65,
      })
    );

    // Subtle grounding shadow plane under entire apartment platform
    const groundPlane = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(46, 46)),
      trackMat(
        new THREE.MeshStandardMaterial({
          color: '#E5ECF3',
          roughness: 0.95,
          metalness: 0.0,
        })
      )
    );
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = -0.32;
    groundPlane.receiveShadow = true;
    scene.add(groundPlane);

    const apartmentRoot = new THREE.Group();
    scene.add(apartmentRoot);

    const furnitureGroup = new THREE.Group();
    const decorGroup = new THREE.Group();
    const raycastZones: THREE.Mesh[] = [];

    function addBox(
      parent: THREE.Object3D,
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      mat: THREE.Material,
      cast = true,
      receive = true
    ) {
      const mesh = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(w, h, d)), mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = cast;
      mesh.receiveShadow = receive;
      parent.add(mesh);
      return mesh;
    }

    function addCyl(
      parent: THREE.Object3D,
      rt: number,
      rb: number,
      h: number,
      x: number,
      y: number,
      z: number,
      mat: THREE.Material,
      segs = 18
    ) {
      const mesh = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(rt, rb, h, segs)),
        mat
      );
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    }

    function buildApartmentGeometry(currentUnit: Unit) {
      // Clear dynamic children
      while (apartmentRoot.children.length > 0) {
        apartmentRoot.remove(apartmentRoot.children[0]);
      }
      while (furnitureGroup.children.length > 0) {
        furnitureGroup.remove(furnitureGroup.children[0]);
      }
      while (decorGroup.children.length > 0) {
        decorGroup.remove(decorGroup.children[0]);
      }
      raycastZones.length = 0;

      const isStudio = currentUnit.rooms === 'studio';
      const isLarge =
        currentUnit.rooms === '3' || currentUnit.layoutKey === '2br-86';
      const aptW = isStudio ? 8.2 : isLarge ? 12.0 : 10.4;
      const aptD = isLarge ? 8.2 : 7.4;
      const halfW = aptW / 2;
      const halfD = aptD / 2;
      const wallH = 2.55;
      const wallT = 0.16;

      // 1. Structural Slab & Main Floor
      addBox(apartmentRoot, aptW + 0.5, 0.28, aptD + 0.5, 0, -0.15, 0, slabMat, false, true);
      addBox(apartmentRoot, aptW, 0.04, aptD, 0, 0.01, 0, mainFloorMat, false, true);

      // Bathroom Tile Zone (Top-Left Corner)
      const bathW = 2.6;
      const bathD = 2.6;
      const bathX = -halfW + bathW / 2;
      const bathZ = -halfD + bathD / 2;
      const bathFloor = addBox(
        apartmentRoot,
        bathW - 0.1,
        0.045,
        bathD - 0.1,
        bathX,
        0.015,
        bathZ,
        bathFloorMat,
        false,
        true
      );
      bathFloor.material.polygonOffset = true;
      bathFloor.material.polygonOffsetFactor = -1;

      // Balcony Deck (Front-Left)
      const balW = 4.2;
      const balD = 1.6;
      const balX = -halfW + balW / 2 + 0.4;
      const balZ = halfD + balD / 2;
      addBox(apartmentRoot, balW, 0.24, balD, balX, -0.13, balZ, slabMat, false, true);
      addBox(apartmentRoot, balW - 0.1, 0.04, balD - 0.1, balX, 0.01, balZ, balconyFloorMat, false, true);

      // Balcony Glass Balustrade
      addBox(apartmentRoot, balW, 0.95, 0.04, balX, 0.48, balZ + balD / 2 - 0.05, glassMat, false, false);
      addBox(apartmentRoot, balW, 0.05, 0.07, balX, 0.97, balZ + balD / 2 - 0.05, mullionMat);
      addBox(apartmentRoot, 0.05, 0.95, balD, balX - balW / 2 + 0.03, 0.48, balZ, mullionMat);
      addBox(apartmentRoot, 0.05, 0.95, balD, balX + balW / 2 - 0.03, 0.48, balZ, mullionMat);

      // 2. Cutaway Exterior & Partition Walls
      // Back wall (North)
      addBox(apartmentRoot, aptW, wallH, wallT, 0, wallH / 2, -halfD, wallMat);
      // Left wall (West)
      addBox(apartmentRoot, wallT, wallH, aptD, -halfW, wallH / 2, 0, wallMat);
      // Right wall (East) with accent finish
      addBox(apartmentRoot, wallT, wallH, aptD, halfW, wallH / 2, 0, accentWallMat);

      // Front panoramic window wall (South) — lowered sill + mullions + glass
      addBox(apartmentRoot, aptW, 0.35, wallT, 0, 0.18, halfD, wallMat);
      // Window mullions across South facade
      for (let mx = -halfW + 0.4; mx <= halfW - 0.4; mx += 1.65) {
        addBox(apartmentRoot, 0.06, wallH - 0.35, 0.08, mx, 0.35 + (wallH - 0.35) / 2, halfD, mullionMat);
      }
      addBox(apartmentRoot, aptW - 0.3, wallH - 0.45, 0.03, 0, 0.35 + (wallH - 0.45) / 2, halfD, glassMat, false, false);
      addBox(apartmentRoot, aptW, 0.08, wallT, 0, wallH - 0.04, halfD, mullionMat);

      // Bathroom Partitions
      addBox(apartmentRoot, wallT, wallH, bathD, -halfW + bathW, wallH / 2, bathZ, wallMat);
      addBox(apartmentRoot, bathW - 0.85, wallH, wallT, -halfW + (bathW - 0.85) / 2, wallH / 2, -halfD + bathD, wallMat);

      // Bedroom Separation Wall (if not Studio)
      if (!isStudio) {
        const splitX = isLarge ? 1.2 : 0.9;
        addBox(apartmentRoot, wallT, wallH, aptD - 1.5, splitX, wallH / 2, -0.75, wallMat);
        if (isLarge) {
          // Second bedroom / study partition on right wing
          addBox(apartmentRoot, halfW - splitX, wallH, wallT, splitX + (halfW - splitX) / 2, wallH / 2, 0.6, wallMat);
        }
      }

      // 3. Multi-Part Furnished Assemblies
      apartmentRoot.add(furnitureGroup);
      apartmentRoot.add(decorGroup);

      // --- LIVING ROOM (Bottom-Left) ---
      const livingGroup = new THREE.Group();
      const lx = isStudio ? -1.4 : -2.2;
      const lz = 1.6;
      // Woven Area Rug
      addBox(decorGroup, 3.2, 0.025, 2.3, lx, 0.032, lz, rugMat, false, true);
      // Sectional Sofa (5-part composite)
      addBox(livingGroup, 2.4, 0.22, 0.92, lx, 0.14, lz - 0.5, sofaFabricMat); // base
      addBox(livingGroup, 0.95, 0.22, 1.65, lx - 0.72, 0.14, lz - 0.14, sofaFabricMat); // chaise
      addBox(livingGroup, 2.4, 0.36, 0.22, lx, 0.43, lz - 0.85, sofaFabricMat); // backrest
      addBox(livingGroup, 0.2, 0.32, 0.92, lx + 1.1, 0.38, lz - 0.5, sofaFabricMat); // right arm
      addBox(livingGroup, 0.2, 0.32, 1.65, lx - 1.1, 0.38, lz - 0.14, sofaFabricMat); // left arm
      // Accent Pillows
      addBox(decorGroup, 0.38, 0.3, 0.14, lx - 0.5, 0.42, lz - 0.68, cushionMat);
      addBox(decorGroup, 0.38, 0.3, 0.14, lx + 0.55, 0.42, lz - 0.68, cushionMat);
      // Coffee Table (Top + 4 legs)
      addBox(livingGroup, 1.15, 0.06, 0.65, lx + 0.15, 0.38, lz + 0.48, walnutWoodMat);
      addCyl(livingGroup, 0.025, 0.02, 0.35, lx - 0.32, 0.18, lz + 0.22, mullionMat);
      addCyl(livingGroup, 0.025, 0.02, 0.35, lx + 0.62, 0.18, lz + 0.22, mullionMat);
      addCyl(livingGroup, 0.025, 0.02, 0.35, lx - 0.32, 0.18, lz + 0.74, mullionMat);
      addCyl(livingGroup, 0.025, 0.02, 0.35, lx + 0.62, 0.18, lz + 0.74, mullionMat);
      // Media Console & TV
      addBox(livingGroup, 2.0, 0.42, 0.44, lx + 0.1, 0.23, halfD - 0.45, walnutWoodMat);
      addBox(livingGroup, 1.45, 0.82, 0.06, lx + 0.1, 1.05, halfD - 0.48, mullionMat);
      addBox(livingGroup, 1.38, 0.76, 0.07, lx + 0.1, 1.05, halfD - 0.47, screenMat);
      // Floor Lamp (Base + Stem + Shade)
      addCyl(decorGroup, 0.18, 0.2, 0.04, lx + 1.45, 0.04, lz - 0.75, brassMat);
      addCyl(decorGroup, 0.02, 0.02, 1.55, lx + 1.45, 0.82, lz - 0.75, brassMat);
      addCyl(decorGroup, 0.18, 0.26, 0.34, lx + 1.45, 1.65, lz - 0.75, lampShadeMat);
      furnitureGroup.add(livingGroup);

      // --- KITCHEN & DINING (Top-Center) ---
      const kitchenGroup = new THREE.Group();
      const kx = isStudio ? 0.5 : -0.8;
      const kz = -halfD + 0.55;
      // Lower Cabinetry + Countertop
      addBox(kitchenGroup, 2.9, 0.86, 0.65, kx, 0.45, kz, whiteLacquerMat);
      addBox(kitchenGroup, 2.94, 0.05, 0.68, kx, 0.9, kz, stoneTopMat);
      // Upper Wall Cabinets
      addBox(kitchenGroup, 2.2, 0.78, 0.38, kx - 0.32, 1.85, kz - 0.13, whiteLacquerMat);
      // Tall Fridge
      addBox(kitchenGroup, 0.72, 2.05, 0.68, kx + 1.85, 1.04, kz, chromeMat);
      // Sink & Chrome Faucet
      addBox(kitchenGroup, 0.55, 0.02, 0.42, kx - 0.7, 0.93, kz, chromeMat);
      addCyl(kitchenGroup, 0.02, 0.02, 0.24, kx - 0.7, 1.04, kz - 0.16, chromeMat);
      // Cooktop
      addBox(kitchenGroup, 0.62, 0.02, 0.48, kx + 0.35, 0.93, kz, mullionMat);
      // Dining Table + 4 Chairs
      const dx = kx + 0.2;
      const dz = kz + 1.75;
      addBox(kitchenGroup, 1.5, 0.05, 0.88, dx, 0.76, dz, walnutWoodMat);
      addBox(kitchenGroup, 0.07, 0.74, 0.07, dx - 0.62, 0.37, dz - 0.34, mullionMat);
      addBox(kitchenGroup, 0.07, 0.74, 0.07, dx + 0.62, 0.37, dz - 0.34, mullionMat);
      addBox(kitchenGroup, 0.07, 0.74, 0.07, dx - 0.62, 0.37, dz + 0.34, mullionMat);
      addBox(kitchenGroup, 0.07, 0.74, 0.07, dx + 0.62, 0.37, dz + 0.34, mullionMat);
      [-0.4, 0.4].forEach((offset) => {
        addBox(kitchenGroup, 0.42, 0.06, 0.42, dx + offset, 0.46, dz - 0.58, sofaFabricMat);
        addBox(kitchenGroup, 0.42, 0.38, 0.06, dx + offset, 0.66, dz - 0.76, sofaFabricMat);
        addBox(kitchenGroup, 0.42, 0.06, 0.42, dx + offset, 0.46, dz + 0.58, sofaFabricMat);
        addBox(kitchenGroup, 0.42, 0.38, 0.06, dx + offset, 0.66, dz + 0.76, sofaFabricMat);
      });
      furnitureGroup.add(kitchenGroup);

      // --- BATHROOM (Top-Left) ---
      const bathGroup = new THREE.Group();
      // Walk-in Glass Shower
      addBox(bathGroup, 1.1, 0.06, 1.0, -halfW + 0.62, 0.05, -halfD + 0.58, stoneTopMat);
      addBox(bathGroup, 0.03, 2.05, 1.0, -halfW + 1.18, 1.05, -halfD + 0.58, glassMat, false, false);
      addCyl(bathGroup, 0.02, 0.02, 1.85, -halfW + 0.25, 1.0, -halfD + 0.58, chromeMat);
      addCyl(bathGroup, 0.14, 0.14, 0.03, -halfW + 0.48, 1.92, -halfD + 0.58, chromeMat);
      // Floating Vanity + Mirror
      addBox(bathGroup, 0.95, 0.48, 0.48, -halfW + 1.85, 0.55, -halfD + 0.34, walnutWoodMat);
      addBox(bathGroup, 0.96, 0.04, 0.5, -halfW + 1.85, 0.81, -halfD + 0.34, stoneTopMat);
      addBox(bathGroup, 0.82, 0.72, 0.03, -halfW + 1.85, 1.45, -halfD + 0.12, chromeMat);
      // Ceramic Toilet
      addBox(bathGroup, 0.42, 0.42, 0.56, -halfW + 0.44, 0.23, -halfD + 1.75, whiteLacquerMat);
      addBox(bathGroup, 0.4, 0.38, 0.2, -halfW + 0.25, 0.6, -halfD + 1.75, whiteLacquerMat);
      furnitureGroup.add(bathGroup);

      // --- BEDROOM (Right Wing) ---
      const bedGroup = new THREE.Group();
      const bx = isStudio ? halfW - 1.55 : halfW - 2.0;
      const bz = isStudio ? 0.5 : -1.5;
      // Bed Frame, Headboard, Mattress, Duvet, Pillows
      addBox(bedGroup, 1.78, 0.26, 2.1, bx, 0.16, bz, sofaFabricMat);
      addBox(bedGroup, 1.84, 1.05, 0.14, bx, 0.56, bz - 1.02, sofaFabricMat);
      addBox(bedGroup, 1.66, 0.22, 1.96, bx, 0.38, bz + 0.02, bedLinenMat);
      addBox(bedGroup, 1.68, 0.14, 1.32, bx, 0.46, bz + 0.32, duvetMat);
      addBox(decorGroup, 0.64, 0.14, 0.42, bx - 0.42, 0.54, bz - 0.68, bedLinenMat);
      addBox(decorGroup, 0.64, 0.14, 0.42, bx + 0.42, 0.54, bz - 0.68, bedLinenMat);
      // Nightstands + Lamps
      addBox(bedGroup, 0.46, 0.45, 0.42, bx - 1.2, 0.24, bz - 0.85, walnutWoodMat);
      addBox(bedGroup, 0.46, 0.45, 0.42, bx + 1.2, 0.24, bz - 0.85, walnutWoodMat);
      addCyl(decorGroup, 0.11, 0.15, 0.24, bx - 1.2, 0.64, bz - 0.85, lampShadeMat);
      addCyl(decorGroup, 0.11, 0.15, 0.24, bx + 1.2, 0.64, bz - 0.85, lampShadeMat);
      // Full-height Wardrobe
      addBox(bedGroup, 0.62, 2.25, 2.1, halfW - 0.42, 1.14, bz + 0.2, whiteLacquerMat);
      addBox(bedGroup, 0.03, 1.1, 0.04, halfW - 0.74, 1.15, bz - 0.05, brassMat);
      addBox(bedGroup, 0.03, 1.1, 0.04, halfW - 0.74, 1.15, bz + 0.45, brassMat);
      furnitureGroup.add(bedGroup);

      // --- SECOND BEDROOM / STUDY (For 2BR-Euro & 3BR) ---
      if (isLarge) {
        const studyGroup = new THREE.Group();
        const sx = halfW - 2.1;
        const sz = 2.1;
        addBox(studyGroup, 1.5, 0.05, 0.72, sx, 0.75, sz + 1.1, walnutWoodMat);
        addBox(studyGroup, 0.06, 0.73, 0.68, sx - 0.68, 0.37, sz + 1.1, mullionMat);
        addBox(studyGroup, 0.06, 0.73, 0.68, sx + 0.68, 0.37, sz + 1.1, mullionMat);
        addBox(studyGroup, 1.05, 0.38, 1.85, sx + 0.9, 0.22, sz - 0.2, duvetMat);
        addBox(decorGroup, 0.55, 0.12, 0.36, sx + 0.9, 0.46, sz - 0.88, bedLinenMat);
        furnitureGroup.add(studyGroup);
      }

      // --- BALCONY LOUNGE & PLANTER ---
      addCyl(decorGroup, 0.22, 0.16, 0.36, balX - 1.35, 0.2, balZ, stoneTopMat);
      addCyl(decorGroup, 0.28, 0.12, 0.75, balX - 1.35, 0.7, balZ, leafMat, 10);
      addBox(decorGroup, 0.62, 0.36, 0.62, balX + 0.6, 0.2, balZ, walnutWoodMat);
      addCyl(decorGroup, 0.28, 0.28, 0.04, balX - 0.25, 0.44, balZ, stoneTopMat);
      addCyl(decorGroup, 0.03, 0.03, 0.42, balX - 0.25, 0.22, balZ, mullionMat);

      // Invisible Simplified Raycasting Floor Zones (Layer 1)
      const zoneConfigs: {
        name: string;
        area: number;
        roomId: CameraRoomId;
        x: number;
        z: number;
        w: number;
        d: number;
      }[] = [
        {
          name: 'Гостиная',
          area: currentUnit.livingAreaSqm,
          roomId: 'living',
          x: lx,
          z: lz,
          w: 3.8,
          d: 3.4,
        },
        {
          name: 'Кухня-столовая',
          area: currentUnit.kitchenAreaSqm,
          roomId: 'kitchen',
          x: kx + 0.3,
          z: kz + 1.2,
          w: 3.6,
          d: 3.0,
        },
        {
          name: 'Спальня',
          area:
            currentUnit.roomBreakdown.find((r) => r.zoneId === 'bedroom')?.area ??
            16.5,
          roomId: 'bedroom',
          x: bx,
          z: bz,
          w: 3.6,
          d: 3.6,
        },
        {
          name: 'Санузел',
          area:
            currentUnit.roomBreakdown.find((r) => r.zoneId === 'bath')?.area ??
            5.8,
          roomId: 'bath',
          x: bathX,
          z: bathZ,
          w: bathW,
          d: bathD,
        },
        {
          name: 'Балкон / Лоджия',
          area:
            currentUnit.roomBreakdown.find((r) => r.zoneId === 'balcony')?.area ??
            4.2,
          roomId: 'balcony',
          x: balX,
          z: balZ,
          w: balW,
          d: balD,
        },
      ];

      const proxyMat = trackMat(new THREE.MeshBasicMaterial({ visible: false }));
      zoneConfigs.forEach((zc) => {
        const zoneMesh = new THREE.Mesh(
          trackGeo(new THREE.PlaneGeometry(zc.w, zc.d)),
          proxyMat
        );
        zoneMesh.rotation.x = -Math.PI / 2;
        zoneMesh.position.set(zc.x, 0.05, zc.z);
        zoneMesh.layers.set(1);
        zoneMesh.userData = {
          roomId: zc.roomId,
          label: `${zc.name} · ${formatArea(zc.area)}`,
        };
        apartmentRoot.add(zoneMesh);
        raycastZones.push(zoneMesh);
      });
    }

    buildApartmentGeometry(unit);

    // On-Demand Render Loop & Exponential Damping
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let lastTime = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function requestRender() {
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        renderDirty = false;
        const now = performance.now();
        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        if (stateRef.current.transitionActive) {
          const preset =
            CAMERA_PRESETS.find((p) => p.id === stateRef.current.activeRoom) ??
            CAMERA_PRESETS[0];
          _targetPos.set(...preset.position);
          _targetLook.set(...preset.target);

          const lambda = isSoftwareGl ? 18 : 6.5;
          camera.position.x = THREE.MathUtils.damp(
            camera.position.x,
            _targetPos.x,
            lambda,
            dt
          );
          camera.position.y = THREE.MathUtils.damp(
            camera.position.y,
            _targetPos.y,
            lambda,
            dt
          );
          camera.position.z = THREE.MathUtils.damp(
            camera.position.z,
            _targetPos.z,
            lambda,
            dt
          );

          controls.target.x = THREE.MathUtils.damp(
            controls.target.x,
            _targetLook.x,
            lambda,
            dt
          );
          controls.target.y = THREE.MathUtils.damp(
            controls.target.y,
            _targetLook.y,
            lambda,
            dt
          );
          controls.target.z = THREE.MathUtils.damp(
            controls.target.z,
            _targetLook.z,
            lambda,
            dt
          );

          if (
            camera.position.distanceTo(_targetPos) < 0.04 &&
            controls.target.distanceTo(_targetLook) < 0.04
          ) {
            camera.position.copy(_targetPos);
            controls.target.copy(_targetLook);
            stateRef.current.transitionActive = false;
          } else {
            renderDirty = true;
          }
        }

        controls.update();
        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (renderDirty) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    // Cancel scripted camera fly-to when user grabs controls
    const handleControlsStart = () => {
      stateRef.current.transitionActive = false;
    };
    const handleControlsChange = () => {
      requestRender();
    };
    controls.addEventListener('start', handleControlsStart);
    controls.addEventListener('change', handleControlsChange);

    // Expose live control handlers to React
    engineCallbacksRef.current = {
      applyRoomCamera: (roomId: CameraRoomId) => {
        stateRef.current.activeRoom = roomId;
        stateRef.current.transitionActive = true;
        requestRender();
      },
      applyFinish: (preset: FinishPreset) => {
        stateRef.current.finishPreset = preset;
        if (preset === 'whitebox') {
          mainFloorMat.map = null;
          mainFloorMat.color.set('#CBD5E1');
          mainFloorMat.roughness = 0.92;
          mainFloorMat.needsUpdate = true;
          wallMat.color.set('#E5E7EB');
          accentWallMat.color.set('#E2E8F0');
          furnitureGroup.visible = false;
          decorGroup.visible = false;
        } else if (preset === 'scandi') {
          mainFloorMat.map = scandiOakTex;
          mainFloorMat.color.set('#FFFFFF');
          mainFloorMat.roughness = 0.58;
          mainFloorMat.needsUpdate = true;
          wallMat.color.set('#F8FAFC');
          accentWallMat.color.set('#E6EDF5');
          furnitureGroup.visible = true;
          decorGroup.visible = false;
        } else {
          mainFloorMat.map = oakTex;
          mainFloorMat.color.set('#FFFFFF');
          mainFloorMat.roughness = 0.5;
          mainFloorMat.needsUpdate = true;
          wallMat.color.set('#F4F5F7');
          accentWallMat.color.set('#D3DEE8');
          furnitureGroup.visible = true;
          decorGroup.visible = true;
        }
        requestRender();
      },
      applyLighting: (mode: LightingMode) => {
        stateRef.current.lightingMode = mode;
        if (mode === 'evening') {
          scene.background = nightBgColor.clone();
          scene.fog = new THREE.Fog('#131A26', 24, 54);
          sunLight.intensity = 0.35;
          sunLight.color.set('#8EB2E6');
          hemiLight.intensity = 0.25;
          interiorLights.forEach((l) => (l.intensity = 3.6));
          lampShadeMat.emissiveIntensity = 0.65;
          groundPlane.material.color.set('#1B2434');
        } else {
          scene.background = dayBgColor.clone();
          scene.fog = new THREE.Fog('#EEF3F9', 26, 58);
          sunLight.intensity = 1.85;
          sunLight.color.set('#FFF5E4');
          hemiLight.intensity = 0.72;
          interiorLights.forEach((l) => (l.intensity = 0));
          lampShadeMat.emissiveIntensity = 0.08;
          groundPlane.material.color.set('#E5ECF3');
        }
        requestRender();
      },
      rebuildLayout: (nextUnit: Unit) => {
        buildApartmentGeometry(nextUnit);
        requestRender();
      },
    };

    // Throttled Raycasting on Floor Zones (Layer 1)
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    let lastRaycastMs = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastRaycastMs < 55) return;
      lastRaycastMs = now;

      const rect = renderer.domElement.getBoundingClientRect();
      _mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(_mouseVec, camera);
      const hits = raycaster.intersectObjects(raycastZones, false);
      if (hits.length > 0) {
        const label = hits[0].object.userData.label as string;
        setHoveredZoneLabel(label);
        renderer.domElement.style.cursor = 'pointer';
      } else {
        setHoveredZoneLabel(null);
        renderer.domElement.style.cursor = 'grab';
      }
    };

    let pointerDownPos = { x: 0, y: 0 };
    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };
    const handlePointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(
        e.clientX - pointerDownPos.x,
        e.clientY - pointerDownPos.y
      );
      if (dist > 6) return; // Ignore orbit drags
      const rect = renderer.domElement.getBoundingClientRect();
      _mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(_mouseVec, camera);
      const hits = raycaster.intersectObjects(raycastZones, false);
      if (hits.length > 0) {
        const roomId = hits[0].object.userData.roomId as CameraRoomId;
        setActiveRoom(roomId);
        engineCallbacksRef.current?.applyRoomCamera(roomId);
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    // WebGL Context Loss Safety
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => {
      setContextLost(false);
      requestRender();
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener(
      'webglcontextrestored',
      handleContextRestored
    );

    // Responsive ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(entry.contentRect.width, 200);
      const h = Math.max(entry.contentRect.height, 200);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    });
    resizeObserver.observe(container);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    requestRender();

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', handleControlsStart);
      controls.removeEventListener('change', handleControlsChange);
      controls.dispose();
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener(
        'webglcontextlost',
        handleContextLost
      );
      renderer.domElement.removeEventListener(
        'webglcontextrestored',
        handleContextRestored
      );

      disposables.geometries.forEach((g) => g.dispose());
      disposables.materials.forEach((m) => m.dispose());
      disposables.textures.forEach((t) => t.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
    // Mount once; unit & UI updates flow via refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoomSelect = (roomId: CameraRoomId) => {
    setActiveRoom(roomId);
    engineCallbacksRef.current?.applyRoomCamera(roomId);
  };

  const handleFinishChange = (preset: FinishPreset) => {
    setFinishPreset(preset);
    engineCallbacksRef.current?.applyFinish(preset);
  };

  const handleLightingToggle = (mode: LightingMode) => {
    setLightingMode(mode);
    engineCallbacksRef.current?.applyLighting(mode);
  };

  if (webglUnsupported) {
    return (
      <div className="w-full h-full min-h-[380px] rounded-xl bg-[#F5F7FA] border border-[#E5EAF0] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-sm font-semibold text-[#14181F] mb-1">
          3D-тур недоступен в текущем браузере
        </p>
        <p className="text-xs text-[#5E6773]">
          Пожалуйста, переключитесь на вкладку «2D-планировка с размерами».
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-[#E5EAF0] bg-[#EEF3F9] select-none ${
        compact ? 'h-[420px] sm:h-[480px]' : 'h-[480px] sm:h-[560px]'
      }`}
    >
      {/* Dedicated Isolated WebGL Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Minimal Top-Left Readout Badge (No backdrop-blur over WebGL) */}
      <div className="pointer-events-none absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        <div className="bg-[#14181F]/85 text-white px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10">
          {unit.roomsLabel} · {formatArea(unit.areaSqm)} · Этаж {unit.floor}
        </div>
        {hoveredZoneLabel && (
          <div className="bg-[#007BFB] text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-sm">
            {hoveredZoneLabel} — нажмите для обзора
          </div>
        )}
      </div>

      {/* Top-Right Quick Reset View */}
      <div className="absolute top-3 right-3 z-10">
        <button
          type="button"
          onClick={() => handleRoomSelect('overview')}
          title="Сбросить ракурс"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14181F]/80 hover:bg-[#14181F] text-white text-xs font-medium border border-white/15 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Общий вид</span>
        </button>
      </div>

      {contextLost && (
        <div className="absolute inset-0 z-20 bg-[#14181F]/90 text-white flex items-center justify-center text-sm font-medium">
          Восстановление 3D-рендера...
        </div>
      )}

      {/* Collapsible Unified Bottom Control Dock */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-[min(94%,880px)] flex flex-col items-center">
        <button
          type="button"
          onClick={() => setDockCollapsed((v) => !v)}
          className="mb-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14181F]/85 hover:bg-[#14181F] text-white text-[11px] font-medium border border-white/15 transition-colors cursor-pointer"
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Показать панель 3D-тура</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Скрыть панель</span>
            </>
          )}
        </button>

        {!dockCollapsed && (
          <div className="w-full bg-[#14181F]/92 text-white rounded-xl p-2.5 sm:p-3 border border-white/15 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
            {/* Room Camera Presets */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
              {CAMERA_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleRoomSelect(preset.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    activeRoom === preset.id
                      ? 'bg-[#007BFB] text-white'
                      : 'text-white/75 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 lg:border-l border-white/15 lg:pl-3">
              {/* Finish Preset Selector */}
              <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-lg">
                {(
                  [
                    { id: 'whitebox', label: 'White Box' },
                    { id: 'scandi', label: 'Чистовая' },
                    { id: 'turnkey', label: 'С мебелью' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleFinishChange(f.id)}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      finishPreset === f.id
                        ? 'bg-white text-[#14181F]'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Day / Evening Light Switcher */}
              <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleLightingToggle('day')}
                  aria-label="Дневной свет"
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    lightingMode === 'day'
                      ? 'bg-[#007BFB] text-white'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>День</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLightingToggle('evening')}
                  aria-label="Вечерний свет"
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    lightingMode === 'evening'
                      ? 'bg-[#007BFB] text-white'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Вечер</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drag Hint on initial view */}
      {dockCollapsed && (
        <div className="pointer-events-none absolute bottom-3 right-3 z-10 bg-[#14181F]/75 text-white/90 px-2.5 py-1 rounded text-[11px] inline-flex items-center gap-1">
          <Eye className="w-3 h-3" />
          <span>Вращайте мышью</span>
        </div>
      )}
    </div>
  );
}
