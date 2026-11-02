import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';

export type GameMode = 'manual' | 'autopilot' | 'crashed' | 'paused' | 'ready';

export interface TrafficGameController {
  start(): void;
  pause(): void;
  restart(): void;
  setAutopilot(enabled?: boolean): void;
  destroy(): void;
}

export interface TrafficGameOptions {
  modelUrl?: string;
  initialTraffic?: number;
  maxTraffic?: number;
}

type TrafficVehicle = {
  root: THREE.Group;
  lane: number;
  speed: number;
  passed: boolean;
  box: THREE.Box3;
};

const LANES = [-3.1, 0, 3.1];
const ROAD_WIDTH = 11.2;
const ROAD_LENGTH = 230;

const getEl = <T extends HTMLElement>(root: HTMLElement, selector: string) => root.querySelector<T>(selector);

function setText(root: HTMLElement, selector: string, value: string) {
  const node = getEl<HTMLElement>(root, selector);
  if (node) node.textContent = value;
}

function setVisible(root: HTMLElement, selector: string, visible: boolean) {
  const node = getEl<HTMLElement>(root, selector);
  if (!node) return;
  node.classList.toggle('is-visible', visible);
  node.setAttribute('aria-hidden', String(!visible));
}

function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const wholeSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${wholeSeconds}`;
}

function makePbrMaterial(color: number, roughness = 0.5, metalness = 0.05) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function createProceduralCar(color = 0x667783, scale = 1): THREE.Group {
  const group = new THREE.Group();
  group.name = 'TrafficVehicle';
  group.scale.setScalar(scale);

  const body = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.54, 4.3), makePbrMaterial(color, 0.28, 0.25));
  body.position.y = 0.78;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.58, 2.05), makePbrMaterial(0x15252d, 0.16, 0.42));
  cabin.position.set(0, 1.25, -0.16);
  cabin.castShadow = true;
  group.add(cabin);

  const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.43, 0.33, 0.035), new THREE.MeshStandardMaterial({ color: 0x8fb2bf, transparent: true, opacity: 0.5, roughness: 0.08, metalness: 0.3 }));
  windshield.position.set(0, 1.31, -1.18);
  windshield.rotation.x = -0.14;
  group.add(windshield);

  const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.22, 0.2), makePbrMaterial(0x171b20, 0.7, 0.1));
  bumper.position.set(0, 0.58, -2.12);
  group.add(bumper);

  const headlampMaterial = new THREE.MeshStandardMaterial({ color: 0xe8f6ff, emissive: 0xa6d8ff, emissiveIntensity: 2.8, roughness: 0.2 });
  [-0.64, 0.64].forEach((x) => {
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.13, 0.08), headlampMaterial);
    lamp.position.set(x, 0.87, -2.16);
    group.add(lamp);
  });

  const wheelMaterial = makePbrMaterial(0x13171b, 0.82, 0.04);
  const wheelGeometry = new THREE.CylinderGeometry(0.43, 0.43, 0.23, 20);
  [-0.98, 0.98].forEach((x) => [-1.36, 1.36].forEach((z) => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.5, z);
    wheel.castShadow = true;
    group.add(wheel);
  }));

  return group;
}

function createRoad(scene: THREE.Scene) {
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(ROAD_WIDTH, ROAD_LENGTH),
    new THREE.MeshStandardMaterial({ color: 0x171d22, roughness: 0.92, metalness: 0.04 }),
  );
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0, -ROAD_LENGTH / 2 + 25);
  road.receiveShadow = true;
  scene.add(road);

  const shoulderMaterial = new THREE.MeshStandardMaterial({ color: 0x2b353a, roughness: 0.9 });
  [-1, 1].forEach((side) => {
    const shoulder = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, ROAD_LENGTH), shoulderMaterial);
    shoulder.position.set(side * (ROAD_WIDTH / 2 + 0.25), 0.025, road.position.z);
    shoulder.receiveShadow = true;
    scene.add(shoulder);
  });

  const laneMaterial = new THREE.MeshStandardMaterial({ color: 0xc6d5d5, roughness: 0.65, emissive: 0x283839, emissiveIntensity: 0.25 });
  const laneMarkers: THREE.Mesh[] = [];
  [-1.55, 1.55].forEach((x) => {
    for (let index = 0; index < 24; index += 1) {
      const marker = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.025, 3.6), laneMaterial);
      marker.position.set(x, 0.04, 18 - index * 9.6);
      marker.receiveShadow = true;
      scene.add(marker);
      laneMarkers.push(marker);
    }
  });

  const sideLightMaterial = new THREE.MeshStandardMaterial({ color: 0x85c9c6, emissive: 0x4db8b5, emissiveIntensity: 1.7 });
  const sideLights: THREE.Mesh[] = [];
  [-1, 1].forEach((side) => {
    for (let index = 0; index < 31; index += 1) {
      const light = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), sideLightMaterial);
      light.position.set(side * (ROAD_WIDTH / 2 + 0.45), 0.16, 22 - index * 7.4);
      scene.add(light);
      sideLights.push(light);
    }
  });

  const updateRoad = (delta: number, speed: number) => {
    const dz = speed * delta;
    laneMarkers.forEach((marker) => {
      marker.position.z += dz;
      if (marker.position.z > 25) marker.position.z -= 230;
    });
    sideLights.forEach((light) => {
      light.position.z += dz;
      if (light.position.z > 25) light.position.z -= 230;
    });
  };
  return { updateRoad };
}

function configureClone(root: THREE.Object3D, targetWidth = 2.15) {
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        if ('roughness' in material) material.roughness = Math.min(Number(material.roughness) || 0.5, 0.65);
      });
    }
  });
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const width = Math.max(size.x, size.z);
  if (width > 0) root.scale.multiplyScalar(targetWidth / width);
  root.position.sub(center.multiply(root.scale));
  root.position.y -= new THREE.Box3().setFromObject(root).min.y;
}

export function initTrafficGame(root: HTMLElement, options: TrafficGameOptions = {}): TrafficGameController {
  const canvas = getEl<HTMLCanvasElement>(root, '[data-game-canvas]') ?? root.querySelector('canvas');
  if (!canvas) throw new Error('Traffic game requires a canvas[data-game-canvas].');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111b1f);
  scene.fog = new THREE.Fog(0x111b1f, 45, 180);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 300);
  camera.position.set(0, 5.7, 9.7);
  camera.lookAt(0, 1, -24);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const hemi = new THREE.HemisphereLight(0xaad5d5, 0x172328, 1.6);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffe6cc, 2.8);
  key.position.set(-10, 18, 8);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -22;
  key.shadow.camera.right = 22;
  key.shadow.camera.top = 28;
  key.shadow.camera.bottom = -10;
  key.shadow.camera.far = 90;
  scene.add(key);
  const fill = new THREE.PointLight(0x72c7cc, 25, 26, 2);
  fill.position.set(0, 4.5, 2);
  scene.add(fill);

  const road = createRoad(scene);
  const player = new THREE.Group();
  player.name = 'PlayerVehicle';
  player.position.set(0, 0.05, 4.7);
  scene.add(player);
  const fallbackPlayer = createProceduralCar(0x080b0e, 1.02);
  player.add(fallbackPlayer);

  let modelLoaded = false;
  let disposed = false;
  const loader = new GLTFLoader();
  loader.load(options.modelUrl ?? '/assets/yaojing-s9.glb', (gltf) => {
    if (disposed) return;
    const model = cloneSkeleton(gltf.scene);
    configureClone(model, 2.35);
    player.remove(fallbackPlayer);
    player.add(model);
    modelLoaded = true;
    setText(root, '[data-game-status]', '曜境 S9 已接入 / READY');
  }, undefined, () => {
    setText(root, '[data-game-status]', '程序化车辆已就绪 / READY');
  });

  const traffic: TrafficVehicle[] = [];
  const palette = [0x4d5b68, 0x8b3438, 0x9d865b, 0x3e6b6c, 0x7c7c83, 0x253c54];
  const maxTraffic = options.maxTraffic ?? 11;
  const initialTraffic = options.initialTraffic ?? 5;
  const clock = new THREE.Clock();
  let animationFrame = 0;
  let running = false;
  let paused = false;
  let mode: GameMode = 'ready';
  let autopilot = false;
  let playerTargetX = 0;
  let playerX = 0;
  let gameTime = 0;
  let score = 0;
  let energy = 0;
  let dodged = 0;
  let spawnAccumulator = 0;
  let difficulty = 1;
  let invulnerable = 0;
  let lastTime = 0;

  const updateUi = () => {
    setText(root, '[data-game-score]', Math.floor(score).toLocaleString('en-US'));
    setText(root, '[data-game-time]', formatClock(gameTime));
    setText(root, '[data-game-energy]', `${Math.round(energy)}%`);
    const energyBar = getEl<HTMLElement>(root, '[data-game-energy-bar]');
    if (energyBar) {
      const energyPercent = Math.max(0, Math.min(100, energy));
      energyBar.style.setProperty('--energy', `${energyPercent}%`);
      energyBar.style.width = `${energyPercent}%`;
    }
    setText(root, '[data-game-mode]', autopilot ? '智驾模式 / AUTO' : mode === 'crashed' ? '碰撞 / RESET' : mode === 'paused' ? '暂停 / PAUSED' : '手动驾驶 / MANUAL');
    const status = getEl<HTMLElement>(root, '[data-game-status]');
    if (status && mode !== 'ready' && mode !== 'crashed') status.textContent = autopilot ? '智驾模式已接管方向' : paused ? '游戏已暂停' : '道路运行中 / 保持车道';
    const statusCopy = getEl<HTMLElement>(root, '[data-game-status-copy]');
    if (statusCopy && mode !== 'ready' && mode !== 'crashed') statusCopy.textContent = autopilot ? '系统正在寻找更安全的车道，能量会持续消耗。' : '躲避来车以获得分数与能量，撞击会中断本轮旅程。';
    setVisible(root, '[data-game-start-screen]', mode === 'ready' && !running);
    setVisible(root, '[data-game-over]', mode === 'crashed');
    const message = getEl<HTMLElement>(root, '[data-game-message]');
    if (message) {
      message.classList.toggle('is-visible', mode === 'crashed' || autopilot || energy >= 100);
      if (mode === 'crashed') message.textContent = '发生碰撞，重新开始以再次出发';
      else if (autopilot) message.textContent = '智驾模式已接管';
      else if (energy >= 100) message.textContent = '能量充满：智驾模式可用';
    }
    const autopilotButton = getEl<HTMLButtonElement>(root, '[data-game-autopilot]');
    if (autopilotButton) {
      autopilotButton.disabled = !autopilot && energy < 100;
      autopilotButton.classList.toggle('is-active', autopilot);
      autopilotButton.setAttribute('aria-pressed', String(autopilot));
    }
  };

  const makeTraffic = (lane: number, z: number) => {
    const isTruck = Math.random() > 0.77;
    const vehicle = createProceduralCar(palette[Math.floor(Math.random() * palette.length)], isTruck ? 1.15 : 0.9);
    vehicle.position.set(LANES[lane], 0, z);
    scene.add(vehicle);
    const entry: TrafficVehicle = { root: vehicle, lane, speed: 6 + Math.random() * 3.5, passed: false, box: new THREE.Box3() };
    traffic.push(entry);
    return entry;
  };

  const clearTraffic = () => {
    traffic.splice(0).forEach((item) => scene.remove(item.root));
  };

  const spawnTraffic = (count = 1) => {
    for (let index = 0; index < count; index += 1) {
      const lane = Math.floor(Math.random() * LANES.length);
      const z = -58 - Math.random() * 88 - index * 17;
      makeTraffic(lane, z);
    }
  };

  const setMode = (next: GameMode) => {
    mode = next;
    const startScreen = getEl<HTMLElement>(root, '[data-game-start-screen]');
    const overScreen = getEl<HTMLElement>(root, '[data-game-over]');
    const message = getEl<HTMLElement>(root, '[data-game-message]');
    const isReady = next === 'ready';
    const isCrashed = next === 'crashed';
    startScreen?.classList.toggle('is-visible', isReady);
    overScreen?.classList.toggle('is-visible', isCrashed);
    overScreen?.setAttribute('aria-hidden', String(!isCrashed));
    if (message) {
      message.textContent = isCrashed
        ? '车辆发生碰撞，重新规划路线'
        : next === 'paused'
          ? '游戏已暂停'
          : autopilot
            ? '智驾模式正在寻找安全车道'
            : isReady
              ? '准备进入道路'
              : '保持移动，避开来车';
      message.classList.toggle('is-visible', next !== 'manual' && next !== 'autopilot');
    }
    setText(root, '[data-game-result-time]', `${gameTime.toFixed(1)} s`);
    setText(root, '[data-game-result-score]', Math.floor(score).toLocaleString('en-US'));
    setText(root, '[data-game-result-dodged]', String(dodged).padStart(2, '0'));
    updateUi();
  };

  const restart = () => {
    clearTraffic();
    gameTime = 0;
    score = 0;
    energy = 0;
    dodged = 0;
    difficulty = 1;
    spawnAccumulator = 0;
    invulnerable = 0;
    playerTargetX = 0;
    playerX = 0;
    player.position.x = 0;
    autopilot = false;
    paused = false;
    spawnTraffic(initialTraffic);
    setMode('ready');
    setText(root, '[data-game-result-time]', formatClock(gameTime));
    setText(root, '[data-game-result-score]', '0000');
    setText(root, '[data-game-result-dodged]', '00');
    updateUi();
  };

  const start = () => {
    if (mode === 'crashed') restart();
    running = true;
    paused = false;
    setMode('manual');
    clock.start();
    lastTime = performance.now();
  };

  const pause = () => {
    if (!running || mode === 'crashed') return;
    paused = !paused;
    setMode(paused ? 'paused' : autopilot ? 'autopilot' : 'manual');
    if (!paused) clock.start();
  };

  const setAutopilot = (enabled = !autopilot) => {
    if (enabled && energy < 100) {
      setText(root, '[data-game-status]', '能量不足：继续躲避车辆以充能');
      return;
    }
    autopilot = enabled;
    if (autopilot) energy = Math.max(0, energy - 100);
    if (mode !== 'crashed' && !paused) setMode(autopilot ? 'autopilot' : 'manual');
    updateUi();
  };

  const chooseAutopilotLane = () => {
    const scoreByLane = LANES.map((_, lane) => {
      const danger = traffic.reduce((total, item) => {
        const dz = item.root.position.z - player.position.z;
        if (dz > 16 || dz < -44 || item.lane !== lane) return total;
        return total + Math.max(0, 44 - Math.abs(dz));
      }, 0);
      return danger;
    });
    let bestLane = 0;
    scoreByLane.forEach((value, index) => {
      if (value < scoreByLane[bestLane]) bestLane = index;
    });
    return LANES[bestLane];
  };

  const crash = () => {
    if (invulnerable > 0 || mode === 'crashed') return;
    invulnerable = 1.4;
    energy = Math.max(0, energy - 28);
    score = Math.max(0, score - 180);
    setText(root, '[data-game-status]', '发生碰撞，按重新开始继续');
    setText(root, '[data-game-status-copy]', '车辆与来车发生碰撞，本轮得分已锁定。');
    setText(root, '[data-game-result-time]', formatClock(gameTime));
    setText(root, '[data-game-result-score]', Math.floor(score).toLocaleString('en-US'));
    setText(root, '[data-game-result-dodged]', dodged.toString().padStart(2, '0'));
    setMode('crashed');
    running = false;
  };

  const update = (delta: number) => {
    if (!running || paused || mode === 'crashed') return;
    const dt = Math.min(0.045, delta);
    gameTime += dt;
    difficulty = 1 + Math.min(1.4, gameTime / 95);
    score += dt * (autopilot ? 14 : 10);
    invulnerable = Math.max(0, invulnerable - dt);

    const desiredX = autopilot ? chooseAutopilotLane() : playerTargetX;
    playerX = THREE.MathUtils.damp(playerX, desiredX, autopilot ? 4.6 : 8.5, dt);
    player.position.x = playerX;
    player.rotation.z = THREE.MathUtils.damp(player.rotation.z, (desiredX - playerX) * -0.055, 7, dt);

    const worldSpeed = 12.5 * difficulty;
    road.updateRoad(dt, worldSpeed);
    spawnAccumulator += dt;
    const spawnEvery = Math.max(0.72, 1.55 - gameTime / 160);
    if (spawnAccumulator > spawnEvery && traffic.length < maxTraffic) {
      spawnAccumulator = 0;
      spawnTraffic(1);
    }

    const playerBox = new THREE.Box3(
      new THREE.Vector3(player.position.x - 0.92, 0.15, player.position.z - 1.75),
      new THREE.Vector3(player.position.x + 0.92, 1.75, player.position.z + 1.75),
    );
    traffic.slice().forEach((item) => {
      item.root.position.z += (worldSpeed - item.speed) * dt;
      item.root.rotation.y = Math.sin(gameTime * 0.6 + item.lane) * 0.006;
      item.box.setFromObject(item.root);
      if (!item.passed && item.root.position.z > player.position.z + 2.8) {
        item.passed = true;
        dodged += 1;
        energy = autopilot ? energy : Math.min(100, energy + 9);
        score += autopilot ? 105 : 120;
        if (!autopilot && energy >= 100) setText(root, '[data-game-status]', '智驾能量已充满，点击“智驾模式”');
      }
      if (playerBox.intersectsBox(item.box)) crash();
      if (item.root.position.z > 26) {
        scene.remove(item.root);
        const index = traffic.indexOf(item);
        if (index >= 0) traffic.splice(index, 1);
      }
    });
    if (autopilot) {
      energy = Math.max(0, energy - dt * 4.5);
      if (energy <= 0) {
        autopilot = false;
        setMode('manual');
        setText(root, '[data-game-status]', '智驾能量耗尽，回到手动驾驶');
      }
    }
    updateUi();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') playerTargetX = Math.max(-3.1, playerTargetX - 3.1);
    if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') playerTargetX = Math.min(3.1, playerTargetX + 3.1);
    if (event.code === 'Space') setAutopilot();
    if (event.key.toLowerCase() === 'p') pause();
  };
  const moveLeft = () => { playerTargetX = Math.max(-3.1, playerTargetX - 3.1); };
  const moveRight = () => { playerTargetX = Math.min(3.1, playerTargetX + 3.1); };
  const movePointer = (event: PointerEvent) => {
    if (event.pointerType === 'mouse' && event.buttons === 0) return;
    const rect = canvas.getBoundingClientRect();
    const normalized = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    playerTargetX = THREE.MathUtils.clamp(normalized * 4.2, -3.1, 3.1);
  };

  window.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('pointermove', movePointer);
  getEl<HTMLButtonElement>(root, '[data-game-left]')?.addEventListener('pointerdown', moveLeft);
  getEl<HTMLButtonElement>(root, '[data-game-right]')?.addEventListener('pointerdown', moveRight);
  getEl<HTMLButtonElement>(root, '[data-game-start]')?.addEventListener('click', start);
  getEl<HTMLButtonElement>(root, '[data-game-pause]')?.addEventListener('click', pause);
  getEl<HTMLButtonElement>(root, '[data-game-restart]')?.addEventListener('click', () => {
    restart();
    start();
  });
  getEl<HTMLButtonElement>(root, '[data-game-autopilot]')?.addEventListener('click', () => setAutopilot());

  const resize = () => {
    const width = root.clientWidth || canvas.clientWidth || window.innerWidth;
    const height = root.clientHeight || canvas.clientHeight || window.innerHeight;
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(root);
  resize();

  const animate = (time: number) => {
    if (disposed) return;
    animationFrame = requestAnimationFrame(animate);
    const dt = Math.max(0, Math.min(0.05, (time - lastTime) / 1000 || 0));
    lastTime = time;
    update(dt);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, player.position.x * 0.24, 4.2, dt);
    camera.lookAt(player.position.x * 0.18, 0.9, -23);
    renderer.render(scene, camera);
  };

  restart();
  animationFrame = requestAnimationFrame(animate);

  return {
    start,
    pause,
    restart,
    setAutopilot,
    destroy: () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('pointermove', movePointer);
      renderer.dispose();
      traffic.splice(0).forEach((item) => scene.remove(item.root));
    },
  };
}

export default initTrafficGame;
