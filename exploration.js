// Physical inspection, optional evidence and restrained environmental feedback.
// Loaded before game.js; functions access the shared game state only after startup.
const presidentRecords = {
  "president-note": {
    scene: "molecularBiologyLab", title: "학생회장의 접힌 메모", label: "접힌 메모", time: "14:52 · 분자생물학실",
    paragraphs: [
      "기업 탐방 명찰 뒷면에 급히 쓴 글씨가 남아 있다. 소속란에는 ‘생정융 학생회장’이라고 적혀 있다.",
      "안전한 교육용 검체라고 했다. 하지만 이상 반응을 보고도 경보를 끈 건 나다. 추천서를 잃는 게 무서워서, 친구들이 있는 건물의 문을 열어 버렸다.",
      "분석실로 가던 연구원이 원본 기록을 찾고 있었다. 나는 아무것도 모르는 척했다. 지금이라도 내가 한 일을 남긴다. 이 메모를 발견하면 지우지 말아 줘.",
    ],
  },
  "president-access-log": {
    scene: "cellCultureLab", title: "배양실 비상 출입 기록", label: "출입 기록", time: "14:57 · 세포배양실",
    paragraphs: [
      "출입 단말기 옆에 손으로 출력한 비상 기록이 놓여 있다. 사용자명은 CCTV에서 확인한 학생회장의 계정과 같다.",
      "14:54 — 내부 수동 잠금. 14:55 — 비상 전원 유지. 14:57 — 기록 보존 요청. 비고: ‘복도에서 사람이 부르는 소리가 들린다. 문을 열기 전에 상태를 확인할 것.’",
      "출력물 뒤에는 짧은 문장이 덧붙어 있다. ‘여기까지 온 친구들에게. 보관 장비 전원은 꺼지지 않게 해 뒀어. 이걸로 내가 한 일이 없어지지는 않겠지. 내가 지운 기록은 C-07 단말기에 남아 있어.’",
    ],
  },
  "president-voice": {
    scene: "reagentStorage", title: "전송되지 않은 음성 메시지", label: "남겨진 단말기", time: "15:03 · 시약보관실",
    paragraphs: [
      "단말기에 학생회 단체방으로 보내다 실패한 메시지가 남아 있다. 발신자는 생정융 학생회장이다.",
      "나야. 같이 탐방 갔던 회장. 상자를 가져온 것도, 격리를 해제한 것도 나야. 회사에서 기록을 없애라고 했고, 나는 그대로 했어. 몰랐다는 말로 넘어갈 수 없는 일이야.",
      "지금 시약보관실을 나가려는데 계단에서 소리가 들려. 난 다른 비상 통로를 찾아볼게. 너희가 이걸 들을 때 내가 어디에 있을지는 모르겠어. 구조대가 오면 기록을 전부 넘겨 줘. 내 이름도 빼지 말고.",
    ], voice: true,
  },
};
const presidentRecordItems = Object.fromEntries(Object.entries(presidentRecords).map(([id, record]) => [id, {
  name: record.title, icon: record.voice ? "◖" : "▤", description: "사고 이후의 흔적",
}]));
const primerTubeSequences = ["GCTACG", "CGATGC", "TTACGA", "AATGCT", "TCGTAA"];
const cultureSamples = [
  { id: "A-03", density: "35%", note: "세포 사이 빈 공간이 넓다. 부착된 세포는 관찰되며 부유 입자는 없다.", visual: "sparse" },
  { id: "B-12", density: "75%", note: "세포가 균일하게 부착되어 있다. 떠다니는 입자나 세포 탈락은 관찰되지 않는다.", visual: "healthy" },
  { id: "C-04", density: "95%", note: "세포가 겹쳐 자라고 있다. 일부 세포가 바닥에서 떨어져 있다.", visual: "overgrown" },
  { id: "D-09", density: "72%", note: "세포 사이에서 작은 부유 입자가 다수 관찰된다. 배양액에 혼탁이 보인다.", visual: "contaminated" },
];
const antibodySamples = [
  { id: "R-04", target: "anti-ZV-SPIKE RBD", label: "IgG · 4°C 보관 · 동결 이력 없음", appearance: "투명한 용액. 침전은 관찰되지 않는다." },
  { id: "R-11", target: "anti-ZV-NUCLEO", label: "IgG · 4°C 보관 · 동결 이력 없음", appearance: "투명한 용액. 침전은 관찰되지 않는다." },
  { id: "F-02", target: "anti-ZV-SPIKE RBD", label: "IgG · −20°C 보관 · 해동 3회", appearance: "용액은 맑지만 라벨 가장자리에 성에가 남아 있다." },
  { id: "C-08", target: "anti-ZV-SPIKE RBD", label: "IgM · 4°C 보관 · 동결 이력 없음", appearance: "바이알 바닥에 작은 침전이 보인다." },
];
let inventoryCategory = "tools";
const newInventoryItems = new Map();
let inventoryNoticeTimer = null;
let heldPrimer = "";
let explorationAudioNodes = [];
let blackoutTimer = null;
let voicePlayback = null;

