const STORAGE='marysiaSorobanV4';
const old=JSON.parse(localStorage.getItem('marysiaMath')||'null')||{};
let state=JSON.parse(localStorage.getItem(STORAGE)||'null')||{
  stars:old.stars||0,correct:old.correct||0,total:old.total||0,voice:old.voice!==false,voiceName:old.voiceName||''
};
let mode='add';
let task={start:0,change:0,answer:0,index:0,total:10,instruction:'',locked:false};
let digits=[0,0];
let availableVoices=[],activeVoice=null;

function value(){return digits[0]*10+digits[1]}
function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a}

function setMode(next){
  mode=next;
  document.querySelectorAll('.modes button').forEach(b=>b.classList.remove('active'));
  document.getElementById('mode-'+mode).classList.add('active');
  document.getElementById('modeTitle').textContent=
    mode==='number'?'Liczby od 0 do 10':mode==='add'?'Dodawanie do 10':'Odejmowanie do 10';
  task.index=0;task.locked=false;newTask();
}
function newTask(){
  task.locked=false;
  clearFeedback();
  if(mode==='number'){
    task.start=0;task.answer=rand(0,10);task.change=0;
    task.instruction='Ustaw na sorobanie liczbę '+task.answer+'.';
    setValue(0);
  } else if(mode==='add'){
    task.start=rand(0,9);
    task.change=rand(1,10-task.start);
    task.answer=task.start+task.change;
    task.instruction='Na sorobanie jest '+task.start+'. Dodaj '+task.change+'.';
    setValue(task.start);
  } else {
    task.start=rand(1,10);
    task.change=rand(1,task.start);
    task.answer=task.start-task.change;
    task.instruction='Na sorobanie jest '+task.start+'. Odejmij '+task.change+'.';
    setValue(task.start);
  }
  renderDots();
  setTimeout(()=>speak(task.instruction),220);
}
function nextTask(){
  task.index++;
  if(task.index>=task.total){
    state.stars+=5;save();
    task.index=0;
    celebrate(18);
    speak('Brawo Marysiu! Skończyłaś dziesięć zadań.');
    setTimeout(newTask,1500);
  }else newTask();
}
function resetToStart(){task.locked=false;clearFeedback();setValue(task.start);repeatInstruction()}
function repeatInstruction(){speak(task.instruction,true)}
function checkTask(){
  if(task.locked)return;
  if(value()===task.answer){
    task.locked=true;state.correct++;state.total++;state.stars+=2;save();
    feedback('Brawo! ✨','good');celebrate(10);speak('Brawo Marysiu!');
    setTimeout(nextTask,950);
  }else{
    state.total++;save();
    feedback('Spróbuj jeszcze raz','bad');speak('Spróbuj jeszcze raz. Posłuchaj polecenia.');
    setTimeout(()=>{clearFeedback();repeatInstruction()},800);
  }
}
function feedback(text,kind){let el=document.getElementById('feedback');el.textContent=text;el.className='feedback '+kind}
function clearFeedback(){let el=document.getElementById('feedback');el.textContent='';el.className='feedback'}
function save(){localStorage.setItem(STORAGE,JSON.stringify(state));renderStats()}
function renderStats(){
  document.getElementById('stars').textContent='⭐ '+state.stars;
  document.getElementById('correctStat').textContent=state.correct;
  document.getElementById('totalStat').textContent=state.total;
  document.getElementById('accuracyStat').textContent=(state.total?Math.round(state.correct/state.total*100):0)+'%';
}
function renderDots(){
  let html='';
  for(let i=0;i<task.total;i++)html+='<i class="dot '+(i<task.index?'done':i===task.index?'now':'')+'"></i>';
  document.getElementById('dots').innerHTML=html;
  document.getElementById('sessionText').textContent=(task.index+1)+' z '+task.total;
}

function setValue(n){
  n=clamp(n,0,10);
  digits=[Math.floor(n/10),n%10];
  renderSoroban();
}
function renderSoroban(){
  const mount=document.getElementById('sorobanMount');
  mount.innerHTML='<div class="sorobanFrame"><div class="rods">'+rodHTML(0,'DZIESIĄTKI')+rodHTML(1,'JEDNOŚCI')+'</div></div>';
}
function rodHTML(i,label){
  const d=digits[i],isTens=i===0;
  const heaven=d>=5;
  const lowers=d%5;
  let html='<div class="rod" data-rod="'+i+'"><div class="rodLine"></div>';
  const skyDisabled=isTens?' disabled':'';
  html+='<button class="bead sky'+skyDisabled+'" style="top:'+(heaven?65:20)+'px" '+(isTens?'disabled':'')+' onclick="toggleHeaven('+i+')" aria-label="Koralik pięć"></button>';
  for(let k=0;k<4;k++){
    const disabled=isTens&&k>0;
    const active=k<lowers;
    const top=active?(132+k*44):(174+k*44);
    html+='<button class="bead'+(disabled?' disabled':'')+'" style="top:'+top+'px" '+(disabled?'disabled':'')+' onclick="tapLower('+i+','+k+')" aria-label="Dolny koralik"></button>';
  }
  html+='<div class="rodLabel">'+label+'</div></div>';
  return html;
}
function toggleHeaven(i){
  if(task.locked||i===0)return;
  const low=digits[i]%5;
  digits[i]=(digits[i]>=5?0:5)+low;
  if(value()>10)digits[i]=low;
  renderSoroban();
}
function tapLower(i,k){
  if(task.locked)return;
  if(i===0){
    digits[0]=digits[0]===1?0:1;
    if(value()>10)digits[1]=0;
    renderSoroban();return;
  }
  const top=digits[1]>=5?5:0;
  const low=digits[1]%5;
  let newLow=(k<low)?k:k+1;
  digits[1]=top+newLow;
  if(value()>10){digits=[1,0]}
  renderSoroban();
}

