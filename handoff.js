// Story-only local handoff. No actual medical treatment, reporting, or external transmission.
const handoffRequiredItems = ["vaccine-candidate", "vaccine-validation-record", "target-protein-report", "c07-record", "emergency-power-record"];
const handoffOptionalItems = ["graduate-letter", "research-fragment", "damaged-sequence-chip", "president-note", "president-access-log", "president-voice"];
const handoffItemNotes = {
  "vaccine-candidate": ["외부 의료·연구팀", "V-03 보관함", "보관 중인 V-03을 인계한다. 현장 검증을 통과한 연구 후보이며, 바로 투여할 완제품은 아니다.", "의료·연구팀이 후보를 인수하고 냉장 보관을 이어받았다. 현장에서는 누구에게도 투여하지 않는다."],
  "vaccine-validation-record": ["외부 의료·연구팀", "통합 백신 개발실", "표적, 바이러스 유입률, 세포 생존율을 비교했던 후보 검증 결과다.", "V-03의 검증 자료를 후보의 접수 기록에 연결했다. 추가 검증에 필요한 자료로 보존한다."],
  "target-protein-report": ["외부 의료·연구팀", "3층 생물정보 분석실", "훼손된 염기서열을 복원하고 번역해 찾아낸 ZV-SPIKE 표적 분석 기록이다.", "표적 분석 보고서를 접수했다. 후보를 선택한 근거와 복원 과정을 함께 확인할 수 있다."],
  "c07-record": ["구조팀 기록 담당", "3층 C-07 보관함", "채용 제안, 비공식 검체 반입, 격리 해제와 기록 삭제 요구가 남은 메신저 대화다.", "C-07 대화 기록을 접수했다. 기업의 지시와 학생회장의 행동을 따로 대조할 수 있도록 원본 출처를 함께 기록한다."],
  "emergency-power-record": ["구조팀 기록 담당", "3층 비상 격리실 전달함", "HXB 원격 관리 계정의 외부 송신 차단 내역과 로비 비상 전원 상태가 남아 있다.", "통신 차단 기록을 접수했다. 전원 복구와 별개로 차단 명령의 흔적을 보존한다."],
  "graduate-letter": ["구조팀 기록 담당", "1층 로비", "우리를 연구실로 이끌었던 대학원생의 편지다.", "편지 원문과 발견 장소를 추가 기록으로 보존했다."],
  "research-fragment": ["구조팀 기록 담당", "바리케이드 설치 후 확보", "형광등으로 확인했던 손상된 연구일지와 과사무실로 이어지는 단서다.", "손상된 연구일지를 접수했다. 훼손된 부분을 임의로 채우지 않고 원문을 보존한다."],
  "damaged-sequence-chip": ["외부 의료·연구팀", "3층 C-07 보관함", "분석실에서 복원에 사용한 손상된 염기서열 칩이다.", "칩을 접수하고 표적 분석 보고서와 출처를 연결했다."],
  "president-note": ["구조팀 기록 담당", "분자생물학실", "경보를 끈 자신의 선택을 적어 둔 학생회장의 메모다.", "사고 후 메모를 추가 증거로 보존했다. 직접 진술과 별도로 대조한다."],
  "president-access-log": ["구조팀 기록 담당", "세포배양실", "사고 뒤 전원 유지와 기록 보존 요청이 남은 비상 출입 기록이다.", "사고 후 수습 행동을 기록했다. 앞서 격리를 해제한 책임과 구분해 남긴다."],
  "president-voice": ["구조팀 기록 담당", "시약보관실", "학생회 단체방으로 보내지 못한 음성 메시지의 기록이다.", "미전송 메시지를 보존했다. 학생회장이 남긴 말과 다른 기록을 함께 확인할 수 있다."],
};
const handoffStatement = [
  { title: "상자를 가져온 사람", lines: [
    ["narrator", "로비의 보호 구역. 중단발 머리 아래로 얼굴을 숙인 학생회장이 붉은 완장을 내려놓는다. 구조팀의 기록 단말기에 녹취 표시가 켜진다."],
    ["president", "상자를 학교에 가져온 사람은 저예요. 회사가 교육용 검체라고 했고, 인턴 자리와 추천서를 약속했어요. 정식 반출 기록을 피하려는 부탁이라는 걸 알면서도 받아들였어요."],
    ["player", "C-07에서 그 대화를 찾았어. 우리가 해독한 기록도 넘겼어. 지금 말하는 내용과 같이 남을 거야."],
  ] },
  { title: "위험을 알게 된 뒤의 선택", lines: [
    ["president", "쥐에게 이상 반응이 나타난 뒤에는 위험하다는 걸 알았어요. 그런데 회사가 신고하면 채용을 취소하고 제 책임으로 돌리겠다고 하자, 과사무실 계정으로 격리를 해제했어요. 경보를 끄고 기록도 지웠어요."],
    ["player", "회사에서 시켰다는 사실도 중요해. 하지만 그 버튼을 누른 건 너였어. 우린 아무것도 모른 채 같은 버스로 돌아왔잖아."],
    ["president", "맞아. 몰랐다는 말로 넘어갈 수 없어. 회사를 숨기지도, 내 이름을 빼지도 말아 줘."],
  ] },
  { title: "구조와 용서는 다른 일", lines: [
    ["player", "네가 전원 기록을 건네준 건 남길게. 그렇다고 우리가 겪은 일이 없어지는 건 아니야. 여기서 괜찮다고 말할 수는 없어."],
    ["president", "알아. 도왔으니까 용서해 달라고 하지 않을게. 내가 지운 것, 내가 한 것부터 다시 설명할게."],
    ["team", "구조와 보호는 계속하겠습니다. 수습에 협조한 사실도, 위험을 알면서 격리를 해제했다는 진술도 구분해서 기록합니다. 진술만으로 사건을 끝내지는 않겠습니다."],
  ] },
  { title: "우리가 가져온 것은 답만이 아니었다", lines: [
    ["team", "후보와 검증 자료는 의료·연구팀이 인수했습니다. 사건 기록과 이번 진술은 원본 출처를 보존해 후속 조사에 전달하겠습니다. 접수는 완료됐지만, 효과 검증과 책임 판단은 별도로 진행됩니다."],
    ["president", "같이 탐방 갔던 친구들이에요. 제 이름도 그 기록에 그대로 남겨 주세요. 제가 직접 설명하겠습니다."],
    ["player", "처음 주운 편지를 여기까지 가져왔어. 우리가 찾은 기록이 또 사라지지 않게 해 주세요."],
    ["narrator", "기록 담당이 접수 목록을 돌려 보여 준다. 우리는 항목을 확인한다. 후보와 증거가 이제 우리 손을 떠났다. 아직 건물 밖은 아니지만, 더는 우리끼리만 이 일을 감당하지 않는다."],
  ] },
];

