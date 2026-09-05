// Entirely local fictional power-routing puzzle and simulated rescue radio.
const rescueCircuits = [
  { id: "radio", name: "비상 송신기", demand: 4 },
  { id: "cold", name: "백신 보관 장치", demand: 3 },
  { id: "gate", name: "송신 구역 격리문 모터", demand: 5 },
];
const rescueRequiredAttachments = ["vaccine-validation-record", "survivor-signal"];

function canStartRescueDefense() {
  return Boolean(state.emergencyPowerRecordCollected && state.vaccineValidated && state.barricadeInstalled);
}

function normalizeRescueState() {
  state.rescuePower = Array.isArray(state.rescuePower) && state.rescuePower.length === 3
    ? state.rescuePower.map((value) => Number.isInteger(value) && value >= 0 && value <= 8 ? value : 0) : [0, 0, 0];
  state.rescuePowerFailures = Number.isFinite(state.rescuePowerFailures) ? Math.max(0, Math.floor(state.rescuePowerFailures)) : 0;
  state.rescueAttachments = Array.isArray(state.rescueAttachments)
    ? [...new Set(state.rescueAttachments.filter((id) => rescueRequiredAttachments.includes(id) && state.inventory.includes(id)))] : [];
  state.rescueDefenseStarted = Boolean(canStartRescueDefense() && (state.rescueDefenseStarted || state.scene === "lobby"));
  state.rescueAntennaReady = Boolean(state.rescueDefenseStarted && state.rescueAntennaReady);
  state.rescueLinkEstablished = Boolean(state.rescueAntennaReady && state.rescueLinkEstablished);
  state.rescueRequestSent = Boolean(state.rescueLinkEstablished && state.rescueRequestSent && rescueRequiredAttachments.every((id) => state.rescueAttachments.includes(id)));
  if (state.rescueLinkEstablished) state.rescuePower = [4, 3, 0];
  if (state.rescueRequestSent) {
    state.rescueRequestElapsed = Number.isFinite(state.rescueRequestElapsed) ? Math.max(0, Math.min(state.elapsed, state.rescueRequestElapsed)) : state.elapsed;
    addItem("rescue-transmission-receipt");
  } else state.rescueRequestElapsed = null;
}

function prepareRescueDefense() {
  if (!canStartRescueDefense() || state.rescueDefenseStarted || state.paused || state.failed) return;
  state.rescueDefenseStarted = true;
  setActivity("로비의 바리케이드가 다시 흔들린다. 학생회장이 건넨 전원 기록과 비상 배전반을 확인해야 한다.");
  saveState();
  window.setTimeout(() => {
    if (!canStartRescueDefense() || !state.rescueDefenseStarted || state.scene !== "lobby" || state.paused || state.failed || state.rescueRequestSent || $("#modal").open) return;
    showModal(modalFrame({ code: "LAST DEFENSE · LOBBY", title: "처음 도망쳐 들어왔던 곳", body: `<p class="result-copy">우리가 펼쳐 놓았던 바리케이드가 철컥거리며 밀린다. 친구들이 지지대를 붙잡고 버티는 사이, 로비의 비상 배전반을 연다.</p><blockquote class="vaccine-quote">“우리가 버틸게. 밖에 연락할 방법을 찾아!”</blockquote><p class="result-copy">냉장 보관함의 표시등이 깜빡인다. 송신 안테나는 별도 격리문 뒤에 접혀 있다. 전원 기록을 펼치고 어떤 장치부터 가동할지 판단해야 한다.</p><button class="primary-button material-check-button" type="button" data-enter-power-panel>배전반을 조사한다 <span>→</span></button>` }));
    $("#modal").classList.add("evidence-modal", "exploration-modal", "rescue-modal");
    $("[data-enter-power-panel]").addEventListener("click", openRescuePowerPanel);
  }, 380);
}

