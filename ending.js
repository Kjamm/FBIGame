// Final evacuation and fictional epilogue. Completion is separate from earlier chapter checkpoints.
const endingImage = "assets/images/cnu-evacuation-assembly.jpg";
const endingEpilogue = [
  { code: "LATER · FOLLOW-UP REPORT", title: "우리가 넘긴 후보의 다음 이야기", paragraphs: [
    "대피 직후, 후보와 기록은 외부 의료·연구팀으로 옮겨졌다. 그날 우리가 확인한 것은 연구 후보의 가능성이었다. 누구에게 바로 투여할 수 있는 완성품은 아니었다.",
    "시간이 흐른 뒤, 추가 검증과 생산을 거친 백신이 배포되기 시작했다는 소식이 전해진다. 우리가 복원한 표적 정보와 남겨 온 검증 자료가 그 출발점이 되었다.",
    "백신 한 번으로 그날의 피해가 사라지지는 않았다. 감염자들의 치료와 회복, 지역의 방역은 계속됐다. 그래도 새로운 감염을 막을 수 있는 길이 생겼다.",
  ] },
  { code: "INCIDENT RECORD · PRESERVED", title: "기록에서 누구의 이름도 지우지 않았다", paragraphs: [
    "C-07의 대화와 통신 차단 기록은 HXB의 비공식 검체 반입 지시와 사건 은폐 정황을 조사하는 자료가 됐다. 복구된 원본과 학생들이 확보한 기록이 함께 보존됐다.",
    "학생회장은 위험을 알게 된 뒤 경보를 끄고 격리를 해제했으며 기록을 지웠다는 자신의 행동을 진술했다. 사고 뒤 수습에 협조한 사실도 남았다. 하지만 그 협조가 앞선 선택의 책임을 없애지는 않았다.",
    "이것은 조사와 기록 보존의 시작이었다. 기업의 지시, 회장의 행동, 각자의 책임은 자료를 대조해 확인할 문제로 남았다. 구조되었다는 이유로 사건이 덮이지는 않았다.",
  ] },
  { code: "EPILOGUE · WHAT WE BROUGHT BACK", title: "다시, 함께 돌아갈 곳", paragraphs: [
    "기업 탐방에서 돌아오던 버스 안에서는, 그날 배운 것을 이야기하고 있었다. 건물에 갇힌 뒤에는 서로 다른 기억과 지식을 꺼내 놓으며 다음 문을 찾았다.",
    "처음에는 암호 하나를 풀기 위해 들여다본 종이였다. 끝에 남은 것은 정답만이 아니었다. 누가 무엇을 했는지 남기는 기록, 서로를 기다린 시간, 바깥에 닿은 목소리였다.",
    "모든 것이 예전으로 돌아온 것은 아니다. 그래도 우리는 다시 만날 약속을 한다. 이번에는 누군가 뒤에 남아 있지 않은지, 함께 확인하면서.",
  ] },
];

function endingAvailable() {
  return state.handoffComplete && state.endingStarted && !state.paused && !state.failed;
}

function makeEndingSummary() {
  return {
    elapsed: state.elapsed,
    bites: state.bites,
    evidenceIds: state.inventory.filter((id) => id !== "game-clear-record" && inventoryGroup(id) === "evidence"),
    deliveredIds: [...state.handoffDelivered],
  };
}

