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
var activity=state.activity;openSurvivorSignal();assert($('#modal-content').innerHTML.includes('발신자 확인') && state.activity===activity,'signal updates identity without overwriting latest story');
saveState();state=freshState();loadState();assert(state.emergencyPowerRecordCollected && isolationConversationComplete(),'completed conversation reloads');
$('[data-signal-return-lobby]').handlers.click();flush(260);assert(state.scene==='lobby','return to lobby');
state.paused=true;enterIsolationRoom();assert(state.scene==='lobby','paused entry ignored');state.paused=false;
var savedRead=state.isolationTopicsRead;var clean=freshState();clean.isolationTopicsRead.push('transport');assert(state.isolationTopicsRead===savedRead && savedRead.length===4,'read arrays independent');
state.vaccineSlots=['bad','bad','bad'];normalizeVaccineState();normalizeIsolationState();assert(!state.vaccineBenchReady && !state.vaccineValidated && !canAccessIsolationRoom(),'invalid mounting data sanitized');
assert(!state.presidentConfronted && state.isolationTopicsRead.length===0,'unreachable conversation resets');
var a=freshState(),b=freshState();a.vaccineSlots[0]='x';assert(b.vaccineSlots[0]==='','new game slot arrays independent');
print('PASS: exploration/vaccine regressions + isolation gate, dialogue acknowledgment/replay, partial save, hatch pickup, evidence deduplication, signal identity, return route');
`;
Function(readFile('exploration.js') + '\n' + readFile('vaccine.js') + '\n' + readFile('isolation.js') + '\n' + readFile('game.js') + checks)();