function decorateRescueHotspots(container) {
  container.classList.add("rescue-lobby-hotspots");
  container.insertAdjacentHTML("beforeend", `<button type="button" class="hotspot rescue-power-hotspot${state.rescueLinkEstablished ? " completed" : ""}" data-action="inspect-rescue-power"><span class="pulse" aria-hidden="true"></span><span class="hotspot-label">비상 배전반</span></button><button type="button" class="hotspot rescue-radio-hotspot${state.rescueRequestSent ? " completed" : ""}" data-action="inspect-rescue-radio"><span class="pulse" aria-hidden="true"></span><span class="hotspot-label">${state.rescueRequestSent ? "수신 확인서" : "비상 송신기"}</span></button><button type="button" class="hotspot final-barricade-hotspot danger-marker" data-action="inspect-final-barricade"><span class="pulse" aria-hidden="true"></span><span class="hotspot-label">버티는 바리케이드</span></button>`);
}

function inspectFinalBarricade() {
  if (!state.rescueDefenseStarted || state.scene !== "lobby" || state.paused || state.failed) return;
  showModal(modalFrame({ code: "BARRICADE · HOLDING", title: "아직 버티고 있다", body: `<div class="defense-detail"><img src="assets/images/cnu-lobby-final-defense.jpg" alt="복도 입구를 막고 있는 접이식 바리케이드" /></div><p class="result-copy">경첩은 휘었지만 지지대가 바닥을 붙잡고 있다. 우리가 설치했던 바리케이드다. 친구들이 벌어진 틈을 다시 막는다.</p><p class="result-copy">${state.rescueRequestSent ? "구조대는 위치를 확인했다. 아직 도착한 것은 아니다. 문을 임의로 열지 않고 지시를 기다린다." : "배전반과 송신기를 조작할 동안 이곳이 마지막 방어선이다."}</p>` }));
  $("#modal").classList.add("evidence-modal", "exploration-modal", "rescue-modal");
}

function rescuePanelAvailable() {
  return canStartRescueDefense() && state.rescueDefenseStarted && state.scene === "lobby" && !state.paused && !state.failed;
}