function normalizeEndingState() {
  state.endingStarted = Boolean(state.handoffComplete && !state.failed && state.endingStarted);
  state.endingDepartureStep = state.endingStarted && Number.isInteger(state.endingDepartureStep) ? Math.max(0, Math.min(2, state.endingDepartureStep)) : 0;
  state.escaped = Boolean(state.endingStarted && state.endingDepartureStep === 2 && state.escaped);
  if (!state.escaped && state.endingDepartureStep === 2) state.endingDepartureStep = 1;
  state.endingEpilogueStarted = Boolean(state.escaped && state.endingEpilogueStarted);
  state.endingEpilogueIndex = state.endingEpilogueStarted && Number.isInteger(state.endingEpilogueIndex) ? Math.max(0, Math.min(endingEpilogue.length - 1, state.endingEpilogueIndex)) : 0;
  state.endingComplete = Boolean(state.endingEpilogueStarted && state.endingEpilogueIndex === endingEpilogue.length - 1 && state.endingComplete);
  if (state.escaped) {
    const snapshot = state.endingSummary;
    const validIds = (ids, allowed) => Array.isArray(ids) ? [...new Set(ids.filter((id) => allowed.includes(id)))] : [...allowed];
    const fallback = makeEndingSummary();
    state.endingSummary = snapshot && typeof snapshot === "object" ? {
      elapsed: Number.isFinite(snapshot.elapsed) ? Math.max(0, Math.min(state.elapsed, Math.floor(snapshot.elapsed))) : fallback.elapsed,
      bites: Number.isInteger(snapshot.bites) && snapshot.bites >= 0 && snapshot.bites < 3 ? snapshot.bites : fallback.bites,
      evidenceIds: validIds(snapshot.evidenceIds, fallback.evidenceIds),
      deliveredIds: validIds(snapshot.deliveredIds, fallback.deliveredIds),
    } : fallback;
    state.scene = "rescueAssembly";
    state.pendingBiteSource = null;
  } else {
    state.endingSummary = null;
    if (state.scene === "rescueAssembly") state.scene = "lobby";
  }
  if (state.endingComplete) addItem("game-clear-record");
  else state.inventory = state.inventory.filter((id) => id !== "game-clear-record");
}

function endingModal(title, code, body) {
  showModal(modalFrame({ title, code, body }));
  $("#modal").classList.add("evidence-modal", "exploration-modal", "ending-modal");
}

function startEnding() {
  if (!state.handoffComplete || state.paused || state.failed) return;
  if (!state.endingStarted && state.scene !== "lobby") return;
  if (!state.endingStarted) {
    state.endingStarted = true;
    sceneTransitionId += 1;
    setActivity("후보와 기록을 인계했다. 이제 구조대의 안내에 따라 함께 건물을 나설 차례다.");
    saveState(); render();
  }
  openEndingFlow();
}

function openEndingFlow() {
  if (!endingAvailable()) return;
  if (state.endingComplete) showEndingResult();
  else if (state.endingEpilogueStarted) showEndingEpilogue();
  else if (state.escaped) showEscapeArrival();
  else showEndingDeparture();
}

function showEndingDeparture() {
  if (!endingAvailable() || state.escaped || state.scene !== "lobby") return;
  const step = state.endingDepartureStep;
  const path = [...state.rescueRoutePath].reverse().map((id) => rescueRouteNodes.find((node) => node.id === id).name).join(" → ");
  endingModal(step ? "우리가 열어 둔 길로" : "마지막으로 서로를 확인한다", `EVACUATION · ${step + 1} / 2`, `
    <div class="survivor-terminal"><small>구조팀 · 대피 안내</small><p>${step ? "“남측 보조문까지 연결됩니다. 앞뒤에서 동행하겠습니다. 정문 바리케이드는 해체하지 않습니다.”" : "“후보와 기록은 인계받았습니다. 함께 움직일 학생들이 모였는지 확인해 주세요. 보호 이송 중인 생존자는 의료진이 동행합니다.”"}</p></div>
    ${step ? `<p class="ending-path">${path}</p><p class="result-copy">카트를 밀어 두었던 자리를 지나간다. 들어오는 사람들을 위해 확보했던 통로가 이제 우리가 나가는 길이 되었다. 보조문 너머로 바깥빛이 들어온다.</p>` : '<p class="result-copy">우리는 서로의 얼굴을 확인한다. 로비를 지켰던 친구가 마지막으로 지지대에서 손을 뗀다. 그 자리는 구조대가 맡는다. 학생회장도 의료진 곁에서 이동 안내를 기다리고 있다.</p><p class="result-copy">“혼자 먼저 가지 말자. 같이 나가자.”</p>'}
    <p class="handling-copy">구조대의 통제 아래 진행되는 대피 장면이다. 추가 제한 시간이나 오답 판정은 없다.</p>
    <button type="button" class="primary-button material-check-button" data-ending-depart>${step ? "구조대와 함께 보조문 밖으로 나간다" : "동행 확인을 마치고 출발한다"}<span>→</span></button>`);
  $("[data-ending-depart]").addEventListener("click", () => advanceEndingDeparture(step));
}

