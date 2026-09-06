// Fictional schematic, not a real campus evacuation plan. All radio traffic is local.
const rescueRouteNodes = [
  { id: "A", name: "정문", entry: true }, { id: "B", name: "정문 홀" }, { id: "C", name: "로비", goal: true },
  { id: "D", name: "서측 출입구", entry: true }, { id: "E", name: "물품 대기실" }, { id: "F", name: "안쪽 복도" },
  { id: "G", name: "남측 보조문", entry: true }, { id: "H", name: "연결 통로" }, { id: "I", name: "계단 전실" },
];
const rescueRouteEdges = ["AB", "BC", "DE", "EF", "GH", "HI", "AD", "DG", "BE", "EH", "CF", "FI"];
const rescueRouteCameras = [
  { id: "north", name: "CAM 01 · 정문", image: "cnu-zombie-chase.jpg", alt: "정문 쪽 복도에 몰려 있는 감염체들", observations: ["A 정문: 유리문 바깥을 감염체 무리가 에워싸고 있다.", "B 정문 홀: 넘어진 철제 수납장이 통로 전체를 막고 있다."] },
  { id: "west", name: "CAM 02 · 물품 구역", image: "cnu-hallway-101-105.jpg", alt: "물품 구역의 어두운 복도 중계 영상", observations: ["D 서측 출입구: 문을 두드리는 감염체의 그림자가 반복해서 지나간다.", "E 물품 대기실: 감염체는 보이지 않는다. 통로에 있는 운반 카트는 바퀴 잠금을 풀어 옆으로 옮길 수 있다."] },
  { id: "south", name: "CAM 03 · 연결 통로", image: "cnu-reading-room-entrance.jpg", alt: "문과 연결 통로를 비추는 중계 영상", observations: ["H 연결 통로 · F 안쪽 복도: 움직이는 그림자나 통로를 막는 물건이 없다.", "I 계단 전실: 방화문이 휘어 바닥에 걸렸다. 구조대 장비가 통과할 폭으로 열리지 않는다.", "G 남측 보조문: 안쪽 잠금은 정상이다. 외부 상황은 구조대의 현장 보고로 확인해야 한다."] },
];

function rescueChapterWaiting() {
  return state.rescueRequestSent && (!state.rescueRouteStarted || state.rescueRouteSecured);
}

function rescueRouteAvailable() {
  return rescuePanelAvailable() && state.rescueRequestSent && state.rescueRouteStarted;
}

function routeNeighbors(a, b) {
  return rescueRouteEdges.includes(a + b) || rescueRouteEdges.includes(b + a);
}

function routePathValid(path) {
  return path.length > 1 && rescueRouteNodes.some((node) => node.id === path[0] && node.entry)
    && path[path.length - 1] === "C" && !path.some((id) => ["A", "B", "D", "I"].includes(id))
    && new Set(path).size === path.length && path.every((id, i) => rescueRouteNodes.some((node) => node.id === id) && (!i || routeNeighbors(path[i - 1], id)));
}