function inventoryGroup(id) {
  if (["spike-primer-set", "culture-cells", "neutralizing-antibody", "vaccine-candidate"].includes(id)) return "materials";
  return ["campus-map", "fluorescent-lamp", "barricade"].includes(id) ? "tools" : "evidence";
}

function markInventoryNew(id) {
  inventoryCategory = inventoryGroup(id);
  newInventoryItems.set(id, Date.now() + 7000);
  if (inventoryNoticeTimer != null) window.clearTimeout(inventoryNoticeTimer);
  inventoryNoticeTimer = window.setTimeout(() => {
    newInventoryItems.clear();
    inventoryNoticeTimer = null;
    renderInventory();
  }, 7000);
}

function renderInventoryCategories() {
  const nav = $("#inventory-categories");
  const markup = [["tools", "도구"], ["evidence", "증거"], ["materials", "재료"]].map(([key, label]) => {
    const ids = state.inventory.filter((id) => inventoryGroup(id) === key);
    return `<button type="button" data-inventory-category="${key}" aria-pressed="${key === inventoryCategory}">${label} <span>${ids.length}</span>${ids.some((id) => newInventoryItems.has(id)) ? '<i aria-label="새 아이템">·</i>' : ""}</button>`;
  }).join("");
  if (nav.innerHTML === markup) return;
  nav.innerHTML = markup;
  nav.querySelectorAll("[data-inventory-category]").forEach((button) => button.addEventListener("click", () => {
    inventoryCategory = button.dataset.inventoryCategory;
    renderInventory();
    $(`[data-inventory-category="${inventoryCategory}"]`).focus({ preventScroll: true });
  }));
}

function recordForScene() {
  return Object.keys(presidentRecords).find((id) => presidentRecords[id].scene === state.scene);
}

function openPresidentRecord(id) {
  const record = presidentRecords[id];
  if (!record || state.paused || state.failed) return;
  const collected = state.inventory.includes(id);
  showModal(modalFrame({ code: "RECOVERED TRACE · STUDENT COUNCIL", title: record.title,
    body: `<article class="president-document${record.voice ? " voice-document" : ""}"><header><span>생정융 학생회장</span><time>${record.time}</time></header>${record.paragraphs.map((p) => `<p>${p}</p>`).join("")}${record.voice ? '<div class="voice-controls"><button type="button" data-play-record>▶ 메시지 듣기</button><small id="voice-status" role="status">기기 음성으로 재생 · 대본은 위에서 확인할 수 있다.</small></div>' : ""}</article><button type="button" class="primary-button material-check-button" data-collect-record ${collected ? "disabled" : ""}>${collected ? "증거 보관 완료" : "기록을 챙긴다"}</button>`,
  }));
  $("#modal").classList.add("evidence-modal", "exploration-modal");
  $("[data-collect-record]").addEventListener("click", () => {
    if (state.inventory.includes(id)) return;
    addItem(id);
    state.selectedItem = id;
    setActivity(`${record.title}을 증거로 보관했다.`);
    saveState(); render();
    $("[data-collect-record]").disabled = true;
    $("[data-collect-record]").textContent = "증거 보관 완료";
  });
  if (record.voice) $("[data-play-record]").addEventListener("click", () => playPresidentVoice(record));
}