function advanceEndingDeparture(expectedStep) {
  if (!endingAvailable() || state.escaped || state.scene !== "lobby" || expectedStep !== state.endingDepartureStep) return;
  if (state.endingDepartureStep === 0) {
    state.endingDepartureStep = 1; saveState(); showEndingDeparture(); return;
  }
  state.endingDepartureStep = 2;
  state.escaped = true;
  state.scene = "rescueAssembly";
  state.endingSummary = makeEndingSummary();
  sceneTransitionId += 1;
  $("#scene").classList.remove("transitioning");
  setActivity("건물 밖 구조 구역에 도착했다. 우리는 탈출했다. 후보와 기록, 생존자도 구조팀에 인계했다.");
  saveState(); render(); showEscapeArrival();
}

function endingPhoto() {
  return `<figure class="ending-photo"><img src="${endingImage}" alt="건물 밖 통제 구역에서 구조대와 함께 모여 있는 성인 대학생들" /><figcaption>건물 밖 구조 구역 · 게임 속 가상 장면</figcaption></figure>`;
}

function showEscapeArrival() {
  if (!endingAvailable() || !state.escaped) return;
  endingModal("우리는 밖으로 나왔다", "ESCAPE SUCCESS · OUTSIDE", `${endingPhoto()}
    <p class="ending-kicker">탈출 성공</p><p class="result-copy">문이 우리 뒤에서 닫힌다. 이번에는 갇히는 소리가 아니다. 통제선 바깥에서 서로의 목소리가 또렷하게 들린다.</p>
    <p class="result-copy">${state.endingSummary.bites > 0 ? "팔에 남은 물림 자국을 의료진에게 알린다. 탈출했다고 몸의 상태까지 괜찮아진 것은 아니다. 관찰과 진료는 계속된다." : "우리는 의료진의 안내에 따라 상태 확인을 기다린다. 물린 적이 없다는 사실만으로 모든 확인이 끝난 것은 아니다."}</p>
    <p class="result-copy">학생회장도 별도의 보호 아래 이동한다. 백신 후보와 사건 기록은 이미 담당 팀의 손에 있다. 건물 안에서 시작한 일의 다음 부분은 이제 바깥에서 이어진다.</p>
    <button type="button" class="primary-button material-check-button" data-open-epilogue>그 뒤의 소식을 확인한다 <span>→</span></button>`);
  $("[data-open-epilogue]").addEventListener("click", beginEndingEpilogue);
}

function beginEndingEpilogue() {
  if (!endingAvailable() || !state.escaped) return;
  if (state.endingComplete) { showEndingResult(); return; }
  state.endingEpilogueStarted = true; saveState(); showEndingEpilogue();
}

function showEndingEpilogue(replayIndex) {
  if (!endingAvailable() || !state.endingEpilogueStarted) return;
  const replay = state.endingComplete;
  const index = replay ? (Number.isInteger(replayIndex) ? Math.max(0, Math.min(endingEpilogue.length - 1, replayIndex)) : 0) : state.endingEpilogueIndex;
  const page = endingEpilogue[index];
  endingModal(page.title, `${page.code} · ${index + 1} / ${endingEpilogue.length}`, `
    <article class="ending-epilogue"><p class="ending-kicker">${index === 0 ? "시간이 흐른 뒤" : index === 1 ? "남겨진 기록" : "그날 이후의 우리"}</p>${page.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}</article>
    <p class="handling-copy">게임 속 허구의 후일담이다. 백신 배포까지의 시간 경과는 60분 플레이 제한과 별개다.</p>
    <div class="ending-actions"><button type="button" data-epilogue-back ${index === 0 ? "disabled" : ""}>이전 이야기</button><button type="button" class="primary-button" data-epilogue-next>${index === endingEpilogue.length - 1 ? "플레이 결과 확인" : "다음 이야기"}<span>→</span></button></div>`);
  $("[data-epilogue-back]").addEventListener("click", () => {
    if (!endingAvailable() || index === 0) return;
    if (!replay) { state.endingEpilogueIndex = index - 1; saveState(); }
    showEndingEpilogue(index - 1);
  });
  $("[data-epilogue-next]").addEventListener("click", () => {
    if (!endingAvailable()) return;
    if (replay) { if (index === endingEpilogue.length - 1) showEndingResult(); else showEndingEpilogue(index + 1); }
    else advanceEndingEpilogue(index);
  });
}

function advanceEndingEpilogue(expectedIndex) {
  if (!endingAvailable() || !state.endingEpilogueStarted || state.endingComplete || expectedIndex !== state.endingEpilogueIndex) return;
  if (state.endingEpilogueIndex < endingEpilogue.length - 1) {
    state.endingEpilogueIndex += 1; saveState(); showEndingEpilogue(); return;
  }
  state.endingComplete = true;
  addItem("game-clear-record");
  setActivity("탈출 완료. 백신 후보는 추가 검증과 생산을 거쳐 배포로 이어졌고, 사건 기록은 후속 조사에 남았다.");
  saveState(); render(); showEndingResult();
}

