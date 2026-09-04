const $ = (selector) => document.querySelector(selector);

const STORAGE_KEY = "cnu-biozombie-chapter-01";
const LIMIT_SECONDS = 60 * 60;
const MICROSCOPE_COARSE_TARGET = 5;
const MICROSCOPE_FINE_TARGET = 2;

const initialState = {
  started: false,
  paused: false,
  failed: false,
  audioEnabled: true,
  elapsed: 0,
  scene: "lobby",
  letterRead: false,
  inventory: ["campus-map"],
  selectedItem: null,
  zombieDistance: 120,
  bites: 0,
  wrongDoorCount: 0,
  letterHints: 0,
  terminalCwd: "/home/pc",
  terminalSolved: false,
  b17Inspected: false,
  fluorescentOn: false,
  shelfIlluminated: false,
  shelfNoteFound: false,
  shelfPuzzleSolved: false,
  animalCenterStoryShown: false,
  infectedRatsInspected: false,
  microscopeInspected: false,
  microscopeObjective: 4,
  microscopeCoarseFocus: 2,
  microscopeFineFocus: 0,
  microscopeSolved: false,
  drawerPuzzleSolved: false,
  zombieSurgeActive: false,
  barricadeInstalled: false,
  barricadeDeadline: null,
  barricadeTimeoutBiteTriggered: false,
  researchFragmentFound: false,
  journalUvRevealed: false,
  journalPuzzleSolved: false,
  securityRoomUnlocked: false,
  securityDoorFailures: 0,
  securityDoorBiteTriggered: false,
  securityGuardResolved: false,
  securityConsoleInspected: false,
  culpritIdentified: false,
  cctvArchiveSolved: false,
  activity: "버스에서 가져온 캠퍼스 안내도가 있다.",
};

const itemData = {
  "campus-map": {
    name: "미니맵",
    icon: "⌖",
    description: "좀비 위치 확인",
  },
  "fluorescent-lamp": {
    name: "형광등",
    icon: "▰",
    description: "어두운 곳을 밝힌다",
  },
  "graduate-letter": {
    name: "구겨진 편지",
    icon: "✉",
    description: "다시 읽기",
  },
  "terminal-note": {
    name: "위치 단서",
    icon: "⌘",
    description: "2층 독서실",
  },
  barricade: {
    name: "바리케이드",
    icon: "▥",
    description: "좀비 이동 차단",
  },
  "research-fragment": {
    name: "손상된 연구일지",
    icon: "≣",
    description: "사고 전 마지막 기록",
  },
};

const scenes = {
  lobby: {
    image: "assets/images/cnu-lobby-outbreak.jpg",
    alt: "어둡고 버려진 생명시스템과학대학 로비",
    number: "01",
    name: "생명시스템과학대학 로비",
    hud: "1F · 로비",
  },
  hallway: {
    image: "assets/images/cnu-hallway-101-105.jpg",
    alt: "101호와 105호가 마주 보는 어두운 생명시스템과학대학 복도",
    number: "02",
    name: "생명시스템과학대학 1층 복도",
    hud: "1F · 101—105",
  },
  computerLab: {
    image: "assets/images/cnu-computer-lab.jpg",
    alt: "여러 대의 컴퓨터 중 한 대만 켜진 어두운 101호 컴퓨터실",
    number: "03",
    name: "101호 컴퓨터실",
    hud: "1F · 101호",
  },
  readingRoomEntrance: {
    image: "assets/images/cnu-reading-room-entrance.jpg",
    alt: "비상등이 켜진 생명시스템과학대학 2층 자료열람실 앞",
    number: "04",
    name: "2층 자료열람실 앞",
    hud: "2F · 212호 앞",
  },
  readingRoom: {
    image: "assets/images/cnu-reading-room-interior.jpg",
    alt: "책상과 책장이 늘어선 어두운 2층 자료열람실 내부",
    number: "05",
    name: "2층 자료열람실",
    hud: "2F · 자료열람실",
  },
  animalResearchCenter: {
    image: "assets/images/cnu-animal-research-center.jpg",
    alt: "손상된 케이지 주변을 바이러스에 감염된 실험쥐들이 돌아다니는 어두운 동물실험 연구센터",
    number: "06",
    name: "동물실험 연구센터",
    hud: "2F · 동물실험 연구센터",
  },
  securityRoom: {
    image: "assets/images/cnu-department-office.jpg",
    alt: "사무용 책상과 여러 CCTV 화면이 켜진 어두운 생정융 과사무실",
    number: "07",
    name: "생정융 과사무실",
    hud: "1F · 과사무실",
  },
};

const virtualFileSystem = {
  "/home/pc": {
    directories: ["Desktop", "Documents", "Downloads"],
    files: {},
  },
  "/home/pc/Desktop": {
    directories: [],
    files: { "schedule.txt": "기업 탐방 일정표뿐이다. 단서는 이곳에 없다." },
  },
  "/home/pc/Documents": {
    directories: ["assignments", "research"],
    files: {},
  },
  "/home/pc/Documents/assignments": {
    directories: [],
    files: { "biology_101.txt": "제출이 끝난 생명과학개론 과제다." },
  },
  "/home/pc/Documents/research": {
    directories: ["2024", "2025", "2026"],
    files: {},
  },
  "/home/pc/Documents/research/2024": {
    directories: [],
    files: { "closed.txt": "폐기된 연구 기록이다." },
  },
  "/home/pc/Documents/research/2025": {
    directories: [],
    files: { "closed.txt": "백신 연구 이전의 자료다." },
  },
  "/home/pc/Documents/research/2026": {
    directories: ["samples"],
    files: {
      "README.txt": "중요 기록은 숨김 파일로 전환했다. 숨김 항목까지 확인하려면 ls -a 를 입력하라.",
      ".next_location": "NEXT_LOCATION = 2층 독서실\nSHELF = B-17\nAUTHOR_AFFILIATION = 동물실험 연구센터\nSYSTEM_ALERT = 사고 발생 3분 후 연구 기록 대량 삭제",
    },
  },
  "/home/pc/Documents/research/2026/samples": {
    directories: [],
    files: { "sample_00.dat": "손상된 검체 데이터다. 읽을 수 없다." },
  },
  "/home/pc/Downloads": {
    directories: [],
    files: { "installer.tmp": "불완전한 설치 파일이다." },
  },
};

let state = freshState();
let failureShown = false;
let audioContext = null;
let bgmNodes = [];
const mobileLayout = window.matchMedia("(max-width: 560px)");
let inventoryExpanded = !mobileLayout.matches;

