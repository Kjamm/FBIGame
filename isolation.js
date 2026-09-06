// Chapter 2: a conversation and evidence handoff, not a new quiz or absolution.
const isolationTopics = [
  {
    id: "transport", title: "왜 그 상자를 가져왔어?",
    lines: [
      ["player", "CCTV의 붉은 완장, C-07에 남은 대화… 전부 너였어. 같이 탐방하고 돌아오는 버스에 그걸 실은 거야?"],
      ["president", "응. 회사 담당자가 학교로 보내면 반출 기록이 남는다고, 내가 가져가 달라고 했어. 교육용 검체라 안전하다고 했고… 인턴 자리와 추천서도 약속했어."],
      ["player", "그 말을 믿었다고 해도, 승인 없이 가져온 건 네 선택이잖아."],
      ["president", "맞아. 이상한 부탁이라는 걸 알았는데 모른 척했어. 동물실험 연구센터에 상자를 두고도 너희한테 아무 말 안 했어. 상자를 가져온 건 나야."],
    ],
  },
  {
    id: "containment", title: "위험한 걸 알고도 경보를 껐어?",
    lines: [
      ["player", "실험쥐가 이상해진 뒤에는 신고하겠다고 했잖아. 그런데 왜 격리를 해제했어?"],
      ["president", "상자를 가져온 건 나야. 그런데 일이 이렇게 된 건… 위험한 걸 알고도 경보를 껐기 때문이야."],
      ["president", "회사에서 신고하면 채용도 추천도 취소된다고 했어. 반입한 사람이 나라는 말도 했고. 그때 멈췄어야 했는데, 과사무실 계정으로 격리 장치를 해제하고 기록까지 지웠어."],
      ["player", "너를 믿고 같이 왔던 사람들이 지금 저 복도에 있어. 회사가 시켰다는 말만으로 끝낼 수는 없어."],
      ["president", "알아. 강요받았다고 해서 내가 누른 버튼이 없어지진 않아. 내가 한 일과 회사가 지시한 일을 둘 다 남겨 줘. 내 이름을 빼 달라고 하지 않을게."],
    ],
  },
  {
    id: "communications", title: "왜 밖으로 구조 요청이 안 나가지?",
    lines: [
      ["player", "개발실에서 내부 호출은 잡혔어. 그런데 외부로 보내는 구조 요청은 계속 실패해."],
      ["president", "내가 비상 통로를 찾다가 이 방에 들어왔어. 뒤에서 격리문이 닫혔고, 여기 단말기로도 밖에 연락하려고 했는데 막혔어."],
      ["president", "단말기 진단 기록에 HXB 원격 관리 계정이 외부 송신을 차단한 내역이 남아 있어. 내부 인터폰은 별도 회선이라 살아 있고. 회사가 이 건물에서 나가는 연락까지 막은 거야."],
      ["player", "그것도 네 추측만으로는 안 돼. 확인할 수 있는 기록이 있어?"],
      ["president", "응. 차단 내역과 로비 비상 배전반 상태를 출력해 뒀어. 주 통신망 말고 독립 비상 송신기로 연결할 수는 있지만, 남은 전력으로 모든 장치를 동시에 켤 수는 없어."],
    ],
  },
  {
    id: "handoff", title: "지금 우리가 할 수 있는 일은?",
    lines: [
      ["player", "백신 후보와 검증 기록은 확보했어. 의료진에게 인계해야 해. 널 여기서 꺼내는 것도 전력이 필요하겠지?"],
      ["president", "문을 열겠다고 격리를 한꺼번에 풀지는 마. 내가 그렇게 해서 일이 커졌어. 이 방 문도 따로 제어해야 해. 내가 안전한 상태인지 너희가 아직 확인한 것도 아니고."],
      ["president", "유리문 아래 전달함으로 비상 전원 기록을 보낼게. 한쪽 덮개가 닫혀야 반대쪽이 열리는 구조야. 문을 열지 않아도 종이는 받을 수 있어."],
      ["player", "기록은 가져갈게. 밖에 연락하고 사람들을 구조할 방법을 찾겠어. 네 책임까지 없던 일로 하겠다는 뜻은 아니야."],
      ["president", "알아. 용서해 달라는 조건으로 주는 게 아니야. 난 여기서 내부 호출을 받고 있을게. 구조대가 오면 내가 직접 말할게. 내가 뭘 했는지 전부."],
    ],
  },
];

function canAccessIsolationRoom() {
  return Boolean(state.vaccineValidated && state.survivorSignalFound);
}