function handoffAvailable() {
  return state.rescueRouteSecured && state.handoffStarted && state.scene === "lobby" && !state.paused && !state.failed;
}

function handoffRequiredComplete() {
  return handoffRequiredItems.every((id) => state.handoffDelivered.includes(id) && state.inventory.includes(id));
}

function normalizeHandoffState() {
  state.handoffStarted = Boolean(state.rescueRouteSecured && state.handoffStarted);
  state.handoffDelivered = state.handoffStarted && Array.isArray(state.handoffDelivered)
    ? [...new Set(state.handoffDelivered.filter((id) => Object.hasOwn(handoffItemNotes, id) && state.inventory.includes(id)))] : [];
  if (!state.handoffStarted || !Object.hasOwn(handoffItemNotes, state.handoffSelectedItem) || !state.inventory.includes(state.handoffSelectedItem)) state.handoffSelectedItem = "";
  state.presidentMedicalChecked = Boolean(state.handoffStarted && handoffRequiredComplete() && state.presidentMedicalChecked);
  state.presidentRescued = Boolean(state.presidentMedicalChecked && state.presidentRescued);
  state.handoffStatementIndex = state.presidentRescued && Number.isInteger(state.handoffStatementIndex) ? Math.max(0, Math.min(handoffStatement.length - 1, state.handoffStatementIndex)) : 0;
  state.handoffComplete = Boolean(state.presidentRescued && state.handoffStatementIndex === handoffStatement.length - 1 && state.handoffComplete);
  for (const id of ["handoff-receipt", "president-statement"]) {
    if (state.handoffComplete) addItem(id);
    else state.inventory = state.inventory.filter((item) => item !== id);
  }
  if (state.presidentRescued && state.scene === "emergencyIsolationRoom") state.scene = "lobby";
  normalizeEndingState();
}