function playPresidentVoice(record) {
  const status = $("#voice-status");
  if (voicePlayback) { stopExplorationAudio(); return; }
  if (!state.audioEnabled) { status.textContent = "소리가 꺼져 있다. 소리를 켜거나 대본으로 확인하자."; return; }
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
    status.textContent = "이 기기는 음성 재생을 지원하지 않는다. 위 대본으로 확인할 수 있다."; return;
  }
  const speech = new window.SpeechSynthesisUtterance(record.paragraphs.slice(1).join(" "));
  speech.lang = "ko-KR"; speech.rate = 0.9;
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("ko"));
  if (voice) speech.voice = voice;
  voicePlayback = speech;
  $("[data-play-record]").textContent = "■ 재생 멈추기";
  status.textContent = "메시지 재생 중…";
  speech.onend = speech.onerror = () => {
    if (voicePlayback !== speech) return;
    voicePlayback = null;
    status.textContent = "대본은 언제든 다시 읽을 수 있다.";
    const button = $("[data-play-record]");
    if (button) button.textContent = "▶ 다시 듣기";
  };
  window.speechSynthesis.speak(speech);
}

function decorateExplorationHotspots(container) {
  container.classList.toggle("rescue-lobby-hotspots", state.scene === "lobby" && state.rescueDefenseStarted);
  if (state.scene === "emergencyIsolationRoom") renderIsolationHotspots(container);
  if (state.scene === "vaccineDevelopmentLab") renderVaccineHotspots(container);
  if (state.scene === "lobby" && state.virusTargetIdentified && !(state.zombieSurgeActive && !state.barricadeInstalled)) {
    container.innerHTML = `<button class="hotspot directory-hotspot room-hotspot" type="button" data-action="open-floor-directory"><span class="pulse" aria-hidden="true"></span><span class="hotspot-label">층별 안내판</span></button>`;
  }
  if (state.scene === "lobby" && state.rescueDefenseStarted) decorateRescueHotspots(container);
  const recordId = recordForScene();
  if (recordId) container.insertAdjacentHTML("beforeend", `<button class="hotspot trace-hotspot${state.inventory.includes(recordId) ? " completed" : ""}" type="button" data-action="inspect-president-trace"><span class="pulse" aria-hidden="true"></span><span class="hotspot-label">${presidentRecords[recordId].label}</span></button>`);
  const completed = {
    "use-computer": state.terminalSolved, "inspect-b17": state.shelfPuzzleSolved,
    "inspect-infected-rats": state.infectedRatsInspected, "inspect-security-console": state.cctvArchiveSolved,
    "inspect-c07-locker": state.sequenceChipCollected, "inspect-sequence-workstation": state.virusTargetIdentified,
  };
  container.querySelectorAll("[data-action]").forEach((button) => {
    const action = button.dataset.action;
    if (completed[action]) button.classList.add("completed");
    if (/^(go-|enter-|choose-)|^inspect-lab-entrance$|^open-floor-directory$/.test(action)) button.classList.add("navigation-marker");
    if (["install-barricade", "security-guard-encounter"].includes(action)) button.classList.add("danger-marker");
  });
}