function freshState() {
  return {
    ...initialState,
    inventory: [...initialState.inventory],
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    state = {
      ...freshState(),
      ...parsed,
      paused: false,
      inventory: Array.isArray(parsed.inventory) ? parsed.inventory : ["campus-map"],
    };
    if (state.letterRead) {
      addItem("graduate-letter");
      addItem("fluorescent-lamp");
    }
    if (state.scene === "chapterEnd" && !state.terminalSolved) {
      state.scene = "computerLab";
    }
    if (!virtualFileSystem[state.terminalCwd]) state.terminalCwd = "/home/pc";
    if (!scenes[state.scene]) state.scene = state.terminalSolved ? "computerLab" : "lobby";
    if (state.terminalSolved) {
      addItem("terminal-note");
    }
    if (state.shelfPuzzleSolved && !state.barricadeInstalled) {
      addItem("barricade");
    } else if (state.barricadeInstalled) {
      state.inventory = state.inventory.filter((item) => item !== "barricade");
      state.researchFragmentFound = true;
    }
    if (state.zombieSurgeActive && !state.barricadeInstalled && state.barricadeDeadline == null) {
      state.barricadeDeadline = state.elapsed + 15;
      state.barricadeTimeoutBiteTriggered = false;
    }
    if (state.barricadeInstalled) state.barricadeDeadline = null;
    if (state.researchFragmentFound) addItem("research-fragment");
    if (state.securityConsoleInspected) state.culpritIdentified = true;
    delete state.chapterComplete;
    delete state.readingRoomReached;
    delete state.microscopeFocus;
    $("#continue-button").hidden = !state.started || state.failed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function formatTime(elapsed) {
  const remaining = Math.max(0, LIMIT_SECONDS - elapsed);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function barricadeSecondsRemaining() {
  if (!state.zombieSurgeActive || state.barricadeInstalled || state.barricadeDeadline == null) return 0;
  return Math.max(0, Number(state.barricadeDeadline) - state.elapsed);
}

function formatBarricadeCountdown() {
  if (state.barricadeTimeoutBiteTriggered) return "시간 초과";
  return `00:${String(barricadeSecondsRemaining()).padStart(2, "0")}`;
}

function updateBarricadeCountdownDisplays() {
  document.querySelectorAll("[data-barricade-countdown]").forEach((element) => {
    element.textContent = formatBarricadeCountdown();
  });
}

function updateSoundButton() {
  const button = $("#sound-button");
  if (!button) return;
  const label = state.audioEnabled ? "배경음악 끄기" : "배경음악 켜기";
  button.classList.toggle("active", state.audioEnabled);
  button.setAttribute("aria-pressed", String(state.audioEnabled));
  button.setAttribute("aria-label", label);
  button.title = label;
}

function createNoiseBuffer(context, seconds = 5) {
  const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
  const samples = buffer.getChannelData(0);
  let previous = 0;
  for (let index = 0; index < samples.length; index += 1) {
    const random = Math.random() * 2 - 1;
    previous = (previous + random * 0.035) / 1.018;
    samples[index] = previous;
  }
  return buffer;
}

function startBgm() {
  if (!state.audioEnabled || state.paused) return;

  if (audioContext) {
    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }
    return;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const context = new AudioContextClass();
    const master = context.createGain();
    const lowpass = context.createBiquadFilter();
    const droneGain = context.createGain();
    const subGain = context.createGain();
    const noiseGain = context.createGain();
    const noiseFilter = context.createBiquadFilter();
    const pulseGain = context.createGain();
    const pulseLfoGain = context.createGain();
    const drone = context.createOscillator();
    const subDrone = context.createOscillator();
    const pulse = context.createOscillator();
    const pulseLfo = context.createOscillator();
    const noise = context.createBufferSource();

    master.gain.setValueAtTime(0.045, context.currentTime);
    master.connect(context.destination);

    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(420, context.currentTime);
    lowpass.Q.setValueAtTime(0.8, context.currentTime);
    lowpass.connect(master);

    drone.type = "sawtooth";
    drone.frequency.setValueAtTime(43.65, context.currentTime);
    drone.detune.setValueAtTime(-8, context.currentTime);
    droneGain.gain.setValueAtTime(0.17, context.currentTime);
    drone.connect(droneGain);
    droneGain.connect(lowpass);

    subDrone.type = "triangle";
    subDrone.frequency.setValueAtTime(65.41, context.currentTime);
    subDrone.detune.setValueAtTime(6, context.currentTime);
    subGain.gain.setValueAtTime(0.09, context.currentTime);
    subDrone.connect(subGain);
    subGain.connect(lowpass);

    pulse.type = "sine";
    pulse.frequency.setValueAtTime(32.7, context.currentTime);
    pulseGain.gain.setValueAtTime(0.025, context.currentTime);
    pulse.connect(pulseGain);
    pulseGain.connect(master);

    pulseLfo.type = "sine";
    pulseLfo.frequency.setValueAtTime(0.42, context.currentTime);
    pulseLfoGain.gain.setValueAtTime(0.022, context.currentTime);
    pulseLfo.connect(pulseLfoGain);
    pulseLfoGain.connect(pulseGain.gain);

    noise.buffer = createNoiseBuffer(context);
    noise.loop = true;
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(260, context.currentTime);
    noiseGain.gain.setValueAtTime(0.025, context.currentTime);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);

    [drone, subDrone, pulse, pulseLfo, noise].forEach((source) => source.start());
    audioContext = context;
    bgmNodes = [drone, subDrone, pulse, pulseLfo, noise, droneGain, subGain, pulseGain, pulseLfoGain, noiseFilter, noiseGain, lowpass, master];
  } catch {
    audioContext = null;
    bgmNodes = [];
  }
}

function suspendBgm() {
  if (audioContext?.state === "running") {
    audioContext.suspend().catch(() => {});
  }
}

function stopBgm() {
  bgmNodes.forEach((node) => {
    try {
      if (typeof node.stop === "function") node.stop();
      node.disconnect();
    } catch {
      // 이미 정지된 오디오 노드는 건너뛴다.
    }
  });
  bgmNodes = [];
  if (audioContext) audioContext.close().catch(() => {});
  audioContext = null;
}

function toggleBgm() {
  state.audioEnabled = !state.audioEnabled;
  if (state.audioEnabled) startBgm();
  else stopBgm();
  updateSoundButton();
  saveState();
}

function startGame(reset = false) {
  if (reset) {
    const audioEnabled = state.audioEnabled;
    state = freshState();
    state.audioEnabled = audioEnabled;
    failureShown = false;
  }
  state.started = true;
  state.paused = false;
  document.body.classList.add("game-active");
  $("#title-screen").hidden = true;
  $("#game").hidden = false;
  $("#pause-overlay").hidden = true;
  saveState();
  render();
  startBgm();
}

function setActivity(message) {
  state.activity = message;
  $("#activity").textContent = message;
}

function addItem(id) {
  if (!state.inventory.includes(id)) state.inventory.push(id);
}

function renderInventory() {
  const container = $("#inventory-items");
  $("#item-count").textContent = `${state.inventory.length} / 6`;
  const cards = state.inventory.map((id) => {
    const item = itemData[id];
    const description = id === "research-fragment"
      ? state.cctvArchiveSolved
        ? "다음 단서: C-07"
        : state.culpritIdentified
        ? "반입자: 학생회장"
        : state.journalPuzzleSolved
        ? "과사무실 코드 확보"
        : state.journalUvRevealed
          ? "UV 염기 퍼즐"
          : "형광 반응 흔적"
      : item.description;
    return `
      <button class="item${state.selectedItem === id ? " selected" : ""}" type="button" data-item="${id}">
        <span class="item-icon" aria-hidden="true">${item.icon}</span>
        <strong>${item.name}</strong>
        <small>${description}</small>
      </button>`;
  });
  const emptySlots = Math.max(0, 4 - cards.length);
  container.innerHTML = cards.join("") + Array.from({ length: emptySlots }, () => `<div class="item empty" aria-hidden="true"><span class="item-icon">·</span></div>`).join("");

  container.querySelectorAll("[data-item]").forEach((button) => {
    button.addEventListener("click", () => inspectItem(button.dataset.item));
  });
}

function updateInventoryPanel() {
  const panel = $(".inventory-bar");
  const toggle = $("#inventory-toggle");
  const collapsed = mobileLayout.matches && !inventoryExpanded;
  panel.classList.toggle("collapsed", collapsed);
  toggle.setAttribute("aria-expanded", String(!collapsed));
  toggle.setAttribute("aria-label", collapsed ? "인벤토리 펼치기" : "인벤토리 접기");
}

function toggleInventoryPanel() {
  if (!mobileLayout.matches) return;
  inventoryExpanded = !inventoryExpanded;
  updateInventoryPanel();
}

function handleLayoutChange(event) {
  inventoryExpanded = !event.matches;
  updateInventoryPanel();
}

function renderHotspots() {
  const container = $("#hotspots");
  if (state.scene === "lobby") {
    container.innerHTML = `
      ${!state.letterRead ? `
        <button class="hotspot paper-hotspot" data-action="inspect-letter" type="button">
          <span class="pulse" aria-hidden="true"></span>
          <span class="hotspot-label">떨어진 편지</span>
        </button>` : ""}
      ${state.letterRead && !(state.zombieSurgeActive && !state.barricadeInstalled) ? `
        <button class="hotspot hallway-hotspot room-hotspot" data-action="go-hallway" type="button">
          <span class="pulse" aria-hidden="true"></span>
          <span class="hotspot-label">1층 복도</span>
        </button>` : ""}
      ${state.terminalSolved && !(state.zombieSurgeActive && !state.barricadeInstalled) ? `
        <button class="hotspot room-hotspot second-floor-hotspot" data-action="go-reading-room-entrance" type="button">
          <span class="pulse" aria-hidden="true"></span>
          <span class="hotspot-label">2층 자료열람실</span>
        </button>` : ""}
      ${state.journalPuzzleSolved && !(state.zombieSurgeActive && !state.barricadeInstalled) ? `
        <button class="hotspot room-hotspot security-room-hotspot" data-action="enter-security-room" type="button">
          <span class="pulse" aria-hidden="true"></span>
          <span class="hotspot-label">생정융 과사무실</span>
        </button>` : ""}
      ${state.zombieSurgeActive && !state.barricadeInstalled ? `
        <div class="surge-scene-alert" role="status"><span>●</span> 바리케이드 설치 <strong data-barricade-countdown>${formatBarricadeCountdown()}</strong></div>
        <button class="hotspot barricade-install-hotspot" data-action="install-barricade" type="button">
          <span class="pulse" aria-hidden="true"></span>
          <span class="hotspot-label">바리케이드 설치</span>
        </button>` : ""}`;
  } else if (state.scene === "hallway") {
    container.innerHTML = `
      <button class="hotspot room-hotspot door-101" data-action="choose-101" type="button">
        <span class="pulse" aria-hidden="true"></span><span class="hotspot-label">101</span>
      </button>
      <button class="hotspot room-hotspot door-105" data-action="choose-105" type="button">
        <span class="pulse" aria-hidden="true"></span><span class="hotspot-label">105</span>
      </button>
      <button class="scene-back" data-action="go-lobby" type="button">← 로비</button>`;
  } else if (state.scene === "computerLab") {
    container.innerHTML = `
      <button class="hotspot computer-hotspot" data-action="use-computer" type="button">
        <span class="pulse" aria-hidden="true"></span>
        <span class="hotspot-label">${state.terminalSolved ? "단서 확인" : "켜진 컴퓨터"}</span>
      </button>
      <button class="scene-back lab-back" data-action="go-hallway" type="button">← 복도</button>`;
  } else if (state.scene === "readingRoomEntrance") {
    container.innerHTML = `
      ${!state.zombieSurgeActive ? `
        <button class="hotspot reading-room-door-hotspot" data-action="enter-reading-room" type="button">
          <span class="pulse" aria-hidden="true"></span>
          <span class="hotspot-label">자료열람실 문</span>
        </button>` : `
        <div class="surge-scene-alert" role="status"><span>●</span> 1층 로비로 즉시 이동</div>`}
      ${state.shelfPuzzleSolved && !state.zombieSurgeActive ? `
        <button class="hotspot lab-entrance-hotspot" data-action="inspect-lab-entrance" type="button">
          <span class="lab-glimmer" aria-hidden="true"></span>
          <span class="pulse" aria-hidden="true"></span>
          <span class="hotspot-label">동물실험 연구센터</span>
        </button>` : ""}
      <button class="scene-back${state.zombieSurgeActive ? " emergency-back" : ""}" data-action="go-lobby" type="button">${state.zombieSurgeActive ? "← 1층 로비" : "← 로비"}</button>`;
  } else if (state.scene === "readingRoom") {
    container.innerHTML = `
      <button class="hotspot shelf-hotspot" data-action="inspect-b17" type="button">
        <span class="pulse" aria-hidden="true"></span>
        <span class="hotspot-label">${state.shelfPuzzleSolved ? "B-17 확보 완료" : state.fluorescentOn ? "B-17 다시 보기" : "B-17 책장"}</span>
      </button>
      <button class="scene-back" data-action="go-reading-room-entrance" type="button">← 출입문</button>`;
  } else if (state.scene === "animalResearchCenter") {
    container.innerHTML = `
      <button class="hotspot microscope-hotspot${state.microscopeSolved ? " solved" : ""}" data-action="inspect-microscope" type="button">
        <span class="pulse" aria-hidden="true"></span>
        <span class="hotspot-label">${state.microscopeSolved ? "열린 현미경 서랍" : "현미경"}</span>
      </button>
      <button class="hotspot infected-rats-hotspot" data-action="inspect-infected-rats" type="button">
        <span class="pulse" aria-hidden="true"></span>
        <span class="hotspot-label">감염된 실험쥐</span>
      </button>
      <button class="scene-back" data-action="go-reading-room-entrance" type="button">← 2층 복도</button>`;
  } else if (state.scene === "securityRoom") {
    container.innerHTML = `
      ${state.securityGuardResolved ? `
        <button class="hotspot security-console-hotspot" data-action="inspect-security-console" type="button">
          <span class="pulse" aria-hidden="true"></span>
          <span class="hotspot-label">CCTV 콘솔</span>
        </button>` : `
        <button class="hotspot security-guard-hotspot" data-action="security-guard-encounter" type="button">
          <span class="pulse" aria-hidden="true"></span>
          <span class="hotspot-label">움직이는 그림자</span>
        </button>`}
      <button class="scene-back" data-action="go-lobby" type="button">← 로비</button>`;
  } else {
    container.innerHTML = `<button class="scene-back" data-action="go-lobby" type="button">← 로비</button>`;
  }
}

function renderScene() {
  const scene = scenes[state.scene];
  const image = $("#scene-image");
  image.src = scene.image;
  image.alt = scene.alt;
  $("#scene-number").textContent = scene.number;
  $("#scene-name").textContent = scene.name;
  $("#location-label").textContent = scene.hud;
  renderHotspots();
}

function render() {
  $("#timer").textContent = formatTime(state.elapsed);
  $("#timer").classList.toggle("urgent", LIMIT_SECONDS - state.elapsed <= 10 * 60);
  $("#activity").textContent = state.activity;
  $("#bite-pips").querySelectorAll("i").forEach((pip, index) => pip.classList.toggle("active", index < state.bites));
  updateSoundButton();
  renderScene();
  renderInventory();
  updateBarricadeCountdownDisplays();
}

function transitionTo(sceneName) {
  const sceneElement = $("#scene");
  sceneElement.classList.add("transitioning");
  window.setTimeout(() => {
    state.scene = sceneName;
    saveState();
    render();
    window.requestAnimationFrame(() => sceneElement.classList.remove("transitioning"));
  }, 260);
}

function modalFrame({ code, title, body, close = true }) {
  return `
    <article class="modal-panel">
      <header class="modal-header">
        <div><p>${code}</p><h2>${title}</h2></div>
        ${close ? `<button class="modal-close" type="button" data-close-modal aria-label="닫기">×</button>` : ""}
      </header>
      <div class="modal-body">${body}</div>
    </article>`;
}

function showModal(html) {
  $("#modal-content").innerHTML = html;
  if (!$("#modal").open) $("#modal").showModal();
  const close = $("[data-close-modal]");
  if (close) close.addEventListener("click", closeModal);
}

function closeModal() {
  if ($("#modal").open) $("#modal").close();
  $("#modal").classList.remove("terminal-modal", "evidence-modal", "microscope-modal");
}

function inspectLetter(fromInventory = false) {
  if (!state.letterRead) {
    state.letterRead = true;
    addItem("graduate-letter");
    addItem("fluorescent-lamp");
    state.zombieDistance = Math.min(state.zombieDistance, 105);
    setActivity("편지와 휴대용 형광등을 챙겼다. 편지 속 숫자가 호실을 가리키는 것 같다.");
    saveState();
    render();
  }
  showModal(modalFrame({
    code: fromInventory ? "INVENTORY · EVIDENCE 01" : "FOUND OBJECT · 01",
    title: "구겨진 편지",
    body: `
      <div class="letter" aria-label="대학원생이 남긴 편지">
        <p>이 편지를 보는 아무나에게…</p>
        <p><span class="corrupt">ㅇ1</span> 편지를 읽으실 수 있다면 당신은 아직 감염이 되지 않은 거겠죠.</p>
        <p>저는 생명대 한 연구실에서 일하고 있는 대학원생입니다.</p>
        <p>실수로 실험을 잘못해버려 바이러스가 생명대 전역으로 퍼지게 <span class="corrupt">되0ㅓ</span>버렸습니다.</p>
        <p>다만 <span class="corrupt">ㅇ1</span> 바이러스는 다행히도 공기 중으로는 전파되지 않는 것 같습니다.</p>
        <p>제 연구실에 다행히 해당 바이러스의 구조가 있습니다.<br />부디 저희 연구실에 도달하셔서 백신을 만들어 주셨으면 좋겠습니다.</p>
        <p class="faded">저희 연 ㄱ ㅜ 실….ㅇ느…</p>
      </div>
      <button class="primary-button letter-action" type="button" data-follow-letter>${fromInventory ? "편지를 접는다" : "편지를 챙기고 복도로 간다"} <span>${fromInventory ? "×" : "→"}</span></button>
      <div class="hint-row"><div class="hint-text" id="letter-hint">문장에 이상한 부분이 있다.</div><button class="hint-button" type="button" data-letter-hint>힌트 −01:00</button></div>`,
  }));

  $("[data-follow-letter]").addEventListener("click", () => {
    closeModal();
    if (!fromInventory) transitionTo("hallway");
    saveState();
  });
  $("[data-letter-hint]").addEventListener("click", revealLetterHint);
}

function revealLetterHint() {
  const hints = [
    "자연스럽지 않은 한글 조합 세 곳을 찾으세요.",
    "한글 사이에 숫자가 섞여 있습니다.",
    "위에서부터 숫자만 읽으면 1 · 0 · 1입니다.",
  ];
  const box = $("#letter-hint");
  if (state.letterHints >= hints.length) {
    box.textContent = "모든 힌트를 확인했습니다.";
    return;
  }
  box.textContent = hints[state.letterHints];
  state.letterHints += 1;
  state.elapsed = Math.min(LIMIT_SECONDS, state.elapsed + 60);
  setActivity(`${state.letterHints}단계 힌트를 확인해 1분이 지났습니다.`);
  saveState();
  render();
}

function chooseRoom(room) {
  if (room === "105") {
    closeModal();
    state.wrongDoorCount += 1;
    state.zombieDistance = 18;
    setActivity("105호 안에서 좀비 무리가 나타났다. 당장 도망쳐야 한다!");
    saveState();
    render();
    $("#jumpscare").hidden = false;
    if (navigator.vibrate) navigator.vibrate([180, 60, 240]);
    return;
  }

  state.zombieDistance = Math.max(state.zombieDistance, 82);
  setActivity("편지의 숨은 숫자와 일치한다. 101호 안은 컴퓨터실이다.");
  saveState();
  showModal(modalFrame({
    code: "CORRECT LOCATION · 101",
    title: "101호 컴퓨터실",
    close: false,
    body: `
      <div class="result-mark">✓</div>
      <p class="result-copy">문장 속 어색한 글자에서 <strong>1 · 0 · 1</strong>을 찾아냈다.<br />문을 열자 컴퓨터가 줄지어 있고, 단 한 대의 화면만 켜져 있다.</p>
      <div class="status-grid"><div><small>현재 위치</small><strong>101호</strong></div><div><small>공간</small><strong>컴퓨터실</strong></div><div><small>다음 목표</small><strong>켜진 PC 조사</strong></div></div>
      <button class="primary-button letter-action" type="button" data-enter-computer-lab>컴퓨터실로 들어간다 <span>→</span></button>`,
  }));
  $("[data-enter-computer-lab]").addEventListener("click", () => {
    closeModal();
    transitionTo("computerLab");
  });
}

let terminalLines = [];

function resolveTerminalPath(input) {
  if (!input || input === "~") return input === "~" ? "/home/pc" : state.terminalCwd;
  const parts = input.startsWith("/") ? [] : state.terminalCwd.split("/").filter(Boolean);
  input.split("/").filter(Boolean).forEach((part) => {
    if (part === ".") return;
    if (part === "..") {
      if (parts.length > 2) parts.pop();
      return;
    }
    parts.push(part);
  });
  return `/${parts.join("/")}`;
}

function terminalPromptPath() {
  return state.terminalCwd === "/home/pc" ? "~" : state.terminalCwd.replace("/home/pc", "~");
}

function addTerminalLine(text, type = "output") {
  terminalLines.push({ text, type });
}

function renderTerminalOutput() {
  const output = $("#terminal-output");
  if (!output) return;
  output.innerHTML = "";
  terminalLines.forEach(({ text, type }) => {
    const line = document.createElement("p");
    line.className = `terminal-line ${type}`;
    line.textContent = text;
    output.appendChild(line);
  });
  $("#terminal-current-path").textContent = terminalPromptPath();
  $("#terminal-path-display").textContent = state.terminalCwd;
  $("#terminal-finish").hidden = !state.terminalSolved;
  output.scrollTop = output.scrollHeight;
}

function completeTerminalPuzzle() {
  if (state.terminalSolved) return;
  state.terminalSolved = true;
  state.zombieDistance = Math.max(state.zombieDistance, 92);
  addItem("terminal-note");
  setActivity("숨김 파일에서 다음 장소를 찾았다: 2층 독서실 B-17 책장.");
  saveState();
  render();
}

function runTerminalCommand(rawCommand) {
  const raw = rawCommand.trim();
  if (!raw) return;
  addTerminalLine(`pc@cnu:${terminalPromptPath()}$ ${raw}`, "command");
  const [command, ...args] = raw.split(/\s+/);

  if (command === "clear") {
    terminalLines = [];
    return;
  }

  if (command === "help") {
    addTerminalLine("ls [경로]  목록 보기 · ls -a  숨김 파일 포함");
    addTerminalLine("cd [폴더]  이동 · cd ..  이전 폴더 · cat [파일]  파일 읽기 · pwd  현재 경로");
    return;
  }

  if (command === "pwd") {
    addTerminalLine(state.terminalCwd);
    return;
  }

  if (command === "ls") {
    const showHidden = args.some((arg) => arg.startsWith("-") && arg.includes("a"));
    const pathArg = args.find((arg) => !arg.startsWith("-"));
    const targetPath = resolveTerminalPath(pathArg || "");
    const directory = virtualFileSystem[targetPath];
    if (!directory) {
      addTerminalLine(`ls: '${pathArg || targetPath}'에 접근할 수 없습니다.`, "error");
      return;
    }
    const directories = directory.directories.map((name) => `${name}/`);
    const files = Object.keys(directory.files).filter((name) => showHidden || !name.startsWith("."));
    addTerminalLine([...directories, ...files].join("    ") || "(비어 있음)", "listing");
    return;
  }

  if (command === "cd") {
    const targetPath = resolveTerminalPath(args[0] || "~");
    if (!virtualFileSystem[targetPath]) {
      addTerminalLine(`cd: '${args[0] || ""}' 폴더를 찾을 수 없습니다.`, "error");
      return;
    }
    state.terminalCwd = targetPath;
    saveState();
    return;
  }

  if (command === "cat") {
    if (!args[0]) {
      addTerminalLine("cat: 읽을 파일 이름이 필요합니다.", "error");
      return;
    }
    const requestedPath = resolveTerminalPath(args[0]);
    const pathParts = requestedPath.split("/");
    const fileName = pathParts.pop();
    const directoryPath = pathParts.join("/") || "/";
    const file = virtualFileSystem[directoryPath]?.files[fileName];
    if (file === undefined) {
      addTerminalLine(`cat: '${args[0]}' 파일을 찾을 수 없습니다.`, "error");
      return;
    }
    file.split("\n").forEach((line) => addTerminalLine(line, fileName === ".next_location" ? "success" : "output"));
    if (requestedPath === "/home/pc/Documents/research/2026/.next_location") completeTerminalPuzzle();
    return;
  }

  addTerminalLine(`${command}: 명령을 찾을 수 없습니다. 'help'를 입력해 보세요.`, "error");
}

function openComputerTerminal() {
  terminalLines = [
    { text: "CNU BIOSYSTEM TERMINAL · RECOVERY MODE", type: "system" },
    { text: `현재 컴퓨터의 경로는 ${state.terminalCwd}이다.`, type: "output" },
    { text: "컴퓨터 저장소 어딘가에 다음 장소로 향하는 힌트가 있다 한다. 잘 찾아보자.", type: "output" },
    { text: "목록을 확인하려면 ls를 입력하라. 사용 가능한 명령은 help에서 확인할 수 있다.", type: "hint" },
  ];
  if (state.terminalSolved) {
    terminalLines.push({ text: "복구 완료: 다음 장소는 2층 독서실 B-17 책장이다.", type: "success" });
  }
  showModal(modalFrame({
    code: "PC-07 · LOCAL STORAGE",
    title: "켜진 컴퓨터",
    body: `
      <div class="terminal-screen">
        <div class="terminal-status"><span>LOCAL SHELL</span><span id="terminal-path-display">${state.terminalCwd}</span></div>
        <div class="terminal-output" id="terminal-output" aria-live="polite"></div>
        <form class="terminal-form" id="terminal-form" autocomplete="off">
          <label class="terminal-prompt" for="terminal-command">pc@cnu:<span id="terminal-current-path">${terminalPromptPath()}</span>$</label>
          <input id="terminal-command" name="command" type="text" inputmode="text" autocapitalize="none" autocomplete="off" spellcheck="false" aria-label="터미널 명령어" placeholder="ls" />
          <button type="submit">실행</button>
        </form>
      </div>
      <div class="terminal-guide"><span>첫 명령어</span><code>ls</code><span>막히면</span><code>help</code></div>
      <button class="primary-button letter-action" id="terminal-finish" type="button" hidden>위치 단서를 챙긴다 <span>→</span></button>`,
  }));
  $("#modal").classList.add("terminal-modal");
  renderTerminalOutput();
  $("#terminal-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("#terminal-command");
    runTerminalCommand(input.value);
    input.value = "";
    renderTerminalOutput();
    input.focus();
  });
  $("#terminal-finish").addEventListener("click", closeModal);
  $("#terminal-command").focus();
}

