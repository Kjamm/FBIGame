// Fictional puzzle data only: no real manufacturing procedure or live assay.
const vaccineItemData = {
  "vaccine-candidate": { name: "검증된 백신 후보", icon: "◇", description: "V-03 · 인계용 보관" },
  "vaccine-validation-record": { name: "후보 검증 기록", icon: "▤", description: "실험 결과 다시 보기" },
  "survivor-signal": { name: "격리실 수신 기록", icon: "◉", description: "3층 비상 격리실" },
};
const vaccineMaterials = ["spike-primer-set", "culture-cells", "neutralizing-antibody"];
const vaccineCandidates = [
  { id: "V-01", target: "ZV-SPIKE", binding: 92, entry: 8, viability: 34 },
  { id: "V-02", target: "ZV-NUCLEO", binding: 91, entry: 75, viability: 96 },
  { id: "V-03", target: "ZV-SPIKE", binding: 86, entry: 14, viability: 93 },
  { id: "V-04", target: "ZV-SPIKE", binding: 90, entry: 71, viability: 95 },
];
let heldVaccineMaterial = "";

function canAccessVaccineLab() {
  return state.virusTargetIdentified && vaccineMaterials.every((id) => state.inventory.includes(id));
}

function normalizeVaccineState() {
  const seen = new Set();
  state.vaccineSlots = Array.isArray(state.vaccineSlots) && state.vaccineSlots.length === 3
    ? state.vaccineSlots.map((id) => {
      if (!vaccineMaterials.includes(id) || !state.inventory.includes(id) || seen.has(id)) return "";
      seen.add(id); return id;
    }) : ["", "", ""];
  if (!vaccineCandidates.some((candidate) => candidate.id === state.vaccineCandidateSelection)) state.vaccineCandidateSelection = "";
  state.vaccineBenchReady = Boolean(state.vaccineBenchReady && canAccessVaccineLab() && state.vaccineSlots.every((id, i) => id === vaccineMaterials[i]));
  state.vaccineValidated = Boolean(state.vaccineValidated && state.vaccineBenchReady);
  state.survivorSignalFound = Boolean(state.survivorSignalFound && state.vaccineValidated);
  if (state.vaccineValidated) {
    addItem("vaccine-candidate"); addItem("vaccine-validation-record");
  }
  if (state.survivorSignalFound) addItem("survivor-signal");
  if (state.scene === "vaccineDevelopmentLab" && !canAccessVaccineLab()) state.scene = "lobby";
}

function vaccineLabAccessBody() {
  if (!canAccessVaccineLab()) return "";
  return `<section class="vaccine-access"><small>REPORT APPENDIX · LOCATION RESTORED</small><strong>3층 · 통합 백신 개발실</strong><p>재료 목록이 완성되자 보고서의 연계 장비 위치가 확인됐다. 로비의 층별 안내판에서 이동할 수 있다.</p></section>`;
}

function enterVaccineLab() {
  if (!canAccessVaccineLab() || state.paused || state.failed) return;
  enterMaterialLab("vaccineDevelopmentLab", "vaccineLabEntered", "통합 백신 개발실에 도착했다. 중단된 장비에는 아직 전원이 남아 있다.", {
    code: "FINAL EXPERIMENT · 3F", title: "아직 끝난 것이 아니다",
    body: `<p class="result-copy">문을 닫자 냉각 팬 소리만 남는다. 누군가 급히 떠난 작업대 위에 기록 하나가 놓여 있다.</p><blockquote class="vaccine-quote">“재료가 있다고 끝나는 게 아니다.<br>작동한다는 것을 확인해야 한다.”</blockquote><p class="result-copy">장비에는 검증이 중단된 후보 네 개가 남아 있다. 우리가 모은 재료와 복원한 보고서로 마지막 확인을 끝내야 한다.</p>`,
  });
}

function renderVaccineHotspots(container) {
  container.innerHTML = `<button type="button" class="hotspot vaccine-bench-hotspot${state.vaccineValidated ? " completed" : ""}" data-action="inspect-vaccine-bench"><span class="pulse" aria-hidden="true"></span><span class="hotspot-label">${state.vaccineValidated ? "검증 기록" : "중단된 검증 장비"}</span></button><button type="button" class="hotspot vaccine-log-hotspot" data-action="inspect-vaccine-log"><span class="pulse" aria-hidden="true"></span><span class="hotspot-label">연구 기록</span></button>${state.vaccineValidated ? `<button type="button" class="hotspot vaccine-signal-hotspot${state.survivorSignalFound ? " completed" : ""}" data-action="inspect-survivor-signal"><span class="pulse" aria-hidden="true"></span><span class="hotspot-label">수신 중인 신호</span></button>` : ""}<button class="scene-back" type="button" data-action="go-lobby">← 로비</button>`;
}