function openRescuePowerPanel() {
  if (!rescuePanelAvailable()) return;
  if (state.rescueLinkEstablished) { openRescueRadio(); return; }
  physicalPuzzleFrame("로비 비상 배전반", "POWER ROUTING · " + (state.rescueAntennaReady ? "ANTENNA DEPLOYED" : "ANTENNA STOWED"), `
    <details class="vaccine-reference"><summary>수집한 비상 전원 기록 펼치기</summary><p>동시에 공급할 수 있는 최대 출력: <strong>8칸</strong></p><p>최소 가동 전력: 송신기 4칸 · 냉장 보관 3칸 · 격리문 모터 5칸.</p><p>HXB가 차단한 주 통신망과 독립 비상 송신기는 별개 회선이다.</p></details>
    <section class="rescue-conditions"><h3>배전 규칙</h3>
      <p><strong>출력 한도</strong> · 세 장치에 배분한 합계는 8칸 이하여야 한다. 8칸은 소모되는 배터리 잔량이 아닌 동시 출력 한도이며, 모두 사용할 필요는 없다.</p>
      <p><strong>냉장 유지</strong> · 매번 ‘배전 실행’을 할 때 백신 보관 장치에 최소 3칸을 배분해야 한다. 각 장치의 표시값은 최소 가동 전력이며, 0칸은 전원 차단을 뜻한다.</p>
      <p><strong>안테나 전개 조건</strong> · 로비 송신 구역 격리문이 완전히 열리면 안테나가 자동으로 펼쳐진다. 그전에는 송신기 전원을 차단해야 한다.</p>
      <p><strong>문 개방 후</strong> · 문은 기계식으로 고정되어 모터 전원을 꺼도 열린 상태를 유지한다. 송신 중에는 격리문 모터에 배분한 전력이 반드시 0칸이어야 한다.</p>
      <p class="handling-copy">이 격리문은 로비 송신 구역의 문이며, 생존자가 있는 3층 격리실 문과는 별개다.</p>
      <strong class="rescue-antenna-state">${state.rescueAntennaReady ? "안테나 전개 완료 · 격리문 열림 / 기계식 고정" : "안테나 접힘 · 격리문 닫힘"}</strong></section>
    <div class="rescue-capacity"><div><span>배분 설정 합계 / 출력 한도</span><strong id="rescue-power-total">0 / 8</strong></div><div class="power-cell-meter" id="rescue-power-meter" aria-hidden="true"></div></div>
    <div class="rescue-circuits">${rescueCircuits.map((circuit, i) => `<section><h3>${circuit.name}</h3><small>최소 가동 전력 ${circuit.demand}칸</small><div class="power-stepper"><button type="button" data-power-index="${i}" data-power-delta="-1" aria-label="${circuit.name} 전력 1칸 줄이기">−</button><output data-power-value="${i}">0</output><button type="button" data-power-index="${i}" data-power-delta="1" aria-label="${circuit.name} 전력 1칸 늘리기">+</button></div></section>`).join("")}</div>
    <p class="handling-copy">+/−는 다음에 적용할 배분값을 설정한다. ‘배전 실행’을 눌러야 조건을 판정하고 적용한다. 숫자를 조정하는 동안에는 기존 장비 상태와 냉장 보관이 유지되며, 오답으로 처리되지 않는다.</p>
    <button class="primary-button material-check-button" type="button" data-apply-rescue-power>배전 실행 <span>→</span></button><p class="material-feedback" id="rescue-power-feedback" aria-live="polite"></p>`, "rescue");
  $("#modal").classList.add("rescue-modal");
  document.querySelectorAll("[data-power-delta]").forEach((button) => button.addEventListener("click", () => adjustRescuePower(Number(button.dataset.powerIndex), Number(button.dataset.powerDelta))));
  $("[data-apply-rescue-power]").addEventListener("click", applyRescuePower);
  renderRescuePowerValues();
}

function adjustRescuePower(index, delta) {
  if (!rescuePanelAvailable() || state.rescueLinkEstablished || ![0, 1, 2].includes(index) || ![-1, 1].includes(delta)) return;
  state.rescuePower[index] = Math.max(0, Math.min(8, state.rescuePower[index] + delta));
  saveState(); renderRescuePowerValues();
}

function renderRescuePowerValues() {
  const total = state.rescuePower.reduce((sum, value) => sum + value, 0);
  $("#rescue-power-total").textContent = `${total} / 8`;
  $("#rescue-power-total").classList.toggle("over-capacity", total > 8);
  $("#rescue-power-meter").innerHTML = Array.from({ length: 8 }, (_, i) => `<i class="${i < total ? "allocated" : ""}${total > 8 ? " overloaded" : ""}"></i>`).join("");
  state.rescuePower.forEach((value, i) => { $(`[data-power-value="${i}"]`).textContent = String(value); });
  document.querySelectorAll("[data-power-delta]").forEach((button) => {
    const value = state.rescuePower[Number(button.dataset.powerIndex)];
    button.disabled = Number(button.dataset.powerDelta) < 0 ? value === 0 : value === 8;
  });
}