function normalizeRescueRouteState() {
  state.rescueRouteStarted = Boolean(state.rescueRequestSent && state.rescueRouteStarted);
  const path = Array.isArray(state.rescueRoutePath) ? state.rescueRoutePath : [];
  state.rescueRoutePath = state.rescueRouteStarted && new Set(path).size === path.length
    && path.every((id, i) => rescueRouteNodes.some((node) => node.id === id && (i > 0 || node.entry)) && (!i || routeNeighbors(path[i - 1], id))) ? [...path] : [];
  state.rescueRouteCamerasRead = state.rescueRouteStarted && Array.isArray(state.rescueRouteCamerasRead)
    ? [...new Set(state.rescueRouteCamerasRead.filter((id) => rescueRouteCameras.some((camera) => camera.id === id)))] : [];
  state.rescueRouteFailures = state.rescueRouteStarted && Number.isFinite(state.rescueRouteFailures) ? Math.max(0, Math.floor(state.rescueRouteFailures)) : 0;
  state.rescueRouteBiteTriggered = Boolean(state.rescueRouteStarted && state.rescueRouteBiteTriggered);
  state.rescueRouteApproved = Boolean(state.rescueRouteStarted && state.rescueRouteApproved && routePathValid(state.rescueRoutePath) && state.rescueRouteCamerasRead.length === rescueRouteCameras.length);
  state.rescuePassageCleared = Boolean(state.rescueRouteApproved && state.rescuePassageCleared);
  state.rescueRouteSecured = Boolean(state.rescuePassageCleared && state.rescueRouteSecured);
  state.rescueRouteElapsed = state.rescueRouteSecured && Number.isFinite(state.rescueRouteElapsed) ? Math.max(0, Math.min(state.elapsed, state.rescueRouteElapsed)) : null;
  if (state.rescueRouteSecured) addItem("rescue-entry-record");
  else state.inventory = state.inventory.filter((id) => id !== "rescue-entry-record");
  normalizeHandoffState();
}

function startRescueRoute() {
  if (!rescuePanelAvailable() || !state.rescueRequestSent) return;
  if (!state.rescueRouteStarted) {
    state.rescueRouteStarted = true;
    setActivity("구조대가 건물 외곽에 도착했다. 정문은 막혀 있다. 중계된 CCTV와 도면으로 다른 진입 경로를 찾아야 한다.");
    saveState(); render();
  }
  openRescueRoute();
}

function openRescueRoute() {
  if (!rescueRouteAvailable()) return;
  if (state.rescueRouteSecured) { showRescueEntryRecord(); return; }
  if (state.rescueRouteApproved) { openRescueCooperation(); return; }
  physicalPuzzleFrame("구조 경로 확보", "ACCESS PLANNING · CCTV RELAY", `
    <div class="survivor-terminal route-radio"><small>구조 지휘팀 · 건물 외곽 도착</small><p>“정문은 접근 불가입니다. 남측 보조문 바깥은 저희가 확보했습니다. 과사무실 CCTV를 이 단말기에 중계합니다. 장비를 운반할 수 있는 경로를 골라 주세요. 무리가 있는 곳과 고정 장애물은 통과할 수 없습니다.”</p></div>
    <div class="route-workspace"><section aria-label="진입 경로 도면">
      <h3>1F 진입 도면 <small>게임용 가상 배치</small></h3>
      <p class="handling-copy">외부 출입구에서 시작해 선으로 연결된 지점을 차례로 누르고 로비까지 이어 보자. 선택했던 지점을 다시 누르면 그곳까지 되돌린다.</p>
      <div class="route-map"><svg viewBox="0 0 300 300" preserveAspectRatio="none" aria-hidden="true">${rescueRouteEdges.map((edge) => {
        const a = rescueRouteNodes.findIndex((node) => node.id === edge[0]), b = rescueRouteNodes.findIndex((node) => node.id === edge[1]);
        return `<line x1="${a % 3 * 100 + 50}" y1="${Math.floor(a / 3) * 100 + 50}" x2="${b % 3 * 100 + 50}" y2="${Math.floor(b / 3) * 100 + 50}" data-route-edge="${edge}" />`;
      }).join("")}</svg>${rescueRouteNodes.map((node) => `<button type="button" data-route-node="${node.id}" aria-pressed="false" aria-label="${node.id} ${node.name}${node.entry ? ' 외부 출입구' : node.goal ? ' 목적지' : ''}"><b>${node.id}</b><span>${node.name}</span><small>${node.entry ? "외부 출입구" : node.goal ? "목적지" : "내부"}</small></button>`).join("")}</div>
      <p class="route-path" id="route-path" aria-live="polite"></p>
      <div class="route-edit"><button type="button" data-route-undo>한 칸 되돌리기</button><button type="button" data-route-reset>경로 지우기</button></div>
    </section><section aria-label="CCTV 관찰 기록"><h3>CCTV 중계 <small>영상 + 관찰 기록</small></h3>
      <div class="route-cameras">${rescueRouteCameras.map((camera) => `<button type="button" data-route-camera="${camera.id}" aria-pressed="false">${camera.name}<span data-camera-read="${camera.id}"></span></button>`).join("")}</div>
      <div id="route-camera-view" class="route-camera-view" aria-live="polite"><p>카메라를 선택하면 영상과 해당 구역의 관찰 기록이 표시된다.</p></div>
    </section></div>
    <p class="handling-copy">경로 편집과 CCTV 열람은 오답으로 처리되지 않는다. ‘경로 검증 요청’을 눌러야 판정한다. 시간과 추격은 진행 중이다.</p>
    <button type="button" class="primary-button material-check-button" data-route-submit>경로 검증 요청 <span>→</span></button>
    <p class="material-feedback" id="route-feedback" aria-live="polite"></p>`, "route");
  $("#modal").classList.add("rescue-modal", "route-modal");
  document.querySelectorAll("[data-route-node]").forEach((button) => button.addEventListener("click", () => selectRescueRouteNode(button.dataset.routeNode)));
  document.querySelectorAll("[data-route-camera]").forEach((button) => button.addEventListener("click", () => inspectRouteCamera(button.dataset.routeCamera)));
  $("[data-route-undo]").addEventListener("click", () => editRescueRoute(false));
  $("[data-route-reset]").addEventListener("click", () => editRescueRoute(true));
  $("[data-route-submit]").addEventListener("click", submitRescueRoute);
  renderRescueRouteDraft();
  const lastCamera = state.rescueRouteCamerasRead[state.rescueRouteCamerasRead.length - 1];
  if (lastCamera) inspectRouteCamera(lastCamera);
}