function handoffModal(title, code, body) {
  showModal(modalFrame({ title, code, body }));
  $("#modal").classList.add("evidence-modal", "exploration-modal", "handoff-modal");
}

function startHandoff() {
  if (!state.rescueRouteSecured || state.scene !== "lobby" || state.paused || state.failed) return;
  if (!state.handoffStarted) {
    state.handoffStarted = true;
    setActivity("구조대가 로비의 방어를 맡았다. 우리가 확보한 백신 후보와 사건 기록을 인계한다.");
    saveState(); render();
  }
  openHandoff();
}

function openHandoff() {
  if (!handoffAvailable()) return;
  if (state.handoffComplete) showHandoffReceipt();
  else if (state.presidentRescued) openHandoffStatement();
  else if (handoffRequiredComplete()) openPresidentTransfer();
  else openHandoffDesk();
}

function openHandoffDesk() {
  if (!handoffAvailable()) return;
  const optional = handoffOptionalItems.filter((id) => state.inventory.includes(id));
  const cards = (ids) => ids.map((id) => `<button type="button" data-handoff-item="${id}" aria-pressed="false" ${state.inventory.includes(id) ? "" : "disabled"}><span aria-hidden="true">${itemData[id].icon}</span><strong>${itemData[id].name}</strong><small>${state.handoffDelivered.includes(id) ? "접수 완료 · 기록 확인" : state.inventory.includes(id) ? "인계할 항목 선택" : `미확보 · ${handoffItemNotes[id][1]}`}</small></button>`).join("");
  handoffModal("우리가 가져온 것들", "HANDOFF DESK · LOBBY", `
    <div class="survivor-terminal"><small>구조팀 기록 담당 · 1층 로비</small><p>“보관 중인 후보와 찾은 기록을 하나씩 확인하겠습니다. 복구한 자료는 출처도 함께 남겨 주세요. 접수한 기록의 사본은 여러분도 보관할 수 있습니다.”</p></div>
    <p class="handling-copy">구조대가 방어를 맡아 시간과 추격은 멈춘 상태다. 항목을 선택하고 내용을 확인한 뒤 직접 인계하자. 추가 기록은 없어도 진행할 수 있다.</p>
    <h3>후보·핵심 기록 <small>${handoffRequiredItems.filter((id) => state.handoffDelivered.includes(id)).length} / ${handoffRequiredItems.length}</small></h3>
    <div class="handoff-items">${cards(handoffRequiredItems)}</div>
    ${optional.length ? `<details class="handoff-additional"><summary>함께 가져온 추가 기록 ${optional.length}개</summary><div class="handoff-items">${cards(optional)}</div></details>` : ""}
    <section id="handoff-inspection" class="handoff-inspection" aria-live="polite"><p>넘길 항목을 선택하자. 선택만으로는 인계되지 않는다.</p></section>
    ${handoffRequiredComplete() ? `<button type="button" class="primary-button material-check-button" data-handoff-next>${state.handoffComplete ? "인계 확인서로 돌아간다" : "학생회장 구조 상황 확인"}<span>→</span></button>` : '<p class="handling-copy">핵심 항목이 미확보라면 로비 안내판에서 해당 장소로 돌아가 챙길 수 있다.</p>'}`);
  document.querySelectorAll("[data-handoff-item]").forEach((button) => button.addEventListener("click", () => selectHandoffItem(button.dataset.handoffItem)));
  if (handoffRequiredComplete()) $("[data-handoff-next]").addEventListener("click", openHandoff);
  if (state.handoffSelectedItem) selectHandoffItem(state.handoffSelectedItem);
}

