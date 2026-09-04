const $ = (selector) => document.querySelector(selector);

const STORAGE_KEY = "cnu-biozombie-chapter-01";
const LIMIT_SECONDS = 60 * 60;
const INVENTORY_CAPACITY = 12;
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
  coldStorageEntered: false,
  c07PuzzleSolved: false,
  c07PuzzleFailures: 0,
  c07PuzzleBiteTriggered: false,
  c07LockerOpened: false,
  presidentMotiveRevealed: false,
  sequenceChipCollected: false,
  bioinformaticsLabEntered: false,
  sequenceRepairBases: ["", "", "", "", ""],
  sequenceRepairSolved: false,
  sequencePuzzleFailures: 0,
  virusTargetIdentified: false,
  materialsBriefingSeen: false,
  molecularLabEntered: false,
  primerForwardSelection: "",
  primerReverseSelection: "",
  primerCollected: false,
  cellCultureLabEntered: false,
  cultureCellsCollected: false,
  reagentStorageEntered: false,
  antibodyCollected: false,
  vaccineMaterialsComplete: false,
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
    description: "2층 자료열람실",
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
  "c07-record": {
    name: "C-07 운송 기록",
    icon: "▧",
    description: "기업의 비공식 의뢰",
  },
  "damaged-sequence-chip": {
    name: "손상된 염기서열 칩",
    icon: "▦",
    description: "복원 장비가 필요하다",
  },
  "target-protein-report": {
    name: "표적 단백질 보고서",
    icon: "◎",
    description: "ZV-SPIKE 약점",
  },
  "spike-primer-set": {
    name: "ZV-SPIKE 프라이머",
    icon: "≋",
    description: "표적 유전자 증폭용",
  },
  "culture-cells": {
    name: "HEK-293 배양세포",
    icon: "◉",
    description: "항원 발현용 세포",
  },
  "neutralizing-antibody": {
    name: "중화항체 표준물질",
    icon: "Y",
    description: "anti-ZV-SPIKE RBD",
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
  coldStorage: {
    image: "assets/images/cnu-cold-storage.jpg",
    alt: "붉은 비상등과 냉동고의 푸른빛만 남은 3층 저온 시료 보관실",
    number: "08",
    name: "3층 저온 시료 보관실",
    hud: "3F · 저온 시료 보관실",
  },
  bioinformaticsLab: {
    image: "assets/images/cnu-bioinformatics-lab.jpg",
    alt: "바이러스 염기서열과 단백질 구조 화면이 켜진 어두운 생물정보 분석실",
    number: "09",
    name: "3층 생물정보 분석실",
    hud: "3F · 생물정보 분석실",
  },
  molecularBiologyLab: {
    image: "assets/images/cnu-molecular-biology-lab.jpg",
    alt: "PCR 장비와 프라이머 준비대가 남겨진 어두운 분자생물학실",
    number: "10",
    name: "분자생물학실",
    hud: "3F · 분자생물학실",
  },
  cellCultureLab: {
    image: "assets/images/cnu-cell-culture-lab.jpg",
    alt: "생물안전작업대와 배양 접시가 푸른빛에 드러난 어두운 세포배양실",
    number: "11",
    name: "세포배양실",
    hud: "2F · 세포배양실",
  },
  reagentStorage: {
    image: "assets/images/cnu-reagent-storage.jpg",
    alt: "항체 바이알이 든 냉장고에 비상등이 비치는 시약보관실",
    number: "12",
    name: "시약보관실",
    hud: "B1 · 시약보관실",
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
      ".next_location": "NEXT_LOCATION = 2층 자료열람실\nEMERGENCY_CACHE = B-17\nAUTHOR_AFFILIATION = 동물실험 연구센터\nSECURITY_LOG = 외부 검체 반입 직후 출입 기록 삭제",
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
let c07MovedMatchId = null;
let activeSequenceGap = 0;
const mobileLayout = window.matchMedia("(max-width: 560px)");
let inventoryExpanded = !mobileLayout.matches;

function freshState() {
  return {
    ...initialState,
    inventory: [...initialState.inventory],
    sequenceRepairBases: [...initialState.sequenceRepairBases],
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
      sequenceRepairBases: Array.isArray(parsed.sequenceRepairBases) && parsed.sequenceRepairBases.length === 5
        ? parsed.sequenceRepairBases
        : [...initialState.sequenceRepairBases],
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
    if (state.c07LockerOpened && !state.c07PuzzleSolved) {
      state.c07LockerOpened = false;
      state.presidentMotiveRevealed = false;
      state.inventory = state.inventory.filter((item) => item !== "c07-record");
    }
    if (state.c07LockerOpened && state.c07PuzzleSolved) {
      state.presidentMotiveRevealed = true;
      addItem("c07-record");
    }
    if (state.sequenceChipCollected) addItem("damaged-sequence-chip");
    if (state.virusTargetIdentified) {
      state.sequenceRepairSolved = true;
      addItem("target-protein-report");
    }
    if (state.primerCollected) addItem("spike-primer-set");
    if (state.cultureCellsCollected) addItem("culture-cells");
    if (state.antibodyCollected) addItem("neutralizing-antibody");
    if (state.primerCollected && state.cultureCellsCollected && state.antibodyCollected) {
      state.vaccineMaterialsComplete = true;
    }
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
  $("#item-count").textContent = `${state.inventory.length} / ${INVENTORY_CAPACITY}`;
  const cards = state.inventory.map((id) => {
    const item = itemData[id];
    const description = id === "research-fragment"
      ? state.presidentMotiveRevealed
        ? "기업 의뢰까지 확인"
        : state.cctvArchiveSolved
        ? "다음 단서: C-07"
        : state.culpritIdentified
        ? "반입자: 학생회장"
        : state.journalPuzzleSolved
        ? "과사무실 코드 확보"
        : state.journalUvRevealed
          ? "UV 염기 퍼즐"
          : "형광 반응 흔적"
      : id === "damaged-sequence-chip"
        ? state.virusTargetIdentified
          ? "SPIKE 표적 확인"
          : state.sequenceRepairSolved
            ? "아미노산 번역 필요"
            : "3층 분석실에서 복원"
      : id === "target-protein-report" && !state.vaccineMaterialsComplete
        ? `백신 재료 ${collectedMaterialCount()} / 3`
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
      ${state.cctvArchiveSolved && !(state.zombieSurgeActive && !state.barricadeInstalled) ? `
        <button class="hotspot room-hotspot cold-storage-hotspot" data-action="enter-cold-storage" type="button">
          <span class="pulse" aria-hidden="true"></span>
          <span class="hotspot-label">3층 저온 시료 보관실</span>
        </button>` : ""}
      ${state.sequenceChipCollected && !(state.zombieSurgeActive && !state.barricadeInstalled) ? `
        <button class="hotspot room-hotspot bioinformatics-lab-hotspot" data-action="enter-bioinformatics-lab" type="button">
          <span class="pulse" aria-hidden="true"></span>
          <span class="hotspot-label">3층 생물정보 분석실</span>
        </button>` : ""}
      ${state.virusTargetIdentified && !(state.zombieSurgeActive && !state.barricadeInstalled) ? `
        <button class="hotspot room-hotspot material-room-hotspot molecular-room-route${state.primerCollected ? " completed" : ""}" data-action="enter-molecular-lab" type="button">
          <span class="pulse" aria-hidden="true"></span>
          <span class="hotspot-label">${state.primerCollected ? "✓ " : ""}분자생물학실</span>
        </button>
        <button class="hotspot room-hotspot material-room-hotspot culture-room-route${state.cultureCellsCollected ? " completed" : ""}" data-action="enter-cell-culture-lab" type="button">
          <span class="pulse" aria-hidden="true"></span>
          <span class="hotspot-label">${state.cultureCellsCollected ? "✓ " : ""}세포배양실</span>
        </button>
        <button class="hotspot room-hotspot material-room-hotspot reagent-room-route${state.antibodyCollected ? " completed" : ""}" data-action="enter-reagent-storage" type="button">
          <span class="pulse" aria-hidden="true"></span>
          <span class="hotspot-label">${state.antibodyCollected ? "✓ " : ""}시약보관실</span>
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
  } else if (state.scene === "coldStorage") {
    container.innerHTML = `
      <button class="hotspot c07-locker-hotspot${state.c07PuzzleSolved ? " opened" : ""}" data-action="inspect-c07-locker" type="button">
        <span class="pulse" aria-hidden="true"></span>
        <span class="hotspot-label">${state.c07PuzzleSolved ? "C-07 증거 다시 보기" : "C-07 보관함"}</span>
      </button>
      <button class="scene-back" data-action="go-lobby" type="button">← 로비</button>`;
  } else if (state.scene === "bioinformaticsLab") {
    container.innerHTML = `
      <button class="hotspot sequence-workstation-hotspot${state.virusTargetIdentified ? " solved" : ""}" data-action="inspect-sequence-workstation" type="button">
        <span class="pulse" aria-hidden="true"></span>
        <span class="hotspot-label">${state.virusTargetIdentified ? "표적 분석 결과" : "염기서열 분석 장비"}</span>
      </button>
      <button class="scene-back" data-action="go-lobby" type="button">← 로비</button>`;
  } else if (state.scene === "molecularBiologyLab") {
    container.innerHTML = `
      <button class="hotspot material-station-hotspot primer-station${state.primerCollected ? " solved" : ""}" data-action="inspect-primer-station" type="button">
        <span class="pulse" aria-hidden="true"></span>
        <span class="hotspot-label">${state.primerCollected ? "프라이머 확보 완료" : "PCR 프라이머 준비대"}</span>
      </button>
      <button class="scene-back" data-action="go-lobby" type="button">← 로비</button>`;
  } else if (state.scene === "cellCultureLab") {
    container.innerHTML = `
      <button class="hotspot material-station-hotspot culture-station${state.cultureCellsCollected ? " solved" : ""}" data-action="inspect-culture-station" type="button">
        <span class="pulse" aria-hidden="true"></span>
        <span class="hotspot-label">${state.cultureCellsCollected ? "배양세포 확보 완료" : "세포 배양 작업대"}</span>
      </button>
      <button class="scene-back" data-action="go-lobby" type="button">← 로비</button>`;
  } else if (state.scene === "reagentStorage") {
    container.innerHTML = `
      <button class="hotspot material-station-hotspot antibody-station${state.antibodyCollected ? " solved" : ""}" data-action="inspect-antibody-storage" type="button">
        <span class="pulse" aria-hidden="true"></span>
        <span class="hotspot-label">${state.antibodyCollected ? "항체 확보 완료" : "항체 냉장고"}</span>
      </button>
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
  $("#modal").classList.remove("terminal-modal", "evidence-modal", "microscope-modal", "match-puzzle-modal", "sequence-analyzer-modal", "materials-modal");
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
        <p>저는 생명대 동물실험 연구센터에서 일하는 대학원생입니다.</p>
        <p>오늘 오후, 등록되지 않은 냉각 상자 하나가 외부에서 반입됐습니다. 보관 기록을 확인하던 중 그 안의 바이러스가 신고된 검체와 다르다는 것을 알게 <span class="corrupt">되0ㅓ</span> 격리를 시도했습니다.</p>
        <p>하지만 누군가 격리 장치를 해제했고 감염이 건물 전체로 번졌습니다. 다만 <span class="corrupt">ㅇ1</span> 바이러스는 공기 중으로는 전파되지 않는 것 같습니다.</p>
        <p>반입자의 신원은 건물 기록 어딘가에 남아 있을 겁니다. 감염 직전, 아래층 컴퓨터실에 조사 기록의 위치를 숨겼습니다.<br />그 기록을 따라 검체 원본을 찾고 백신을 만들어 주세요.</p>
        <p class="faded">컴퓨터실… 호수는 문장 속에… 더는 시간이…</p>
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
  setActivity("숨김 파일에서 다음 장소를 찾았다: 2층 자료열람실 B-17 비상 물자함.");
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
    terminalLines.push({ text: "복구 완료: 다음 장소는 2층 자료열람실 B-17 비상 물자함이다.", type: "success" });
  }
  showModal(modalFrame({
    code: "PC-101 · LOCAL STORAGE",
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
      ? "자료열람실 밖으로 나오자 복구된 비상 전원이 켜지고, 왼쪽 동물실험 연구센터 문이 열린다. 안쪽에서 빛이 희미하게 반짝인다."
      : "자료열람실 출입문 앞으로 돌아왔다.");
  } else if (state.scene === "animalResearchCenter") {
    setActivity(state.zombieSurgeActive
      ? "2층 복도로 나왔다. 아래층에서 수많은 발소리와 비명이 들린다. 1층 로비로 서둘러야 한다."
      : "동물실험 연구센터에서 빠져나와 2층 복도로 돌아왔다. 감염된 실험쥐들의 울음소리가 문 너머로 들린다.");
  } else {
    setActivity("터미널에서 복구한 기록을 따라 2층 212호 자료열람실의 B-17 비상 물자함을 찾으러 왔다.");
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
  setActivity("편지 작성자의 소속으로 기록된 동물실험 연구센터에 도착했다. 손상된 케이지 주변에 감염된 실험쥐들이 모여 있다.");
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
        <div><small>편지 서명 · 101호 복구 로그</small><strong>동물실험 연구센터</strong></div>
        <b>MATCH</b>
      </div>
      <p class="result-copy">편지에 적힌 소속과 컴퓨터에서 복구한 기록이 일치한다.<br />사람이 사라진 연구실에는 깨진 케이지와 중단된 현미경만 남아 있다.</p>`,
  }));
}

function inspectInfectedRats() {
  state.infectedRatsInspected = true;
  setActivity("케이지 기록을 확인했다. 첫 사람 감염 18분 전부터 실험쥐의 이상 행동이 기록되어 있다.");
  saveState();
  render();
  showModal(modalFrame({
    code: "BIOHAZARD · INFECTED SUBJECTS",
    title: "감염된 실험쥐",
    body: `
      <div class="result-mark danger-mark" aria-hidden="true">☣</div>
      <div class="incident-timeline" aria-label="감염 사건 시간 기록">
        <div><small>첫 사람 감염 18분 전</small><strong>실험쥐 이상 행동</strong></div>
        <span aria-hidden="true">→</span>
        <div class="danger"><small>사고 발생</small><strong>첫 사람 감염</strong></div>
      </div>
      <p class="result-copy">탁한 눈, 공격성 증가, 케이지 파손.<br />외부 검체가 들어온 뒤 실험쥐가 먼저 노출되고, 곧 사람에게도 감염이 번진 것으로 보인다.</p>`,
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
    <p class="microscope-intro">누군가 관찰하다 멈춘 바이러스 감염 쥐의 조직 표본이다. 살펴보자.</p>
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
            <p><span>RECOVERY KEY</span> 격리 제어 단말과 연결된 오프라인 사건 기록의 복구 문구다.</p>
            <img src="assets/images/drawer-word-puzzle-v2.jpg" alt="N E W D O O R 일곱 글자를 모두 재조합해 보안 문구를 만드는 생물안전 기록지" />
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
      <div class="system-cascade" aria-label="사건 기록 복구와 격리문 연동 상태">
        <div><span>✓</span><small>INCIDENT ARCHIVE</small><strong>사건 기록 복구 완료</strong></div>
        <div class="danger"><span>!</span><small>QUARANTINE GATE · 1F</small><strong>격리문 연동 해제</strong></div>
      </div>
      <div class="zombie-surge-visual">
        <img src="assets/images/cnu-zombie-chase.jpg" alt="1층 복도를 가득 메우며 몰려오는 대규모 좀비 무리" />
        <div aria-hidden="true"><strong>1F</strong><span>감염체 신호 폭증</span></div>
      </div>
      <p class="result-copy"><strong>ONE WORD는 오프라인 사건 기록의 복구 문구였다.</strong><br />하지만 같은 비상 회로에 연결된 1층 격리문까지 함께 열려 버렸다. 감염체들이 로비로 몰려든다.</p>
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
    <div class="story-evidence culprit-evidence"><span class="story-evidence-icon" aria-hidden="true">!</span><div><small>샘플 반입 · 격리 해제 계정 일치</small><strong>생정융 학생회장</strong></div><b>CULPRIT CONFIRMED</b></div>
    <div class="cctv-culprit-still">
      <img src="assets/images/cctv-student-president-silhouette.jpg" alt="냉각 상자를 들고 과사무실 복도를 지나는 중단발 여성 학생회장의 실루엣이 찍힌 CCTV 화면" />
      <div><span>CAM 04 · IDENTITY MATCH</span><strong>생정융 학생회장</strong><small>기업탐방 명단 · 학생회 완장 · 관리자 계정 일치</small></div>
      <b>MATCH 98%</b>
    </div>
    <div class="cctv-recovery-rule"><small>BIO-ARCHIVE RECOVERY · BLAST</small><strong>냉각 상자에서 검출된 바이러스 서열과 가장 신뢰도 높게 일치하는 보관 샘플을 찾아라.</strong><p>Query cover와 Identity는 높을수록, E-value는 0에 가까울수록 신뢰도가 높다. Sample ID는 저온 보관함 번호와 같다.</p></div>
    <div class="blast-query-card"><span>QUERY · OUTBREAK_SAMPLE</span><code>ATGGCCTTTGAACCTGGTTGCTAACGATCGTACGTA</code><small>Sequence preview: 36 / 1,284 bp · nucleotide BLAST</small></div>
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
      <p class="result-copy cctv-result-copy">현장 검체와 완전히 일치한 C-07 샘플은 3층 저온 보관함에 등록되어 있다. 같은 시각, 학생회장의 관리자 계정으로 <strong>C-07 보관함</strong>이 열린 출입 로그도 복구됐다.</p>` : `
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
    ? "BLAST 결과와 출입 로그가 학생회장이 사용한 3층 저온 시료 보관실 C-07을 가리킨다."
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
  setActivity("BLAST에서 현장 바이러스와 일치하는 C-07 샘플을 찾았고, 같은 보관함을 연 학생회장의 출입 로그도 복구했다.");
  saveState();
  render();
  inspectSecurityConsole();
}

function enterColdStorage() {
  if (!state.cctvArchiveSolved) return;
  const firstEntry = !state.coldStorageEntered;
  state.coldStorageEntered = true;
  setActivity(state.c07LockerOpened
    ? "3층 저온 시료 보관실로 돌아왔다. C-07에서 확보한 운송 기록을 다시 확인할 수 있다."
    : "BLAST 결과가 가리킨 3층 저온 시료 보관실에 도착했다. 냉동고들 사이에서 C-07을 찾아야 한다.");
  saveState();
  closeModal();
  transitionTo("coldStorage");
  if (firstEntry) {
    window.setTimeout(() => {
      if (state.scene !== "coldStorage" || state.c07LockerOpened) return;
      showModal(modalFrame({
        code: "LOCATION 08 · −80°C ARCHIVE",
        title: "C-07을 찾아라",
        body: `
          <div class="cold-storage-status" aria-label="저온 시료 보관실 상태">
            <div><small>현재 구역</small><strong>3F 저온 보관실</strong></div>
            <div><small>보관 온도</small><strong>−80°C</strong></div>
            <div><small>추적 대상</small><strong>C-07</strong></div>
          </div>
          <p class="result-copy">문이 열리자 서리가 낀 냉동고들이 줄지어 나타난다.<br />학생회장의 마지막 출입 로그와 일치하는 보관함을 조사하자.</p>`,
      }));
    }, 380);
  }
}

function c07MatchPuzzleBody() {
  const warning = state.c07PuzzleFailures === 1
    ? `<div class="match-zombie-warning"><span aria-hidden="true">!</span><p><strong>뒤쪽 통로에서 발소리가 들린다.</strong><br />좀비가 냉동고 사이로 다가오고 있다.</p></div>`
    : "";
  const matches = [
    ["one-upper", "1번 성냥개비", "vertical", 27, 33, 0],
    ["one-lower", "2번 성냥개비", "vertical", 27, 68, 0],
    ["zero-top", "3번 성냥개비", "horizontal", 68, 16, 90],
    ["zero-upper-left", "4번 성냥개비", "vertical", 57, 33, 0],
    ["zero-upper-right", "5번 성냥개비", "vertical", 79, 33, 0],
    ["zero-lower-left", "6번 성냥개비", "vertical", 57, 68, 0],
    ["zero-lower-right", "7번 성냥개비", "vertical", 79, 68, 0],
    ["zero-bottom", "8번 성냥개비", "horizontal", 68, 85, 90],
  ];
  return `
    <div class="match-lock-heading"><span>▧</span><div><small>C-07 MECHANICAL LOCK</small><strong>성냥개비 하나를 움직여 10의 반을 만들어라.</strong></div></div>
    <p class="match-puzzle-guide">성냥개비를 직접 끌어 옮기고, 선택한 성냥은 <strong>90° 회전</strong> 버튼으로 돌릴 수 있다.</p>
    ${warning}
    <div class="match-board" id="c07-match-board" aria-label="성냥개비로 만들어진 숫자 10">
      <span class="match-board-number" aria-hidden="true">10</span>
      <div class="match-drop-target" id="c07-match-target" aria-hidden="true"></div>
      ${matches.map(([id, label, orientation, left, top, rotation]) => `
        <button class="matchstick ${orientation}" id="match-${id}" type="button" data-match-id="${id}" data-base-rotation="${rotation}" style="--match-left:${left}%;--match-top:${top}%" aria-label="${label}">
          <i></i>
        </button>`).join("")}
    </div>
    <div class="match-controls">
      <button type="button" data-rotate-match>↻ 90° 회전</button>
      <button type="button" data-reset-match>원위치</button>
      <button class="match-check" type="button" data-check-match>잠금 해제</button>
    </div>
    <p class="match-feedback${state.c07PuzzleFailures === 1 ? " danger" : ""}" id="c07-match-feedback" aria-live="polite">${state.c07PuzzleFailures === 1 ? "다음 오답에는 경고음이 울린다." : "성냥개비 하나만 움직일 수 있다."}</p>`;
}

function openC07MatchPuzzle() {
  c07MovedMatchId = null;
  showModal(modalFrame({
    code: "C-07 · MECHANICAL LOCK",
    title: "성냥개비 잠금 장치",
    body: c07MatchPuzzleBody(),
  }));
  $("#modal").classList.add("evidence-modal", "match-puzzle-modal");
  initializeC07MatchPuzzle();
}

function initializeC07MatchPuzzle() {
  document.querySelectorAll("[data-match-id]").forEach((match) => {
    match.dataset.rotation = "0";
    match.dataset.dragging = "false";
    match.addEventListener("pointerdown", startC07MatchDrag);
    match.addEventListener("pointermove", moveC07MatchDrag);
    match.addEventListener("pointerup", endC07MatchDrag);
    match.addEventListener("pointercancel", endC07MatchDrag);
  });
  $("[data-rotate-match]").addEventListener("click", rotateC07Match);
  $("[data-reset-match]").addEventListener("click", resetC07MatchPuzzle);
  $("[data-check-match]").addEventListener("click", checkC07MatchSolution);
}

function selectC07Match(match) {
  if (c07MovedMatchId && c07MovedMatchId !== match.dataset.matchId) resetC07MatchPuzzle();
  c07MovedMatchId = match.dataset.matchId;
  document.querySelectorAll("[data-match-id]").forEach((item) => item.classList.toggle("selected", item === match));
}

function positionC07Match(match, clientX, clientY) {
  const board = $("#c07-match-board");
  const rect = board.getBoundingClientRect();
  const x = Math.max(12, Math.min(rect.width - 12, clientX - rect.left));
  const y = Math.max(12, Math.min(rect.height - 12, clientY - rect.top));
  match.style.left = `${x}px`;
  match.style.top = `${y}px`;
  match.style.setProperty("--drag-rotation", `${Number(match.dataset.rotation || 0)}deg`);
  match.dataset.moved = "true";
}

function startC07MatchDrag(event) {
  event.preventDefault();
  selectC07Match(event.currentTarget);
  event.currentTarget.dataset.dragging = "true";
  event.currentTarget.setPointerCapture?.(event.pointerId);
  positionC07Match(event.currentTarget, event.clientX, event.clientY);
}

function moveC07MatchDrag(event) {
  if (event.currentTarget.dataset.dragging !== "true") return;
  event.preventDefault();
  positionC07Match(event.currentTarget, event.clientX, event.clientY);
}

function endC07MatchDrag(event) {
  event.currentTarget.dataset.dragging = "false";
  event.currentTarget.releasePointerCapture?.(event.pointerId);
}

function rotateC07Match() {
  if (!c07MovedMatchId) {
    $("#c07-match-feedback").textContent = "먼저 옮길 성냥개비를 선택하자.";
    return;
  }
  const match = $(`[data-match-id="${c07MovedMatchId}"]`);
  match.dataset.rotation = String((Number(match.dataset.rotation || 0) + 90) % 360);
  match.style.setProperty("--drag-rotation", `${match.dataset.rotation}deg`);
  match.dataset.moved = "true";
}

function resetC07MatchPuzzle() {
  c07MovedMatchId = null;
  document.querySelectorAll("[data-match-id]").forEach((match) => {
    match.classList.remove("selected");
    match.style.removeProperty("left");
    match.style.removeProperty("top");
    match.style.removeProperty("--drag-rotation");
    match.dataset.rotation = "0";
    match.dataset.moved = "false";
    match.dataset.dragging = "false";
  });
  const feedback = $("#c07-match-feedback");
  if (feedback) feedback.textContent = "성냥개비 하나만 움직일 수 있다.";
}

function c07MatchIsInTarget(match) {
  const matchRect = match.getBoundingClientRect();
  const targetRect = $("#c07-match-target").getBoundingClientRect();
  const matchX = matchRect.left + matchRect.width / 2;
  const matchY = matchRect.top + matchRect.height / 2;
  return matchX >= targetRect.left && matchX <= targetRect.right
    && matchY >= targetRect.top && matchY <= targetRect.bottom;
}

function checkC07MatchSolution() {
  const feedback = $("#c07-match-feedback");
  const match = c07MovedMatchId ? $(`[data-match-id="${c07MovedMatchId}"]`) : null;
  const rotation = match ? Number(match.dataset.rotation || 0) % 180 : 0;
  const correct = match
    && match.dataset.matchId === "zero-bottom"
    && match.dataset.moved === "true"
    && rotation === 0
    && c07MatchIsInTarget(match);

  if (correct) {
    const boardRect = $("#c07-match-board").getBoundingClientRect();
    const targetRect = $("#c07-match-target").getBoundingClientRect();
    match.style.left = `${targetRect.left + targetRect.width / 2 - boardRect.left}px`;
    match.style.top = `${targetRect.top + targetRect.height / 2 - boardRect.top}px`;
    match.style.setProperty("--drag-rotation", "0deg");
    match.classList.remove("selected");
    state.c07PuzzleSolved = true;
    state.c07LockerOpened = true;
    state.presidentMotiveRevealed = true;
    addItem("c07-record");
    setActivity("성냥개비를 옮겨 10의 반인 5를 만들었다. C-07 잠금이 해제되고 내부 기록이 복구됐다.");
    saveState();
    render();
    $("#c07-match-board").classList.add("solved");
    feedback.classList.remove("danger");
    feedback.classList.add("success");
    feedback.textContent = "10 ÷ 2 = 5 · C-07 잠금 해제";
    document.querySelectorAll("[data-match-id], [data-rotate-match], [data-reset-match], [data-check-match]").forEach((control) => { control.disabled = true; });
    window.setTimeout(inspectC07Locker, 700);
    return;
  }

  state.c07PuzzleFailures += 1;
  state.zombieDistance = Math.max(12, state.zombieDistance - 18);
  setActivity("C-07 성냥개비 잠금 해제에 실패했다. 뒤쪽 냉동고 사이에서 좀비의 발소리가 가까워진다.");
  saveState();
  if (navigator.vibrate) navigator.vibrate([80, 50, 120]);

  if (state.c07PuzzleFailures >= 2 && !state.c07PuzzleBiteTriggered) {
    state.c07PuzzleBiteTriggered = true;
    saveState();
    triggerZombieAttack("c07-puzzle");
    return;
  }

  resetC07MatchPuzzle();
  feedback.classList.add("danger");
  feedback.textContent = state.c07PuzzleBiteTriggered
    ? "잠금 장치가 반응하지 않는다. 성냥개비의 위치와 방향을 다시 확인하자."
    : "뒤에서 발소리가 들린다. 한 번 더 틀리면 좀비가 따라잡는다.";
  if (!state.c07PuzzleBiteTriggered) {
    const warning = document.createElement("div");
    warning.className = "match-zombie-warning live";
    warning.innerHTML = `<span aria-hidden="true">!</span><p><strong>뒤쪽 통로에서 움직임 감지</strong><br />좀비가 냉동고 사이로 다가오고 있다.</p>`;
    $("#c07-match-board").before(warning);
  }
}

function c07EvidenceBody() {
  return `
    <div class="c07-evidence-visual">
      <img src="assets/images/c07-locker-evidence.jpg" alt="C-07 냉동고 안의 파손된 운송 상자, 빈 바이알 랙, 붉은 학생회 표식, 휴대전화와 손상된 데이터 칩" />
      ${state.sequenceChipCollected ? `
        <span class="chip-collected-badge">✓ 염기서열 칩 수집 완료</span>` : `
        <button class="c07-chip-hotspot" type="button" data-collect-sequence-chip aria-label="손상된 염기서열 칩 수집">
          <b aria-hidden="true">▦</b><em>손상된 염기서열 칩</em>
        </button>`}
      <div><span>COLD LOCKER · C-07</span><strong>비공식 운송 증거 발견</strong><small>빈 바이알 슬롯 · 학생회 표식 · 삭제된 통신 기록</small></div>
    </div>
    <div class="story-evidence culprit-evidence"><span class="story-evidence-icon" aria-hidden="true">▧</span><div><small>가상 기업 HXB 바이오 · 비공식 의뢰</small><strong>C-07 시험용 바이러스 벡터 운송</strong></div><b>MOTIVE FOUND</b></div>
    <div class="evidence-messenger" aria-label="기업 담당자와 학생회장 사이에서 복구된 메신저 대화">
      <header class="messenger-topbar">
        <span class="messenger-avatar company" aria-hidden="true">H</span>
        <div><strong>HXB 바이오 · 연구협력팀</strong><small>암호화 채널에서 삭제된 대화 9개 복구</small></div>
        <b>OFFLINE</b>
      </header>
      <div class="messenger-day"><span>기업 탐방 당일</span></div>
      <div class="message-thread">
        <article class="chat-row incoming">
          <span class="messenger-avatar company" aria-hidden="true">H</span>
          <div><small>기업 담당자</small><p>아까 협의한 <strong>C-07 냉각 상자</strong>, 오늘 복귀 차량에 실어 주시면 됩니다. 회사 차량으로 학교에 보내면 반출 기록이 남아서 곤란합니다.</p><time>13:12</time></div>
        </article>
        <article class="chat-row outgoing">
          <div><small>생정융 학생회장</small><p>공식 승인서도 없이 제가 직접 가져가야 하나요? 학과에서 상자 안을 확인하면 설명할 방법이 없어요.</p><time>13:14</time></div>
          <span class="messenger-avatar president" aria-hidden="true">회</span>
        </article>
        <article class="chat-row incoming">
          <span class="messenger-avatar company" aria-hidden="true">H</span>
          <div><small>기업 담당자</small><p>서류는 나중에 처리하겠습니다. 감염성이 제거된 <strong>교육용 바이러스 벡터</strong>라 위험하지 않습니다. 이번 일만 끝나면 약속한 인턴 자리와 임원 추천서도 확정하죠.</p><time>13:15</time></div>
        </article>
        <article class="chat-row outgoing">
          <div><small>생정융 학생회장</small><p>복귀 버스에서 내렸습니다. 상자는 동물실험 연구센터 냉장 구역에 잠시 두었어요. 아무도 반입 장면은 못 본 것 같습니다.</p><time>13:52</time></div>
          <span class="messenger-avatar president" aria-hidden="true">회</span>
        </article>
        <div class="message-system"><span>삭제된 메시지 조각 복원 · 82%</span></div>
        <article class="chat-row outgoing danger">
          <div><small>생정융 학생회장</small><p>방금 실험쥐들이 심하게 경련하고 공격성을 보였어요. 상자 라벨의 서열 코드도 탐방 때 받은 명세서와 다릅니다. <strong>지금 신고하고 격리하겠습니다.</strong></p><time>14:26</time></div>
          <span class="messenger-avatar president" aria-hidden="true">회</span>
        </article>
        <article class="chat-row incoming danger">
          <span class="messenger-avatar company" aria-hidden="true">H</span>
          <div><small>기업 담당자</small><p>외부에 알리지 마세요. 단순한 운송 스트레스일 수 있습니다. C-07을 회수하고, 당신 계정으로 남은 반입·출입 기록부터 삭제하세요.</p><time>14:27</time></div>
        </article>
        <article class="chat-row outgoing danger">
          <div><small>생정융 학생회장</small><p>이미 자동 격리 경보가 시작됐고 연구센터 대학원생 한 명이 기록을 확인했습니다. 이 상태에서 장치를 끄면 더 위험해질 수 있어요.</p><time>14:28</time></div>
          <span class="messenger-avatar president" aria-hidden="true">회</span>
        </article>
        <article class="chat-row incoming danger critical">
          <span class="messenger-avatar company" aria-hidden="true">H</span>
          <div><small>기업 담당자</small><p>공식 보고가 올라가면 채용 제안과 추천은 전부 취소됩니다. 상자를 반입한 사람도 당신입니다. <strong>과사무실 관리자 계정으로 격리를 해제하고 C-07로 옮기세요.</strong></p><time>14:29</time></div>
        </article>
        <article class="chat-row outgoing danger critical">
          <div><small>생정융 학생회장</small><p>알겠습니다. 경보를 끄고 저온 보관실로 옮기겠습니다. 이동이 끝나면 이 대화도 삭제할게요.</p><time>14:30 · 읽음</time></div>
          <span class="messenger-avatar president" aria-hidden="true">회</span>
        </article>
        <div class="message-system breach"><span>14:31 · 1층 격리 장치 해제</span><span>14:44 · 최초 인체 감염 기록</span></div>
      </div>
      <footer class="messenger-recovery"><span>▥</span><p><small>RECOVERY SOURCE</small><strong>C-07 내부 단말기 로컬 캐시</strong></p><b>무결성 94%</b></footer>
    </div>
    <div class="culprit-conclusion">
      <div><small>처음의 선택</small><strong>채용 제안을 받고 미등록 검체 반입</strong></div>
      <span aria-hidden="true">→</span>
      <div class="danger"><small>결정적 은폐</small><strong>이상 반응 뒤에도 격리 해제·기록 삭제</strong></div>
    </div>
    <p class="result-copy c07-result-copy">학생회장은 처음에는 C-07이 안전하다는 기업의 말을 믿었다. 하지만 감염 징후를 확인한 뒤에도 자신의 반입 사실을 숨기기 위해 격리 장치를 껐다. <strong>그 은폐가 바이러스를 건물 전체로 퍼뜨렸다.</strong></p>
    <div class="emergency-protocol"><small>NEXT TRACE · DAMAGED SEQUENCE CHIP</small><strong>${state.sequenceChipCollected ? "칩의 시스템 경로가 3층 생물정보 분석실을 가리킨다. 로비로 돌아가 분석 장비를 찾자." : "보관함 사진 속 손상된 염기서열 칩을 눌러 수집하자. 백신 제작에 필요한 원본 서열이 남아 있을 수 있다."}</strong></div>`;
}

function bindC07EvidenceActions() {
  const chipButton = $("[data-collect-sequence-chip]");
  if (chipButton) chipButton.addEventListener("click", collectSequenceChip);
}

function collectSequenceChip() {
  if (state.sequenceChipCollected) return;
  state.sequenceChipCollected = true;
  state.selectedItem = "damaged-sequence-chip";
  addItem("damaged-sequence-chip");
  setActivity("C-07에서 손상된 염기서열 칩을 수집했다. 시스템 경로는 3층 생물정보 분석실을 가리킨다.");
  saveState();
  render();
  inspectC07Locker();
}

function inspectC07Locker() {
  if (!state.cctvArchiveSolved) return;
  if (!state.c07PuzzleSolved) {
    openC07MatchPuzzle();
    return;
  }
  if (!state.c07LockerOpened) {
    state.c07LockerOpened = true;
    state.presidentMotiveRevealed = true;
    addItem("c07-record");
    setActivity("C-07에서 기업의 채용 제안과 학생회장의 격리 해제 지시를 복구했다. 은폐가 감염 확산의 결정적 원인이었다.");
    saveState();
    render();
  }
  showModal(modalFrame({
    code: "C-07 · DELETED RECORD RECOVERED",
    title: "학생회장의 선택",
    body: c07EvidenceBody(),
  }));
  $("#modal").classList.add("evidence-modal");
  bindC07EvidenceActions();
}

function enterBioinformaticsLab() {
  if (!state.sequenceChipCollected) return;
  const firstEntry = !state.bioinformaticsLabEntered;
  state.bioinformaticsLabEntered = true;
  setActivity(state.virusTargetIdentified
    ? "생물정보 분석실로 돌아왔다. 복원된 바이러스 표적 단백질 보고서를 다시 확인할 수 있다."
    : "손상된 염기서열 칩을 가지고 3층 생물정보 분석실에 도착했다. 중앙 분석 장비가 대기 중이다.");
  saveState();
  closeModal();
  transitionTo("bioinformaticsLab");
  if (firstEntry) {
    window.setTimeout(() => {
      if (state.scene !== "bioinformaticsLab" || state.virusTargetIdentified) return;
      showModal(modalFrame({
        code: "LOCATION 09 · GENOME ANALYSIS",
        title: "바이러스 원본 확보",
        body: `
          <div class="bioinfo-entry-status"><span>▦</span><div><small>RECOVERED MEDIA</small><strong>손상된 C-07 염기서열 칩</strong></div><b>READABLE 61%</b></div>
          <p class="result-copy">서버는 살아 있지만 칩의 핵심 염기 다섯 개가 훼손되어 있다.<br />중앙 분석 장비에 칩을 연결해 원본 서열을 복원하자.</p>`,
      }));
    }, 380);
  }
}

function showSequenceChipItem() {
  showModal(modalFrame({
    code: "ITEM · DAMAGED GENOME CHIP",
    title: "손상된 염기서열 칩",
    body: `
      <div class="sequence-chip-card" aria-hidden="true"><span>▦</span><i></i><i></i><i></i><b>C-07</b></div>
      <p class="result-copy">C-07 내부 단말기에서 분리한 저장 칩이다.<br />바이러스 원본 서열의 일부가 남아 있지만 다섯 개의 염기가 손상됐다.</p>
      <div class="status-grid"><div><small>데이터 상태</small><strong>${state.virusTargetIdentified ? "복원 완료" : state.sequenceRepairSolved ? "서열 복원" : "61% 판독"}</strong></div><div><small>분석 위치</small><strong>3층 생물정보 분석실</strong></div><div><small>목표</small><strong>${state.virusTargetIdentified ? "SPIKE" : "표적 단백질"}</strong></div></div>`,
  }));
}

function renderRepairCodons() {
  const codingCodons = [["T", 0, "T"], ["C", 1, "T"], ["A", 2, "T"], ["A", "A", 3], ["G", 4, "A"]];
  const templateCodons = ["AGA", "GGA", "TAA", "TTT", "CTT"];
  return codingCodons.map((codon, codonIndex) => `
    <section class="repair-codon-pair" aria-label="코돈 ${codonIndex + 1}">
      <small>CODON ${String(codonIndex + 1).padStart(2, "0")}</small>
      <div class="repair-codon coding"><i>5′</i>${codon.map((base) => typeof base === "number"
        ? `<button class="repair-gap${activeSequenceGap === base ? " active" : ""}${state.sequenceRepairBases[base] ? " filled" : ""}" type="button" data-sequence-gap="${base}" aria-label="손상된 염기 ${base + 1}">${state.sequenceRepairBases[base] || "?"}</button>`
        : `<b class="base base-${base.toLowerCase()}">${base}</b>`).join("")}<i>3′</i></div>
      <span class="codon-bonds" aria-hidden="true">⋮&nbsp;⋮&nbsp;⋮</span>
      <div class="repair-codon template"><i>3′</i>${renderDnaBases(templateCodons[codonIndex])}<i>5′</i></div>
    </section>`).join("");
}

function sequenceRepairBody() {
  return `
    <div class="genome-console-header"><span>▦</span><div><small>C-07 ORIGINAL GENOME · 61% RECOVERED</small><strong>훼손된 이중가닥 DNA 복원</strong></div><b>STEP 1 / 2</b></div>
    <div class="genome-stage-progress"><i class="active"></i><i></i><span>DNA 복원</span><span>단백질 번역</span></div>
    <div class="base-pair-rule compact" aria-label="DNA 상보적 염기쌍 규칙"><span><b class="base base-a">A</b> ↔ <b class="base base-t">T</b></span><span><b class="base base-g">G</b> ↔ <b class="base base-c">C</b></span></div>
    <p class="sequence-guide">아래쪽 주형 가닥을 이용해 위쪽 암호화 가닥의 <strong>물음표 다섯 곳</strong>을 복원하라.</p>
    <div class="sequence-pair-board">${renderRepairCodons()}</div>
    <div class="sequence-base-picker" aria-label="복원할 DNA 염기 선택">
      <small>선택한 빈칸에 넣을 염기</small>
      <div>${["A", "T", "G", "C"].map((base) => `<button class="base-choice base-${base.toLowerCase()}" type="button" data-sequence-base="${base}">${base}</button>`).join("")}</div>
    </div>
    <button class="primary-button sequence-run-button" type="button" data-check-sequence-repair>복원 서열 검증 <span>→</span></button>
    <p class="sequence-feedback" id="sequence-repair-feedback" aria-live="polite">DNA에서는 A–T, G–C가 서로 마주 본다.</p>`;
}

function sequenceTranslationBody() {
  const codonReference = [
    ["GAA", "Glutamate"],
    ["AUU", "Isoleucine"],
    ["CCU", "Proline"],
    ["AAA", "Lysine"],
    ["UCU", "Serine"],
  ];
  return `
    <div class="genome-console-header"><span>✓</span><div><small>C-07 ORIGINAL GENOME · REPAIRED</small><strong>복원 서열 단백질 번역</strong></div><b>STEP 2 / 2</b></div>
    <div class="genome-stage-progress"><i class="complete"></i><i class="active"></i><span>DNA 복원</span><span>단백질 번역</span></div>
    <div class="translation-flow">
      <div><small>CODING DNA · 5′ → 3′</small><strong>TCT · CCT · ATT · AAA · GAA</strong></div>
      <span>전사<br />↓</span>
      <div><small>mRNA · 5′ → 3′</small><strong>UCU · CCU · AUU · AAA · GAA</strong></div>
    </div>
    <p class="sequence-guide">mRNA 코돈을 왼쪽부터 번역하고, 아미노산의 <strong>1-letter code</strong>를 이어 붙여 표적 이름을 찾아라.</p>
    <div class="codon-reference" aria-label="분석 서버에서 복구한 코돈표 일부">
      ${codonReference.map(([codon, name]) => `<div><code>${codon}</code><span>${name}</span></div>`).join("")}
    </div>
    <form class="answer-form target-protein-form" id="target-protein-form" autocomplete="off">
      <label for="target-protein-answer">표적 단백질 식별 코드 · 5 LETTERS</label>
      <div><input id="target-protein-answer" name="answer" type="text" inputmode="text" autocapitalize="characters" spellcheck="false" maxlength="5" placeholder="?????" aria-describedby="target-protein-feedback" /><button type="submit">분석</button></div>
      <p id="target-protein-feedback" aria-live="polite">코돈표는 순서가 섞여 있다. mRNA 순서대로 찾은 뒤 각 아미노산의 표준 1-letter code를 직접 변환하자.</p>
    </form>`;
}

function openSequenceAnalyzer() {
  if (!state.sequenceChipCollected) return;
  if (state.virusTargetIdentified) {
    showTargetProteinReport();
    return;
  }
  activeSequenceGap = Math.max(0, state.sequenceRepairBases.findIndex((base) => !base));
  showModal(modalFrame({
    code: "GENOME RECOVERY · C-07",
    title: state.sequenceRepairSolved ? "표적 단백질 탐색" : "바이러스 원본 확보",
    body: state.sequenceRepairSolved ? sequenceTranslationBody() : sequenceRepairBody(),
  }));
  $("#modal").classList.add("evidence-modal", "sequence-analyzer-modal");
  document.querySelectorAll("[data-sequence-gap]").forEach((button) => button.addEventListener("click", () => selectSequenceGap(Number(button.dataset.sequenceGap))));
  document.querySelectorAll("[data-sequence-base]").forEach((button) => button.addEventListener("click", () => assignSequenceBase(button.dataset.sequenceBase)));
  const repairButton = $("[data-check-sequence-repair]");
  if (repairButton) repairButton.addEventListener("click", checkSequenceRepair);
  const translationForm = $("#target-protein-form");
  if (translationForm) {
    translationForm.addEventListener("submit", checkTargetProteinAnswer);
    $("#target-protein-answer").focus();
  }
}

function selectSequenceGap(index) {
  activeSequenceGap = index;
  document.querySelectorAll("[data-sequence-gap]").forEach((button) => button.classList.toggle("active", Number(button.dataset.sequenceGap) === index));
}

function assignSequenceBase(base) {
  state.sequenceRepairBases[activeSequenceGap] = base;
  saveState();
  const gap = $(`[data-sequence-gap="${activeSequenceGap}"]`);
  if (gap) {
    gap.textContent = base;
    gap.classList.add("filled");
    gap.classList.remove("wrong");
  }
  const nextEmpty = state.sequenceRepairBases.findIndex((value) => !value);
  if (nextEmpty >= 0) selectSequenceGap(nextEmpty);
  const feedback = $("#sequence-repair-feedback");
  if (feedback) feedback.textContent = nextEmpty >= 0 ? `남은 손상 염기: ${state.sequenceRepairBases.filter((value) => !value).length}개` : "모든 빈칸을 채웠다. 복원 서열을 검증하자.";
}

function checkSequenceRepair() {
  const expected = ["C", "C", "T", "A", "A"];
  const feedback = $("#sequence-repair-feedback");
  const complete = state.sequenceRepairBases.every(Boolean);
  const correct = complete && state.sequenceRepairBases.every((base, index) => base === expected[index]);
  if (!correct) {
    state.sequencePuzzleFailures += 1;
    saveState();
    document.querySelectorAll("[data-sequence-gap]").forEach((button) => {
      const index = Number(button.dataset.sequenceGap);
      button.classList.toggle("wrong", Boolean(state.sequenceRepairBases[index]) && state.sequenceRepairBases[index] !== expected[index]);
    });
    feedback.classList.add("error");
    feedback.textContent = complete ? "상보적이지 않은 염기가 남아 있다. 각 세로 위치를 다시 비교하자." : "아직 복원하지 않은 염기가 있다.";
    if (navigator.vibrate) navigator.vibrate(100);
    return;
  }
  state.sequenceRepairSolved = true;
  setActivity("상보적 염기쌍을 이용해 C-07 바이러스의 손상된 DNA 서열을 복원했다. 이제 단백질로 번역해야 한다.");
  saveState();
  openSequenceAnalyzer();
}

function checkTargetProteinAnswer(event) {
  event.preventDefault();
  const input = $("#target-protein-answer");
  const feedback = $("#target-protein-feedback");
  const answer = input.value.toUpperCase().replace(/[^A-Z]/g, "");
  if (answer !== "SPIKE") {
    state.sequencePuzzleFailures += 1;
    saveState();
    input.classList.remove("wrong");
    void input.offsetWidth;
    input.classList.add("wrong");
    feedback.classList.add("error");
    feedback.textContent = "번역 결과가 데이터베이스 표적과 일치하지 않는다. mRNA 코돈의 순서를 다시 확인하자.";
    input.select();
    if (navigator.vibrate) navigator.vibrate(100);
    return;
  }
  state.virusTargetIdentified = true;
  state.selectedItem = "target-protein-report";
  addItem("target-protein-report");
  setActivity("복원 서열에서 ZV-SPIKE 표면 융합 단백질을 확인했다. 노출된 수용체 결합 부위가 백신의 핵심 표적이다.");
  saveState();
  render();
  showTargetProteinReport();
}

function targetProteinReportBody() {
  return `
    <div class="target-protein-visual" aria-hidden="true"><div class="virus-core"><i></i><i></i><i></i><i></i><i></i><i></i><span>+</span></div><div class="antibody-mark"><b>Y</b><span>중화항체 결합 지점</span></div></div>
    <div class="target-identification"><small>DATABASE MATCH · 99.8%</small><strong>ZV-SPIKE</strong><span>표면 융합 당단백질</span></div>
    <div class="target-findings">
      <div><small>바이러스의 약점</small><strong>숙주세포 수용체와 결합하기 전 외부에 노출되는 보존 영역</strong></div>
      <div><small>백신 표적</small><strong>수용체 결합 부위를 막는 중화항체 유도</strong></div>
      <div><small>기대 효과</small><strong>세포막 융합과 바이러스 침투 차단</strong></div>
    </div>
    <p class="result-copy target-result-copy">훼손된 염기서열에서 바이러스 원본의 핵심 서명을 복원했다. ZV-SPIKE가 숙주세포에 달라붙지 못하게 막으면 감염을 시작할 수 없다.</p>
    <div class="emergency-protocol"><small>VACCINE TARGET ACQUIRED</small><strong>분석 서버에서 대학원생이 사고 직전에 남긴 비상 제조 목록이 복구됐다. 백신 재료는 감염 확산에 대비해 건물 여러 연구실에 분산되어 있다.</strong></div>
    ${vaccineMaterialManifest()}
    ${state.vaccineMaterialsComplete ? "" : `<button class="primary-button material-route-button" type="button" data-start-material-hunt>로비에서 재료 수집 시작 <span>→</span></button>`}`;
}

function showTargetProteinReport() {
  showModal(modalFrame({
    code: "GENOME RESTORED · TARGET ACQUIRED",
    title: "바이러스의 약점",
    body: targetProteinReportBody(),
  }));
  $("#modal").classList.add("evidence-modal", "sequence-analyzer-modal");
  const startButton = $("[data-start-material-hunt]");
  if (startButton) startButton.addEventListener("click", startMaterialHunt);
}

function collectedMaterialCount() {
  return [state.primerCollected, state.cultureCellsCollected, state.antibodyCollected].filter(Boolean).length;
}

function vaccineMaterialManifest() {
  const materials = [
    [state.primerCollected, "분자생물학실", "ZV-SPIKE 프라이머"],
    [state.cultureCellsCollected, "세포배양실", "HEK-293 배양세포"],
    [state.antibodyCollected, "시약보관실", "중화항체 표준물질"],
  ];
  return `
    <section class="material-manifest" aria-label="백신 재료 수집 현황">
      <header><div><small>EMERGENCY VACCINE PROTOCOL</small><strong>백신 재료 수집</strong></div><b>${collectedMaterialCount()} / 3</b></header>
      <div>${materials.map(([done, place, material], index) => `
        <article class="${done ? "complete" : ""}"><span>${done ? "✓" : String(index + 1).padStart(2, "0")}</span><div><small>${place}</small><strong>${material}</strong></div><b>${done ? "SECURED" : "MISSING"}</b></article>`).join("")}</div>
    </section>`;
}

function startMaterialHunt() {
  state.materialsBriefingSeen = true;
  setActivity(`백신 재료 수집을 시작했다. 세 연구실에서 ${3 - collectedMaterialCount()}개의 재료를 더 확보해야 한다.`);
  saveState();
  goToLobby();
}

function enterMaterialLab(sceneName, enteredKey, activity, intro) {
  if (!state.virusTargetIdentified) return;
  const firstEntry = !state[enteredKey];
  state[enteredKey] = true;
  state.materialsBriefingSeen = true;
  setActivity(activity);
  saveState();
  closeModal();
  transitionTo(sceneName);
  if (firstEntry) {
    window.setTimeout(() => {
      if (state.scene !== sceneName) return;
      showModal(modalFrame(intro));
      $("#modal").classList.add("evidence-modal", "materials-modal");
    }, 380);
  }
}

function enterMolecularBiologyLab() {
  enterMaterialLab(
    "molecularBiologyLab",
    "molecularLabEntered",
    state.primerCollected ? "분자생물학실로 돌아왔다. ZV-SPIKE 프라이머는 이미 확보했다." : "분자생물학실에 도착했다. 멈춘 PCR 장비 옆에 여러 프라이머 튜브가 흩어져 있다.",
    {
      code: "LOCATION 10 · MOLECULAR BIOLOGY",
      title: "표적 유전자 증폭 준비",
      body: `<div class="lab-entry-card primer"><span>≋</span><div><small>REQUIRED MATERIAL 01</small><strong>ZV-SPIKE 프라이머 세트</strong></div><b>${state.primerCollected ? "SECURED" : "MISSING"}</b></div><p class="result-copy">백신 후보를 만들려면 먼저 ZV-SPIKE 유전자를 증폭해야 한다.<br />PCR 장비 앞에서 표적 양쪽에 결합할 프라이머를 고르자.</p>`,
    },
  );
}

function enterCellCultureLab() {
  enterMaterialLab(
    "cellCultureLab",
    "cellCultureLabEntered",
    state.cultureCellsCollected ? "세포배양실로 돌아왔다. 항원 발현용 배양세포는 이미 확보했다." : "세포배양실에 도착했다. 정전 직전 배양 상태가 서로 다른 접시들이 작업대에 남아 있다.",
    {
      code: "LOCATION 11 · CELL CULTURE",
      title: "항원 발현 세포 확보",
      body: `<div class="lab-entry-card culture"><span>◉</span><div><small>REQUIRED MATERIAL 02</small><strong>상태가 양호한 HEK-293 세포</strong></div><b>${state.cultureCellsCollected ? "SECURED" : "MISSING"}</b></div><p class="result-copy">복원한 유전자를 발현시킬 살아 있는 세포가 필요하다.<br />생물안전작업대에서 오염되지 않은 배양 접시를 찾아야 한다.</p>`,
    },
  );
}

function enterReagentStorage() {
  enterMaterialLab(
    "reagentStorage",
    "reagentStorageEntered",
    state.antibodyCollected ? "시약보관실로 돌아왔다. ZV-SPIKE 중화항체 표준물질은 이미 확보했다." : "지하 시약보관실에 도착했다. 냉장고의 예비 전력이 얼마 남지 않았다.",
    {
      code: "LOCATION 12 · REAGENT STORAGE",
      title: "중화항체 표준물질 확보",
      body: `<div class="lab-entry-card antibody"><span>Y</span><div><small>REQUIRED MATERIAL 03</small><strong>anti-ZV-SPIKE 중화항체</strong></div><b>${state.antibodyCollected ? "SECURED" : "MISSING"}</b></div><p class="result-copy">백신 후보가 제대로 만들어졌는지 확인하려면 표적에 결합하는 중화항체가 필요하다.<br />냉장고 안에서 조건에 맞는 바이알을 골라야 한다.</p>`,
    },
  );
}

function primerChoiceButton(role, value, label) {
  const selected = role === "forward" ? state.primerForwardSelection === value : state.primerReverseSelection === value;
  return `<button class="primer-option${selected ? " selected" : ""}" type="button" data-primer-role="${role}" data-primer-value="${value}"><code>5′-${value}-3′</code><span>${label}</span></button>`;
}

function openPrimerPuzzle() {
  if (state.primerCollected) {
    showMaterialItem("spike-primer-set");
    return;
  }
  showModal(modalFrame({
    code: "PCR DESIGN · ZV-SPIKE",
    title: "프라이머 방향을 맞춰라",
    body: `
      <div class="primer-target-map"><small>TARGET REGION · CODING STRAND</small><div><code>5′—GCTACG</code><strong>ZV-SPIKE</strong><code>TTACGA—3′</code></div><span>두 프라이머의 3′ 말단이 표적을 향해야 증폭할 수 있다.</span></div>
      <div class="primer-rule"><span>→</span><p><strong>Forward primer</strong><br />왼쪽 암호화 가닥과 같은 서열</p><span>←</span><p><strong>Reverse primer</strong><br />오른쪽 서열의 역상보 서열</p></div>
      <div class="primer-choice-grid">
        <section><h3>FORWARD · 5′ → 3′</h3>${primerChoiceButton("forward", "GCTACG", "후보 A")}${primerChoiceButton("forward", "CGATGC", "후보 B")}${primerChoiceButton("forward", "TTACGA", "후보 C")}</section>
        <section><h3>REVERSE · 5′ → 3′</h3>${primerChoiceButton("reverse", "AATGCT", "후보 A")}${primerChoiceButton("reverse", "TCGTAA", "후보 B")}${primerChoiceButton("reverse", "TTACGA", "후보 C")}</section>
      </div>
      <button class="primary-button material-check-button" type="button" data-check-primers>프라이머 검증 <span>→</span></button>
      <p class="material-feedback" id="primer-feedback" aria-live="polite">각 방향에서 하나씩 선택하자.</p>`,
  }));
  $("#modal").classList.add("evidence-modal", "materials-modal");
  document.querySelectorAll("[data-primer-role]").forEach((button) => button.addEventListener("click", () => selectPrimer(button.dataset.primerRole, button.dataset.primerValue)));
  $("[data-check-primers]").addEventListener("click", checkPrimerPuzzle);
}

function selectPrimer(role, value) {
  if (role === "forward") state.primerForwardSelection = value;
  else state.primerReverseSelection = value;
  saveState();
  document.querySelectorAll(`[data-primer-role="${role}"]`).forEach((button) => button.classList.toggle("selected", button.dataset.primerValue === value));
  const feedback = $("#primer-feedback");
  if (feedback) {
    feedback.classList.remove("error");
    feedback.textContent = state.primerForwardSelection && state.primerReverseSelection ? "두 프라이머를 선택했다. 방향과 상보성을 검증하자." : "반대쪽 프라이머도 선택하자.";
  }
}

function checkPrimerPuzzle() {
  const feedback = $("#primer-feedback");
  if (!state.primerForwardSelection || !state.primerReverseSelection) {
    feedback.classList.add("error");
    feedback.textContent = "Forward와 Reverse 프라이머를 모두 선택해야 한다.";
    return;
  }
  if (state.primerForwardSelection !== "GCTACG" || state.primerReverseSelection !== "TCGTAA") {
    feedback.classList.add("error");
    feedback.textContent = "증폭 방향이 표적 바깥을 향한다. Reverse primer는 오른쪽 서열을 역상보로 읽어야 한다.";
    if (navigator.vibrate) navigator.vibrate(100);
    return;
  }
  state.primerCollected = true;
  state.selectedItem = "spike-primer-set";
  addItem("spike-primer-set");
  finishMaterialCollection("spike-primer-set", "ZV-SPIKE 표적 양쪽을 증폭하는 프라이머 세트를 확보했다.");
}

function openCulturePuzzle() {
  if (state.cultureCellsCollected) {
    showMaterialItem("culture-cells");
    return;
  }
  const cultures = [
    ["A-03", "35%", "세포 밀도 낮음", "sparse"],
    ["B-12", "75%", "균일 · 오염 없음", "healthy"],
    ["C-04", "95%", "과밀 · 세포 탈락", "overgrown"],
    ["D-09", "72%", "부유 입자 증가", "contaminated"],
  ];
  showModal(modalFrame({
    code: "CELL CULTURE · QUALITY CONTROL",
    title: "사용 가능한 배양세포를 골라라",
    body: `
      <div class="culture-requirement"><span>◉</span><div><small>ANTIGEN EXPRESSION CONDITION</small><strong>부착 상태 양호 · 오염 없음 · Confluency 70–80%</strong></div></div>
      <p class="sequence-guide">관찰 기록과 세포 밀도를 비교해 바로 사용할 수 있는 배양 접시 하나를 선택하자.</p>
      <div class="culture-dish-grid">${cultures.map(([id, density, note, visual]) => `<button class="culture-dish-card ${visual}" type="button" data-culture-id="${id}"><span class="culture-dish" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><strong>${id}</strong><small>Confluency ${density}</small><em>${note}</em></button>`).join("")}</div>
      <p class="material-feedback" id="culture-feedback" aria-live="polite">과밀하거나 오염된 세포는 항원 발현 결과를 망칠 수 있다.</p>`,
  }));
  $("#modal").classList.add("evidence-modal", "materials-modal");
  document.querySelectorAll("[data-culture-id]").forEach((button) => button.addEventListener("click", () => checkCultureDish(button.dataset.cultureId)));
}

function checkCultureDish(id) {
  const feedback = $("#culture-feedback");
  if (id !== "B-12") {
    feedback.classList.add("error");
    feedback.textContent = id === "A-03" ? "세포 밀도가 너무 낮아 항원 생산량을 확보하기 어렵다." : id === "C-04" ? "과밀 배양으로 세포 상태가 무너지고 있다." : "배지의 부유 입자는 미생물 오염 징후다.";
    document.querySelectorAll("[data-culture-id]").forEach((button) => button.classList.toggle("wrong", button.dataset.cultureId === id));
    if (navigator.vibrate) navigator.vibrate(100);
    return;
  }
  state.cultureCellsCollected = true;
  state.selectedItem = "culture-cells";
  addItem("culture-cells");
  finishMaterialCollection("culture-cells", "오염 없이 75% 밀도로 자란 HEK-293 배양세포를 확보했다.");
}

function openAntibodyPuzzle() {
  if (state.antibodyCollected) {
    showMaterialItem("neutralizing-antibody");
    return;
  }
  const vials = [
    ["R-04", "anti-ZV-SPIKE RBD", "IgG · 4°C · 맑음"],
    ["R-11", "anti-ZV-NUCLEO", "IgG · 4°C · 맑음"],
    ["F-02", "anti-ZV-SPIKE RBD", "IgG · −20°C · 해동 3회"],
    ["C-08", "anti-ZV-SPIKE RBD", "IgM · 4°C · 침전 관찰"],
  ];
  showModal(modalFrame({
    code: "COLD REAGENT · ANTIBODY VALIDATION",
    title: "사용 가능한 항체를 골라라",
    body: `
      <div class="antibody-requirement"><span>Y</span><div><small>VALIDATION STANDARD</small><strong>ZV-SPIKE 수용체 결합부위 특이적 IgG</strong><p>2–8°C 보관 · 동결 이력 없음 · 침전 없음</p></div></div>
      <div class="antibody-vial-grid">${vials.map(([id, target, condition]) => `<button type="button" data-antibody-id="${id}"><span class="vial-visual" aria-hidden="true"><i></i><b>${id}</b></span><div><strong>${target}</strong><small>${condition}</small></div></button>`).join("")}</div>
      <p class="material-feedback" id="antibody-feedback" aria-live="polite">표적, 항체 종류, 보관 상태를 모두 확인하자.</p>`,
  }));
  $("#modal").classList.add("evidence-modal", "materials-modal");
  document.querySelectorAll("[data-antibody-id]").forEach((button) => button.addEventListener("click", () => checkAntibodyVial(button.dataset.antibodyId)));
}

function checkAntibodyVial(id) {
  const feedback = $("#antibody-feedback");
  if (id !== "R-04") {
    feedback.classList.add("error");
    feedback.textContent = id === "R-11" ? "이 항체는 바이러스 내부 단백질을 인식해 세포 침투를 막을 수 없다." : id === "F-02" ? "반복 동결·해동으로 항체가 변성됐을 가능성이 높다." : "침전이 생긴 IgM 시약은 표준물질로 사용할 수 없다.";
    document.querySelectorAll("[data-antibody-id]").forEach((button) => button.classList.toggle("wrong", button.dataset.antibodyId === id));
    if (navigator.vibrate) navigator.vibrate(100);
    return;
  }
  state.antibodyCollected = true;
  state.selectedItem = "neutralizing-antibody";
  addItem("neutralizing-antibody");
  finishMaterialCollection("neutralizing-antibody", "보관 상태가 온전한 anti-ZV-SPIKE RBD 중화항체 표준물질을 확보했다.");
}

function finishMaterialCollection(itemId, message) {
  const nowComplete = state.primerCollected && state.cultureCellsCollected && state.antibodyCollected;
  state.vaccineMaterialsComplete = nowComplete;
  setActivity(nowComplete ? "프라이머·배양세포·중화항체를 모두 확보했다. 이제 백신 후보 제작을 시작할 수 있다." : `${message} 남은 재료는 ${3 - collectedMaterialCount()}개다.`);
  saveState();
  render();
  showMaterialAcquired(itemId, message);
}

function showMaterialAcquired(itemId, message) {
  const complete = state.vaccineMaterialsComplete;
  showModal(modalFrame({
    code: complete ? "MATERIALS 03 / 03 · READY" : `MATERIAL SECURED · ${String(collectedMaterialCount()).padStart(2, "0")} / 03`,
    title: complete ? "백신 재료 확보 완료" : itemData[itemId].name,
    body: `<div class="material-acquired"><span>${itemData[itemId].icon}</span><div><small>INVENTORY UPDATED</small><strong>${message}</strong></div><b>SECURED</b></div>${vaccineMaterialManifest()}<div class="emergency-protocol"><small>${complete ? "NEXT · VACCINE ASSEMBLY" : "CONTINUE COLLECTION"}</small><strong>${complete ? "모든 재료가 준비됐다. 다음 단계에서는 ZV-SPIKE 항원을 발현하고 백신 후보를 조립한다." : `로비로 돌아가 남은 ${3 - collectedMaterialCount()}개의 재료를 찾자.`}</strong></div><button class="primary-button material-route-button" type="button" data-return-materials>${complete ? "재료 상자를 챙긴다" : "로비로 돌아간다"} <span>→</span></button>`,
  }));
  $("#modal").classList.add("evidence-modal", "materials-modal");
  $("[data-return-materials]").addEventListener("click", complete ? closeModal : goToLobby);
}

function showMaterialItem(id) {
  const details = {
    "spike-primer-set": ["PCR · PRIMER SET", "GCTACG / TCGTAA", "ZV-SPIKE 표적 유전자의 양쪽에 결합해 필요한 구간만 증폭한다."],
    "culture-cells": ["CELL CULTURE · B-12", "HEK-293 · 75%", "오염 없이 안정적으로 부착된 항원 발현용 배양세포다."],
    "neutralizing-antibody": ["ANTIBODY · R-04", "anti-ZV-SPIKE RBD", "ZV-SPIKE 수용체 결합부위를 인식하는 중화항체 표준물질이다."],
  };
  const [code, title, copy] = details[id];
  showModal(modalFrame({
    code,
    title,
    body: `<div class="material-item-view ${id}"><span>${itemData[id].icon}</span></div><p class="result-copy">${copy}</p>${vaccineMaterialManifest()}`,
  }));
  $("#modal").classList.add("evidence-modal", "materials-modal");
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
  setActivity("바리케이드를 고정하려 로비 안내 데스크를 밀다가, 처음 편지와 같은 필체의 손상된 연구일지를 발견했다.");
  saveState();
  render();
  showModal(modalFrame({
    code: "DEFENSE · LOBBY SEALED",
    title: "바리케이드 설치 완료",
    body: `
      <div class="barricade-reward compact installed" aria-hidden="true"><span>▥</span></div>
      <p class="result-copy">바리케이드가 출입구를 막았다. 지지대로 쓰려고 안내 데스크를 밀자, 그 아래에 끼어 있던 찢어진 기록 한 장이 드러난다. 처음 편지와 같은 필체다.</p>
      <div class="research-fragment-note">
        <span>연구일지 · 격리 직전 기록</span>
        <strong>“실험쥐의 감염 특징은 미등록 검체와 일치했다.<br />반입 시각은 기업탐방 버스 복귀 직후.<br />격리 해제 명령은 과사무실 관리자 계정에서 실행됐다.”</strong>
      </div>
      <div class="story-evidence compact"><span class="story-evidence-icon" aria-hidden="true">≣</span><div><small>새 증거 획득</small><strong>손상된 연구일지</strong></div><b>NEW</b></div>`,
  }));
}

function enterReadingRoom() {
  setActivity("자료열람실 안으로 들어왔다. 복구 기록에 표시된 B-17 책장과 비상 물자함을 찾아야 한다.");
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
  setActivity(state.shelfPuzzleSolved ? "B-17 비상 물자함의 잠금 번호는 25였다." : "B-17 책 사이에서 비상 물자함 잠금표를 발견했다.");
  saveState();
  render();
  showModal(modalFrame({
    code: "EMERGENCY CACHE · B-17",
    title: "비상 물자함 잠금 해제",
    body: `
      <div class="emergency-protocol"><small>책장 하단 비상 물자함</small><strong>숫자표의 빈칸이 잠금 번호다.</strong></div>
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
  setActivity("정답 25로 B-17 비상 물자함을 열어 접이식 바리케이드를 확보했고, 복도 비상 전원도 복구됐다.");
  saveState();
  render();
  showModal(modalFrame({
    code: "ITEM ACQUIRED · DEFENSE",
    title: "바리케이드 획득",
    body: `
      <div class="barricade-reward" aria-hidden="true"><span>▥</span></div>
      <p class="result-copy"><strong>정답 25.</strong><br />책장 아래 비상 물자함이 열리며 접이식 바리케이드가 나온다. 동시에 연결된 복도 비상 전원이 복구된다.</p>
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
        <span>연구일지 · 격리 직전 기록</span>
        <strong>“실험쥐의 감염 특징은 미등록 검체와 일치했다.<br />반입 시각은 기업탐방 버스 복귀 직후.<br />격리 해제 명령은 과사무실 관리자 계정에서 실행됐다.”</strong>
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
        <p class="result-copy"><strong>다음 장소: 2층 자료열람실</strong><br />확인 지점: B-17 비상 물자함</p>
        <div class="story-evidence"><span class="story-evidence-icon" aria-hidden="true">!</span><div><small>편지 작성자 소속</small><strong>동물실험 연구센터</strong></div><b>출입 기록 삭제 감지</b></div>`,
    }));
    return;
  }
  if (id === "barricade") {
    showModal(modalFrame({
      code: "ITEM · DEFENSE",
      title: "접이식 바리케이드",
      body: `<div class="barricade-reward compact" aria-hidden="true"><span>▥</span></div><p class="result-copy">B-17 비상 물자함에서 꺼낸 접이식 바리케이드다.<br />좀비의 이동 경로를 한 번 차단할 수 있다.</p>`,
    }));
    return;
  }
  if (id === "research-fragment") {
    openResearchJournal();
    return;
  }
  if (id === "c07-record") {
    showModal(modalFrame({
      code: "INVENTORY · C-07 EVIDENCE",
      title: "C-07 운송 기록",
      body: c07EvidenceBody(),
    }));
    $("#modal").classList.add("evidence-modal");
    bindC07EvidenceActions();
    return;
  }
  if (id === "damaged-sequence-chip") {
    showSequenceChipItem();
    return;
  }
  if (id === "target-protein-report") {
    showTargetProteinReport();
    return;
  }
  if (["spike-primer-set", "culture-cells", "neutralizing-antibody"].includes(id)) {
    showMaterialItem(id);
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
  const coldStorageCurrent = state.scene === "coldStorage";
  const bioinformaticsLabCurrent = state.scene === "bioinformaticsLab";
  const molecularLabCurrent = state.scene === "molecularBiologyLab";
  const cellCultureLabCurrent = state.scene === "cellCultureLab";
  const reagentStorageCurrent = state.scene === "reagentStorage";
  showModal(modalFrame({
    code: "ITEM · CAMPUS MINIMAP",
    title: "좀비 위치 탐지",
    body: `
      <div class="map-area${state.virusTargetIdentified ? " material-map" : ""}">
        <div class="map-path" aria-hidden="true"></div>
        <div class="map-node node-101${computerLabCurrent ? " current" : ""}">101호<br />컴퓨터실</div>
        <div class="map-node node-105">105호</div>
        <div class="map-node node-hallway${hallCurrent ? " current" : ""}">1층 복도</div>
        <div class="map-node node-lobby${lobbyCurrent ? " current" : ""}">로비</div>
        <div class="map-node node-reading-room${readingRoomCurrent ? " current" : ""}">2층<br />자료열람실</div>
        ${state.shelfPuzzleSolved ? `<div class="map-node node-animal-center${animalCenterCurrent ? " current" : ""}">동물실험<br />연구센터</div>` : ""}
        ${state.journalPuzzleSolved ? `<div class="map-node node-security-room${securityRoomCurrent ? " current" : ""}">생정융<br />과사무실</div>` : ""}
        ${state.cctvArchiveSolved ? `<div class="map-node node-cold-storage${coldStorageCurrent ? " current" : ""}">3층<br />저온 보관실</div>` : ""}
        ${state.sequenceChipCollected ? `<div class="map-node node-bioinformatics-lab${bioinformaticsLabCurrent ? " current" : ""}">생물정보<br />분석실</div>` : ""}
        ${state.virusTargetIdentified ? `<div class="map-node node-molecular-lab${molecularLabCurrent ? " current" : ""}">분자생물<br />학실</div><div class="map-node node-cell-culture${cellCultureLabCurrent ? " current" : ""}">세포<br />배양실</div><div class="map-node node-reagent-storage${reagentStorageCurrent ? " current" : ""}">시약<br />보관실</div>` : ""}
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
    body: `<p class="result-copy">제한 시간 안에 백신 제작에 필요한 바이러스 원본을 확보하지 못했다.<br />좀비 바이러스가 생명대 전체로 퍼졌다.</p><button class="primary-button letter-action" type="button" data-restart>처음부터 다시 시작</button>`,
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
    "c07-puzzle": {
      code: "COLD STORAGE AMBUSH",
      activity: "C-07 잠금 장치의 경고음이 울렸고, 뒤에서 다가온 좀비에게 물렸다.",
      copy: "두 번째 오답과 함께 냉동고 경고음이 울렸다. 뒤를 돌아보는 순간 좀비에게 어깨를 물렸다.",
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
      : source === "c07-puzzle"
        ? Math.min(state.zombieDistance, 32)
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
  if (action === "enter-cold-storage") enterColdStorage();
  if (action === "inspect-c07-locker") inspectC07Locker();
  if (action === "enter-bioinformatics-lab") enterBioinformaticsLab();
  if (action === "inspect-sequence-workstation") openSequenceAnalyzer();
  if (action === "enter-molecular-lab") enterMolecularBiologyLab();
  if (action === "enter-cell-culture-lab") enterCellCultureLab();
  if (action === "enter-reagent-storage") enterReagentStorage();
  if (action === "inspect-primer-station") openPrimerPuzzle();
  if (action === "inspect-culture-station") openCulturePuzzle();
  if (action === "inspect-antibody-storage") openAntibodyPuzzle();
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