function openVaccineLog() {
  if (!canAccessVaccineLab() || state.paused || state.failed) return;
  showModal(modalFrame({ code: "RESEARCHER'S LAST ENTRY", title: "중단된 연구 기록", body: `<article class="president-document"><header><span>동물실험 연구센터 · 비상 협업 기록</span><span>작성자: 편지를 남긴 대학원생</span></header><p>검체를 옮긴 뒤부터 격리 구역의 경보가 제멋대로 꺼졌다. 반입 기록도 사라졌다. 누가 지웠는지 확인하러 갈 시간이 없다.</p><p>원본을 잃을 것에 대비해 후보 기록을 이 장비에 남겼다. 재료는 여러 방에 나누어 보관했다. 한 곳이 뚫려도 전부 잃지 않도록.</p><blockquote>“재료가 있다고 끝나는 게 아니다. 작동한다는 것을 확인해야 한다.”</blockquote><p>내가 돌아오지 못하면, 보고서와 검증 기록을 함께 가져가 줘. 이 장비의 판정은 응급 연구 단계일 뿐이다. 투여 여부는 외부 의료진이 판단해야 한다.</p></article>` }));
  $("#modal").classList.add("evidence-modal", "exploration-modal");
}

function openVaccineWorkbench() {
  if (!canAccessVaccineLab() || state.paused || state.failed) return;
  if (state.vaccineValidated) { showVaccineValidation(); return; }
  heldVaccineMaterial = "";
  physicalPuzzleFrame("통합 검증 장비", "FINAL EXPERIMENT · " + (state.vaccineBenchReady ? "02 / 02" : "01 / 02"), state.vaccineBenchReady ? vaccineResultsBody() : vaccineMountBody(), "vaccine");
  $("#modal").classList.add("vaccine-modal");
  if (!state.vaccineBenchReady) {
    document.querySelectorAll("[data-vaccine-material]").forEach((button) => button.addEventListener("click", () => holdVaccineMaterial(button.dataset.vaccineMaterial)));
    document.querySelectorAll("[data-vaccine-slot]").forEach((button) => button.addEventListener("click", () => placeVaccineMaterial(Number(button.dataset.vaccineSlot))));
    $("[data-check-vaccine-mount]").addEventListener("click", checkVaccineMount);
    updateVaccineSlots();
  } else {
    document.querySelectorAll("[data-vaccine-candidate]").forEach((button) => button.addEventListener("click", () => inspectVaccineCandidate(button.dataset.vaccineCandidate)));
    $("[data-confirm-vaccine]").addEventListener("click", confirmVaccineCandidate);
    if (state.vaccineCandidateSelection) inspectVaccineCandidate(state.vaccineCandidateSelection);
  }
}

function vaccineMountBody() {
  return `<div class="vaccine-stage-strip"><span class="active">01 재료 배치</span><span>02 후보 검증</span></div><p class="handling-copy">보유 재료를 누른 뒤 장비의 연결부를 누르자. 장비 점검 전까지 배치를 바꿀 수 있다.</p><div class="vaccine-material-rack">${vaccineMaterials.map((id) => `<button type="button" data-vaccine-material="${id}" aria-pressed="false"><b aria-hidden="true">${itemData[id].icon}</b><strong>${itemData[id].name}</strong></button>`).join("")}</div><div class="vaccine-sockets">${["표적 구간 증폭 모듈", "항원 발현 모듈", "결합 검증 기준 모듈"].map((name, i) => `<button type="button" data-vaccine-slot="${i}"><small>PORT ${i + 1}</small><strong>${name}</strong><span data-vaccine-slot-label="${i}">연결되지 않음</span></button>`).join("")}</div><p class="handling-copy">중화항체 표준물질은 검증 기준으로 사용되며 백신 후보의 성분으로 혼합되지 않는다.</p><button type="button" class="primary-button material-check-button" data-check-vaccine-mount>장비 점검 <span>→</span></button><p class="material-feedback" id="vaccine-feedback" aria-live="polite"></p>`;
}