function showHelp(){
  let text='';
  if(mode==='number')text='Dotknij koralików, które mają dojść do środkowej belki. Górny koralik w jedności ma wartość pięć, a każdy dolny jeden.';
  if(mode==='add')text='Nie licz na palcach. Popatrz na układ, posłuchaj ile trzeba dodać i przesuń koraliki. Jeśli dojdziesz do dziesięciu, zostaje jedna dziesiątka i zero jedności.';
  if(mode==='sub')text='Zacznij od liczby już ustawionej. Cofaj koraliki od środkowej belki. Gdy schodzisz z dziesięciu, wróć do jedności.';
  document.getElementById('tipText').textContent=text;
  speak(text,true);
}
function celebrate(n){
  const chars=['⭐','✨','🌟'];
  for(let i=0;i<n;i++){
    const e=document.createElement('span');e.className='spark';e.textContent=chars[rand(0,chars.length-1)];
    e.style.left=rand(15,85)+'vw';e.style.top=rand(35,65)+'vh';e.style.setProperty('--x',rand(-100,100)+'px');e.style.setProperty('--y',rand(-150,80)+'px');
    document.body.appendChild(e);setTimeout(()=>e.remove(),850);
  }
}

function openSettings(){renderStats();loadVoices();document.getElementById('voiceToggle').checked=state.voice!==false;document.getElementById('settingsSheet').classList.add('show')}
function closeSettings(){document.getElementById('settingsSheet').classList.remove('show')}
function sheetBackdrop(e){if(e.target.id==='settingsSheet')closeSettings()}
function saveVoiceSetting(){state.voice=document.getElementById('voiceToggle').checked;save();if(state.voice)testVoice()}
function resetProgress(){if(confirm('Wyzerować postępy Marysi?')){state.stars=0;state.correct=0;state.total=0;save();closeSettings()}}
function voiceScore(v){
  let n=(v.name||'').toLowerCase(),l=(v.lang||'').toLowerCase(),s=0;
  if(l==='pl-pl')s+=100;else if(l.startsWith('pl'))s+=80;
  if(/natural|neural/.test(n))s+=70;if(/google/.test(n))s+=45;if(/microsoft/.test(n))s+=30;if(v.default)s+=5;return s
}
function loadVoices(){
  if(!('speechSynthesis'in window))return;
  availableVoices=speechSynthesis.getVoices()||[];
  const pl=availableVoices.filter(v=>(v.lang||'').toLowerCase().startsWith('pl')).sort((a,b)=>voiceScore(b)-voiceScore(a));
  activeVoice=(state.voiceName&&availableVoices.find(v=>v.name===state.voiceName))||pl[0]||null;
  const sel=document.getElementById('voiceSelect');if(!sel)return;
  sel.innerHTML='<option value="">Automatycznie — najlepszy polski</option>'+pl.map(v=>'<option value="'+escapeHtml(v.name)+'">'+escapeHtml(v.name)+'</option>').join('');
  sel.value=pl.some(v=>v.name===state.voiceName)?state.voiceName:'';
}
function escapeHtml(x){return String(x).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function selectVoice(name){state.voiceName=name||'';activeVoice=(name&&availableVoices.find(v=>v.name===name))||null;save();loadVoices();testVoice()}
function speak(text,force=false){
  if((!state.voice&&!force)||!('speechSynthesis'in window))return;
  try{
    if(!availableVoices.length)loadVoices();
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    const v=(state.voiceName&&availableVoices.find(x=>x.name===state.voiceName))||activeVoice;
    if(v){u.voice=v;u.lang=v.lang||'pl-PL'}else u.lang='pl-PL';
    u.rate=.86;u.pitch=1.02;u.volume=1;speechSynthesis.speak(u);
  }catch(e){}
}
function testVoice(){speak('Cześć Marysiu. Posłuchaj polecenia i przesuń koraliki na sorobanie.',true)}

if('speechSynthesis'in window){
  loadVoices();speechSynthesis.onvoiceschanged=loadVoices;setTimeout(loadVoices,300);setTimeout(loadVoices,1200);
}
renderStats();renderDots();newTask();