function applyRescuePower() {
  if (!rescuePanelAvailable() || state.rescueLinkEstablished) return;
  const [radio, cold, gate] = state.rescuePower;
  if (radio + cold + gate === 0) { $("#rescue-power-feedback").textContent = "전력을 배분한 뒤 실행하자."; return; }
  const safe = radio + cold + gate <= 8 && cold >= 3;
  const valid = safe && (state.rescueAntennaReady ? radio >= 4 && gate === 0 : gate >= 5 && radio === 0);
  if (!valid) { failRescuePower(); return; }
  if (!state.rescueAntennaReady) {
    state.rescueAntennaReady = true;
    setActivity("냉장 보관을 유지하며 송신 구역 격리문을 구동했다. 안테나가 펼쳐지고 문은 기계식으로 고정됐다.");
    saveState(); render(); openRescuePowerPanel();
    $("#rescue-power-feedback").textContent = "격리문 개방·안테나 전개 완료. 문은 전원 없이 열린 상태를 유지한다. 표시된 숫자는 방금 실행한 배분값이며, 이제 다음 배전을 설정할 수 있다.";
  } else {
    state.rescueLinkEstablished = true;
    state.rescuePower = [4, 3, 0];
    setActivity("독립 비상 송신기에 전력이 들어왔다. 냉장 보관을 유지한 채 외부 구조대와 연결됐다.");
    saveState(); render(); openRescueRadio();
  }
}

function failRescuePower() {
  state.rescuePowerFailures += 1;
  state.zombieDistance = Math.max(0, state.zombieDistance - 18);
  setActivity("배전 조건 불일치로 안전 차단기가 작동했다. 바리케이드 너머에서 충격음이 가까워진다.");
  saveState(); render();
  if (state.rescuePowerFailures >= 2 && !state.rescuePowerBiteTriggered) {
    state.rescuePowerBiteTriggered = true; saveState(); triggerZombieAttack("rescue-power"); return;
  }
  $("#rescue-power-feedback").classList.add("error");
  $("#rescue-power-feedback").textContent = state.rescuePowerBiteTriggered ? "가동 조건에 맞지 않는다. 안전 차단기가 작동했다." : "가동 조건 불일치. 바리케이드 틈으로 그림자가 다가온다. 다시 틀리면 물린다.";
  revealApproachingZombie("rescue");
}

function openRescueRadio() {
  if (!rescuePanelAvailable()) return;
  if (state.rescueRequestSent) { showRescueReceipt(); return; }
  if (!state.rescueLinkEstablished) {
    showModal(modalFrame({ code: "EMERGENCY RADIO · OFFLINE", title: "응답 없는 송신기", body: '<p class="result-copy">독립 송신 회선은 살아 있지만 안테나와 전원이 준비되지 않았다. 비상 배전반을 확인해야 한다.</p><button class="primary-button material-check-button" type="button" data-radio-power>배전반 확인</button>' }));
    $("[data-radio-power]").addEventListener("click", openRescuePowerPanel);
  } else {
    showModal(modalFrame({ code: "RESCUE CHANNEL · CONNECTED", title: "밖에서 돌아온 목소리", body: `<div class="survivor-terminal"><small>외부 구조대 · 독립 비상 회선</small><p>“여기는 구조 지휘팀. 신호 잡혔습니다. 건물 안에 생존자가 있습니까?”</p><p>“검증 자료와 생존자 위치를 보내 주세요. 확인 후 접근 계획을 세우겠습니다. 격리실 문은 임의로 열지 마세요.”</p></div><div class="rescue-attachments">${rescueRequiredAttachments.map((id) => `<button type="button" data-rescue-attachment="${id}" aria-pressed="${state.rescueAttachments.includes(id)}"><span>${itemData[id].icon}</span><div><strong>${itemData[id].name}</strong><small>${id === "vaccine-validation-record" ? "V-03 · 표적·유입률·세포 생존율" : "3F 비상 격리실 · 발신자: 학생회장 / 발신팀: 1F 로비"}</small></div><b data-attachment-status="${id}">${state.rescueAttachments.includes(id) ? "✓" : "+"}</b></button>`).join("")}</div><button class="primary-button material-check-button" type="button" data-send-rescue>선택한 자료와 구조 요청 전송 <span>→</span></button><p class="material-feedback" id="rescue-send-feedback" aria-live="polite">인벤토리에서 보낼 기록 2개를 선택하자.</p><p class="handling-copy">게임 속 가상 교신입니다. 실제 구조기관에 연락하거나 개인정보를 전송하지 않습니다.</p>` }));
    document.querySelectorAll("[data-rescue-attachment]").forEach((button) => button.addEventListener("click", () => toggleRescueAttachment(button.dataset.rescueAttachment)));
    $("[data-send-rescue]").addEventListener("click", sendRescueRequest);
  }
  $("#modal").classList.add("evidence-modal", "exploration-modal", "rescue-modal");
}