function goToReadingRoomEntrance() {
  if (!state.terminalSolved) return;
  closeModal();
  if (state.scene === "readingRoom") {
    setActivity(state.shelfPuzzleSolved
      ? "자료열람실 밖으로 나오자 왼쪽 실험실 입구가 열려 있다. 안쪽에서 빛이 희미하게 반짝인다."
      : "자료열람실 출입문 앞으로 돌아왔다.");
  } else if (state.scene === "animalResearchCenter") {
    setActivity(state.zombieSurgeActive
      ? "2층 복도로 나왔다. 아래층에서 수많은 발소리와 비명이 들린다. 1층 로비로 서둘러야 한다."
      : "동물실험 연구센터에서 빠져나와 2층 복도로 돌아왔다. 감염된 실험쥐들의 울음소리가 문 너머로 들린다.");
  } else {
    setActivity("터미널에서 찾은 단서를 따라 2층 212호 자료열람실 앞에 도착했다.");
    state.zombieDistance = Math.max(64, state.zombieDistance - 12);
  }
  saveState();
  transitionTo("readingRoomEntrance");
}

function inspectLabEntrance() {
  if (!state.shelfPuzzleSolved) return;
  closeModal();
  const showStory = !state.animalCenterStoryShown;
  state.animalCenterStoryShown = true;
  setActivity("101호 기록의 작성자 소속과 같은 동물실험 연구센터에 도착했다. 손상된 케이지 주변에 감염된 실험쥐들이 모여 있다.");
  saveState();
  transitionTo("animalResearchCenter");
  if (showStory) {
    window.setTimeout(() => {
      if (state.scene === "animalResearchCenter") showAnimalCenterIntro();
    }, 380);
  }
}

