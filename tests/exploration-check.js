// Logic/event regression checks, not a browser rendering test.
// From the project root: jsc tests/exploration-check.js
var elements = {}, storage = {}, intervals = new Map(), timeouts = new Map(), nextId = 0;
function element() {
  var classes = new Set();
  return { hidden:false, open:false, disabled:false, textContent:'', value:'', dataset:{}, attrs:{}, handlers:{}, writes:0,
    get innerHTML(){return this.html || '';}, set innerHTML(v){this.html=v; this.writes++;},
    classList:{add(...xs){xs.forEach(x=>classes.add(x));},remove(...xs){xs.forEach(x=>classes.delete(x));},contains(x){return classes.has(x);},toggle(x,on){if(on)classes.add(x);else classes.delete(x);}},
    style:{setProperty(){}}, addEventListener(t,f){this.handlers[t]=f;},
    querySelectorAll(s){return document.querySelectorAll(s);},setAttribute(k,v){this.attrs[k]=v;},getAttribute(k){return this.attrs[k];},
    insertAdjacentHTML(where,html){this.innerHTML += html;},scrollIntoView(){},
    focus(){},select(){},showModal(){this.open=true;},close(){this.open=false;},before(){},offsetWidth:0,
    setPointerCapture(){},getBoundingClientRect(){return this.rect || {left:0,top:0,right:10,bottom:10};} };
}
var queryLists = {};
var document={body:element(),querySelector(s){
  if(s==='#modal [data-close-modal]' && !(elements['#modal-content']?.innerHTML || '').includes('data-close-modal')) return null;
  return elements[s] || (elements[s]=element());
},querySelectorAll(s){return queryLists[s] || [];},createElement:element};
var window={matchMedia(){return {matches:false,addEventListener(){}};},
  setInterval(f){var id=++nextId;intervals.set(id,f);return id;},clearInterval(id){intervals.delete(id);},
  setTimeout(f,ms){var id=++nextId;timeouts.set(id,{f,ms});return id;},clearTimeout(id){timeouts.delete(id);},
  requestAnimationFrame(f){f();}};
var navigator={vibrate(){}};
var localStorage={getItem(k){return storage[k]||null;},setItem(k,v){storage[k]=v;},removeItem(k){delete storage[k];}};
function flush(ms){for (var [id,task] of [...timeouts]) if(task.ms<=ms){timeouts.delete(id);task.f();}}
function assert(ok,msg){if(!ok)throw new Error(msg);}
function param(){return {value:0,setValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;},cancelScheduledValues(){}};}
function audioNode(){return {gain:param(),frequency:param(),Q:param(),detune:param(),connect(){},disconnect(){},start(){},stop(){}};}
function FakeAudio(){this.currentTime=1;this.sampleRate=100;this.state='running';this.destination={};}
FakeAudio.prototype={createGain:audioNode,createOscillator:audioNode,createBiquadFilter:audioNode,createBufferSource:audioNode,
  createBuffer(c,l){return {getChannelData(){return new Float32Array(l);}};},
  suspend(){this.state='suspended';return Promise.resolve();},resume(){this.state='running';return Promise.resolve();},close(){this.state='closed';return Promise.resolve();}};