function selectHandoffItem(id) {
  if (!handoffAvailable() || !Object.hasOwn(handoffItemNotes, id) || !state.inventory.includes(id)) return;
  state.handoffSelectedItem = id; saveState();
  document.querySelectorAll("[data-handoff-item]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.handoffItem === id)));
  const [recipient, source, note, response] = handoffItemNotes[id], delivered = state.handoffDelivered.includes(id);
  $("#handoff-inspection").innerHTML = `<small>${source} → ${recipient}</small><h3>${itemData[id].name}</h3><p>${note}</p>${delivered ? `<div class="handoff-ack"><strong>✓ 접수 완료</strong><p>${response}</p><small>${id === "vaccine-candidate" ? "실물 후보는 의료·연구팀 보관 · 인벤토리에는 접수 기록 유지" : "원본·확보 자료 인계 완료 · 인벤토리에는 보관 사본 유지"}</small></div>` : '<button type="button" class="primary-button material-check-button" data-handoff-deliver>이 항목을 인계한다 <span>→</span></button>'}`;
  if (!delivered) $("[data-handoff-deliver]").addEventListener("click", () => deliverHandoffItem(id));
}

function deliverHandoffItem(id) {
  if (!handoffAvailable() || state.handoffSelectedItem !== id || !Object.hasOwn(handoffItemNotes, id) || !state.inventory.includes(id) || state.handoffDelivered.includes(id)) return;
  state.handoffDelivered.push(id);
  setActivity(`${itemData[id].name} 인계 완료. ${handoffItemNotes[id][3]}`);
  saveState(); render(); openHandoffDesk();
  $("#handoff-inspection").scrollIntoView({ block: "nearest", behavior: "auto" });
}

function openPresidentTransfer() {
  if (!handoffAvailable() || !handoffRequiredComplete()) return;
  if (state.presidentRescued) { openHandoffStatement(); return; }
  handoffModal("이번에는 문을 함부로 열지 않는다", "MEDICAL TEAM · 3F RELAY", `
    <div class="survivor-terminal"><small>의료진 동행 구조팀 · 3층 중계</small><p>${state.presidentMedicalChecked ? "“격리실 안 생존자의 상태를 확인했습니다. 관찰을 계속하며 보호 이송하겠습니다. 주변 격리 구역은 그대로 유지합니다.”" : "“전달받은 위치로 이동했습니다. 당사자와 먼저 연락하고 상태를 확인하겠습니다. 격리를 일괄 해제하지 않습니다. 여러분은 로비에서 기다려 주세요.”"}</p></div>
    <p class="result-copy">${state.presidentMedicalChecked ? "회장은 구조팀의 설명을 듣고 고개를 끄덕인다. 우리가 직접 문을 조작하지 않는다. 의료진이 동행하는 팀이 해당 격리실의 이송을 맡는다." : "인터폰에서 익숙한 목소리가 돌아온다. “기록은… 받으셨나요?” 구조대가 우리가 넘긴 전원 기록을 확인하며 대답한다. “받았습니다. 이제 상태부터 확인하겠습니다.”"}</p>
    <p class="handling-copy">보호 이송은 감염이 없다는 확정이나 치료 완료를 뜻하지 않는다. 인계한 후보를 현장에서 투여하지 않는다.</p>
    <button type="button" class="primary-button material-check-button" data-president-transfer>${state.presidentMedicalChecked ? "구조팀의 보호 이송을 확인한다" : "의료진의 상태 확인 보고를 받는다"}<span>→</span></button>`);
  const expectedChecked = state.presidentMedicalChecked;
  $("[data-president-transfer]").addEventListener("click", () => advancePresidentTransfer(expectedChecked));
}

function advancePresidentTransfer(expectedChecked) {
  if (!handoffAvailable() || !handoffRequiredComplete() || state.presidentRescued || expectedChecked !== state.presidentMedicalChecked) return;
  if (!state.presidentMedicalChecked) {
    state.presidentMedicalChecked = true;
    setActivity("의료진이 격리실 안 학생회장의 상태를 확인했다. 관찰을 유지하며 보호 이송을 준비한다.");
    saveState(); render(); openPresidentTransfer(); return;
  }
  state.presidentRescued = true;
  setActivity("학생회장이 의료진과 함께 로비 보호 구역으로 이동했다. 구조팀 앞에서 검체 반입과 격리 해제 경위를 직접 진술한다.");
  saveState(); render(); openHandoffStatement();
}

function statementLines(lines) {
  const labels = { narrator: "현장 기록", president: "생정융 학생회장", player: "우리", team: "구조팀 기록 담당" };
  return lines.map(([speaker, copy]) => `<article class="intercom-line ${speaker}"><small>${labels[speaker]}</small><p>${copy}</p></article>`).join("");
}

function openHandoffStatement() {
  if (!handoffAvailable() || !state.presidentRescued) return;
  if (state.handoffComplete) { showPresidentStatementRecord(); return; }
  const page = handoffStatement[state.handoffStatementIndex];
  handoffModal(page.title, `ON-RECORD · ${state.handoffStatementIndex + 1} / ${handoffStatement.length}`, `
    <p class="handling-copy">1층 로비 보호 구역 · 의료진 관찰 아래 진행되는 직접 진술</p>
    <section class="handoff-dialogue">${statementLines(page.lines)}</section>
    <div class="handoff-dialogue-actions"><button type="button" data-statement-back ${state.handoffStatementIndex === 0 ? "disabled" : ""}>이전 대화</button><button type="button" class="primary-button" data-statement-next>${state.handoffStatementIndex === handoffStatement.length - 1 ? "진술과 접수 목록 확인을 마친다" : "대화를 이어 듣는다"}<span>→</span></button></div>`);
  $("[data-statement-back]").addEventListener("click", () => {
    if (!handoffAvailable() || state.handoffComplete || state.handoffStatementIndex === 0) return;
    state.handoffStatementIndex -= 1; saveState(); openHandoffStatement();
  });
  const expectedIndex = state.handoffStatementIndex;
  $("[data-statement-next]").addEventListener("click", () => advanceHandoffStatement(expectedIndex));
}

function advanceHandoffStatement(expectedIndex) {
  if (!handoffAvailable() || !state.presidentRescued || state.handoffComplete || expectedIndex !== state.handoffStatementIndex) return;
  if (state.handoffStatementIndex < handoffStatement.length - 1) {
    state.handoffStatementIndex += 1; saveState(); openHandoffStatement(); return;
  }
  state.handoffComplete = true;
  addItem("handoff-receipt"); addItem("president-statement");
  setActivity("백신 후보·검증 자료·사건 증거 인계와 학생회장의 직접 진술 기록을 마쳤다. 구조팀의 통제 아래 마지막 대피 안내를 기다린다.");
  saveState(); render(); showHandoffReceipt();
}

function showPresidentStatementRecord() {
  if (!state.handoffComplete || state.paused || state.failed) return;
  handoffModal("학생회장 직접 진술 기록", "STATEMENT COPY · NOT A VERDICT", `<p class="handling-copy">구조 후 로비에서 확인한 진술의 보관 사본. 증거 대조와 책임 판단은 후속 조사에서 진행된다.</p><div class="handoff-dialogue">${handoffStatement.map((page) => `<h3>${page.title}</h3>${statementLines(page.lines)}`).join("")}</div>`);
}

function showHandoffReceipt() {
  if (!state.handoffComplete || state.paused || state.failed) return;
  handoffModal("사라지지 않을 기록", "HANDOFF COMPLETE · COPY RETAINED", `
    <div class="rescue-receipt"><strong>후보·증거 인계 확인서</strong><p>인계 장소: 1층 로비 · 수령: 의료·연구팀 / 구조팀 기록 담당</p><ul>${state.handoffDelivered.map((id) => `<li>${itemData[id].name}</li>`).join("")}</ul><p>추가 접수: 학생회장 직접 진술 기록</p></div>
    <div class="survivor-terminal"><small>구조팀 기록 담당</small><p>“접수 목록을 확인했습니다. 후보는 연구팀이 보관하고, 사건 기록은 출처와 함께 보존합니다. 학생회장은 의료진의 관찰 아래 있습니다. 협조한 사실과 앞선 행동의 책임은 별개로 남습니다.”</p></div>
    <p class="result-copy">${state.escaped ? "학생들의 대피와 학생회장 보호 이송, 후보·증거 인계가 끝났다. 이 문서는 로비에서 담당 팀에 넘긴 자료의 접수 기록이다." : "학생회장의 구조와 기록 인계는 끝났다. 후보의 추가 검증과 사건 조사는 이제 외부 팀이 이어받는다. 우리도 아직 건물 밖으로 나간 것은 아니다."}</p>
    <div class="vaccine-access"><strong>후보·증거 인계 완료</strong><p>${state.escaped ? "대피 후 보관 사본을 열람하고 있다. 결과와 에필로그에서 후속 이야기를 확인할 수 있다." : "이제 구조대와 함께 대피할 수 있다. 시간과 추격은 멈춰 있으며, 출발 전까지 추가 기록도 인계할 수 있다."}</p></div>
    <button type="button" class="primary-button material-check-button" data-handoff-ending>${state.escaped ? "탈출 이후 이야기·결과 확인" : state.scene !== "lobby" ? "로비에서 대피 안내를 확인한다" : state.endingStarted ? "대피 장면 이어 보기" : "구조대의 대피 안내를 확인한다"}<span>→</span></button>
    <div class="handoff-dialogue-actions"><button type="button" data-review-statement>학생회장 진술 다시 읽기</button>${state.scene === "lobby" ? '<button type="button" data-add-handoff>추가 기록 인계·접수 목록 확인</button>' : ""}</div>`);
  $("[data-review-statement]").addEventListener("click", showPresidentStatementRecord);
  $("[data-handoff-ending]").addEventListener("click", () => {
    if (!state.escaped && state.scene !== "lobby") goToLobby();
    else startEnding();
  });
  if (state.scene === "lobby") $("[data-add-handoff]").addEventListener("click", openHandoffDesk);
}

function showDeliveredItemRecord(id) {
  if (!state.handoffDelivered.includes(id) || !Object.hasOwn(handoffItemNotes, id) || state.paused || state.failed) return;
  handoffModal("백신 후보 접수 기록", "V-03 · CUSTODY TRANSFERRED", `<div class="rescue-receipt"><strong>${itemData[id].name} · 인계 완료</strong><p>${handoffItemNotes[id][3]}</p><p>실물은 의료·연구팀이 보관 중이다. 이 카드는 인계 사실을 확인하는 접수 기록이다.</p></div>`);
}

function showPresidentTransferRecord() {
  if (!state.presidentRescued || state.paused || state.failed) return;
  if (state.handoffComplete) { showPresidentStatementRecord(); return; }
  handoffModal("격리실 생존자 보호 이송 완료", "TRANSFER UPDATE · LOBBY", '<p class="result-copy">학생회장은 의료진과 함께 로비 보호 구역으로 이동했다. 비어 있는 격리실은 구조팀이 통제하고 있다. 직접 진술은 로비에서 이어서 확인할 수 있다.</p><button type="button" class="primary-button material-check-button" data-transfer-return>로비에서 직접 진술 확인 <span>→</span></button>');
  $("[data-transfer-return]").addEventListener("click", () => {
    if (state.scene !== "lobby") goToLobby();
    else openHandoff();
  });
}

function showTransferredValidation() {
  if (!state.vaccineValidated || state.paused || state.failed) return;
  handoffModal("후보 검증 기록 · 보관 사본", "V-03 · HANDOFF ARCHIVE", `<div class="candidate-detail validated">${candidateResultCard(vaccineCandidates[2])}</div><p class="result-copy">실물 후보는 의료·연구팀에 인계했다. 이 화면은 통합 백신 개발실에서 확인했던 실험 결과의 보관 기록이다.</p><p class="handling-copy">후보의 추가 검증은 외부 팀이 이어받는다. 현장 검증 결과가 투여 가능한 완제품을 뜻하지 않는다.</p>`);
}