function survivorSignalBody() {
  if (state.presidentRescued) return `<div class="survivor-terminal"><small>최초 호출 기록 · 현재 상태 갱신</small><strong>학생회장 · 보호 이송 완료</strong><p>3층 격리실에서 보냈던 최초 호출의 기록이다. 현재는 의료진의 관찰 아래 로비 보호 구역으로 이동했다.</p></div><button type="button" class="primary-button material-check-button" data-signal-return-lobby>로비로 돌아간다 <span>→</span></button>`;
  return `<div class="survivor-terminal"><span class="signal-bars" aria-hidden="true">▂ ▄ ▆ ▃ ▅</span><small>수신 위치</small><strong>3F · 비상 격리실</strong><p>“…복도에 있나요? 문이 안 열려요.”</p><p>“나 혼자… 여기 남아 있어요. 제발…”</p><span>${state.presidentConfronted ? "발신자 확인 · 생정융 학생회장 / 최초 수신 기록" : "발신자 미확인 · 연결 불안정"}</span></div><p class="result-copy">${state.presidentConfronted ? "처음에는 알아듣지 못했던 목소리. 유리문 너머에서 만난 학생회장의 호출이었다." : "낯익은 목소리 같지만 잡음 때문에 확신할 수 없다. 수신 위치를 지도에 기록했다."}</p><div class="vaccine-access"><small>이동 가능 · 3층</small><strong>비상 격리실</strong><p>로비의 층별 안내판에서 격리실 관찰 구역으로 이동할 수 있다.</p></div><button class="primary-button material-check-button" type="button" data-signal-return-lobby>로비 안내판으로 돌아간다 <span>→</span></button>`;
}

function isolationConversationComplete() {
  return isolationTopics.every((topic) => state.isolationTopicsRead.includes(topic.id));
}

function normalizeIsolationState() {
  const ids = isolationTopics.map((topic) => topic.id);
  state.isolationTopicsRead = Array.isArray(state.isolationTopicsRead) ? [...new Set(state.isolationTopicsRead.filter((id) => ids.includes(id)))] : [];
  if (!ids.includes(state.isolationActiveTopic)) state.isolationActiveTopic = "";
  state.presidentConfronted = Boolean(state.presidentConfronted && canAccessIsolationRoom());
  state.emergencyPowerRecordCollected = Boolean(state.emergencyPowerRecordCollected && state.presidentConfronted);
  if (state.emergencyPowerRecordCollected) {
    state.isolationTopicsRead = [...ids];
    addItem("emergency-power-record");
  }
  if (!state.presidentConfronted) { state.isolationTopicsRead = []; state.isolationActiveTopic = ""; }
  if (state.scene === "emergencyIsolationRoom" && !canAccessIsolationRoom()) state.scene = "lobby";
}

function enterIsolationRoom() {
  if (!canAccessIsolationRoom() || state.paused || state.failed) return;
  if (state.presidentRescued) { showPresidentTransferRecord(); return; }
  enterMaterialLab("emergencyIsolationRoom", "isolationRoomEntered", "비상 격리실의 관찰 구역에 도착했다. 유리문 너머에서 붉은 완장의 사람이 고개를 든다.", {
    code: "SURVIVOR LOCATED · 3F", title: "유리문 너머의 얼굴",
    body: `<p class="result-copy">발신 위치를 따라 들어온 관찰 구역. 닫힌 유리문 안에서 한 사람이 천천히 일어난다.</p><p class="result-copy">중단발 머리, 검은 옷, 팔에 남은 붉은 학생회 완장. CCTV에서 보았던 실루엣과 겹친다.</p><blockquote class="vaccine-quote">“너희가… 여기까지 왔구나.”</blockquote><p class="result-copy">기업 탐방 때 우리를 인솔했던 생정융 학생회장이다. 유리문 옆 인터폰에 통화 표시가 켜진다.</p>`,
  });
}

function renderIsolationHotspots(container) {
  container.innerHTML = `<button type="button" class="hotspot isolation-president-hotspot${isolationConversationComplete() ? " completed" : ""}" data-action="talk-president"><span class="pulse" aria-hidden="true"></span><span class="hotspot-label">학생회장과 대화</span></button><button type="button" class="hotspot isolation-hatch-hotspot${state.emergencyPowerRecordCollected ? " completed" : ""}" data-action="inspect-isolation-hatch"><span class="pulse" aria-hidden="true"></span><span class="hotspot-label">${state.emergencyPowerRecordCollected ? "전원 기록 다시 보기" : isolationConversationComplete() ? "전달된 기록" : "유리문 아래 전달함"}</span></button><button class="scene-back" type="button" data-action="go-lobby">← 로비</button>`;
}