function routeDraftEditable() {
  return rescueRouteAvailable() && !state.rescueRouteApproved;
}

function routeFeedback(copy, error = false) {
  $("#route-feedback").textContent = copy;
  $("#route-feedback").classList.toggle("error", error);
}

function selectRescueRouteNode(id) {
  if (!routeDraftEditable()) return;
  const node = rescueRouteNodes.find((entry) => entry.id === id);
  if (!node) return;
  const path = state.rescueRoutePath, index = path.indexOf(id);
  if (index >= 0) state.rescueRoutePath = path.slice(0, index + 1);
  else if (!path.length && node.entry) state.rescueRoutePath = [id];
  else if (path.length && path[path.length - 1] !== "C" && routeNeighbors(path[path.length - 1], id)) path.push(id);
  else { routeFeedback(path.length ? "마지막 지점과 선으로 연결된 곳을 선택하자. 로비에 도착했다면 제출하거나 경로를 되돌릴 수 있다." : "외부 출입구 표시가 있는 지점부터 선택하자."); return; }
  routeFeedback(""); saveState(); renderRescueRouteDraft();
}

function editRescueRoute(clear) {
  if (!routeDraftEditable()) return;
  state.rescueRoutePath = clear ? [] : state.rescueRoutePath.slice(0, -1);
  saveState(); renderRescueRouteDraft(); routeFeedback("");
}

function renderRescueRouteDraft() {
  const path = state.rescueRoutePath;
  document.querySelectorAll("[data-route-node]").forEach((button) => button.setAttribute("aria-pressed", String(path.includes(button.dataset.routeNode))));
  document.querySelectorAll("[data-route-edge]").forEach((line) => {
    const edge = line.dataset.routeEdge;
    line.classList.toggle("selected", path.some((id, i) => i > 0 && (path[i - 1] + id === edge || id + path[i - 1] === edge)));
  });
  $("#route-path").textContent = path.length ? path.join(" → ") : "아직 선택한 경로가 없다.";
  $("[data-route-undo]").disabled = $("[data-route-reset]").disabled = !path.length;
}