function showAnimalCenterIntro() {
  showModal(modalFrame({
    code: "STORY FILE · CONNECTION 01",
    title: "기록이 가리킨 연구실",
    body: `
      <div class="story-evidence">
        <span class="story-evidence-icon" aria-hidden="true">⌘</span>
        <div><small>101호 삭제 기록 · 작성자 소속</small><strong>동물실험 연구센터</strong></div>
        <b>MATCH</b>
      </div>
      <p class="result-copy">컴퓨터에서 본 소속과 일치한다.<br />텅 빈 연구실에는 깨진 케이지와 중단된 현미경만 남아 있다.</p>`,
  }));
}

function inspectInfectedRats() {
  state.infectedRatsInspected = true;
  setActivity("케이지 기록을 확인했다. 사람의 감염 보고보다 6시간 먼저 실험쥐의 이상 행동이 기록되어 있다.");
  saveState();
  render();
  showModal(modalFrame({
    code: "BIOHAZARD · INFECTED SUBJECTS",
    title: "감염된 실험쥐",
    body: `
      <div class="result-mark danger-mark" aria-hidden="true">☣</div>
      <div class="incident-timeline" aria-label="감염 사건 시간 기록">
        <div><small>사고 6시간 전</small><strong>실험쥐 이상 행동</strong></div>
        <span aria-hidden="true">→</span>
        <div class="danger"><small>사고 발생</small><strong>첫 사람 감염</strong></div>
      </div>
      <p class="result-copy">탁한 눈, 공격성 증가, 케이지 파손.<br />실험쥐의 이상 징후는 사람들이 감염되기 전부터 시작됐다.</p>`,
  }));
}

function microscopeFocusState() {
  const objective = Number(state.microscopeObjective);
  const fineTarget = objective === 40 ? MICROSCOPE_FINE_TARGET : objective === 10 ? 1 : 0;
  const coarseError = Math.abs(state.microscopeCoarseFocus - MICROSCOPE_COARSE_TARGET);
  const fineError = Math.abs(state.microscopeFineFocus - fineTarget);
  const error = coarseError * 1.8 + fineError * 0.65;
  const powerFactor = objective === 40 ? 1.55 : objective === 10 ? 1.05 : 0.72;
  const scale = objective === 40 ? 2.7 : objective === 10 ? 1.65 : 1.05;
  const blur = state.microscopeSolved ? 0 : Math.min(12, error * powerFactor);

  if (objective === 40 && coarseError === 0 && fineError === 0) {
    return { blur: 0, scale, label: "세포막과 핵의 경계가 정확히 겹쳐 보인다.", ready: true };
  }
  if (coarseError >= 2) return { blur, scale, label: "상이 크게 흐트러져 있다. 조동 나사로 표본 높이를 맞춰야 한다.", ready: false };
  if (fineError > 0) return { blur, scale, label: "형태는 보이지만 경계가 겹쳐 보인다. 미동 나사를 조절해야 한다.", ready: false };
  if (objective === 4) return { blur, scale, label: "표본 전체가 보인다. 관찰할 부위를 찾았다면 배율을 높여 보자.", ready: false };
  if (objective === 10) return { blur, scale, label: "세포 무리가 보이지만 감염 흔적을 확인하기에는 배율이 부족하다.", ready: false };
  return { blur, scale, label: "렌즈 상태를 다시 확인하자.", ready: false };
}

function microscopePuzzleBody() {
  const focus = microscopeFocusState();
  const objective = Number(state.microscopeObjective);
  const totalMagnification = objective * 10;
  return `
    <p class="microscope-intro">누가 연구하다 만 바이러스 감염 쥐의 흔적이다. 살펴보자.</p>
    <div class="microscope-stage${state.microscopeSolved ? " focused" : ""}">
      <div class="scope-viewport">
        <img id="microscope-specimen" src="assets/images/infected-rat-tissue.jpg" alt="현미경으로 관찰한 바이러스 감염 쥐의 조직" style="--focus-blur: ${focus.blur}px; --focus-scale: ${focus.scale};" />
        <span class="scope-reticle" aria-hidden="true"></span>
        <span class="scope-scanlines" aria-hidden="true"></span>
        <strong class="scope-magnification">${totalMagnification}×</strong>
      </div>
      ${state.microscopeSolved ? `
        <div class="focus-readout success"><span>●</span> 400× · 초점 고정 완료</div>
        <div class="microscope-drawer open" aria-live="polite">
          <div class="drawer-cavity"><strong>서랍이 열렸다</strong><small>현미경 아래에서 잠금장치가 풀리는 소리가 났다.</small></div>
          <div class="drawer-front"><span></span></div>
        </div>
        ${state.drawerPuzzleSolved ? `
          <div class="drawer-puzzle-complete">
            <span aria-hidden="true">✓</span>
            <p><strong>문자 재조합 완료</strong><br />${state.barricadeInstalled ? "1층 로비의 출입구를 봉쇄했다." : "1층 로비로 이동해 바리케이드를 설치해야 한다."}</p>
          </div>` : `
          <div class="drawer-puzzle-card">
            <p><span>RECOVERY KEY</span> 연구 자료 복구용 보안 문구가 적힌 종이다.</p>
            <img src="assets/images/drawer-word-puzzle-v2.jpg" alt="N E W D O O R 일곱 글자를 모두 재조합해 한 단어를 만드는 생물안전 연구 기록지" />
            <form class="answer-form drawer-answer-form" id="drawer-puzzle-form" autocomplete="off">
              <label for="drawer-puzzle-answer">보안 복구 문구 입력</label>
              <div><input id="drawer-puzzle-answer" name="answer" type="text" inputmode="text" autocapitalize="characters" spellcheck="false" placeholder="정답 입력" /><button type="submit">확인</button></div>
              <p id="drawer-puzzle-feedback">알파벳은 모두 한 번씩 사용해야 한다.</p>
            </form>
          </div>`}` : `
        <div class="focus-console">
          <div class="magnification-formula" aria-live="polite">
            <span><small>접안렌즈</small><b>10×</b></span><i>×</i>
            <span><small>대물렌즈</small><b>${objective}×</b></span><i>=</i>
            <strong><small>총배율</small>${totalMagnification}×</strong>
          </div>
          <p class="microscope-guide">낮은 배율에서 표본을 찾고, 대물렌즈를 돌려 배율을 높인 뒤 조동·미동 나사로 초점을 맞추자.</p>
          <div class="objective-turret" role="group" aria-label="대물렌즈 선택">
            ${[4, 10, 40].map((power) => `
              <button class="objective-lens${objective === power ? " active" : ""}" type="button" data-objective="${power}" aria-pressed="${objective === power}">
                <span aria-hidden="true"></span><b>${power}×</b><small>${power === 4 ? "탐색" : power === 10 ? "관찰" : "확대"}</small>
              </button>`).join("")}
          </div>
          <div class="focus-knob-grid">
            <section class="focus-knob-control">
              <div class="focus-knob coarse" style="--knob-turn: ${state.microscopeCoarseFocus * 38}deg" aria-hidden="true"><span></span></div>
              <div><strong>조동 나사</strong><small>표본 높이를 크게 조절</small></div>
              <div class="knob-buttons">
                <button type="button" data-focus-control="coarse" data-focus-direction="-1" aria-label="조동 나사를 반시계 방향으로 돌리기">−</button>
                <button type="button" data-focus-control="coarse" data-focus-direction="1" aria-label="조동 나사를 시계 방향으로 돌리기">+</button>
              </div>
            </section>
            <section class="focus-knob-control">
              <div class="focus-knob fine" style="--knob-turn: ${(state.microscopeFineFocus + 4) * 42}deg" aria-hidden="true"><span></span></div>
              <div><strong>미동 나사</strong><small>초점을 미세하게 조절</small></div>
              <div class="knob-buttons">
                <button type="button" data-focus-control="fine" data-focus-direction="-1" aria-label="미동 나사를 반시계 방향으로 돌리기">−</button>
                <button type="button" data-focus-control="fine" data-focus-direction="1" aria-label="미동 나사를 시계 방향으로 돌리기">+</button>
              </div>
            </section>
          </div>
          <div class="focus-readout${focus.ready ? " near" : ""}" id="focus-readout" aria-live="polite">${focus.label}</div>
        </div>`}
    </div>`;
}