function showEndingResult() {
  if (!endingAvailable() || !state.endingComplete || !state.endingSummary) return;
  const summary = state.endingSummary;
  endingModal("생정융 · 탈출 완료", "THE END · RECORD SAVED", `${endingPhoto()}
    <p class="ending-kicker">함께 돌아온 사람들</p>
    <dl class="ending-stats"><div><dt>위험 구간 플레이 시간</dt><dd>${formatElapsed(summary.elapsed)}</dd></div><div><dt>물린 횟수</dt><dd>${summary.bites}회</dd></div><div><dt>보관한 기록</dt><dd>${summary.evidenceIds.length}개</dd></div><div><dt>인계한 후보·자료</dt><dd>${summary.deliveredIds.length}개</dd></div></dl>
    <p class="handling-copy">시간은 일시정지와 구조대 합류 후 대화·대피·에필로그를 제외한 게임 시계 기준이다. 보관 기록 수에는 증거와 접수 확인서를 포함하며, 이 결과 카드는 제외한다.</p>
    <p class="result-copy">우리의 탈출이 끝이 아니라, 다음 사람들이 살아갈 수 있는 시작이 되었다.</p>
    <details class="ending-record-list"><summary>함께 가져온 기록 확인</summary><ul>${summary.evidenceIds.map((id) => `<li>${itemData[id].name}</li>`).join("")}</ul></details>
    <div class="ending-actions"><button type="button" data-ending-replay>에필로그 다시 보기</button><button type="button" data-ending-restart>처음부터 다시 플레이</button></div>`);
  $("[data-ending-replay]").addEventListener("click", () => showEndingEpilogue(0));
  $("[data-ending-restart]").addEventListener("click", confirmEndingRestart);
}

function confirmEndingRestart() {
  if (!endingAvailable() || !state.endingComplete) return;
  endingModal("새 게임을 시작할까?", "RESTART · CONFIRM", '<p class="result-copy">새 게임을 시작하면 이 브라우저의 현재 진행 상황과 탈출 결과를 새 저장으로 덮어쓴다. 취소하면 결과를 그대로 보관한다.</p><div class="ending-actions"><button type="button" data-ending-cancel>취소 · 결과로 돌아가기</button><button type="button" class="primary-button" data-ending-confirm>확인 · 새 게임 시작</button></div>');
  $("[data-ending-cancel]").addEventListener("click", showEndingResult);
  $("[data-ending-confirm]").addEventListener("click", () => {
    if (endingAvailable() && state.endingComplete) startGame(true);
  });
}

function renderEndingHotspots(container) {
  container.classList.remove("rescue-lobby-hotspots");
  container.innerHTML = `<button type="button" class="hotspot ending-record-hotspot" data-action="open-ending"><span class="pulse" aria-hidden="true"></span><span class="hotspot-label">${state.endingComplete ? "탈출 결과 · 에필로그" : "대피 이후의 이야기"}</span></button>`;
}

function inspectEndingArchive(id) {
  if (!endingAvailable() || !state.escaped || !state.inventory.includes(id)) return;
  if (id === "game-clear-record") { showEndingResult(); return; }
  if (id === "handoff-receipt") { showHandoffReceipt(); return; }
  if (id === "president-statement") { showPresidentStatementRecord(); return; }
  if (id === "vaccine-validation-record") { showTransferredValidation(); return; }
  const note = handoffItemNotes[id];
  endingModal(itemData[id].name, "AFTER ESCAPE · ARCHIVE SUMMARY", `<p class="result-copy">${note ? note[2] : itemData[id].description}</p><p class="handling-copy">${state.handoffDelivered.includes(id) ? "인계가 끝난 항목의 보관 기록이다. 실물과 확보 자료는 담당 팀이 보관한다." : "탈출 시 보유한 항목의 기록이다. 건물 내부 재진입이나 추가 수집은 진행되지 않는다."}</p><button type="button" class="primary-button material-check-button" data-archive-ending>${state.endingComplete ? "탈출 결과로 돌아간다" : "이후 이야기 이어 보기"}<span>→</span></button>`);
  $("[data-archive-ending]").addEventListener("click", openEndingFlow);
}