function openFloorDirectory() {
  if (!state.virusTargetIdentified) return;
  const routes = [
    ...(canAccessIsolationRoom() ? [["3F", "비상 격리실", "enter-isolation-room", state.emergencyPowerRecordCollected, "emergencyIsolationRoom"]] : []),
    ...(canAccessVaccineLab() ? [["3F", "통합 백신 개발실", "enter-vaccine-lab", state.vaccineValidated, "vaccineDevelopmentLab"]] : []),
    ["3F", "분자생물학실", "enter-molecular-lab", state.primerCollected, "molecularBiologyLab"],
    ["3F", "생물정보 분석실", "enter-bioinformatics-lab", state.virusTargetIdentified, "bioinformaticsLab"],
    ["3F", "저온 시료 보관실", "enter-cold-storage", state.sequenceChipCollected, "coldStorage"],
    ["2F", "세포배양실", "enter-cell-culture-lab", state.cultureCellsCollected, "cellCultureLab"],
    ["2F", "자료열람실 · 연구센터 통로", "go-reading-room-entrance", state.shelfPuzzleSolved, "readingRoomEntrance"],
    ["1F", "101호 · 105호 복도", "go-hallway", state.terminalSolved, "hallway"],
    ["1F", "생정융 과사무실", "enter-security-room", state.cctvArchiveSolved, "securityRoom"],
    ["B1", "시약보관실", "enter-reagent-storage", state.antibodyCollected, "reagentStorage"],
  ];
  showModal(modalFrame({ code: "BUILDING DIRECTORY", title: "층별 안내판", body: `<div class="floor-directory">${["3F", "2F", "1F", "B1"].map((floor) => `<section><h3>${floor}</h3><div>${routes.filter((route) => route[0] === floor).map(([, name, action, done, scene]) => `<button type="button" data-directory-route="${action}"><img src="${scenes[scene].image}" alt="" /><span><strong>${name}</strong><small>${done ? "조사한 장소 · 다시 방문 가능" : "이동 가능"}</small></span><b aria-hidden="true">→</b></button>`).join("")}</div></section>`).join("")}</div>` }));
  $("#modal").classList.add("evidence-modal", "exploration-modal");
  document.querySelectorAll("[data-directory-route]").forEach((button) => button.addEventListener("click", () => {
    if (state.paused || state.failed) return;
    closeModal(); handleSceneAction(button.dataset.directoryRoute);
  }));
}

function physicalPuzzleFrame(title, code, body, kind) {
  showModal(modalFrame({ title, code, body: `${body}${approachMarkup(kind)}` }));
  $("#modal").classList.add("evidence-modal", "materials-modal", "exploration-modal");
}

function showPrimerWorkbench() {
  heldPrimer = "";
  physicalPuzzleFrame("PCR 작업대", "PCR DESIGN · ZV-SPIKE", `
    <div class="primer-target-map"><small>TARGET REGION · CODING STRAND</small><div><code>5′—GCTACG</code><strong>ZV-SPIKE</strong><code>TTACGA—3′</code></div></div>
    <p class="handling-copy">튜브를 끌어 슬롯에 넣거나, 튜브를 누른 뒤 슬롯을 누르자. 배치는 검증 전까지 바꿀 수 있다.</p>
    <div class="tube-rack" aria-label="프라이머 튜브 보관대">${primerTubeSequences.map((seq, i) => `<button type="button" class="primer-tube" data-tube="${seq}" aria-pressed="false"><span>${String(i + 1).padStart(2, "0")}</span><code>5′-${seq}-3′</code></button>`).join("")}</div>
    <div class="pcr-slots">${["forward", "reverse"].map((role) => `<button type="button" class="pcr-slot" data-pcr-slot="${role}"><small>${role.toUpperCase()} · 5′ → 3′</small><strong data-slot-label="${role}">빈 슬롯</strong></button>`).join("")}</div>
    <button class="primary-button material-check-button" type="button" data-check-primers>배치한 프라이머 검증 <span>→</span></button>
    <p class="material-feedback" id="primer-feedback" aria-live="polite">튜브를 조사해 두 슬롯에 배치하자.</p>`, "primer");
  document.querySelectorAll("[data-tube]").forEach(bindPrimerTube);
  document.querySelectorAll("[data-pcr-slot]").forEach((slot) => slot.addEventListener("click", () => {
    if (!heldPrimer) { $("#primer-feedback").textContent = "먼저 튜브를 집어 들자."; return; }
    placePrimer(slot.dataset.pcrSlot, heldPrimer);
  }));
  $("[data-check-primers]").addEventListener("click", checkPrimerPuzzle);
  updatePcrSlots();
}