function completeMicroscopeFocus() {
  state.microscopeSolved = true;
  setActivity("40배 대물렌즈에서 조동·미동 나사를 정확히 맞추자 잠금장치가 풀리며 아래쪽 서랍이 열렸다.");
  saveState();
  render();
  openMicroscopePuzzle();
}

function refreshMicroscopeControls() {
  const focus = microscopeFocusState();
  saveState();
  if (focus.ready) {
    completeMicroscopeFocus();
    return;
  }
  openMicroscopePuzzle();
}

function setMicroscopeObjective(power) {
  state.microscopeObjective = Number(power);
  refreshMicroscopeControls();
}

function adjustMicroscopeFocus(control, direction) {
  if (control === "coarse") {
    state.microscopeCoarseFocus = Math.max(0, Math.min(8, state.microscopeCoarseFocus + direction));
  } else {
    state.microscopeFineFocus = Math.max(-4, Math.min(4, state.microscopeFineFocus + direction));
  }
  refreshMicroscopeControls();
}

function openMicroscopePuzzle() {
  showModal(modalFrame({
    code: state.microscopeSolved ? "MICROSCOPE · FOCUS LOCKED" : "MICROSCOPE · SAMPLE 01",
    title: state.microscopeSolved ? "정확한 초점" : "중단된 현미경 관찰",
    body: microscopePuzzleBody(),
  }));
  $("#modal").classList.add("microscope-modal");

  if (state.microscopeSolved) {
    if (!state.drawerPuzzleSolved) {
      $("#drawer-puzzle-form").addEventListener("submit", checkDrawerPuzzleAnswer);
      $("#drawer-puzzle-answer").focus();
    }
    return;
  }
  document.querySelectorAll("[data-objective]").forEach((button) => {
    button.addEventListener("click", () => setMicroscopeObjective(button.dataset.objective));
  });
  document.querySelectorAll("[data-focus-control]").forEach((button) => {
    button.addEventListener("click", () => adjustMicroscopeFocus(button.dataset.focusControl, Number(button.dataset.focusDirection)));
  });
}

function checkDrawerPuzzleAnswer(event) {
  event.preventDefault();
  const input = $("#drawer-puzzle-answer");
  const feedback = $("#drawer-puzzle-feedback");
  const answer = input.value.toUpperCase().replace(/[^A-Z]/g, "");
  if (answer !== "ONEWORD") {
    input.classList.remove("wrong");
    void input.offsetWidth;
    input.classList.add("wrong");
    feedback.textContent = "알파벳의 순서가 맞지 않는다.";
    feedback.classList.add("error");
    return;
  }

  state.drawerPuzzleSolved = true;
  state.zombieSurgeActive = true;
  state.barricadeDeadline = state.elapsed + 15;
  state.barricadeTimeoutBiteTriggered = false;
  state.zombieDistance = 24;
  setActivity("1층 로비 쪽에서 대규모 좀비 무리가 감지됐다. 15초 안에 바리케이드를 설치해야 한다.");
  saveState();
  render();
  if (navigator.vibrate) navigator.vibrate([180, 70, 180, 70, 360]);
  showZombieSurgeAlert();
}

function showZombieSurgeAlert() {
  $("#modal").classList.remove("microscope-modal");
  showModal(modalFrame({
    code: "EMERGENCY · 1F SURGE",
    title: "대규모 좀비 출현",
    body: `
      <div class="system-cascade" aria-label="연구 자료 복구와 격리문 연동 상태">
        <div><span>✓</span><small>ARCHIVE RECOVERY</small><strong>연구 자료 복구 완료</strong></div>
        <div class="danger"><span>!</span><small>QUARANTINE GATE · 1F</small><strong>격리문 연동 해제</strong></div>
      </div>
      <div class="zombie-surge-visual">
        <img src="assets/images/cnu-zombie-chase.jpg" alt="1층 복도를 가득 메우며 몰려오는 대규모 좀비 무리" />
        <div aria-hidden="true"><strong>1F</strong><span>감염체 신호 폭증</span></div>
      </div>
      <p class="result-copy"><strong>ONE WORD는 연구 자료 복구 암호였다.</strong><br />하지만 복구 장치와 연결된 1층 격리문까지 함께 열려 버렸다. 감염체들이 로비로 몰려든다.</p>
      <div class="emergency-order"><small>긴급 행동</small><strong>15초 안에 1층 로비의 바리케이드를 설치하라.</strong></div>
      <div class="barricade-countdown" role="timer" aria-live="polite"><small>설치 제한 시간</small><strong data-barricade-countdown>${formatBarricadeCountdown()}</strong><span>초과 시 좀비에게 1회 물린다</span></div>
      <button class="primary-button letter-action" type="button" data-dismiss-surge>즉시 로비로 이동 <span>→</span></button>`,
  }));
  $("[data-dismiss-surge]").addEventListener("click", goToLobby);
}

function inspectMicroscope() {
  state.microscopeInspected = true;
  setActivity(state.microscopeSolved
    ? "초점이 맞춰진 현미경과 열린 아래쪽 서랍을 다시 살펴본다."
    : "누군가 관찰하다 만 감염 쥐의 조직 표본이 현미경에 놓여 있다.");
  saveState();
  render();
  openMicroscopePuzzle();
}

function goToLobby() {
  closeModal();
  if (state.zombieSurgeActive && !state.barricadeInstalled) {
    setActivity("1층 로비에 도착했다. 출입구 너머로 좀비 무리가 몰려온다. 지금 바리케이드를 설치해야 한다.");
    saveState();
  }
  transitionTo("lobby");
}

function openSecurityDoorKeypad() {
  showModal(modalFrame({
    code: "ACCESS CONTROL · DEPARTMENT OFFICE",
    title: "과사무실 전자 잠금",
    body: `
      <div class="security-door-lock" aria-hidden="true"><span>▦</span><div><small>DEPARTMENT OFFICE</small><strong>LOCKED</strong></div></div>
      <p class="result-copy">문 옆 숫자 패드가 켜져 있다.<br />연구일지에서 복원한 네 자리 코드를 입력하자.</p>
      <form class="answer-form security-keypad-form" id="security-keypad-form" autocomplete="off">
        <label for="security-keypad-answer">출입 코드</label>
        <div><input id="security-keypad-answer" name="answer" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="••••" aria-describedby="security-keypad-feedback" /><button type="submit">해제</button></div>
        <p id="security-keypad-feedback" aria-live="polite">오입력이 반복되면 침입 경보가 작동할 수 있다.</p>
      </form>`,
  }));
  $("#security-keypad-form").addEventListener("submit", checkSecurityDoorCode);
  $("#security-keypad-answer").focus();
}

function enterSecurityRoom() {
  if (!state.journalPuzzleSolved) return;
  if (!state.securityRoomUnlocked) {
    openSecurityDoorKeypad();
    return;
  }
  closeModal();
  setActivity("생정융 과사무실로 들어왔다. 행정용 모니터 위 CCTV 화면들이 건물 곳곳을 비추고 있다.");
  saveState();
  transitionTo("securityRoom");
  if (!state.securityGuardResolved) {
    window.setTimeout(() => {
      if (state.scene === "securityRoom" && !state.securityGuardResolved) showSecurityGuardEncounter();
    }, 380);
  }
}

function checkSecurityDoorCode(event) {
  event.preventDefault();
  const input = $("#security-keypad-answer");
  const feedback = $("#security-keypad-feedback");
  if (input.value.trim() === "1420") {
    state.securityRoomUnlocked = true;
    setActivity("연구일지에서 얻은 코드 1420으로 생정융 과사무실 문을 열었다.");
    saveState();
    enterSecurityRoom();
    return;
  }

  state.securityDoorFailures += 1;
  input.classList.remove("wrong");
  void input.offsetWidth;
  input.classList.add("wrong");
  input.value = "";
  if (state.securityDoorFailures >= 3 && !state.securityDoorBiteTriggered) {
    state.securityDoorBiteTriggered = true;
    saveState();
    triggerZombieAttack("security-alarm");
    return;
  }
  const remaining = Math.max(0, 3 - state.securityDoorFailures);
  feedback.textContent = remaining > 0
    ? `ACCESS DENIED · 침입 경보까지 ${remaining}회`
    : "ACCESS DENIED · 경보 회로가 이미 손상되어 있다.";
  feedback.classList.add("error");
  saveState();
}

function showSecurityGuardEncounter() {
  showModal(modalFrame({
    code: "SUDDEN ENCOUNTER · OFFICE",
    title: "책상 뒤의 조교",
    close: false,
    body: `
      <div class="zombie-surge-visual guard-encounter-visual">
        <img src="assets/images/cnu-zombie-chase.jpg" alt="어둠 속에서 갑자기 달려드는 감염자" />
        <div aria-hidden="true"><strong>!</strong><span>근거리 움직임 감지</span></div>
      </div>
      <div class="guard-symptoms"><span>검게 변한 혈관</span><span>불규칙한 경련</span><span>반응 없음</span></div>
      <p class="result-copy">쓰러져 있던 조교가 갑자기 몸을 일으킨다.<br />문 옆에는 사무실 자동 잠금 버튼이 보인다.</p>
      <div class="encounter-actions">
        <button class="primary-button" type="button" data-guard-response="safe">잠금 버튼을 누른다</button>
        <button class="danger-choice" type="button" data-guard-response="risk">조교에게 다가간다</button>
      </div>`,
  }));
  document.querySelectorAll("[data-guard-response]").forEach((button) => {
    button.addEventListener("click", () => resolveSecurityGuardEncounter(button.dataset.guardResponse));
  });
}