var checks = `
function begin(){resetExploration();state=freshState();state.started=true;state.virusTargetIdentified=true;state.scene='molecularBiologyLab';$('#game').hidden=false;closeModal();}
begin();
openPrimerPuzzle();
assert($('#modal-content').innerHTML.includes('data-pcr-slot') && !$('#modal-content').innerHTML.includes('역상보'),'physical workbench without answer hint');
checkPrimerPuzzle();assert(state.primerPuzzleFailures===0,'empty submission is not an error');
holdPrimer('CGATGC');placePrimer('forward',heldPrimer);placePrimer('reverse','AATGCT');
assert(state.primerPuzzleFailures===0,'placing tubes is not submitting');
// Exercise the pointer-drag path as well as the keyboard/click path.
var tube=element();tube.dataset.tube='CGATGC';bindPrimerTube(tube);
var slot=element();slot.dataset.pcrSlot='forward';slot.rect={left:50,top:50,right:100,bottom:100};
queryLists['[data-pcr-slot]']=[slot];
tube.handlers.pointerdown({isPrimary:true,button:0,pointerId:1,clientX:5,clientY:5});
tube.handlers.pointermove({pointerId:1,clientX:75,clientY:75});
assert(tube.classList.contains('dragging'),'drag feedback');
tube.handlers.pointerup({type:'pointerup',pointerId:1,clientX:75,clientY:75});
assert(!tube.classList.contains('dragging') && state.primerForwardSelection==='CGATGC','drag drops into slot');
queryLists['[data-pcr-slot]']=[];
checkPrimerPuzzle();assert(state.primerPuzzleFailures===1 && state.bites===0 && state.zombieDistance===102,'first wrong: approach');
assert(!$('#approach-warning').hidden && !$('#approach-scene').hidden,'first wrong: visible threat');
saveState();loadState();assert(state.primerPuzzleFailures===1 && materialThreatActive('primer'),'first wrong persists');
checkPrimerPuzzle();assert(state.bites===1 && state.paused && state.pendingBiteSource==='primer-puzzle','second wrong: bite');
assert($('#modal').classList.contains('blackout-modal'),'brief blackout starts');
var prevented=false;$('#modal').handlers.cancel({preventDefault(){prevented=true;}});assert(prevented && state.paused,'blackout cannot escape');
checkPrimerPuzzle();assert(state.bites===1 && state.primerPuzzleFailures===2,'paused duplicate ignored');
flush(240);assert($('#modal').classList.contains('bite-modal') && !$('#modal-content').innerHTML.includes('modal-header'),'non-graphic bite after blackout');
state=freshState();loadState();startGame(false);assert(state.paused && state.bites===1,'pending bite restored');
$('[data-survive]').handlers.click();assert(!state.paused && !state.pendingBiteSource && $('#modal-content').innerHTML.includes('data-check-primers'),'retry restored');
checkPrimerPuzzle();assert(state.bites===1,'same puzzle direct bite only once');
selectPrimer('forward','GCTACG');selectPrimer('reverse','TCGTAA');checkPrimerPuzzle();assert(state.primerCollected,'primer correct after bite');
assert(inventoryCategory==='materials' && newInventoryItems.has('spike-primer-set'),'new material selects category');
state.scene='cellCultureLab';openCulturePuzzle();
inspectCultureDish('D-09');assert(state.culturePuzzleFailures===0 && state.bites===1,'dish inspection is safe');
assert($('#culture-observation').innerHTML.includes('72%'),'dish observation displayed');
checkCultureDish('invalid');assert(state.culturePuzzleFailures===0,'invalid dish ignored');
$('[data-confirm-culture]').handlers.click();assert(state.culturePuzzleFailures===1 && state.bites===1,'culture explicit first wrong');
inspectCultureDish('D-09');assert(state.culturePuzzleFailures===1,'reinspection remains safe');
$('[data-confirm-culture]').handlers.click();assert(state.bites===2,'culture second wrong');flush(240);
$('[data-survive]').handlers.click();inspectCultureDish('B-12');$('[data-confirm-culture]').handlers.click();assert(state.cultureCellsCollected,'culture retry succeeds');
state.scene='reagentStorage';openAntibodyPuzzle();inspectAntibodyVial('R-11');
assert(state.antibodyPuzzleFailures===0 && $('[data-confirm-antibody]').disabled,'vial selection is safe');
checkAntibodyVial('R-11');assert(state.antibodyPuzzleFailures===0,'unread label cannot be submitted');
$('[data-flip-vial]').handlers.click();assert(state.antibodyLabelFlipped && !$('#antibody-observation').innerHTML.includes('anti-ZV-NUCLEO'),'label flips');
$('[data-confirm-antibody]').handlers.click();assert(state.antibodyPuzzleFailures===1 && state.bites===2,'antibody explicit first wrong');
inspectAntibodyVial('R-04');assert(!state.antibodyLabelFlipped,'different vial requires fresh label inspection');
$('[data-flip-vial]').handlers.click();$('[data-confirm-antibody]').handlers.click();
assert(state.antibodyCollected && state.vaccineMaterialsComplete,'all three materials complete');
var count=state.inventory.length;checkAntibodyVial('R-04');assert(state.inventory.length===count,'material not duplicated');
// All story records are optional, collectible, order-independent and save-compatible.
for (var id of ['president-voice','president-note','president-access-log']) {
  state.scene=presidentRecords[id].scene;openPresidentRecord(id);
  assert($('#modal-content').innerHTML.includes(presidentRecords[id].time),'record readable');
  $('[data-collect-record]').handlers.click();$('[data-collect-record]').handlers.click();
  assert(state.inventory.filter(x=>x===id).length===1,'evidence collected once');
}
saveState();loadState();assert(state.inventory.includes('president-voice'),'evidence survives reload');
state.fluorescentOn=false;inspectItem('president-note');assert(!state.fluorescentOn,'evidence does not activate lamp');
assert(inventoryGroup('fluorescent-lamp')==='tools' && inventoryGroup('president-note')==='evidence','inventory classification');
markInventoryNew('president-note');renderInventory();assert($('#inventory-items').innerHTML.includes('NEW'),'new badge');
flush(7000);assert(!newInventoryItems.size && !$('#inventory-items').innerHTML.includes('NEW'),'new badge expires');
state.scene='lobby';state.letterRead=true;render();
assert($('#hotspots').innerHTML.includes('open-floor-directory') && !$('#hotspots').innerHTML.includes('molecular-room-route'),'lobby has one directory');
openFloorDirectory();var html=$('#modal-content').innerHTML;
assert((html.match(/data-directory-route=/g)||[]).length===9,'eight old routes plus unlocked development lab');
assert(html.includes('3F') && html.includes('2F') && html.includes('1F') && html.includes('B1'),'floor groups');
var writes=$('#hotspots').writes, inventoryWrites=$('#inventory-items').writes;state.elapsed++;render();
assert($('#hotspots').writes===writes && $('#inventory-items').writes===inventoryWrites,'timer preserves controls');
// Third bite and stale-transition protection.
state.antibodyCollected=false;state.selectedAntibodyVial='R-11';state.antibodyLabelFlipped=true;openAntibodyPuzzle();
checkAntibodyVial('R-11');assert(state.failed && state.bites===3,'third total bite ends game');flush(240);
state=freshState();loadState();assert(state.failed && state.bites===3,'game over persisted');
begin();triggerZombieAttack('distance');startGame(true);flush(240);assert(!$('#modal').open && !$('#modal').classList.contains('blackout-modal'),'reset cancels pending blackout');
begin();transitionTo('cellCultureLab');state.failed=true;flush(260);assert(state.scene==='molecularBiologyLab','late transition cannot bypass game over');
// Audio effects respect BGM mute and cleanup; speech always has transcript fallback.
begin();window.AudioContext=FakeAudio;startBgm();assert(intervals.size===2,'one BGM timer');
playApproachFootsteps();assert(explorationAudioNodes.length===6,'three synthesized footsteps');
closeModal();assert(explorationAudioNodes.length===0,'closing clears effects');
state.audioEnabled=false;playApproachFootsteps();assert(!explorationAudioNodes.length,'mute suppresses footsteps');
openPresidentRecord('president-voice');playPresidentVoice(presidentRecords['president-voice']);
assert($('#voice-status').textContent.includes('소리가 꺼져'),'muted voice has transcript fallback');
state.audioEnabled=true;playPresidentVoice(presidentRecords['president-voice']);assert($('#voice-status').textContent.includes('지원하지'),'unsupported voice fallback');
var cancelled=0;window.SpeechSynthesisUtterance=function(text){this.text=text;};
window.speechSynthesis={getVoices(){return[];},speak(){},cancel(){cancelled++;}};
playPresidentVoice(presidentRecords['president-voice']);assert(voicePlayback,'voice starts');
suspendBgm();assert(!voicePlayback && cancelled===1,'pause cancels voice');
state.paused=false;startBgm();var notes=bgmController.drone.frequency.value;state.scene='coldStorage';render();
assert(bgmController.drone.frequency.value!==notes,'scene changes BGM');
state.zombieDistance=20;render();assert(bgmController.pulseLfo.frequency.value===0.82,'danger changes pulse');
stopBgm();assert(intervals.size===1 && audioContext===null && !explorationAudioNodes.length,'audio cleanup');
resetExploration();assert(!timeouts.size,'no stale exploration timers');
begin();
assert(!canAccessVaccineLab() && !vaccineLabAccessBody(),'development room gated before materials');
enterVaccineLab();assert(!state.vaccineLabEntered,'locked entry ignored');
state.inventory.push(...vaccineMaterials);state.primerCollected=true;state.cultureCellsCollected=true;state.antibodyCollected=true;state.vaccineMaterialsComplete=true;
assert(canAccessVaccineLab() && targetProteinReportBody().includes('통합 백신 개발실'),'report reveals room');
enterVaccineLab();flush(380);assert(state.scene==='vaccineDevelopmentLab','entry via new route');
openVaccineWorkbench();checkVaccineMount();assert(state.vaccinePuzzleFailures===0,'empty mount is safe');
holdVaccineMaterial('culture-cells');placeVaccineMaterial(0);holdVaccineMaterial('spike-primer-set');placeVaccineMaterial(1);holdVaccineMaterial('neutralizing-antibody');placeVaccineMaterial(2);
assert(state.vaccinePuzzleFailures===0,'placing is safe');checkVaccineMount();assert(state.vaccinePuzzleFailures===1 && state.bites===0,'first mounting error approaches');
saveState();loadState();assert(state.vaccineSlots[0]==='culture-cells' && state.vaccinePuzzleFailures===1,'mounting state resumes');
holdVaccineMaterial('spike-primer-set');placeVaccineMaterial(0);holdVaccineMaterial('culture-cells');placeVaccineMaterial(1);checkVaccineMount();assert(state.vaccineBenchReady,'correct modules enable results');
assert($('#modal-content').innerHTML.includes('표적 단백질 보고서 펼치기'),'report available inside puzzle');
inspectVaccineCandidate('V-01');assert(state.vaccinePuzzleFailures===1,'results inspection is safe');confirmVaccineCandidate();assert(state.bites===1 && state.paused,'second combined verification error bites');flush(240);$('[data-survive]').handlers.click();assert(state.vaccineBenchReady && $('#modal-content').innerHTML.includes('data-confirm-vaccine'),'retry keeps mounting progress');
inspectVaccineCandidate('V-04');confirmVaccineCandidate();assert(!state.vaccineValidated && state.bites===1,'binding alone not sufficient; no duplicate bite');
inspectVaccineCandidate('V-03');confirmVaccineCandidate();assert(state.vaccineValidated && state.inventory.includes('vaccine-candidate') && state.inventory.includes('vaccine-validation-record'),'correct candidate collected');
assert(!state.survivorSignalFound && $('#modal-content').innerHTML.includes('수신 신호 확인'),'signal discovered as next interaction');
$('[data-open-survivor-signal]').handlers.click();assert(state.survivorSignalFound && state.inventory.includes('survivor-signal'),'signal record collected');
var inventoryCount=state.inventory.length;openSurvivorSignal();assert(state.inventory.length===inventoryCount,'signal item deduplicated');
saveState();state=freshState();loadState();assert(state.vaccineValidated && state.survivorSignalFound && state.vaccineSlots.length===3,'completed chapter survives reload');
assert(state.scene==='vaccineDevelopmentLab','new scene survives reload');
assert(canAccessIsolationRoom(),'isolation room unlocked by verified signal');
openFloorDirectory();assert($('#modal-content').innerHTML.includes('enter-isolation-room'),'isolation route listed');
enterIsolationRoom();flush(380);assert(state.scene==='emergencyIsolationRoom','isolation entry');
inspectIsolationHatch();assert(!state.emergencyPowerRecordCollected && $('#modal-content').innerHTML.includes('인터폰으로 대화한다'),'hatch gated before conversation');
collectEmergencyPowerRecord();assert(!state.emergencyPowerRecordCollected,'cannot skip conversation for item');
openPresidentConversation();assert(state.presidentConfronted && $('#modal-content').innerHTML.includes('data-isolation-topic'),'conversation establishes identity');
selectIsolationTopic('transport');assert(state.isolationTopicsRead.length===0,'opening answer is not acknowledgment');
acknowledgeIsolationTopic('handoff');assert(state.isolationTopicsRead.length===0,'unseen topic cannot be acknowledged');
acknowledgeIsolationTopic('transport');acknowledgeIsolationTopic('transport');assert(state.isolationTopicsRead.length===1,'read markers deduplicated');
closeModal();saveState();state=freshState();loadState();assert(state.isolationTopicsRead[0]==='transport' && state.scene==='emergencyIsolationRoom','partial conversation persists');
openPresidentConversation();assert($('#isolation-answer').innerHTML.includes('상자를 가져온 건 나야'),'last topic restored');
for (var topic of ['handoff','communications','containment']) { selectIsolationTopic(topic); acknowledgeIsolationTopic(topic); }
assert(isolationConversationComplete() && !state.emergencyPowerRecordCollected,'conversation unlocks but does not auto-collect');
assert($('#hotspots').innerHTML.includes('전달된 기록'),'scene hatch updates after final topic');
inspectIsolationHatch();$('[data-collect-power-record]').handlers.click();assert(state.emergencyPowerRecordCollected && state.inventory.includes('emergency-power-record'),'physical evidence pickup');
assert(inventoryGroup('emergency-power-record')==='evidence','record is evidence');
var recordCount=state.inventory.length;collectEmergencyPowerRecord();assert(state.inventory.length===recordCount,'power record deduplicated');
state.fluorescentOn=false;inspectItem('emergency-power-record');assert(!state.fluorescentOn && $('#modal-content').innerHTML.includes('HXB'),'item opens record not lamp');
assert($('#modal-content').innerHTML.includes('동시에 공급할 수 있는 최대 출력') && $('#modal-content').innerHTML.includes('최소 가동 전력'),'record distinguishes capacity from minimum load');
var activity=state.activity;openSurvivorSignal();assert($('#modal-content').innerHTML.includes('발신자 확인') && state.activity===activity,'signal updates identity without overwriting latest story');
saveState();state=freshState();loadState();assert(state.emergencyPowerRecordCollected && isolationConversationComplete(),'completed conversation reloads');
$('[data-signal-return-lobby]').handlers.click();flush(260);assert(state.scene==='lobby','return to lobby');
state.paused=true;enterIsolationRoom();assert(state.scene==='lobby','paused entry ignored');state.paused=false;
var savedRead=state.isolationTopicsRead;var clean=freshState();clean.isolationTopicsRead.push('transport');assert(state.isolationTopicsRead===savedRead && savedRead.length===4,'read arrays independent');
assert(!state.rescueDefenseStarted,'no defense without installed barricade');
state.barricadeInstalled=true;goToLobby();flush(380);assert(state.rescueDefenseStarted && state.scene==='lobby','record unlocks final lobby');
render();assert($('#scene-image').attrs.src===undefined || $('#scene-image').src.includes('final-defense'),'final lobby image');
openRescueRadio();assert($('#modal-content').innerHTML.includes('응답 없는'),'radio initially offline');
openRescuePowerPanel();applyRescuePower();assert(state.rescuePowerFailures===0,'empty allocation safe');
var powerCopy=$('#modal-content').innerHTML;
assert(powerCopy.includes('모두 사용할 필요는 없다') && powerCopy.includes('최소 가동 전력'),'panel explains spare capacity and minimum loads');
assert(powerCopy.includes('0칸은 전원 차단') && powerCopy.includes('반드시 0칸'),'panel defines power off and motor interlock');
assert(powerCopy.includes('숫자를 조정하는 동안에는 기존 장비 상태와 냉장 보관이 유지'),'panel distinguishes draft settings from execution');
adjustRescuePower(0,1);adjustRescuePower(0,-1);assert(state.rescuePowerFailures===0,'adjusting safe');
state.rescuePower=[4,3,5];applyRescuePower();assert(state.rescuePowerFailures===1 && !state.rescueAntennaReady,'overload rejected');
saveState();state=freshState();loadState();assert(state.rescuePower.join(',')==='4,3,5' && state.rescuePowerFailures===1,'allocation and failures persist');
var previousBites=state.bites;applyRescuePower();assert(state.bites===previousBites+1 && state.paused,'second failure bites');flush(240);$('[data-survive]').handlers.click();
assert($('#modal-content').innerHTML.includes('data-apply-rescue-power'),'power panel restored after bite');
state.rescuePower=[0,3,5];applyRescuePower();assert(state.rescueAntennaReady && !state.rescueLinkEstablished,'gate plus cold unfolds antenna');
assert($('#rescue-power-feedback').textContent.includes('문은 전원 없이 열린 상태를 유지'),'checkpoint explains mechanical hold');
saveState();state=freshState();loadState();assert(state.rescueAntennaReady,'stage checkpoint persists');
openRescuePowerPanel();state.rescuePower=[4,0,0];applyRescuePower();assert(!state.rescueLinkEstablished && state.bites===previousBites+1,'cold outage rejected; no duplicate puzzle bite');
state.rescuePower=[4,3,0];applyRescuePower();assert(state.rescueLinkEstablished && !state.rescueRequestSent,'radio powered while cold maintained');
sendRescueRequest();assert(!state.rescueRequestSent,'attachments required');
toggleRescueAttachment('vaccine-validation-record');sendRescueRequest();assert(!state.rescueRequestSent,'location required too');
toggleRescueAttachment('survivor-signal');sendRescueRequest();assert(state.rescueRequestSent && state.inventory.includes('rescue-transmission-receipt'),'request and receipt completed');
var finalItems=state.inventory.length;sendRescueRequest();assert(state.inventory.length===finalItems,'transmission idempotent');
var frozenElapsed=state.elapsed;[...intervals.values()][0]();assert(state.elapsed===frozenElapsed,'clock stops at completed segment');
saveState();state=freshState();loadState();assert(state.rescueRequestSent && state.rescueLinkEstablished,'completion survives reload');
state.fluorescentOn=false;inspectItem('rescue-transmission-receipt');assert(!state.fluorescentOn && $('#modal-content').innerHTML.includes('3층 비상 격리실'),'receipt reopens as evidence');
assert(!state.rescueRouteStarted && rescueChapterWaiting(),'old checkpoint waits for deliberate continuation');
var legacySave=JSON.parse(localStorage.getItem(STORAGE_KEY));for(var key of Object.keys(legacySave))if(key.startsWith('rescueRoute') || key==='rescuePassageCleared')delete legacySave[key];
localStorage.setItem(STORAGE_KEY,JSON.stringify(legacySave));state=freshState();loadState();
assert(state.rescueRequestSent && !state.rescueRouteStarted && state.rescueRoutePath.length===0,'actual pre-route save migrates with fresh defaults');
openRescueRoute();assert(!state.rescueRouteStarted,'route cannot bypass start');
state.scene='computerLab';startRescueRoute();assert(!state.rescueRouteStarted,'route start requires lobby');state.scene='lobby';
showRescueReceipt();$('[data-rescue-route-continue]').handlers.click();
assert(state.rescueRouteStarted && !rescueChapterWaiting() && $('#modal-content').innerHTML.includes('진입 도면'),'receipt starts route chapter');
state.zombieDistance=120;state.bites=0;
var routeTick=state.elapsed;[...intervals.values()][0]();assert(state.elapsed===routeTick+1,'route resumes global clock');
var nodeG=element();nodeG.dataset.routeNode='G';var nodeH=element();nodeH.dataset.routeNode='H';
var edgeGH=element();edgeGH.dataset.routeEdge='GH';var cameraNorth=element();cameraNorth.dataset.routeCamera='north';
queryLists['[data-route-node]']=[nodeG,nodeH];queryLists['[data-route-edge]']=[edgeGH];queryLists['[data-route-camera]']=[cameraNorth];
openRescueRoute();selectRescueRouteNode('C');assert(!state.rescueRoutePath.length && !state.rescueRouteFailures,'non-entry start harmless');
nodeG.handlers.click();selectRescueRouteNode('B');assert(state.rescueRoutePath.join('')==='G','non-neighbor ignored');nodeH.handlers.click();
assert(nodeH.attrs['aria-pressed']==='true' && edgeGH.classList.contains('selected'),'tap selects node and draws connected edge');
selectRescueRouteNode('E');selectRescueRouteNode('F');selectRescueRouteNode('C');submitRescueRoute();
assert(!state.rescueRouteApproved && !state.rescueRouteFailures,'unread CCTV does not cost a failure');
selectRescueRouteNode('E');assert(state.rescueRoutePath.join('')==='GHE','tapping earlier node rewinds');
$('[data-route-undo]').handlers.click();assert(state.rescueRoutePath.join('')==='GH','undo button removes last point');
cameraNorth.handlers.click();inspectRouteCamera('north');inspectRouteCamera('west');inspectRouteCamera('south');
assert(state.rescueRouteCamerasRead.length===3 && $('#route-camera-view').innerHTML.includes('방화문'),'CCTV observations available; reads deduplicated');
saveState();state=freshState();loadState();assert(state.rescueRoutePath.join('')==='GH' && state.rescueRouteCamerasRead.length===3,'draft and CCTV persist');
openRescueRadio();assert($('#modal-content').innerHTML.includes('진입 도면'),'radio returns to unfinished route');
$('[data-route-reset]').handlers.click();submitRescueRoute();assert(!state.rescueRouteFailures && !state.rescueRoutePath.length,'clear and empty submission harmless');
for(var id of ['A','B','C'])selectRescueRouteNode(id);
$('[data-route-submit]').handlers.click();assert(state.rescueRouteFailures===1 && !state.rescueRouteApproved && !$('#approach-warning').hidden,'blocked path triggers first approach');
state.paused=true;submitRescueRoute();selectRescueRouteNode('B');assert(state.rescueRouteFailures===1 && state.rescueRoutePath.join('')==='ABC','paused inputs ignored');state.paused=false;
submitRescueRoute();assert(state.bites===1 && state.paused && state.pendingBiteSource==='rescue-route','second wrong route triggers bite');
flush(240);assert($('#modal').classList.contains('bite-modal'),'route uses non-graphic bite visual');
$('[data-survive]').handlers.click();assert(!state.paused && $('#modal-content').innerHTML.includes('진입 도면'),'bite returns to route');
submitRescueRoute();assert(state.bites===1 && state.rescueRouteFailures===3,'same puzzle does not give duplicate bite');
editRescueRoute(true);for(var id of ['G','H','E','F','C'])selectRescueRouteNode(id);submitRescueRoute();
assert(state.rescueRouteApproved && !state.rescuePassageCleared && !state.rescueRouteSecured,'valid route approves but does not auto-enter');
var approvedPath=state.rescueRoutePath.join('');editRescueRoute(true);selectRescueRouteNode('A');assert(state.rescueRoutePath.join('')===approvedPath,'approved route immutable');
saveState();state=freshState();loadState();openRescueRadio();assert($('#modal-content').innerHTML.includes('같은 문을 사이에 두고'),'approval checkpoint resumes cooperation');
$('[data-route-cooperate]').handlers.click();assert(state.rescuePassageCleared && !state.rescueRouteSecured,'first cooperative action clears carts only');
saveState();state=freshState();loadState();openRescueRadio();assert($('#modal-content').innerHTML.includes('보조문 잠금 해제'),'cleared passage survives reload');
$('[data-route-cooperate]').handlers.click();assert(state.rescueRouteSecured && state.inventory.includes('rescue-entry-record') && rescueChapterWaiting(),'second action admits team and stores entry record');
var securedInventory=state.inventory.length;advanceRescueCooperation();startRescueRoute();assert(state.inventory.length===securedInventory,'completion actions idempotent');
var securedTime=state.elapsed;[...intervals.values()][0]();triggerZombieAttack();assert(state.elapsed===securedTime && state.bites===1,'secured chapter freezes time and attacks');
saveState();state=freshState();loadState();inspectItem('rescue-entry-record');assert(state.rescueRouteSecured && $('#modal-content').innerHTML.includes('후보는 아직 인계하지 않았고'),'entry record reopens without skipping next story');
showRescueReceipt();assert(!$('#modal-content').innerHTML.includes('아직 구조대가 도착한 것은 아니다'),'historical receipt does not contradict team arrival');
queryLists['[data-route-node]']=[];queryLists['[data-route-edge]']=[];queryLists['[data-route-camera]']=[];
// Corrupt and older saves cannot manufacture approval or carry mutable arrays across new games.
var completedRouteSnapshot=JSON.stringify(state);
state.rescueRoutePath=['G','C'];normalizeRescueRouteState();assert(!state.rescueRouteApproved && !state.rescueRouteSecured && !state.inventory.includes('rescue-entry-record'),'non-adjacent saved route invalidates later states');
state=JSON.parse(completedRouteSnapshot);state.rescueRouteSecured=false;state.rescueRouteApproved=false;state.rescuePassageCleared=false;state.rescueRouteFailures=1;state.rescueRouteBiteTriggered=false;state.rescueRoutePath=['A','B','C'];state.bites=2;
submitRescueRoute();assert(state.failed && state.bites===3,'third total bite still causes game over during route chapter');flush(240);
state=JSON.parse(completedRouteSnapshot);closeModal();
state.rescueRouteSecured=false;state.elapsed=LIMIT_SECONDS-1;state.zombieDistance=120;
[...intervals.values()][0]();assert(state.failed && state.elapsed===LIMIT_SECONDS,'global deadline still enforced during route chapter');
state=JSON.parse(completedRouteSnapshot);closeModal();
var freshRoute=freshState();freshRoute.rescueRoutePath.push('A');freshRoute.rescueRouteCamerasRead.push('north');assert(state.rescueRoutePath.join('')==='GHEFC' && initialState.rescueRoutePath.length===0 && initialState.rescueRouteCamerasRead.length===0,'new game arrays independent');
// Chapter 5: explicit custody transfer, protected rescue and recorded responsibility.
state.rescueRouteSecured=false;startHandoff();assert(!state.handoffStarted,'handoff gated by rescue team arrival');state.rescueRouteSecured=true;
state.scene='computerLab';startHandoff();assert(!state.handoffStarted,'handoff starts only at lobby');state.scene='lobby';
saveState();var oldRouteSave=JSON.parse(localStorage.getItem(STORAGE_KEY));for(var key of Object.keys(oldRouteSave))if(key.startsWith('handoff') || ['presidentMedicalChecked','presidentRescued'].includes(key))delete oldRouteSave[key];
localStorage.setItem(STORAGE_KEY,JSON.stringify(oldRouteSave));state=freshState();loadState();assert(state.rescueRouteSecured && !state.handoffStarted && !state.handoffDelivered.length,'pre-handoff save migrates');
showRescueEntryRecord();$('[data-entry-handoff]').handlers.click();assert(state.handoffStarted && $('#modal-content').innerHTML.includes('후보·핵심 기록'),'entry record opens handoff desk');
var handoffClock=state.elapsed,handoffBites=state.bites;[...intervals.values()][0]();triggerZombieAttack();assert(state.elapsed===handoffClock && state.bites===handoffBites,'team defense keeps story chapter safe');
deliverHandoffItem('vaccine-candidate');advancePresidentTransfer(false);assert(!state.handoffDelivered.length && !state.presidentMedicalChecked,'cannot skip selection or required inventory handoff');
var candidateButton=element();candidateButton.dataset.handoffItem='vaccine-candidate';queryLists['[data-handoff-item]']=[candidateButton];
openHandoffDesk();candidateButton.handlers.click();assert(candidateButton.attrs['aria-pressed']==='true' && !state.handoffDelivered.length,'card inspection does not hand over item');
state.paused=true;$('[data-handoff-deliver]').handlers.click();assert(!state.handoffDelivered.length,'paused delivery ignored');state.paused=false;
$('[data-handoff-deliver]').handlers.click();assert(state.handoffDelivered.join('')==='vaccine-candidate' && state.inventory.includes('vaccine-candidate'),'candidate custody transferred; archive card retained');
deliverHandoffItem('vaccine-candidate');assert(state.handoffDelivered.length===1 && $('#handoff-inspection').innerHTML.includes('접수 완료'),'delivery idempotent and acknowledged');
inventoryCategory='materials';renderInventory();assert($('#inventory-items').innerHTML.includes('백신 후보 접수 기록'),'inventory distinguishes receipt from physical candidate');
state.fluorescentOn=false;inspectItem('vaccine-candidate');assert(!state.fluorescentOn && $('#modal-content').innerHTML.includes('실물은 의료·연구팀'),'candidate archive does not grant lamp or duplicate sample');
inspectItem('vaccine-validation-record');assert($('#modal-content').innerHTML.includes('보관 사본') && !$('#modal-content').innerHTML.includes('장비의 내부 통신 연결이 복구되자'),'validation revisit is historical after transfer');
saveState();state=freshState();loadState();assert(state.handoffDelivered.length===1 && state.handoffSelectedItem==='vaccine-candidate','partial handoff resumes without losing custody');
openRescueRadio();assert($('#modal-content').innerHTML.includes('우리가 가져온 것들'),'lobby terminal resumes desk');
selectHandoffItem('campus-map');selectHandoffItem('president-note');assert(state.handoffSelectedItem==='vaccine-candidate','tools and uncollected optional evidence ignored');
for(var id of ['vaccine-validation-record','target-protein-report','emergency-power-record']){selectHandoffItem(id);deliverHandoffItem(id);}
assert(!handoffRequiredComplete() && !state.presidentMedicalChecked,'missing core evidence blocks progression without fabricating it');
state.c07PuzzleSolved=true;state.c07LockerOpened=true;state.presidentMotiveRevealed=true;addItem('c07-record');
openHandoffDesk();selectHandoffItem('c07-record');$('[data-handoff-deliver]').handlers.click();
assert(handoffRequiredComplete() && !state.presidentMedicalChecked && !state.presidentRescued,'all core items unlock but do not auto-rescue');
$('[data-handoff-next]').handlers.click();assert($('#modal-content').innerHTML.includes('상태 확인 보고'),'next action requests medical status');
var oldMedicalHandler=$('[data-president-transfer]').handlers.click;oldMedicalHandler();assert(state.presidentMedicalChecked && !state.presidentRescued,'status confirmation precedes protected transfer');
oldMedicalHandler();assert(!state.presidentRescued,'stale double click cannot skip transfer confirmation');
saveState();state=freshState();loadState();openRescueRadio();assert($('#modal-content').innerHTML.includes('보호 이송을 확인'),'medical checkpoint survives reload');
$('[data-president-transfer]').handlers.click();assert(state.presidentRescued && !state.handoffComplete && state.handoffStatementIndex===0,'protected arrival starts direct statement, not absolution');
var firstStatementHandler=$('[data-statement-next]').handlers.click;firstStatementHandler();firstStatementHandler();assert(state.handoffStatementIndex===1,'stale statement click cannot skip pages');
$('[data-statement-back]').handlers.click();assert(state.handoffStatementIndex===0,'statement can be reread');$('[data-statement-next]').handlers.click();
saveState();state=freshState();loadState();openRescueRadio();assert(state.handoffStatementIndex===1 && $('#modal-content').innerHTML.includes('위험을 알게 된 뒤의 선택'),'partial statement resumes');
$('[data-statement-next]').handlers.click();assert($('#modal-content').innerHTML.includes('구조와 용서는 다른 일') && !state.handoffComplete,'cooperation does not erase responsibility');
$('[data-statement-next]').handlers.click();assert(!state.handoffComplete,'last page requires explicit acknowledgment');
$('[data-statement-next]').handlers.click();assert(state.handoffComplete && state.inventory.includes('handoff-receipt') && state.inventory.includes('president-statement'),'final acknowledgment stores receipt and statement');
assert(!handoffOptionalItems.some(id=>state.handoffDelivered.includes(id)),'optional evidence never required for completion');
var completedHandoffItems=state.inventory.length;advanceHandoffStatement(handoffStatement.length-1);startHandoff();assert(state.inventory.length===completedHandoffItems,'completion cannot duplicate rewards');
saveState();state=freshState();loadState();assert(state.handoffComplete && state.handoffDelivered.length===5,'completed handoff restores');
inspectItem('handoff-receipt');assert($('#modal-content').innerHTML.includes('아직 건물 밖으로 나간 것은 아니다'),'handoff stops before final escape');
inspectItem('president-statement');assert($('#modal-content').innerHTML.includes('회사에서 시켰다는 사실') && $('#modal-content').innerHTML.includes('책임 판단은 후속 조사'),'record preserves company and president responsibility without verdict');
showRescueEntryRecord();assert(!$('#modal-content').innerHTML.includes('후보는 아직 인계하지 않았고'),'entry archive updates after handoff');
openSurvivorSignal();assert($('#modal-content').innerHTML.includes('보호 이송 완료'),'old survivor signal reflects current location');
state.scene='reagentStorage';enterIsolationRoom();assert(state.scene==='reagentStorage' && $('#modal-content').innerHTML.includes('직접 진술 기록'),'rescued president is not placed back behind glass');state.scene='lobby';
addItem('president-note');openHandoffDesk();selectHandoffItem('president-note');deliverHandoffItem('president-note');assert(state.handoffComplete && state.handoffDelivered.includes('president-note'),'optional evidence can be handed over after completion');
showHandoffReceipt();assert($('#modal-content').innerHTML.includes('학생회장의 접힌 메모'),'receipt includes later optional evidence');
var finalHandoffTime=state.elapsed;[...intervals.values()][0]();assert(state.elapsed===finalHandoffTime,'handoff completion preserves stopped clock');
queryLists['[data-handoff-item]']=[];
var completedHandoffSnapshot=JSON.stringify(state);
state.handoffDelivered=['vaccine-candidate','vaccine-candidate','campus-map','unknown'];normalizeHandoffState();assert(state.handoffDelivered.length===1 && !state.presidentRescued && !state.handoffComplete && !state.inventory.includes('handoff-receipt'),'malformed custody cannot unlock rescue or receipt');
state=JSON.parse(completedHandoffSnapshot);state.scene='emergencyIsolationRoom';normalizeHandoffState();assert(state.scene==='lobby','stale post-rescue isolation scene relocates safely');
var handoffFresh=freshState();handoffFresh.handoffDelivered.push('c07-record');assert(initialState.handoffDelivered.length===0 && state.handoffDelivered.length===6,'handoff arrays independent');
// Chapter 6: an explicit departure, independent epilogue progress and immutable result.
state.handoffComplete=false;startEnding();assert(!state.endingStarted,'ending cannot bypass handoff');state.handoffComplete=true;
state.scene='computerLab';startEnding();assert(!state.endingStarted,'departure must start at lobby');state.scene='lobby';
saveState();var oldHandoffSave=JSON.parse(localStorage.getItem(STORAGE_KEY));for(var key of Object.keys(oldHandoffSave))if(key.startsWith('ending') || key==='escaped')delete oldHandoffSave[key];
localStorage.setItem(STORAGE_KEY,JSON.stringify(oldHandoffSave));state=freshState();loadState();assert(state.handoffComplete && !state.endingStarted && !state.escaped,'handoff-only save migrates without auto-escape');
showHandoffReceipt();$('[data-handoff-ending]').handlers.click();assert(state.endingStarted && state.endingDepartureStep===0 && !state.escaped,'receipt starts guided departure');
assert(currentBgmProfile().danger===false && currentBgmProfile().noise<0.01,'ending selects restrained non-danger BGM');
state.paused=true;advanceEndingDeparture(0);assert(state.endingDepartureStep===0,'paused departure ignored');state.paused=false;
var oldDepartHandler=$('[data-ending-depart]').handlers.click;oldDepartHandler();oldDepartHandler();assert(state.endingDepartureStep===1 && !state.escaped,'stale double tap cannot skip the exit');
assert($('#modal-content').innerHTML.includes('로비 → 안쪽 복도 → 물품 대기실 → 연결 통로 → 남측 보조문'),'departure reverses the established rescue route');
saveState();state=freshState();loadState();startGame(false);assert(state.endingDepartureStep===1 && $('#modal-content').innerHTML.includes('우리가 열어 둔 길로'),'resume reopens unfinished departure');
var endingTime=state.elapsed,endingBites=state.bites;
$('[data-ending-depart]').handlers.click();assert(state.escaped && state.scene==='rescueAssembly' && !state.endingComplete,'exit switches to outside scene before epilogue');
assert($('#scene-image').src.includes('evacuation-assembly') && $('#scene').classList.contains('escaped-scene'),'outside background and safe visual state applied');
assert($('#modal-content').innerHTML.includes('관찰과 진료는 계속된다'),'bite history not magically cured by escape');
var escapeSnapshot=JSON.stringify(state.endingSummary),afterEscapeInventory=state.inventory.length;
advanceEndingDeparture(1);assert(JSON.stringify(state.endingSummary)===escapeSnapshot,'departure cannot overwrite snapshot twice');
[...intervals.values()][0]();triggerZombieAttack();showFailure();showInfectionFailure();assert(state.elapsed===endingTime && state.bites===endingBites && !state.failed,'terminal success cannot turn into attack or time failure');
transitionTo('lobby');handleSceneAction('choose-105');flush(380);assert(state.scene==='rescueAssembly' && state.bites===endingBites,'completed escape cannot return to dangerous rooms');
state.fluorescentOn=false;inspectItem('fluorescent-lamp');assert(!state.fluorescentOn && state.inventory.length===afterEscapeInventory,'archive inspection cannot use tools or collect');
showHandoffReceipt();assert(!$('#modal-content').innerHTML.includes('우리도 아직 건물 밖으로 나간 것은 아니다'),'handoff archive no longer contradicts escape');
goToLobby();assert(state.scene==='rescueAssembly' && $('#modal-content').innerHTML.includes('우리는 밖으로 나왔다'),'old return links stay in ending');
saveState();state=freshState();loadState();startGame(false);assert(state.escaped && !state.endingEpilogueStarted && $('#modal-content').innerHTML.includes('탈출 성공'),'outside checkpoint resumes');
$('[data-open-epilogue]').handlers.click();assert(state.endingEpilogueStarted && state.endingEpilogueIndex===0 && !state.endingComplete,'epilogue is not auto-completed');
assert($('#modal-content').innerHTML.includes('추가 검증과 생산') && $('#modal-content').innerHTML.includes('60분 플레이 제한과 별개'),'vaccine distribution occurs after a time jump');
var epilogueFirst=$('[data-epilogue-next]').handlers.click;epilogueFirst();epilogueFirst();assert(state.endingEpilogueIndex===1,'stale epilogue click cannot skip a page');
$('[data-epilogue-back]').handlers.click();assert(state.endingEpilogueIndex===0,'previous epilogue page can be reread');$('[data-epilogue-next]').handlers.click();
saveState();state=freshState();loadState();startGame(false);assert(state.endingEpilogueIndex===1 && $('#modal-content').innerHTML.includes('기록에서 누구의 이름도'),'epilogue page persists');
assert($('#modal-content').innerHTML.includes('책임을 없애지는 않았다'),'epilogue preserves president responsibility');
$('[data-epilogue-next]').handlers.click();assert(!state.endingComplete,'final epilogue requires acknowledgment');
$('[data-epilogue-next]').handlers.click();assert(state.endingComplete && state.inventory.includes('game-clear-record'),'final acknowledgment stores completed ending');
assert($('#modal-content').innerHTML.includes('위험 구간 플레이 시간') && $('#modal-content').innerHTML.includes('물린 횟수') && $('#modal-content').innerHTML.includes('보관한 기록'),'results expose defined play metrics');
assert(JSON.stringify(state.endingSummary)===escapeSnapshot && !state.endingSummary.evidenceIds.includes('game-clear-record'),'results remain fixed and exclude own reward');
var clearInventoryCount=state.inventory.length;advanceEndingEpilogue(2);assert(state.inventory.length===clearInventoryCount,'clear record is idempotent');
saveState();state=freshState();loadState();startGame(false);assert(state.endingComplete && $('#modal-content').innerHTML.includes('탈출 완료') && $('#continue-button').textContent.includes('결과 다시 보기'),'completed save reopens results');
inspectItem('game-clear-record');assert($('#modal-content').innerHTML.includes('THE END'),'inventory reopens results');
$('[data-ending-replay]').handlers.click();assert($('#modal-content').innerHTML.includes('우리가 넘긴 후보') && state.endingComplete,'epilogue replay leaves completion intact');
$('[data-epilogue-next]').handlers.click();$('[data-epilogue-next]').handlers.click();$('[data-epilogue-next]').handlers.click();assert(JSON.stringify(state.endingSummary)===escapeSnapshot,'replay cannot alter metrics');
var beforeRestartStorage=localStorage.getItem(STORAGE_KEY);
$('[data-ending-restart]').handlers.click();assert(state.endingComplete && localStorage.getItem(STORAGE_KEY)===beforeRestartStorage,'restart prompt is non-destructive');
$('[data-ending-cancel]').handlers.click();assert(state.endingComplete && $('#modal-content').innerHTML.includes('탈출 완료'),'cancel keeps result');
var completedEndingSnapshot=JSON.stringify(state);
$('[data-ending-restart]').handlers.click();$('[data-ending-confirm]').handlers.click();assert(!state.escaped && !state.endingComplete && !state.endingStarted && state.scene==='lobby' && state.elapsed===0 && !state.handoffDelivered.length,'confirmed replay resets all chapters');
state=JSON.parse(completedEndingSnapshot);state.endingDepartureStep=0;normalizeEndingState();assert(!state.escaped && !state.endingComplete && state.scene==='lobby' && !state.inventory.includes('game-clear-record'),'invalid exit checkpoint cannot retain victory');
state=JSON.parse(completedEndingSnapshot);state.endingSummary={elapsed:-10,bites:99,evidenceIds:['unknown','game-clear-record','c07-record','c07-record'],deliveredIds:['campus-map','c07-record']};normalizeEndingState();
assert(state.endingSummary.elapsed===0 && state.endingSummary.bites===state.bites && state.endingSummary.evidenceIds.join('')==='c07-record' && state.endingSummary.deliveredIds.join('')==='c07-record','summary data is bounded and whitelisted');
state=JSON.parse(completedEndingSnapshot);closeModal();
state.vaccineSlots=['bad','bad','bad'];normalizeVaccineState();normalizeIsolationState();normalizeRescueState();assert(!state.vaccineBenchReady && !state.vaccineValidated && !canAccessIsolationRoom() && !state.rescueRequestSent,'invalid mounting data sanitized');
assert(!state.escaped && !state.endingComplete && state.scene==='lobby' && !state.inventory.includes('game-clear-record'),'ending invalidates with broken upstream story');
assert(!state.handoffStarted && !state.presidentRescued && !state.handoffComplete && !state.inventory.includes('president-statement'),'handoff follows upstream invalidation');
assert(!state.rescueRouteStarted && !state.rescueRouteApproved && !state.rescueRouteSecured,'route follows upstream state invalidation');
assert(!state.presidentConfronted && state.isolationTopicsRead.length===0,'unreachable conversation resets');
var a=freshState(),b=freshState();a.vaccineSlots[0]='x';assert(b.vaccineSlots[0]==='','new game slot arrays independent');
print('PASS: all chapters + departure/epilogue checkpoints, outside terminal state, archived results, statistics, confirmed restart, migration and normalization');
`;
Function(readFile('exploration.js') + '\n' + readFile('vaccine.js') + '\n' + readFile('isolation.js') + '\n' + readFile('rescue.js') + '\n' + readFile('route.js') + '\n' + readFile('handoff.js') + '\n' + readFile('ending.js') + '\n' + readFile('game.js') + checks)();