function holdPrimer(sequence) {
  if (state.paused || state.failed || !primerTubeSequences.includes(sequence)) return;
  heldPrimer = sequence;
  document.querySelectorAll("[data-tube]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.tube === sequence)));
  $("#primer-feedback").textContent = `5′-${sequence}-3′ 튜브를 들었다. 놓을 슬롯을 선택하자.`;
}

function bindPrimerTube(button) {
  let drag = null;
  let suppressClick = false;
  button.addEventListener("click", (event) => { if (suppressClick && event.detail !== 0) { suppressClick = false; return; } holdPrimer(button.dataset.tube); });
  button.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0 || state.paused || state.failed) return;
    suppressClick = false;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    button.setPointerCapture(event.pointerId);
    holdPrimer(button.dataset.tube);
  });
  button.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (Math.hypot(dx, dy) > 7) drag.moved = true;
    if (drag.moved) { button.classList.add("dragging"); button.style.transform = `translate(${dx}px, ${dy}px)`; }
  });
  const finish = (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    suppressClick = drag.moved;
    if (event.type === "pointerup" && drag.moved) {
      const slot = [...document.querySelectorAll("[data-pcr-slot]")].find((candidate) => {
        const rect = candidate.getBoundingClientRect();
        return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      });
      if (slot) placePrimer(slot.dataset.pcrSlot, button.dataset.tube);
    }
    drag = null; button.style.transform = ""; button.classList.remove("dragging");
  };
  button.addEventListener("pointerup", finish);
  button.addEventListener("pointercancel", finish);
  button.addEventListener("lostpointercapture", finish);
}

function placePrimer(role, sequence) {
  if (state.paused || state.failed || !["forward", "reverse"].includes(role) || !primerTubeSequences.includes(sequence)) return;
  const otherKey = role === "forward" ? "primerReverseSelection" : "primerForwardSelection";
  if (state[otherKey] === sequence) state[otherKey] = "";
  selectPrimer(role, sequence);
}

function updatePcrSlots() {
  for (const role of ["forward", "reverse"]) {
    const value = role === "forward" ? state.primerForwardSelection : state.primerReverseSelection;
    const label = $(`[data-slot-label="${role}"]`);
    if (label) label.textContent = value ? `5′-${value}-3′` : "빈 슬롯";
    const slot = $(`[data-pcr-slot="${role}"]`);
    if (slot) slot.classList.toggle("occupied", Boolean(value));
  }
}

function dishVisual(sample) {
  return `<span class="culture-dish-card ${sample.visual}"><span class="culture-dish" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span></span>`;
}

function showCultureBench() {
  physicalPuzzleFrame("배양 접시 관찰", "CELL CULTURE · QUALITY CONTROL", `
    <div class="culture-requirement"><span>◉</span><div><small>ANTIGEN EXPRESSION CONDITION</small><strong>부착 상태 양호 · 오염 없음 · Confluency 70–80%</strong></div></div>
    <div class="dish-tray">${cultureSamples.map((sample) => `<button type="button" data-culture-id="${sample.id}" aria-pressed="false">${dishVisual(sample)}<strong>${sample.id}</strong><small>확대 관찰</small></button>`).join("")}</div>
    <div class="observation-panel" id="culture-observation" aria-live="polite">접시를 선택해 확대해서 살펴보자.</div>
    <button class="primary-button material-check-button" type="button" data-confirm-culture disabled>이 재료를 가져간다 <span>→</span></button>
    <p class="material-feedback" id="culture-feedback" aria-live="polite">관찰만으로는 제출되지 않는다.</p>`, "culture");
  document.querySelectorAll("[data-culture-id]").forEach((button) => button.addEventListener("click", () => inspectCultureDish(button.dataset.cultureId)));
  $("[data-confirm-culture]").addEventListener("click", () => checkCultureDish(state.selectedCultureDish));
  if (cultureSamples.some((sample) => sample.id === state.selectedCultureDish)) inspectCultureDish(state.selectedCultureDish);
}