function resolveSecurityGuardEncounter(response) {
  state.securityGuardResolved = true;
  if (response === "risk") {
    setActivity("감염 징후를 보이던 조교가 팔을 물었다. 과사무실 안쪽 자동문은 뒤늦게 닫혔다.");
    saveState();
    render();
    triggerZombieAttack("security-guard");
    return;
  }
  closeModal();
  state.zombieDistance = Math.max(state.zombieDistance, 68);
  setActivity("잠금 버튼을 눌러 감염된 조교를 사무실 안쪽에 격리했다. CCTV 콘솔을 조사할 수 있다.");
  saveState();
  render();
}

function cctvArchiveBody() {
  const blastResults = [
    { sample: "A-03", cover: "82%", identity: "91.2%", evalue: "2e-12" },
    { sample: "C-07", cover: "100%", identity: "100%", evalue: "0.0" },
    { sample: "B-11", cover: "96%", identity: "97.4%", evalue: "4e-48" },
    { sample: "D-02", cover: "71%", identity: "88.6%", evalue: "7e-08" },
  ];
  return `
    <div class="story-evidence culprit-evidence"><span class="story-evidence-icon" aria-hidden="true">!</span><div><small>바이러스 샘플 반입자</small><strong>생정융 학생회장</strong></div><b>SUSPECT CONFIRMED</b></div>
    <div class="cctv-culprit-still">
      <img src="assets/images/cctv-student-president-silhouette.jpg" alt="냉각 상자를 들고 과사무실 복도를 지나는 중단발 여성 학생회장의 실루엣이 찍힌 CCTV 화면" />
      <div><span>CAM 04 · IDENTITY MATCH</span><strong>생정융 학생회장</strong><small>학생회 완장 · 냉각 상자 소지 확인</small></div>
      <b>MATCH 98%</b>
    </div>
    <div class="cctv-recovery-rule"><small>BIO-ARCHIVE RECOVERY · BLAST</small><strong>냉각 상자에서 검출된 바이러스 서열과 가장 신뢰도 높게 일치하는 보관 샘플을 찾아라.</strong><p>Query cover와 Identity는 높을수록, E-value는 0에 가까울수록 신뢰도가 높다.</p></div>
    <div class="blast-query-card"><span>QUERY · OUTBREAK_SAMPLE</span><code>ATGGCCTTTGAACCTGGTTGCTAACGATCGTACGTA</code><small>Length: 36 bp · nucleotide BLAST</small></div>
    <div class="blast-results-wrap">
      <table class="blast-results" aria-label="바이러스 서열 BLAST 검색 결과">
        <thead><tr><th>Sample ID</th><th>Query cover</th><th>Identity</th><th>E-value</th></tr></thead>
        <tbody>${blastResults.map((result) => `<tr><th scope="row">${result.sample}</th><td>${result.cover}</td><td>${result.identity}</td><td>${result.evalue}</td></tr>`).join("")}</tbody>
      </table>
    </div>
    ${state.cctvArchiveSolved ? `
      <div class="journal-code-reveal cctv-route-reveal">
        <span>BLAST MATCH · CCTV RESTORED</span><strong>C-07</strong><small>학생회장의 최종 이동 지점 · 3층 저온 시료 보관실</small>
      </div>
      <p class="result-copy cctv-result-copy">C-07 샘플의 서열이 현장 검체와 완전히 일치한다. 연결된 CCTV의 마지막 프레임에는 학생회장이 냉각 상자를 <strong>C-07 보관함</strong>에 넣는 모습이 남아 있다.</p>` : `
      <form class="answer-form cctv-answer-form" id="cctv-archive-form" autocomplete="off">
        <label for="cctv-archive-answer">가장 신뢰도 높은 Sample ID</label>
        <div><input id="cctv-archive-answer" name="answer" type="text" inputmode="text" autocapitalize="characters" spellcheck="false" maxlength="4" placeholder="? - ? ?" aria-describedby="cctv-archive-feedback" /><button type="submit">BLAST 확인</button></div>
        <p id="cctv-archive-feedback" aria-live="polite">세 지표를 함께 비교해 가장 정확한 일치 결과를 찾자.</p>
      </form>`}`;
}

function inspectSecurityConsole() {
  state.securityConsoleInspected = true;
  state.culpritIdentified = true;
  setActivity(state.cctvArchiveSolved
    ? "BLAST 분석으로 복구된 영상은 학생회장이 향한 3층 저온 시료 보관실 C-07을 가리킨다."
    : "CCTV 보안 서버가 바이러스 서열 인증을 요구한다. BLAST 결과에서 가장 신뢰도 높은 샘플을 찾아야 한다.");
  saveState();
  render();
  showModal(modalFrame({
    code: state.cctvArchiveSolved ? "BLAST MATCH · CCTV RESTORED" : "BIO-CCTV LINK · BLAST SEARCH",
    title: state.cctvArchiveSolved ? "복구된 이동 경로" : "바이러스 서열 인증",
    body: cctvArchiveBody(),
  }));
  $("#modal").classList.add("evidence-modal");
  const form = $("#cctv-archive-form");
  if (form) {
    form.addEventListener("submit", checkCctvArchiveCode);
    $("#cctv-archive-answer").focus();
  }
}

function checkCctvArchiveCode(event) {
  event.preventDefault();
  const input = $("#cctv-archive-answer");
  const feedback = $("#cctv-archive-feedback");
  const answer = input.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (answer !== "C07") {
    input.classList.remove("wrong");
    void input.offsetWidth;
    input.classList.add("wrong");
    feedback.textContent = "서열 일치도가 부족하다. Query cover·Identity·E-value를 다시 비교하자.";
    feedback.classList.add("error");
    input.select();
    if (navigator.vibrate) navigator.vibrate(100);
    return;
  }

  state.cctvArchiveSolved = true;
  setActivity("BLAST에서 현장 바이러스와 일치하는 C-07 샘플을 찾았다. 학생회장은 3층 저온 시료 보관실로 향했다.");
  saveState();
  render();
  inspectSecurityConsole();
}

function installBarricade() {
  if (!state.zombieSurgeActive || state.barricadeInstalled || !state.inventory.includes("barricade")) return;
  state.barricadeInstalled = true;
  state.zombieSurgeActive = false;
  state.barricadeDeadline = null;
  state.researchFragmentFound = true;
  state.zombieDistance = Math.max(state.zombieDistance, 76);
  state.inventory = state.inventory.filter((item) => item !== "barricade");
  addItem("research-fragment");
  if (state.selectedItem === "barricade") state.selectedItem = null;
  setActivity("로비를 봉쇄한 뒤 바리케이드 아래에서 손상된 연구일지를 발견했다. 실험쥐가 최초 감염원은 아니었다.");
  saveState();
  render();
  showModal(modalFrame({
    code: "DEFENSE · LOBBY SEALED",
    title: "바리케이드 설치 완료",
    body: `
      <div class="barricade-reward compact installed" aria-hidden="true"><span>▥</span></div>
      <p class="result-copy">바리케이드가 출입구를 막았다. 철제 프레임 아래에 끼어 있던 손상된 연구일지 한 장이 드러난다.</p>
      <div class="research-fragment-note">
        <span>연구일지 · 마지막 기록</span>
        <strong>“실험쥐는 감염원이 아니었다.<br />누군가 이미 감염된 바이러스를 이곳에 가져왔다.”</strong>
      </div>
      <div class="story-evidence compact"><span class="story-evidence-icon" aria-hidden="true">≣</span><div><small>새 증거 획득</small><strong>손상된 연구일지</strong></div><b>NEW</b></div>`,
  }));
}

function enterReadingRoom() {
  setActivity("자료열람실 안으로 들어왔다. 단서가 가리킨 B-17 책장을 찾아야 한다.");
  saveState();
  transitionTo("readingRoom");
}

function inspectB17Shelf() {
  state.b17Inspected = true;
  if (!state.fluorescentOn) {
    setActivity("B-17 책장에는 책이 빽빽하지만 너무 어두워 자세히 보이지 않는다. 형광등이 필요하다.");
    saveState();
    render();
    showModal(modalFrame({
      code: "SEARCH AREA · B-17",
      title: "어두운 책장",
      body: `
        <div class="shelf-view dark">
          <img src="assets/images/cnu-b17-bookshelf.jpg" alt="어둠에 가려 거의 보이지 않는 B-17 책장" />
          <div class="shelf-darkness" aria-hidden="true"></div>
          <p>책이 꽂혀 있는 것은 보이지만<br />글자도, 책 사이도 확인할 수 없다.</p>
        </div>
        <div class="shelf-instruction"><span aria-hidden="true">?</span><p><strong>빛이 필요하다.</strong><br />무언가 도움이 될 만한 게 없을까?</p></div>`,
    }));
    $("#modal").classList.add("evidence-modal");
    return;
  }

  state.shelfIlluminated = true;
  setActivity(state.shelfPuzzleSolved ? "B-17 책장과 이미 확보한 종이를 다시 확인했다." : "형광등 빛 아래 책 사이에 끼워진 종이 한 장이 드러났다.");
  saveState();
  render();
  showModal(modalFrame({
    code: "ILLUMINATED · B-17",
    title: "밝아진 책장",
    body: `
      <div class="shelf-view lit">
        <img src="assets/images/cnu-b17-bookshelf.jpg" alt="형광등으로 밝힌 B-17 책장과 책 사이에 끼워진 종이" />
        <div class="lamp-beam" aria-hidden="true"></div>
        <button class="shelf-paper-hotspot" type="button" data-open-shelf-puzzle aria-label="책 사이에 끼워진 종이 조사">
          <span aria-hidden="true">+</span><strong>${state.shelfPuzzleSolved ? "푼 문제" : "종이 발견"}</strong>
        </button>
      </div>
      <p class="shelf-caption">형광등을 비추자 책 사이에 접힌 종이가 보인다. 종이를 눌러 확인하자.</p>`,
  }));
  $("#modal").classList.add("evidence-modal");
  $("[data-open-shelf-puzzle]").addEventListener("click", openShelfPuzzle);
}