function inspectRouteCamera(id) {
  if (!routeDraftEditable()) return;
  const camera = rescueRouteCameras.find((entry) => entry.id === id);
  if (!camera) return;
  if (!state.rescueRouteCamerasRead.includes(id)) state.rescueRouteCamerasRead.push(id);
  saveState();
  document.querySelectorAll("[data-route-camera]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.routeCamera === id));
    $(`[data-camera-read="${button.dataset.routeCamera}"]`).textContent = state.rescueRouteCamerasRead.includes(button.dataset.routeCamera) ? " · 확인함" : "";
  });
  $("#route-camera-view").innerHTML = `<figure><img src="assets/images/${camera.image}" alt="${camera.alt}" /><figcaption>${camera.name} · 수신 시점 고정 영상</figcaption></figure><ul>${camera.observations.map((observation) => `<li>${observation}</li>`).join("")}</ul>`;
}

function submitRescueRoute() {
  if (!routeDraftEditable()) return;
  if (state.rescueRoutePath[state.rescueRoutePath.length - 1] !== "C") { routeFeedback("외부 출입구에서 로비까지 경로를 완성해야 한다."); return; }
  if (state.rescueRouteCamerasRead.length !== rescueRouteCameras.length) { routeFeedback("중계된 CCTV 세 곳의 관찰 기록을 모두 확인한 뒤 요청하자."); return; }
  if (!routePathValid(state.rescueRoutePath)) {
    state.rescueRouteFailures += 1;
    state.zombieDistance = Math.max(0, state.zombieDistance - 12);
    setActivity("구조대가 위험 구역이 포함된 경로의 진입을 보류했다. 확인이 늦어지는 사이 바리케이드 너머 발소리가 가까워진다.");
    saveState(); render();
    if (state.rescueRouteFailures >= 2 && !state.rescueRouteBiteTriggered) {
      state.rescueRouteBiteTriggered = true; saveState(); triggerZombieAttack("rescue-route"); return;
    }
    routeFeedback("이 경로로는 진입할 수 없다. CCTV 관찰 기록과 도면을 다시 대조하자.", true);
    revealApproachingZombie("route"); return;
  }
  state.rescueRouteApproved = true;
  setActivity("구조대가 진입 경로를 승인했다. 안쪽 운반 통로를 확보하고 보조문의 잠금을 해제해야 한다.");
  saveState(); render(); openRescueCooperation();
}

function openRescueCooperation() {
  if (!rescueRouteAvailable() || !state.rescueRouteApproved) return;
  if (state.rescueRouteSecured) { showRescueEntryRecord(); return; }
  showModal(modalFrame({ code: "JOINT ENTRY · HOLD POSITION", title: "같은 문을 사이에 두고", body: `
    <div class="survivor-terminal"><small>구조 지휘팀 · 남측 보조문 바깥</small><p>“경로 확인했습니다. 문 바깥은 저희가 지키겠습니다. 안쪽 운반 통로를 확보한 뒤 잠금을 해제해 주세요. 정문 바리케이드는 그대로 유지하세요.”</p></div>
    <p class="route-path">${state.rescueRoutePath.join(" → ")}</p>
    <p class="result-copy">${state.rescuePassageCleared ? "친구들과 카트를 벽 쪽으로 밀어 운반 통로를 넓혔다. 다른 학생들은 여전히 정문 바리케이드를 붙잡고 있다. 보조문 너머에서 무전과 함께 두 번의 노크가 들린다." : "우리는 로비에서 안쪽 복도를 따라 물품 대기실로 움직인다. CCTV에서 보았던 운반 카트가 길을 좁히고 있다. 친구 한 명이 바퀴의 잠금 레버를 찾는다. “같이 밀자. 저쪽에서도 기다리고 있어.”"}</p>
    <button type="button" class="primary-button material-check-button" data-route-cooperate>${state.rescuePassageCleared ? "구조대와 신호를 맞추고 보조문 잠금 해제" : "친구들과 운반 카트를 옆으로 옮긴다"}<span>→</span></button>
    <p class="handling-copy">조작하는 문은 1층 남측 보조문이다. 3층 생존자 격리실과 송신 안테나 구역의 문은 건드리지 않는다.</p>` }));
  $("#modal").classList.add("evidence-modal", "exploration-modal", "rescue-modal");
  $("[data-route-cooperate]").addEventListener("click", advanceRescueCooperation);
}