function openPresidentConversation() {
  if (state.presidentRescued) { showPresidentTransferRecord(); return; }
  if (!canAccessIsolationRoom() || state.scene !== "emergencyIsolationRoom" || state.paused || state.failed) return;
  if (!state.presidentConfronted) {
    state.presidentConfronted = true;
    setActivity("유리문 너머 생존자는 생정융 학생회장이었다. 인터폰으로 직접 대화를 시작했다.");
  }
  saveState(); render();
  showModal(modalFrame({ code: "LIVE INTERCOM · GLASS PARTITION", title: "학생회장과 대면", body: `<div class="isolation-dialogue-intro"><span class="isolation-live">● 내부 회선 연결</span><p>유리문은 닫혀 있다. 서로의 목소리만 인터폰을 통해 들린다.</p></div><nav class="isolation-questions" aria-label="학생회장에게 질문하기">${isolationTopics.map((topic, i) => `<button type="button" data-isolation-topic="${topic.id}" aria-pressed="false"><small>0${i + 1}</small><span>${topic.title}</span><b data-topic-read="${topic.id}">${state.isolationTopicsRead.includes(topic.id) ? "✓" : ""}</b></button>`).join("")}</nav><section id="isolation-answer" class="isolation-answer" aria-label="선택한 질문의 대화"><p>질문을 선택해 이야기를 듣자. 대화는 언제든 다시 확인할 수 있다.</p></section><div id="isolation-handoff-action"></div>` }));
  $("#modal").classList.add("evidence-modal", "exploration-modal", "isolation-modal");
  document.querySelectorAll("[data-isolation-topic]").forEach((button) => button.addEventListener("click", () => selectIsolationTopic(button.dataset.isolationTopic)));
  if (state.isolationActiveTopic) selectIsolationTopic(state.isolationActiveTopic, false);
  renderIsolationHandoffAction();
}