function openShelfPuzzle() {
  state.shelfNoteFound = true;
  setActivity(state.shelfPuzzleSolved ? "책장에서 찾은 숫자 문제의 정답은 25였다." : "B-17 책 사이에서 숫자 규칙 문제가 적힌 종이를 발견했다.");
  saveState();
  render();
  showModal(modalFrame({
    code: "RECOVERED NOTE · B-17",
    title: "규칙을 찾아 빈칸을 채워라",
    body: `
      <div class="number-puzzle" role="img" aria-label="윗줄 68, 81, 32, 88, 16. 아랫줄 44, 22, 13, 9, 빈칸, 14로 이루어진 숫자 규칙 문제">
        <div class="puzzle-heading"><span>Q.</span><strong>규칙을 찾아 빈칸을 채워라</strong></div>
        <div class="number-row top-row"><b>68</b><b>81</b><b>32</b><b>88</b><b>16</b></div>
        <div class="number-row bottom-row"><b>44</b><b>22</b><b>13</b><b>9</b><b class="number-blank">?</b><b>14</b></div>
      </div>
      ${state.shelfPuzzleSolved ? `
        <div class="puzzle-complete"><span>✓</span><p><strong>해독 완료 · 정답 25</strong><br />바리케이드를 이미 확보했다.</p></div>` : `
        <form class="answer-form" id="shelf-puzzle-form" autocomplete="off">
          <label for="shelf-puzzle-answer">빈칸에 들어갈 숫자</label>
          <div><input id="shelf-puzzle-answer" name="answer" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="3" placeholder="?" aria-describedby="shelf-puzzle-feedback" /><button type="submit">확인</button></div>
          <p id="shelf-puzzle-feedback" aria-live="polite">숫자의 규칙을 찾아 입력하자.</p>
        </form>`}`,
  }));
  $("#modal").classList.add("evidence-modal");
  const form = $("#shelf-puzzle-form");
  if (form) {
    form.addEventListener("submit", checkShelfPuzzleAnswer);
    $("#shelf-puzzle-answer").focus();
  }
}

function checkShelfPuzzleAnswer(event) {
  event.preventDefault();
  const input = $("#shelf-puzzle-answer");
  const feedback = $("#shelf-puzzle-feedback");
  if (input.value.trim() !== "25") {
    feedback.textContent = "잠금이 해제되지 않는다. 규칙을 다시 살펴보자.";
    feedback.classList.add("error");
    input.classList.add("wrong");
    input.select();
    if (navigator.vibrate) navigator.vibrate(100);
    return;
  }

  state.shelfPuzzleSolved = true;
  state.selectedItem = "barricade";
  addItem("barricade");
  setActivity("숫자 문제의 정답 25를 입력해 잠금을 풀고 접이식 바리케이드를 확보했다.");
  saveState();
  render();
  showModal(modalFrame({
    code: "ITEM ACQUIRED · DEFENSE",
    title: "바리케이드 획득",
    body: `
      <div class="barricade-reward" aria-hidden="true"><span>▥</span></div>
      <p class="result-copy"><strong>정답 25.</strong><br />책장 아래 잠금 장치가 열리며 접이식 바리케이드가 나온다. 좀비의 이동 경로를 한 번 차단할 수 있다.</p>
      <div class="emergency-protocol"><small>함께 발견된 비상 계획</small><strong>“격리 실패 시 1층 출입구를 우선 봉쇄할 것.”</strong></div>
      <div class="status-grid"><div><small>획득 아이템</small><strong>바리케이드</strong></div><div><small>용도</small><strong>이동 차단</strong></div><div><small>보관 위치</small><strong>인벤토리</strong></div></div>
      <button class="primary-button letter-action" type="button" data-close-reward>인벤토리에 넣는다</button>`,
  }));
  $("#modal").classList.add("evidence-modal");
  $("[data-close-reward]").addEventListener("click", closeModal);
}

function escapeWrongRoom() {
  $("#jumpscare").hidden = true;
  triggerZombieAttack("wrong-room");
}

function renderDnaBases(sequence) {
  return [...sequence].map((base) => `<b class="base base-${base.toLowerCase()}">${base}</b>`).join("");
}

function researchJournalBody() {
  const hasLamp = state.inventory.includes("fluorescent-lamp");
  if (!state.journalUvRevealed) {
    return `
      <div class="research-fragment-note inventory-note journal-dormant">
        <span>연구일지 · 마지막 기록</span>
        <strong>“실험쥐는 감염원이 아니었다.<br />누군가 이미 감염된 바이러스를 이곳에 가져왔다.”</strong>
        <small>나머지 페이지는 찢겨 나갔다. 종이 섬유 사이에 희미한 얼룩이 남아 있다.</small>
        <div class="uv-ghost-marks" aria-hidden="true">A · T &nbsp; G · C &nbsp; 01—04</div>
      </div>
      ${hasLamp ? `
        <button class="primary-button letter-action lamp-journal-action" type="button" data-use-lamp-on-journal><span aria-hidden="true">▰</span> 형광등을 비춰 본다</button>` : `
        <div class="shelf-instruction"><span aria-hidden="true">?</span><p><strong>희미한 흔적이 있다.</strong><br />빛을 비출 만한 물건이 필요하다.</p></div>`}`;
  }

  const samples = [
    { id: "01", top: "ATGC", bottom: "TACC" },
    { id: "02", top: "ATGC", bottom: "ATGC" },
    { id: "03", top: "AAGG", bottom: "TACG" },
    { id: "04", top: "CGTA", bottom: "GCAT" },
  ];
  return `
    <div class="uv-journal">
      <header><span>UV REVEAL · ACCESS KEY</span><strong>형광 잉크로 숨겨진 기록</strong></header>
      <div class="base-pair-rule" aria-label="DNA 상보적 염기쌍 규칙"><span><b class="base base-a">A</b> ↔ <b class="base base-t">T</b></span><span><b class="base base-g">G</b> ↔ <b class="base base-c">C</b></span></div>
      <p class="uv-puzzle-guide">각 조각에서 <strong>서로 정상적으로 결합할 수 없는 염기쌍의 개수</strong>를 세고, 01부터 차례대로 입력하라.</p>
      <div class="dna-sample-grid">
        ${samples.map((sample) => `
          <section class="dna-sample" role="img" aria-label="DNA 조각 ${sample.id}. 위쪽 가닥 ${sample.top}, 아래쪽 가닥 ${sample.bottom}">
            <small>FRAGMENT ${sample.id}</small>
            <div class="dna-strand"><i>5′</i>${renderDnaBases(sample.top)}<i>3′</i></div>
            <div class="dna-bonds" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
            <div class="dna-strand"><i>3′</i>${renderDnaBases(sample.bottom)}<i>5′</i></div>
          </section>`).join("")}
      </div>
      ${state.journalPuzzleSolved ? `
        <div class="journal-code-reveal">
          <span>ACCESS GRANTED</span><strong>14 : 20</strong><small>다음 조사 지점 · 생정융 과사무실 CCTV 서버</small>
        </div>` : `
        <form class="answer-form journal-answer-form" id="journal-puzzle-form" autocomplete="off">
          <label for="journal-puzzle-answer">FRAGMENT 01 → 04 · 4자리 코드</label>
          <div><input id="journal-puzzle-answer" name="answer" type="text" inputmode="numeric" pattern="[0-9:]*" maxlength="5" placeholder="0000" aria-describedby="journal-puzzle-feedback" /><button type="submit">확인</button></div>
          <p id="journal-puzzle-feedback" aria-live="polite">각 세로 열의 두 염기가 상보적인지 확인하자.</p>
        </form>`}
    </div>`;
}

function openResearchJournal() {
  showModal(modalFrame({
    code: state.journalUvRevealed ? "EVIDENCE · UV ANALYSIS" : "EVIDENCE · DAMAGED LOG",
    title: state.journalPuzzleSolved ? "복원된 연구일지" : state.journalUvRevealed ? "형광 염기 퍼즐" : "손상된 연구일지",
    body: researchJournalBody(),
  }));
  $("#modal").classList.add("evidence-modal");
  const lampButton = $("[data-use-lamp-on-journal]");
  if (lampButton) lampButton.addEventListener("click", revealJournalUvPuzzle);
  const form = $("#journal-puzzle-form");
  if (form) {
    form.addEventListener("submit", checkJournalPuzzleAnswer);
    $("#journal-puzzle-answer").focus();
  }
}

function revealJournalUvPuzzle() {
  if (!state.inventory.includes("fluorescent-lamp")) return;
  state.fluorescentOn = true;
  state.journalUvRevealed = true;
  setActivity("형광등을 비추자 연구일지 위로 네 개의 DNA 염기쌍 조각이 나타났다.");
  saveState();
  render();
  openResearchJournal();
}

function checkJournalPuzzleAnswer(event) {
  event.preventDefault();
  const input = $("#journal-puzzle-answer");
  const feedback = $("#journal-puzzle-feedback");
  const answer = input.value.replace(/\D/g, "");
  if (answer !== "1420") {
    input.classList.remove("wrong");
    void input.offsetWidth;
    input.classList.add("wrong");
    feedback.textContent = "코드가 반응하지 않는다. 불일치 염기쌍의 개수를 다시 세어 보자.";
    feedback.classList.add("error");
    input.select();
    if (navigator.vibrate) navigator.vibrate(100);
    return;
  }

  state.journalPuzzleSolved = true;
  setActivity("염기 퍼즐에서 코드 1420을 복원했다. 기록은 생정융 과사무실 CCTV 서버를 가리킨다.");
  saveState();
  render();
  openResearchJournal();
}

function inspectItem(id) {
  state.selectedItem = id;
  saveState();
  renderInventory();
  if (id === "campus-map") {
    openMiniMap();
    return;
  }
  if (id === "graduate-letter") {
    inspectLetter(true);
    return;
  }
  if (id === "terminal-note") {
    showModal(modalFrame({
      code: "RECOVERED FILE · NEXT LOCATION",
      title: "위치 단서",
      body: `
        <div class="result-mark">⌘</div>
        <p class="result-copy"><strong>다음 장소: 2층 독서실</strong><br />확인 지점: B-17 책장</p>
        <div class="story-evidence"><span class="story-evidence-icon" aria-hidden="true">!</span><div><small>작성자 소속</small><strong>동물실험 연구센터</strong></div><b>삭제 감지 · 사고 +03분</b></div>`,
    }));
    return;
  }
  if (id === "barricade") {
    showModal(modalFrame({
      code: "ITEM · DEFENSE",
      title: "접이식 바리케이드",
      body: `<div class="barricade-reward compact" aria-hidden="true"><span>▥</span></div><p class="result-copy">B-17 숫자 문제를 풀고 얻은 바리케이드다.<br />좀비의 이동 경로를 한 번 차단할 수 있다.</p>`,
    }));
    return;
  }
  if (id === "research-fragment") {
    openResearchJournal();
    return;
  }
  state.fluorescentOn = true;
  setActivity(state.scene === "readingRoom" && state.b17Inspected ? "형광등을 켰다. 이제 B-17 책장을 다시 확인할 수 있다." : "휴대용 형광등을 켰다. 어두운 장소를 조사할 수 있다.");
  saveState();
  render();
  showModal(modalFrame({
    code: "ITEM ACTIVE · PORTABLE LIGHT",
    title: "형광등을 켰다",
    body: `<div class="result-mark lamp-active">▰</div><p class="result-copy">차가운 형광빛이 어둠을 밀어낸다.<br />이제 B-17 책장 사이를 자세히 살펴볼 수 있다.</p>`,
  }));
}