function inspectCultureDish(id) {
  const sample = cultureSamples.find((entry) => entry.id === id);
  if (!sample || state.paused || state.failed) return;
  state.selectedCultureDish = id; saveState();
  document.querySelectorAll("[data-culture-id]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.cultureId === id)));
  $("#culture-observation").innerHTML = `<div class="dish-magnifier">${dishVisual(sample)}</div><div><small>OBSERVATION · ${id}</small><h3>Confluency ${sample.density}</h3><p>${sample.note}</p></div>`;
  $("[data-confirm-culture]").disabled = false;
  $("#culture-feedback").classList.remove("error");
  $("#culture-feedback").textContent = `${id} 관찰 중. 가져가기를 눌러야 선택이 확정된다.`;
}

function showAntibodyColdRack() {
  physicalPuzzleFrame("냉장 보관함", "COLD REAGENT · ANTIBODY VALIDATION", `
    <div class="antibody-requirement"><span>Y</span><div><small>VALIDATION STANDARD</small><strong>ZV-SPIKE 수용체 결합부위 특이적 IgG</strong><p>2–8°C 보관 · 동결 이력 없음 · 침전 없음</p></div></div>
    <div class="cold-rack">${antibodySamples.map((vial) => `<button type="button" data-antibody-id="${vial.id}" aria-pressed="false"><span class="vial-visual" aria-hidden="true"><i></i><b>${vial.id}</b></span><strong>${vial.id}</strong><small>집어 들기</small></button>`).join("")}</div>
    <div class="observation-panel vial-inspection" id="antibody-observation" aria-live="polite">바이알을 집어 라벨을 조사하자.</div>
    <button class="primary-button material-check-button" type="button" data-confirm-antibody disabled>이 재료를 가져간다 <span>→</span></button>
    <p class="material-feedback" id="antibody-feedback" aria-live="polite">집어 들거나 라벨을 읽는 것만으로는 제출되지 않는다.</p>`, "antibody");
  document.querySelectorAll("[data-antibody-id]").forEach((button) => button.addEventListener("click", () => inspectAntibodyVial(button.dataset.antibodyId)));
  $("[data-confirm-antibody]").addEventListener("click", () => {
    if (state.antibodyLabelFlipped) checkAntibodyVial(state.selectedAntibodyVial);
  });
  if (antibodySamples.some((sample) => sample.id === state.selectedAntibodyVial)) inspectAntibodyVial(state.selectedAntibodyVial, true);
}

function inspectAntibodyVial(id, restore = false) {
  const vial = antibodySamples.find((entry) => entry.id === id);
  if (!vial || state.paused || state.failed) return;
  if (!restore || state.selectedAntibodyVial !== id) state.antibodyLabelFlipped = false;
  state.selectedAntibodyVial = id; saveState();
  document.querySelectorAll("[data-antibody-id]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.antibodyId === id)));
  renderVialLabel(vial, false);
  $("#antibody-feedback").classList.remove("error");
  $("#antibody-feedback").textContent = `${id} 조사 중. 앞·뒷면을 확인한 뒤 가져가자.`;
}

function renderVialLabel(vial, back) {
  $("#antibody-observation").innerHTML = `<div class="held-vial${back ? " label-back" : ""}"><span class="vial-visual" aria-hidden="true"><i></i><b>${vial.id}</b></span><div><small>${back ? "뒷면 · 보관 기록" : "앞면 · 제품 라벨"}</small><h3>${vial.id}</h3><p>${back ? vial.label : vial.target}</p><p>${vial.appearance}</p></div></div><button class="label-flip" type="button" data-flip-vial>↻ ${back ? "앞면으로" : "라벨 뒤집기"}</button>`;
  $("[data-confirm-antibody]").disabled = !state.antibodyLabelFlipped;
  $("[data-flip-vial]").addEventListener("click", () => {
    state.antibodyLabelFlipped = true; saveState(); renderVialLabel(vial, !back);
    $("[data-flip-vial]").focus({ preventScroll: true });
  });
}

function materialThreatActive(kind) {
  if (kind === "rescue") return state.rescuePowerFailures > 0 && !state.rescuePowerBiteTriggered && !state.rescueLinkEstablished;
  if (kind === "vaccine") return state.vaccinePuzzleFailures > 0 && !state.vaccinePuzzleBiteTriggered && !state.vaccineValidated;
  const keys = { primer: ["primerPuzzleFailures", "primerPuzzleBiteTriggered", "primerCollected"], culture: ["culturePuzzleFailures", "culturePuzzleBiteTriggered", "cultureCellsCollected"], antibody: ["antibodyPuzzleFailures", "antibodyPuzzleBiteTriggered", "antibodyCollected"] }[kind];
  return Boolean(keys && state[keys[0]] > 0 && !state[keys[1]] && !state[keys[2]]);
}

function approachMarkup(kind) {
  return `<div class="approach-warning" id="approach-warning" ${materialThreatActive(kind) ? "" : "hidden"} role="status"><div class="frosted-door"><img src="assets/images/cnu-zombie-chase.jpg" alt="흐린 문 유리 너머로 다가오는 좀비의 윤곽" /></div><p>문 너머에서 발소리가 멈췄다.</p></div>`;
}

function renderApproachScene() {
  const kind = { molecularBiologyLab: "primer", cellCultureLab: "culture", reagentStorage: "antibody", vaccineDevelopmentLab: "vaccine" }[state.scene];
  $("#approach-scene").hidden = !materialThreatActive(kind);
}

function revealApproachingZombie(kind) {
  const warning = $("#approach-warning");
  if (warning && materialThreatActive(kind)) {
    warning.hidden = false;
    warning.scrollIntoView({ block: "nearest", behavior: "auto" });
    playApproachFootsteps();
  }
}

function playApproachFootsteps() {
  if (!state.audioEnabled || !audioContext || audioContext.state !== "running") return;
  for (let step = 0; step < 3; step++) {
    const start = audioContext.currentTime + step * 0.48;
    const osc = audioContext.createOscillator(), gain = audioContext.createGain();
    osc.type = "sine"; osc.frequency.setValueAtTime(82 - step * 6, start);
    gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(0.085, start + 0.025);
    gain.gain.linearRampToValueAtTime(0, start + 0.2);
    osc.connect(gain); gain.connect(audioContext.destination);
    explorationAudioNodes.push(osc, gain);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); explorationAudioNodes = explorationAudioNodes.filter((node) => node !== osc && node !== gain); };
    osc.start(start); osc.stop(start + 0.22);
  }
}