function toggleRescueAttachment(id) {
  if (!rescuePanelAvailable() || !state.rescueLinkEstablished || state.rescueRequestSent || !rescueRequiredAttachments.includes(id) || !state.inventory.includes(id)) return;
  state.rescueAttachments = state.rescueAttachments.includes(id) ? state.rescueAttachments.filter((entry) => entry !== id) : [...state.rescueAttachments, id];
  saveState();
  $(`[data-rescue-attachment="${id}"]`).setAttribute("aria-pressed", String(state.rescueAttachments.includes(id)));
  $(`[data-attachment-status="${id}"]`).textContent = state.rescueAttachments.includes(id) ? "✓" : "+";
  $("#rescue-send-feedback").textContent = `선택한 기록 ${state.rescueAttachments.length} / 2`;
}

function sendRescueRequest() {
  if (!rescuePanelAvailable() || !state.rescueLinkEstablished || state.rescueRequestSent) return;
  if (!rescueRequiredAttachments.every((id) => state.rescueAttachments.includes(id) && state.inventory.includes(id))) {
    $("#rescue-send-feedback").textContent = "검증 자료와 생존자 위치 기록을 모두 선택해야 한다."; return;
  }
  state.rescueRequestSent = true; state.rescueRequestElapsed = state.elapsed;
  addItem("rescue-transmission-receipt");
  setActivity("구조대가 V-03 검증 자료와 1층 로비·3층 격리실의 생존자 위치를 수신했다. 후보를 보관하며 접근 지시를 기다린다.");
  saveState(); render(); showRescueReceipt();
}

function showRescueReceipt() {
  if (!state.rescueRequestSent || state.failed || state.paused) return;
  showModal(modalFrame({ code: "RESCUE REQUEST · RECEIVED", title: "구조 요청이 전달됐다", body: `<div class="rescue-receipt"><small>LOCAL SIMULATION · 수신 확인</small><strong>검증 자료 + 생존자 위치 수신 완료</strong><dl><div><dt>후보</dt><dd>V-03 · ZV-SPIKE 검증 기록</dd></div><div><dt>발신팀</dt><dd>1층 로비 · 바리케이드 안쪽</dd></div><div><dt>추가 생존자</dt><dd>3층 비상 격리실 · 학생회장</dd></div><div><dt>후보 보관</dt><dd>냉장 전원 유지</dd></div><div><dt>요청 시점</dt><dd>게임 경과 ${formatElapsed(state.rescueRequestElapsed)}</dd></div></dl></div><div class="survivor-terminal"><small>구조 지휘팀</small><p>“자료와 위치 확인했습니다. 의료진과 함께 접근 경로를 확보하겠습니다. 후보와 원본 기록을 보존하고, 생존자 상태를 확인하기 전에는 격리실 문을 열지 마세요.”</p></div><p class="result-copy">바깥에서 누군가 우리 위치를 알고 있다. 하지만 아직 구조대가 도착한 것은 아니다. 우리는 바리케이드 안쪽에서 다음 지시를 기다린다.</p><div class="vaccine-access"><strong>이번 구간 완료 · 구조 요청 수신</strong><p>현재 구간의 시간·추격 진행을 멈췄습니다. 구조대 도착과 후보 인계·배포 이야기는 다음 단계에서 이어집니다.</p></div>` }));
  $("#modal").classList.add("evidence-modal", "exploration-modal", "rescue-modal");
}