function openMiniMap() {
  const lobbyCurrent = state.scene === "lobby";
  const hallCurrent = state.scene === "hallway";
  const computerLabCurrent = state.scene === "computerLab";
  const readingRoomCurrent = state.scene === "readingRoomEntrance" || state.scene === "readingRoom";
  const animalCenterCurrent = state.scene === "animalResearchCenter";
  const securityRoomCurrent = state.scene === "securityRoom";
  showModal(modalFrame({
    code: "ITEM · CAMPUS MINIMAP",
    title: "좀비 위치 탐지",
    body: `
      <div class="map-area">
        <div class="map-path" aria-hidden="true"></div>
        <div class="map-node node-101${computerLabCurrent ? " current" : ""}">101호<br />컴퓨터실</div>
        <div class="map-node node-105">105호</div>
        <div class="map-node node-hallway${hallCurrent ? " current" : ""}">1층 복도</div>
        <div class="map-node node-lobby${lobbyCurrent ? " current" : ""}">로비</div>
        <div class="map-node node-reading-room${readingRoomCurrent ? " current" : ""}">2층<br />자료열람실</div>
        ${state.shelfPuzzleSolved ? `<div class="map-node node-animal-center${animalCenterCurrent ? " current" : ""}">동물실험<br />연구센터</div>` : ""}
        ${state.journalPuzzleSolved ? `<div class="map-node node-security-room${securityRoomCurrent ? " current" : ""}">생정융<br />과사무실</div>` : ""}
        <div class="zombie-signal${state.zombieSurgeActive ? " surge" : ""}"><strong>${state.zombieDistance}m</strong><small>${state.zombieSurgeActive ? "1F 대규모 감지" : "좀비 무리"}</small></div>
      </div>
      <div class="status-grid"><div><small>현재 위치</small><strong>${scenes[state.scene].hud}</strong></div><div><small>최근접 좀비</small><strong>${state.zombieDistance}m</strong></div><div><small>물림</small><strong>${state.bites} / 3</strong></div></div>`,
  }));
}

function showActivityLog() {
  showModal(modalFrame({
    code: "SURVIVAL LOG",
    title: "최근 기록",
    body: `<p class="result-copy">${state.activity}</p><div class="status-grid"><div><small>경과 시간</small><strong>${formatElapsed(state.elapsed)}</strong></div><div><small>오답 장소</small><strong>${state.wrongDoorCount}회</strong></div><div><small>현재 거리</small><strong>${state.zombieDistance}m</strong></div></div>`,
  }));
}

function formatElapsed(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function showFailure() {
  if (failureShown) return;
  failureShown = true;
  state.failed = true;
  state.paused = true;
  suspendBgm();
  saveState();
  showModal(modalFrame({
    code: "GAME OVER · TIME EXPIRED",
    title: "감염 확산",
    close: false,
    body: `<p class="result-copy">제한 시간 안에 연구실을 찾지 못했다.<br />좀비 바이러스가 생명대 전체로 퍼졌다.</p><button class="primary-button letter-action" type="button" data-restart>처음부터 다시 시작</button>`,
  }));
  $("[data-restart]").addEventListener("click", () => {
    closeModal();
    startGame(true);
  });
}

function triggerZombieAttack(source = "distance") {
  const attackDetails = {
    "wrong-room": {
      code: "WRONG ROOM",
      activity: "105호에서 탈출하는 순간 좀비에게 물렸다.",
      copy: "105호에서 빠져나오던 중 팔을 물렸다.",
    },
    "security-alarm": {
      code: "SECURITY ALARM",
      activity: "과사무실 출입 코드를 반복해서 틀리자 경보가 울렸고, 소리를 따라온 좀비에게 물렸다.",
      copy: "침입 경보를 듣고 나타난 좀비가 옆 복도에서 달려들어 팔을 물었다.",
    },
    "security-guard": {
      code: "INFECTED ASSISTANT",
      activity: "감염된 조교에게 다가갔다가 손목을 물렸다.",
      copy: "조교의 상태를 확인하려 다가간 순간 손목을 물렸다.",
    },
    "barricade-timeout": {
      code: "BARRICADE TIMEOUT",
      activity: "바리케이드 설치가 늦어 로비로 침입한 좀비에게 물렸다.",
      copy: "15초가 지나 출입구가 뚫렸다. 바리케이드를 펼치던 중 좀비에게 팔을 물렸다.",
    },
    distance: {
      code: "ATTACK",
      activity: "좀비 무리와의 거리가 0m가 되어 공격당했다.",
      copy: "좀비 무리와의 거리가 0m가 되었다.",
    },
  };
  const detail = attackDetails[source] || attackDetails.distance;
  state.bites += 1;
  state.zombieDistance = source === "wrong-room"
    ? Math.max(58, 74 - state.wrongDoorCount * 5)
    : source === "barricade-timeout"
      ? 8
      : 60;
  state.paused = true;
  suspendBgm();
  setActivity(`${detail.activity} 현재 물림 ${state.bites}/3.`);
  saveState();
  render();

  if (state.bites >= 3) {
    state.failed = true;
    showModal(modalFrame({
      code: "GAME OVER · INFECTED",
      title: "감염 완료",
      close: false,
      body: `<p class="result-copy">세 번째 물림이다. 바이러스가 전신으로 퍼지기 시작했다.<br />백신을 만들 기회는 사라졌다.</p><button class="primary-button letter-action" type="button" data-restart>처음부터 다시 시작</button>`,
    }));
    $("[data-restart]").addEventListener("click", () => {
      closeModal();
      startGame(true);
    });
    return;
  }

  showModal(modalFrame({
    code: `${detail.code} · BITE ${state.bites}/3`,
    title: "좀비에게 물렸다",
    close: false,
    body: `<div class="result-mark danger-mark">${state.bites}</div><p class="result-copy">${detail.copy}<br />세 번 물리면 감염된다. 서둘러 이동해야 한다.</p><button class="primary-button letter-action" type="button" data-survive>계속 움직인다</button>`,
  }));
  $("[data-survive]").addEventListener("click", () => {
    state.paused = false;
    closeModal();
    saveState();
    startBgm();
  });
}

function handleSceneAction(action) {
  if (action === "inspect-letter") inspectLetter();
  if (action === "go-hallway") transitionTo("hallway");
  if (action === "go-lobby") goToLobby();
  if (action === "choose-101") chooseRoom("101");
  if (action === "choose-105") chooseRoom("105");
  if (action === "use-computer") openComputerTerminal();
  if (action === "go-reading-room-entrance") goToReadingRoomEntrance();
  if (action === "enter-reading-room") enterReadingRoom();
  if (action === "inspect-b17") inspectB17Shelf();
  if (action === "inspect-lab-entrance") inspectLabEntrance();
  if (action === "inspect-infected-rats") inspectInfectedRats();
  if (action === "inspect-microscope") inspectMicroscope();
  if (action === "install-barricade") installBarricade();
  if (action === "enter-security-room") enterSecurityRoom();
  if (action === "security-guard-encounter") showSecurityGuardEncounter();
  if (action === "inspect-security-console") inspectSecurityConsole();
}

$("#new-game-button").addEventListener("click", () => startGame(true));
$("#continue-button").addEventListener("click", () => startGame(false));
$("#hotspots").addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (target && !state.paused) handleSceneAction(target.dataset.action);
});
$("#pause-button").addEventListener("click", () => {
  state.paused = true;
  $("#pause-overlay").hidden = false;
  suspendBgm();
  saveState();
});
$("#resume-button").addEventListener("click", () => {
  state.paused = false;
  $("#pause-overlay").hidden = true;
  saveState();
  startBgm();
});
$("#sound-button").addEventListener("click", toggleBgm);
$("#escape-button").addEventListener("click", escapeWrongRoom);
$("#log-button").addEventListener("click", showActivityLog);
$("#inventory-toggle").addEventListener("click", toggleInventoryPanel);
$("#modal").addEventListener("click", (event) => {
  if (event.target === $("#modal") && $("#modal [data-close-modal]")) closeModal();
});

window.setInterval(() => {
  if (!state.started || state.paused || state.failed) return;
  state.elapsed += 1;
  if (state.elapsed > 0 && state.elapsed % 90 === 0) {
    state.zombieDistance = Math.max(0, state.zombieDistance - 4);
  }
  if (state.elapsed % 5 === 0) saveState();
  render();
  if (state.zombieSurgeActive && !state.barricadeInstalled && !state.barricadeTimeoutBiteTriggered && barricadeSecondsRemaining() <= 0) {
    state.barricadeTimeoutBiteTriggered = true;
    saveState();
    triggerZombieAttack("barricade-timeout");
    return;
  }
  if (state.zombieDistance <= 0) {
    triggerZombieAttack();
    return;
  }
  if (state.elapsed >= LIMIT_SECONDS) showFailure();
}, 1000);

function registerWebMCP() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  try {
    Promise.resolve(context.registerTool({
      name: "get_survival_status",
      title: "생정융 생존 상태 확인",
      description: "현재 장소, 남은 시간, 좀비 거리, 물림 횟수와 보유 아이템을 확인합니다.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute() {
        return {
          scene: state.scene,
          remainingSeconds: Math.max(0, LIMIT_SECONDS - state.elapsed),
          zombieDistanceMeters: state.zombieDistance,
          bites: state.bites,
          inventory: state.inventory.map((id) => itemData[id].name),
        };
      },
    })).catch(() => {});
  } catch {
    // WebMCP support is optional and does not affect the game.
  }
}

loadState();
render();
updateInventoryPanel();
if (mobileLayout.addEventListener) mobileLayout.addEventListener("change", handleLayoutChange);
else mobileLayout.addListener?.(handleLayoutChange);
registerWebMCP();