function advanceRescueCooperation() {
  if (!rescueRouteAvailable() || !state.rescueRouteApproved || state.rescueRouteSecured) return;
  if (!state.rescuePassageCleared) {
    state.rescuePassageCleared = true;
    setActivity("친구들과 물품 대기실의 운반 카트를 치웠다. 구조대는 남측 보조문 바깥을 지키며 신호를 기다린다.");
    saveState(); render(); openRescueCooperation(); return;
  }
  state.rescueRouteSecured = true; state.rescueRouteElapsed = state.elapsed;
  addItem("rescue-entry-record");
  setActivity("남측 보조문을 통해 구조대가 로비에 진입했다. 정문 바리케이드와 냉장 전원은 유지 중이다. 백신 후보와 사건 증거 인계를 준비한다.");
  saveState(); render(); showRescueEntryRecord();
}

function showRescueEntryRecord() {
  if (!state.rescueRouteSecured || state.paused || state.failed) return;
  showModal(modalFrame({ code: "ACCESS SECURED · TEAM INSIDE", title: "문 너머의 사람들이 들어왔다", body: `
    <div class="survivor-terminal"><small>구조팀 · 1층 로비 도착</small><p>보조문이 열리고 손전등 빛이 복도를 가른다. 구조대가 장비를 들고 들어온 뒤 문을 다시 통제한다. 학생들은 함께 로비로 돌아온다.</p><p>“이쪽 방어는 저희가 맡겠습니다. 후보 보관 위치와 원본 기록부터 확인하겠습니다. 3층 격리실은 의료진이 상태를 확인한 뒤 접근합니다.”</p></div>
    <div class="rescue-receipt"><strong>구조대 진입 확인</strong><p>${state.rescueRoutePath.map((id) => rescueRouteNodes.find((node) => node.id === id).name).join(" → ")}</p><p>운반 통로 확보 · 정문 바리케이드 유지 · 백신 후보 냉장 유지</p></div>
    <p class="result-copy">${state.handoffComplete ? "구조대 합류 뒤 후보와 증거를 인계했고, 학생회장도 의료진과 함께 로비 보호 구역으로 이동했다. 이 문서는 구조대가 처음 진입한 순간의 기록이다." : state.handoffStarted ? "우리가 확보한 길로 구조대가 들어왔다. 현재 후보·증거 인계와 생존자 보호 절차를 이어가고 있다." : "우리가 버틴 시간이 누군가 들어올 길이 됐다. 그러나 후보는 아직 인계하지 않았고, 학생회장도 3층 격리실 안에 있다. 이제 우리가 알아낸 사실을 빠짐없이 전달해야 한다."}</p>
    <div class="vaccine-access"><strong>구조 경로 확보 완료</strong><p>구조대가 방어를 맡아 시간과 추격은 멈춰 있다. 로비에서 후보·증거 인계를 진행할 수 있다.</p></div>
    <button type="button" class="primary-button material-check-button" data-entry-handoff>${state.scene !== "lobby" ? "로비의 구조대에게 돌아간다" : state.handoffComplete ? "인계 확인서 확인" : state.handoffStarted ? "후보·증거 인계 이어하기" : "구조대와 후보·증거 인계 시작"}<span>→</span></button>` }));
  $("#modal").classList.add("evidence-modal", "exploration-modal", "rescue-modal");
  $("[data-entry-handoff]").addEventListener("click", () => {
    if (state.scene !== "lobby") goToLobby();
    else startHandoff();
  });
}