function holdVaccineMaterial(id) {
  if (state.paused || state.failed || state.vaccineBenchReady || !vaccineMaterials.includes(id)) return;
  heldVaccineMaterial = id;
  document.querySelectorAll("[data-vaccine-material]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.vaccineMaterial === id)));
  $("#vaccine-feedback").textContent = `${itemData[id].name} 선택. 연결부를 누르자.`;
}

function placeVaccineMaterial(index) {
  if (!canAccessVaccineLab() || state.paused || state.failed || state.vaccineBenchReady || ![0, 1, 2].includes(index) || !vaccineMaterials.includes(heldVaccineMaterial)) return;
  state.vaccineSlots = state.vaccineSlots.map((id) => id === heldVaccineMaterial ? "" : id);
  state.vaccineSlots[index] = heldVaccineMaterial;
  saveState(); updateVaccineSlots();
  $("#vaccine-feedback").textContent = "배치를 변경했다. 장비 점검을 눌러 확정하자.";
}

function updateVaccineSlots() {
  state.vaccineSlots.forEach((id, i) => {
    const label = $(`[data-vaccine-slot-label="${i}"]`);
    if (label) label.textContent = id ? itemData[id].name : "연결되지 않음";
    const button = $(`[data-vaccine-slot="${i}"]`);
    if (button) button.classList.toggle("occupied", Boolean(id));
  });
}

function checkVaccineMount() {
  if (!canAccessVaccineLab() || state.paused || state.failed || state.vaccineBenchReady) return;
  if (!state.vaccineSlots.every(Boolean)) { $("#vaccine-feedback").textContent = "아직 연결되지 않은 모듈이 있다."; return; }
  if (!state.vaccineSlots.every((id, i) => id === vaccineMaterials[i])) { failVaccinePuzzle(); return; }
  state.vaccineBenchReady = true;
  setActivity("검증 장비가 다시 켜졌다. 중단된 네 후보의 비교 결과를 확인할 수 있다.");
  saveState(); render(); openVaccineWorkbench();
}

function vaccineResultsBody() {
  return `<div class="vaccine-stage-strip"><span>✓ 재료 배치</span><span class="active">02 후보 검증</span></div><details class="vaccine-reference"><summary>보유한 표적 단백질 보고서 펼치기</summary><p><strong>ZV-SPIKE · 표면 융합 당단백질</strong></p><p>숙주세포 수용체와 결합하기 전에 노출되는 영역이 표적이다. 목표는 바이러스의 세포 유입을 차단하는 것이다.</p></details><section class="vaccine-spec"><small>장비 판정 규격 · 가상 실험 데이터</small><p>보고서와 동일한 표적 / 세포 생존율 85% 이상 / 잔여 유입률 20% 이하</p><span>대조군: 무처리 유입률 100% · 기준 중화항체 유입률 10%</span></section><div class="candidate-selector">${vaccineCandidates.map((candidate) => `<button type="button" data-vaccine-candidate="${candidate.id}" aria-pressed="false">${candidate.id}<small>결과 열기</small></button>`).join("")}</div><div id="vaccine-candidate-detail" class="candidate-detail" aria-live="polite">후보를 눌러 실험 결과를 확인하자.</div><button type="button" class="primary-button material-check-button" data-confirm-vaccine disabled>이 후보를 검증한다 <span>→</span></button><p class="material-feedback" id="vaccine-feedback" aria-live="polite">결과를 살펴보는 것만으로는 제출되지 않는다.</p>`;
}

function candidateResultCard(candidate) {
  return `<header><strong>${candidate.id}</strong><span>설계 표적 · ${candidate.target}</span></header>${[["표적 결합 신호", candidate.binding], ["잔여 유입률", candidate.entry], ["세포 생존율", candidate.viability]].map(([label, value]) => `<div class="assay-metric"><div><span>${label}</span><strong>${value}%</strong></div><div class="assay-track" aria-hidden="true"><i style="width:${value}%"></i></div></div>`).join("")}`;
}

function inspectVaccineCandidate(id) {
  const candidate = vaccineCandidates.find((entry) => entry.id === id);
  if (!candidate || !state.vaccineBenchReady || state.vaccineValidated || state.paused || state.failed) return;
  state.vaccineCandidateSelection = id; saveState();
  document.querySelectorAll("[data-vaccine-candidate]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.vaccineCandidate === id)));
  $("#vaccine-candidate-detail").innerHTML = candidateResultCard(candidate);
  $("[data-confirm-vaccine]").disabled = false;
  $("#vaccine-feedback").textContent = `${id} 결과 확인 중.`;
}

function confirmVaccineCandidate() {
  if (!canAccessVaccineLab() || !state.vaccineBenchReady || state.vaccineValidated || state.paused || state.failed) return;
  const candidate = vaccineCandidates.find((entry) => entry.id === state.vaccineCandidateSelection);
  if (!candidate) return;
  if (candidate.target !== "ZV-SPIKE" || candidate.viability < 85 || candidate.entry > 20) { failVaccinePuzzle(); return; }
  state.vaccineValidated = true;
  addItem("vaccine-candidate"); addItem("vaccine-validation-record");
  setActivity("V-03의 검증을 마치고 백신 후보와 기록을 확보했다. 장비가 복구한 내부 통신망에서 생존자 신호가 잡힌다.");
  saveState(); render(); showVaccineValidation();
}

function failVaccinePuzzle() {
  state.vaccinePuzzleFailures += 1;
  state.zombieDistance = Math.max(0, state.zombieDistance - 18);
  setActivity("검증 실패 경고음이 울렸다. 개발실 유리문 너머에서 움직임이 느껴진다.");
  saveState(); render();
  if (state.vaccinePuzzleFailures >= 2 && !state.vaccinePuzzleBiteTriggered) {
    state.vaccinePuzzleBiteTriggered = true; saveState(); triggerZombieAttack("vaccine-puzzle"); return;
  }
  const feedback = $("#vaccine-feedback");
  feedback.classList.add("error");
  feedback.textContent = state.vaccinePuzzleBiteTriggered ? "검증에 실패했다." : "검증 실패. 문밖 발소리가 가까워졌다. 다시 틀리면 따라잡힌다.";
  revealApproachingZombie("vaccine");
}

function showVaccineValidation() {
  if (!state.vaccineValidated) return;
  if (state.handoffDelivered.includes("vaccine-candidate")) { showTransferredValidation(); return; }
  showModal(modalFrame({ code: "CANDIDATE SECURED · V-03", title: "마지막 실험의 결과", body: `<div class="candidate-detail validated">${candidateResultCard(vaccineCandidates[2])}</div><p class="result-copy">보고서의 표적과 일치하며, 세포 생존율을 유지하면서 유입률을 낮춘 후보를 확보했다. 검증 기록도 인벤토리에 보관했다.</p><p class="handling-copy">응급 연구 후보다. 효과가 확정된 치료제나 투여 가능한 완제품을 뜻하지 않는다.</p><div class="signal-notice"><small>INTERNAL NETWORK · SIGNAL DETECTED</small><strong>…들리나요? 아직… 여기 사람이…</strong><p>장비의 내부 통신 연결이 복구되자 끊어진 목소리가 들어온다.</p></div><button class="primary-button material-check-button" type="button" data-open-survivor-signal>수신 신호 확인 <span>→</span></button>` }));
  $("#modal").classList.add("evidence-modal", "exploration-modal", "vaccine-modal");
  $("[data-open-survivor-signal]").addEventListener("click", openSurvivorSignal);
}

function openSurvivorSignal() {
  if (!state.vaccineValidated || state.paused || state.failed) return;
  const firstSignal = !state.survivorSignalFound;
  state.survivorSignalFound = true; addItem("survivor-signal");
  if (firstSignal) setActivity("3층 비상 격리실에서 생존자의 호출을 수신했다. 발신자의 신원은 아직 확인되지 않았다.");
  saveState(); render();
  showModal(modalFrame({ code: "SURVIVOR SIGNAL · LOCAL INTERCOM", title: state.presidentConfronted ? "격리실 수신 기록" : "아직 누군가 살아 있다", body: survivorSignalBody() }));
  $("#modal").classList.add("evidence-modal", "exploration-modal", "vaccine-modal");
  $("[data-signal-return-lobby]").addEventListener("click", goToLobby);
}

function showVaccineItem(id) {
  if (id === "survivor-signal") openSurvivorSignal();
  else showVaccineValidation();
}
