const $ = (selector) => document.querySelector(selector);

const STORAGE_KEY = "cnu-biozombie-chapter-01";
const LIMIT_SECONDS = 60 * 60;

const initialState = {
  started: false,
  paused: false,
  failed: false,
  chapterComplete: false,
  elapsed: 0,
  scene: "lobby",
  letterRead: false,
  inventory: ["campus-map"],
  selectedItem: null,
  zombieDistance: 120,
  bites: 0,
  wrongDoorCount: 0,
  letterHints: 0,
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
};

const scenes = {
  lobby: {
    image: "assets/images/cnu-lobby-outbreak.png",
    alt: "어둡고 버려진 생명시스템과학대학 로비",
    number: "01",
    name: "생명시스템과학대학 로비",
    hud: "1F · 로비",
  },
  hallway: {
    image: "assets/images/cnu-hallway-101-105.png",
    alt: "101호와 105호가 마주 보는 어두운 생명시스템과학대학 복도",
    number: "02",
    name: "생명시스템과학대학 1층 복도",
    hud: "1F · 101—105",
  },
  chapterEnd: {
    image: "assets/images/cnu-hallway-101-105.png",
    alt: "101호 문 앞의 어두운 생명시스템과학대학 복도",
    number: "03",
    name: "101호 앞",
    hud: "1F · 101호",
  },
};

let state = freshState();
let failureShown = false;

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

function startGame(reset = false) {
  if (reset) {
    state = freshState();
    failureShown = false;
  }
  state.started = true;
  state.paused = false;
  $("#title-screen").hidden = true;
  $("#game").hidden = false;
  $("#pause-overlay").hidden = true;
  saveState();
  render();
}