function selectIsolationTopic(id, scroll = true) {
  const topic = isolationTopics.find((entry) => entry.id === id);
  if (!topic || !state.presidentConfronted || state.scene !== "emergencyIsolationRoom" || state.paused || state.failed) return;
  state.isolationActiveTopic = id; saveState();
  document.querySelectorAll("[data-isolation-topic]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.isolationTopic === id)));
  const panel = $("#isolation-answer");
  panel.innerHTML = `<h3 tabindex="-1" id="isolation-answer-title">${topic.title}</h3>${topic.lines.map(([speaker, text]) => `<article class="intercom-line ${speaker}"><small>${speaker === "player" ? "우리" : "생정융 학생회장"}</small><p>${text}</p></article>`).join("")}<button class="primary-button material-check-button" type="button" data-acknowledge-topic="${id}" ${state.isolationTopicsRead.includes(id) ? "disabled" : ""}>${state.isolationTopicsRead.includes(id) ? "확인한 대화" : "이 대화를 기록한다"}</button>`;
  $("[data-acknowledge-topic]").addEventListener("click", () => acknowledgeIsolationTopic(id));
  if (scroll) { $("#isolation-answer-title").focus({ preventScroll: true }); panel.scrollIntoView({ block: "start", behavior: "auto" }); }
}

function acknowledgeIsolationTopic(id) {
  if (state.paused || state.failed || state.scene !== "emergencyIsolationRoom" || !state.presidentConfronted || state.isolationActiveTopic !== id || !isolationTopics.some((topic) => topic.id === id)) return;
  if (!state.isolationTopicsRead.includes(id)) state.isolationTopicsRead.push(id);
  setActivity(isolationConversationComplete() ? "학생회장이 비상 전원 기록을 전달함에 넣었다. 유리문을 열지 않고 기록을 받을 수 있다." : "학생회장의 진술을 확인했다. 아직 물어볼 이야기가 남아 있다.");
  saveState(); render();
  $(`[data-topic-read="${id}"]`).textContent = "✓";
  $("[data-acknowledge-topic]").disabled = true;
  $("[data-acknowledge-topic]").textContent = "확인한 대화";
  renderIsolationHandoffAction();
}

function renderIsolationHandoffAction() {
  const container = $("#isolation-handoff-action");
  container.innerHTML = isolationConversationComplete()
    ? `<div class="signal-notice"><strong>${state.emergencyPowerRecordCollected ? "기록은 이미 인벤토리에 보관했다." : "철컥. 전달함의 바깥쪽 잠금이 풀렸다."}</strong><p>유리문은 여전히 닫혀 있다. 회장은 인터폰 앞에 남는다.</p><button class="primary-button material-check-button" type="button" data-open-isolation-hatch>${state.emergencyPowerRecordCollected ? "비상 전원 기록 다시 보기" : "전달함 확인"}</button></div>`
    : `<p class="handling-copy">확인한 대화 ${state.isolationTopicsRead.length} / ${isolationTopics.length} · 위에서 다른 질문을 선택할 수 있다.</p>`;
  const button = $("[data-open-isolation-hatch]");
  if (button) button.addEventListener("click", inspectIsolationHatch);
}

function inspectIsolationHatch() {
  if (!canAccessIsolationRoom() || state.scene !== "emergencyIsolationRoom" || state.paused || state.failed) return;
  if (state.emergencyPowerRecordCollected) { openEmergencyPowerRecord(); return; }
  const ready = isolationConversationComplete();
  showModal(modalFrame({ code: "PASS-THROUGH · INTERLOCKED", title: "유리문 아래 전달함", body: `<div class="isolation-hatch-image"><img src="assets/images/cnu-emergency-isolation-room.jpg" alt="닫힌 유리문 아래에 있는 이중 덮개 전달함" /></div><p class="result-copy">${ready ? "안쪽 덮개가 닫히고 바깥쪽 잠금이 풀렸다. 회장이 건넨 출력물에는 접힌 자국과 급히 남긴 필기가 있다." : "종이는 보이지만 안쪽 덮개가 잠겨 있다. 먼저 인터폰으로 학생회장과 이야기를 나누자."}</p>${ready ? '<button class="primary-button material-check-button" type="button" data-collect-power-record>비상 전원 기록을 챙긴다 <span>→</span></button>' : '<button class="primary-button material-check-button" type="button" data-return-conversation>인터폰으로 대화한다</button>'}` }));
  $("#modal").classList.add("evidence-modal", "exploration-modal", "isolation-modal");
  if (ready) $("[data-collect-power-record]").addEventListener("click", collectEmergencyPowerRecord);
  else $("[data-return-conversation]").addEventListener("click", openPresidentConversation);
}

function collectEmergencyPowerRecord() {
  if (!canAccessIsolationRoom() || state.scene !== "emergencyIsolationRoom" || !isolationConversationComplete() || state.paused || state.failed) return;
  if (!state.emergencyPowerRecordCollected) {
    state.emergencyPowerRecordCollected = true; addItem("emergency-power-record");
    state.selectedItem = "emergency-power-record";
    setActivity("비상 전원 기록을 확보했다. HXB 외부 송신 차단 내역과 1층 로비 비상 배전반의 제한 전력이 기록되어 있다.");
    saveState(); render();
  }
  openEmergencyPowerRecord();
}

function openEmergencyPowerRecord() {
  if (!state.emergencyPowerRecordCollected || state.paused || state.failed) return;
  showModal(modalFrame({ code: "EVIDENCE SECURED · EMERGENCY POWER", title: "비상 전원 기록", body: `<article class="power-record"><header><small>3F 격리실 단말기 · 로컬 진단 출력</small><strong>통신 차단 및 비상 전원 현황</strong></header><dl class="power-audit"><div><dt>외부 송신</dt><dd>차단됨</dd></div><div><dt>차단 명령 서명</dt><dd>HXB · 원격 관리 계정</dd></div><div><dt>내부 인터폰</dt><dd>별도 회선 · 정상</dd></div><div><dt>독립 비상 송신기</dt><dd>주 통신망과 분리 · 전원 대기</dd></div></dl><h3>1F 로비 · 비상 배전반</h3><p>동시에 공급할 수 있는 최대 출력: <strong>8칸</strong></p><p>아래 수치는 각 장치의 최소 가동 전력이다. 배분 합계는 8칸 이하여야 하며, 남는 전력을 모두 사용할 필요는 없다.</p><div class="power-loads" aria-label="각 장치의 최소 가동 전력"><div><span>비상 송신기</span><strong>4칸</strong></div><div><span>백신 후보 냉장 보관 장치</span><strong>3칸</strong></div><div><span>로비 송신 구역 격리문 모터</span><strong>5칸</strong></div></div><p class="power-handwriting">“차단 원인과 전원 상태를 같이 남긴다. 내 계정으로 지운 출입 기록도 함께 제출해 줘.”</p><p>전원을 배분하기 전 배전반의 현장 상태와 안전 조건을 다시 확인해야 한다. 이 기록에는 전환 순서가 적혀 있지 않다.</p></article><div class="vaccine-access"><small>다음 단서 · 로비 비상 배전반</small><strong>기록을 증거 인벤토리에 보관했다.</strong><p>${state.rescueRequestSent ? "독립 비상 회선을 통해 구조대가 자료와 위치를 수신했다. 주 통신망의 차단 기록은 증거로 보존한다." : "로비에서 비상 배전반을 조사하자. 주 통신망을 거치지 않는 독립 송신기를 가동해야 한다."}</p></div><button class="primary-button material-check-button" type="button" data-power-return-lobby>로비로 돌아간다 <span>→</span></button>` }));
  $("#modal").classList.add("evidence-modal", "exploration-modal", "isolation-modal");
  $("[data-power-return-lobby]").addEventListener("click", goToLobby);
}