function stopExplorationAudio() {
  if (voicePlayback) {
    voicePlayback = null;
    window.speechSynthesis?.cancel();
    const button = $("[data-play-record]");
    if (button) button.textContent = "▶ 메시지 듣기";
    const status = $("#voice-status");
    if (status) status.textContent = "재생을 멈췄다. 대본으로도 확인할 수 있다.";
  }
  explorationAudioNodes.forEach((node) => { try { if (node.stop) node.stop(); node.disconnect(); } catch { /* Already ended. */ } });
  explorationAudioNodes = [];
}

function showBiteTransition(finalBite, source) {
  if (blackoutTimer != null) window.clearTimeout(blackoutTimer);
  showModal('<div class="bite-blackout" role="status" aria-label="시야가 잠시 어두워진다"></div>');
  $("#modal").classList.add("blackout-modal");
  const bites = state.bites;
  blackoutTimer = window.setTimeout(() => {
    blackoutTimer = null;
    if (state.paused && state.pendingBiteSource === source && state.bites === bites) showBiteMark(finalBite, source);
  }, 240);
}

function resetExploration() {
  stopExplorationAudio();
  if (blackoutTimer != null) window.clearTimeout(blackoutTimer);
  if (inventoryNoticeTimer != null) window.clearTimeout(inventoryNoticeTimer);
  blackoutTimer = null; inventoryNoticeTimer = null;
  newInventoryItems.clear(); inventoryCategory = "tools"; heldPrimer = "";
}