function objectiveText() {
  if (state.chapterComplete) return "101호 안으로 들어갈 준비를 하라";
  if (state.scene === "hallway") return "편지가 가리킨 호실을 선택하라";
  if (state.letterRead) return "1층 복도로 이동하라";
  return "바닥에 떨어진 종이를 조사하라";
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
    return `
      <button class="item${state.selectedItem === id ? " selected" : ""}" type="button" data-item="${id}">
        <span class="item-icon" aria-hidden="true">${item.icon}</span>
        <strong>${item.name}</strong>
        <small>${item.description}</small>
      </button>`;
  });
  const emptySlots = Math.max(0, 4 - cards.length);
  container.innerHTML = cards.join("") + Array.from({ length: emptySlots }, () => `<div class="item empty" aria-hidden="true"><span class="item-icon">·</span></div>`).join("");

  container.querySelectorAll("[data-item]").forEach((button) => {
    button.addEventListener("click", () => inspectItem(button.dataset.item));
  });
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
      ${state.letterRead ? `
        <button class="hotspot hallway-hotspot room-hotspot" data-action="go-hallway" type="button">
          <span class="pulse" aria-hidden="true"></span>
          <span class="hotspot-label">1층 복도</span>
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
  $("#objective").textContent = objectiveText();
  $("#activity").textContent = state.activity;
  $("#bite-pips").querySelectorAll("i").forEach((pip, index) => pip.classList.toggle("active", index < state.bites));
  renderScene();
  renderInventory();
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

  state.chapterComplete = true;
  state.zombieDistance = Math.max(state.zombieDistance, 82);
  setActivity("편지의 숨은 숫자와 일치한다. 101호가 대학원생의 연구실이다.");
  transitionTo("chapterEnd");
  saveState();
  showModal(modalFrame({
    code: "CORRECT LOCATION · 101",
    title: "대학원생의 연구실",
    close: false,
    body: `
      <div class="result-mark">✓</div>
      <p class="result-copy">문장 속 어색한 글자에서 <strong>1 · 0 · 1</strong>을 찾아냈다.<br />문 너머에서 냉각 장치가 작동하는 소리가 들린다.</p>
      <div class="status-grid"><div><small>현재 위치</small><strong>101호</strong></div><div><small>확보한 도구</small><strong>형광등</strong></div><div><small>다음 목표</small><strong>바이러스 구조</strong></div></div>
      <button class="primary-button letter-action" type="button" data-finish-chapter>101호 문을 연다 <span>→</span></button>`,
  }));
  $("[data-finish-chapter]").addEventListener("click", () => {
    closeModal();
    showModal(modalFrame({
      code: "CHAPTER 01 · COMPLETE",
      title: "다음 장소 준비 중",
      body: `<p class="result-copy">로비와 1층 복도 구간을 완료했습니다.<br />다음에는 101호 내부의 바이러스 구조 분석 문제가 이어집니다.</p><button class="primary-button letter-action" type="button" data-return-lobby>로비로 돌아가기</button>`,
    }));
    $("[data-return-lobby]").addEventListener("click", () => {
      closeModal();
      transitionTo("lobby");
    });
  });
}

function escapeWrongRoom() {
  $("#jumpscare").hidden = true;
  state.zombieDistance = Math.max(58, 74 - state.wrongDoorCount * 5);
  setActivity("간신히 문을 닫고 복도로 돌아왔다. 105호는 함정이었다.");
  saveState();
  render();
  showModal(modalFrame({
    code: "ESCAPED · NO BITE",
    title: "잘못된 장소",
    body: `<p class="result-copy">105호는 좀비로 가득했다. 다행히 물리기 전에 빠져나왔다.<br />편지의 이상한 글자를 다시 살펴보자.</p><button class="primary-button letter-action" type="button" data-dismiss-result>다른 방을 선택한다</button>`,
  }));
  $("[data-dismiss-result]").addEventListener("click", closeModal);
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
  showModal(modalFrame({
    code: "ITEM · PORTABLE LIGHT",
    title: "휴대용 형광등",
    body: `<div class="result-mark">▰</div><p class="result-copy">로비 비상함에서 꺼낸 형광등이다.<br />전기가 끊긴 장소나 형광 표본을 확인할 때 사용할 수 있다.</p>`,
  }));
}

function openMiniMap() {
  const lobbyCurrent = state.scene === "lobby";
  const hallCurrent = state.scene === "hallway";
  showModal(modalFrame({
    code: "ITEM · CAMPUS MINIMAP",
    title: "좀비 위치 탐지",
    body: `
      <div class="map-area">
        <div class="map-path" aria-hidden="true"></div>
        <div class="map-node node-101${state.chapterComplete ? " current" : ""}">101호</div>
        <div class="map-node node-105">105호</div>
        <div class="map-node node-hallway${hallCurrent ? " current" : ""}">1층 복도</div>
        <div class="map-node node-lobby${lobbyCurrent ? " current" : ""}">로비</div>
        <div class="zombie-signal"><strong>${state.zombieDistance}m</strong><small>좀비 무리</small></div>
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
  if (failureShown || state.chapterComplete) return;
  failureShown = true;
  state.failed = true;
  state.paused = true;
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

function triggerZombieAttack() {
  state.bites += 1;
  state.zombieDistance = 60;
  state.paused = true;
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
    code: `ATTACK · BITE ${state.bites}/3`,
    title: "좀비에게 물렸다",
    close: false,
    body: `<div class="result-mark danger-mark">${state.bites}</div><p class="result-copy">좀비 무리와의 거리가 0m가 되었다.<br />세 번 물리면 감염된다. 서둘러 이동해야 한다.</p><button class="primary-button letter-action" type="button" data-survive>계속 움직인다</button>`,
  }));
  $("[data-survive]").addEventListener("click", () => {
    state.paused = false;
    closeModal();
    saveState();
  });
}

function handleSceneAction(action) {
  if (action === "inspect-letter") inspectLetter();
  if (action === "go-hallway") transitionTo("hallway");
  if (action === "go-lobby") transitionTo("lobby");
  if (action === "choose-101") chooseRoom("101");
  if (action === "choose-105") chooseRoom("105");
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
  saveState();
});
$("#resume-button").addEventListener("click", () => {
  state.paused = false;
  $("#pause-overlay").hidden = true;
  saveState();
});
$("#escape-button").addEventListener("click", escapeWrongRoom);
$("#log-button").addEventListener("click", showActivityLog);
$("#modal").addEventListener("click", (event) => {
  if (event.target === $("#modal")) closeModal();
});

window.setInterval(() => {
  if (!state.started || state.paused || state.failed || state.chapterComplete) return;
  state.elapsed += 1;
  if (state.elapsed > 0 && state.elapsed % 90 === 0) {
    state.zombieDistance = Math.max(0, state.zombieDistance - 4);
  }
  if (state.elapsed % 5 === 0) saveState();
  render();
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
          chapterComplete: state.chapterComplete,
        };
      },
    })).catch(() => {});
  } catch {
    // WebMCP support is optional and does not affect the game.
  }
}

loadState();
render();
registerWebMCP();
