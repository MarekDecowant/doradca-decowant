
const LESSONS=[
{id:1,emoji:'🔢',title:'Liczby na sorobanie',desc:'Ustawiaj 0–9 i poznaj wartość koralików.',type:'show',need:0},
{id:2,emoji:'🖐️',title:'Przyjaciele 5',desc:'1+4, 2+3 — pary, które razem dają 5.',type:'comp5',need:8},
{id:3,emoji:'⭐',title:'Przyjaciele 10',desc:'1+9, 2+8, 3+7… klucz do szybkiego liczenia.',type:'comp10',need:18},
{id:4,emoji:'➕',title:'Proste dodawanie',desc:'Dodawanie bez przekraczania 10.',type:'add',need:30},
{id:5,emoji:'➖',title:'Proste odejmowanie',desc:'Odejmowanie i cofanie koralików.',type:'sub',need:45},
{id:6,emoji:'🌉',title:'Przejście przez 10',desc:'Np. 8+7 jako +10−3.',type:'bridge',need:62},
{id:7,emoji:'👀',title:'Zobacz i zapamiętaj',desc:'Soroban znika — odtwórz liczbę z pamięci.',type:'flash',need:80},
{id:8,emoji:'🧠',title:'Soroban w głowie',desc:'Łańcuchy + i − bez widocznych koralików.',type:'mental',need:100},
{id:9,emoji:'✖️',title:'Mnożenie',desc:'Powtarzane grupy i tabliczka mnożenia.',type:'mul',need:135},
{id:10,emoji:'➗',title:'Dzielenie',desc:'Równe grupy i odwrotność mnożenia.',type:'div',need:170}
];
const CURRIC=[
['1. Fundament','Liczby 0–9, wartości koralików, jedności/dziesiątki/setki.'],
['2. Przyjaciele 5','Dopełnienia: 1↔4 i 2↔3.'],
['3. Przyjaciele 10','Dopełnienia: 1↔9, 2↔8, 3↔7, 4↔6, 5↔5.'],
['4. Dodawanie i odejmowanie','Najpierw łatwe ruchy, później zamiany przez 5 i 10.'],
['5. Wizualizacja','Krótki obraz sorobanu → ukrycie → odpowiedź z pamięci.'],
['6. Mentalne łańcuchy','Kilka działań po kolei na wyobrażonym sorobanie.'],
['7. Mnożenie i dzielenie','Dopiero po opanowaniu +/−; jako kolejny etap.']
];
let state=JSON.parse(localStorage.getItem('marysiaMath')||'null')||{stars:0,correct:0,total:0,today:0,lastDay:'',days:{},voice:true,voiceName:''};
if(typeof state.voice==='undefined')state.voice=true;
if(typeof state.voiceName==='undefined')state.voiceName='';
let session={lesson:null,index:0,total:5,answer:null,hint:'',checked:false,mode:'choice'};
let freeValue=0,freeDigits=[0,0,0];
function dayKey(d=new Date()){return d.toISOString().slice(0,10)}
function ensureDay(){let k=dayKey();if(state.lastDay!==k){state.today=0;state.lastDay=k}save()}
function save(){localStorage.setItem('marysiaMath',JSON.stringify(state));renderHeader()}
function saveSettings(){state.voice=document.getElementById('voiceToggle').checked;save();if(state.voice)testVoice()}
function renderHeader(){ensureDayLite();document.getElementById('starPill').textContent='⭐ '+state.stars;let p=Math.min(100,state.today*10);document.getElementById('dayProgress').style.width=p+'%';document.getElementById('dayText').textContent=`${state.today} z 10 zadań na dziś`;document.getElementById('levelText').textContent='Poziom '+currentLevel()}
function ensureDayLite(){let k=dayKey();if(state.lastDay!==k){state.today=0;state.lastDay=k;localStorage.setItem('marysiaMath',JSON.stringify(state))}}
function currentLevel(){let i=LESSONS.filter(x=>state.correct>=x.need).length;return Math.max(1,i)}
function renderLessons(){let g=document.getElementById('lessonGrid');g.innerHTML='';LESSONS.forEach(l=>{let locked=state.correct<l.need,b=document.createElement('button');b.className='lesson'+(locked?' locked':'');b.innerHTML=`<div class="emoji">${l.emoji}</div><b>${l.title}</b><small>${l.desc}</small><div class="stars">${locked?'🔒 od '+l.need+' poprawnych':'★ dostępne'}</div>`;b.onclick=()=>locked?lessonInfo(l):startLesson(l);g.appendChild(b)})}
function lessonInfo(l){openModal(l.title,`<p>Ten etap odblokuje się po <b>${l.need} poprawnych odpowiedziach</b>. Marysia ma teraz ${state.correct}.</p><p>Nie przyspieszamy na siłę — następny poziom pojawi się automatycznie.</p>`)}
function go(id,btn){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));let target=btn||document.querySelector(`.nav button[data-go="${id}"]`);if(target)target.classList.add('active');if(id==='parent')renderParent();if(id==='learn')renderFree()}
function startRecommended(btn){let available=LESSONS.filter(x=>state.correct>=x.need),lesson=available[available.length-1]||LESSONS[0];startLesson(lesson);if(btn){document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));btn.classList.add('active')}}
function startLesson(l){session={lesson:l,index:0,total:5,answer:null,hint:'',checked:false,mode:'choice'};go('training');document.getElementById('trainingTitle').textContent=l.emoji+' '+l.title;document.getElementById('trainingSub').textContent='5 krótkich zadań • bez presji czasu';nextTask(true)}
function nextTask(first=false){if(!first){session.index++;if(session.index>=session.total){finishSession();return}}session.checked=false;document.getElementById('feedback').textContent='';document.getElementById('feedback').className='feedback';document.getElementById('nextBtn').style.display='none';document.getElementById('sessionCounter').textContent=`Zadanie ${session.index+1} z ${session.total}`;generateTask(session.lesson.type)}
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function shuffle(a){return a.sort(()=>Math.random()-.5)}
function generateTask(type){let p='',hint='',ans=0,area='',label='Zadanie';session.mode='choice';
if(type==='show'){ans=rand(0,9);p=`Ustaw na sorobanie liczbę ${ans}`;hint='Górny koralik = 5. Każdy dolny = 1.';area=`<div id="taskSoroban"></div><button class="primary" style="width:100%;margin-top:10px" onclick="checkSoroban(${ans})">Sprawdź</button>`;session.mode='soroban'}
if(type==='comp5'){let a=rand(1,4);ans=5-a;p=`${a} + ? = 5`;hint=`Para do ${a}, która razem daje 5.`;area=choices(ans,0,5)}
if(type==='comp10'){let a=rand(1,9);ans=10-a;p=`${a} + ? = 10`;hint=`Wyobraź sobie, ile brakuje od ${a} do 10.`;area=choices(ans,0,10)}
if(type==='add'){let a=rand(1,7),b=rand(1,9-a);ans=a+b;p=`${a} + ${b} = ?`;hint='Możesz najpierw zobaczyć wynik na sorobanie.';area=choices(ans,0,10)}
if(type==='sub'){let a=rand(3,10),b=rand(1,a);ans=a-b;p=`${a} − ${b} = ?`;hint=`Zacznij od ${a} i cofnij ${b}.`;area=choices(ans,0,10)}
if(type==='bridge'){let a=rand(6,9),b=rand(2,9);if(a+b<=10)b=11-a;ans=a+b;p=`${a} + ${b} = ?`;let c=10-a;hint=`Najpierw dopełnij ${a} do 10: zabierz z ${b} liczbę ${c}.`;area=numberAnswer()}
if(type==='flash'){ans=rand(1,39);p='Zapamiętaj liczbę na sorobanie';hint='Popatrz na układ koralików, nie nazywaj ich po kolei.';area=`<div id="flashSoroban"></div><div id="flashAnswer" style="display:none">${numberAnswer()}</div>`;session.mode='flash';setTimeout(()=>{let s=document.getElementById('flashSoroban');if(s){s.classList.add('hiddenSoro');document.getElementById('flashAnswer').style.display='block';document.getElementById('prompt').textContent='Jaka to była liczba?'}},2200)}
if(type==='mental'){let start=rand(2,8),ops=[],v=start;for(let i=0;i<3;i++){let add=Math.random()>.45;if(add){let n=rand(1,5);ops.push('+'+n);v+=n}else{let n=rand(1,Math.min(4,v));ops.push('−'+n);v-=n}}ans=v;p=`Start ${start}  →  ${ops.join('  →  ')}`;hint='Wyobraź sobie koraliki i wykonuj po jednym ruchu.';area=numberAnswer()}
if(type==='mul'){let a=rand(2,5),b=rand(2,5);ans=a*b;p=`${a} × ${b} = ?`;hint=`Pomyśl: ${a} grup po ${b}.`;area=choices(ans,0,25)}
if(type==='div'){let b=rand(2,5),ans2=rand(2,5),a=b*ans2;ans=ans2;p=`${a} ÷ ${b} = ?`;hint=`Ile grup po ${b} mieści się w ${a}?`;area=choices(ans,0,12)}
session.answer=ans;session.hint=hint;document.getElementById('taskLabel').textContent=label;document.getElementById('prompt').textContent=p;document.getElementById('taskArea').innerHTML=area;if(type==='show')renderSoroban('taskSoroban',[0,0,0],true);if(type==='flash')renderNumberSoroban('flashSoroban',ans);speak(p.replace('?',''))}
function choices(ans,min,max){let vals=new Set([ans]);while(vals.size<3){let d=rand(Math.max(min,ans-3),Math.min(max,ans+3));vals.add(d)}return `<div class="answerGrid">${shuffle([...vals]).map(v=>`<button class="answerBtn" onclick="checkAnswer(${v})">${v}</button>`).join('')}</div>`}
function numberAnswer(){session.mode='input';return `<input class="numberInput" id="numAnswer" inputmode="numeric" pattern="[0-9]*" placeholder="?" aria-label="Odpowiedź"><button class="primary" style="width:100%;margin-top:10px" onclick="checkInput()">Sprawdź</button>`}
function checkInput(){let el=document.getElementById('numAnswer');if(!el)return;checkAnswer(Number(el.value))}
function checkAnswer(v){if(session.checked)return;session.checked=true;let ok=v===session.answer;record(ok);showFeedback(ok)}
let taskDigits=[0,0,0];
function checkSoroban(ans){if(session.checked)return;let v=taskDigits[0]*100+taskDigits[1]*10+taskDigits[2];session.checked=true;let ok=v===ans;record(ok);showFeedback(ok)}
function record(ok){state.total++;state.today++;state.days[dayKey()]=(state.days[dayKey()]||0)+1;if(ok){state.correct++;state.stars+=2}save();renderLessons()}
function showFeedback(ok){let f=document.getElementById('feedback');f.className='feedback '+(ok?'good':'bad');f.textContent=ok?'✨ Świetnie! Dokładnie tak.':`Jeszcze raz spokojnie. Poprawna odpowiedź: ${session.answer}.`;document.getElementById('taskCard').classList.remove('celebrate');if(ok){void document.getElementById('taskCard').offsetWidth;document.getElementById('taskCard').classList.add('celebrate');speak('Brawo Marysiu!')}else speak('Spróbujemy jeszcze podobne zadanie.');document.getElementById('nextBtn').style.display='block'}
function showHint(){openModal('💡 Podpowiedź',`<p>${session.hint||'Zrób jeden krok naraz.'}</p>`)}
function finishSession(){state.stars+=3;save();openModal('Misja ukończona! 🌟',`<p>Marysia skończyła 5 zadań. Dostaje <b>3 gwiazdki bonusu</b>.</p><p>Na dziś wystarczy krótka seria albo można zrobić jeszcze jedną, jeśli ma ochotę.</p><button class="primary" style="width:100%" onclick="closeModal();go('home')">Wróć do mapy</button>`);renderLessons()}
function openModal(t,b){document.getElementById('modalTitle').innerHTML=t;document.getElementById('modalBody').innerHTML=b;document.getElementById('infoModal').classList.add('show')}
function closeModal(){document.getElementById('infoModal').classList.remove('show')}
let availableVoices=[],activeVoice=null;
function voiceScore(v){let n=(v.name||'').toLowerCase(),l=(v.lang||'').toLowerCase(),score=0;if(l==='pl-pl')score+=100;else if(l.startsWith('pl'))score+=80;if(/natural|neural/.test(n))score+=70;if(/google/.test(n))score+=45;if(/microsoft/.test(n))score+=30;if(/zofia|zosia|ewa|agnieszka|paulina|maja|marek|krzysztof/.test(n))score+=24;if(v.default)score+=4;return score}
function loadVoices(){if(!('speechSynthesis'in window))return;availableVoices=speechSynthesis.getVoices()||[];let polish=availableVoices.filter(v=>(v.lang||'').toLowerCase().startsWith('pl')).sort((a,b)=>voiceScore(b)-voiceScore(a));activeVoice=(state.voiceName&&availableVoices.find(v=>v.name===state.voiceName))||polish[0]||null;let sel=document.getElementById('voiceSelect');if(sel){let current=state.voiceName||'';sel.innerHTML='<option value="">Automatycznie — najlepszy polski</option>'+polish.map(v=>`<option value="${escapeHtml(v.name)}">${escapeHtml(v.name)}${v.localService?' • telefon':''}</option>`).join('');sel.value=polish.some(v=>v.name===current)?current:''}updateVoiceStatus(polish)}
function escapeHtml(x){return String(x).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function updateVoiceStatus(polish){let el=document.getElementById('voiceStatus');if(!el)return;if(!('speechSynthesis'in window)){el.textContent='Ta przeglądarka nie udostępnia lektora.';return}let chosen=(state.voiceName&&availableVoices.find(v=>v.name===state.voiceName))||activeVoice;if(chosen)el.textContent=`Używany głos: ${chosen.name}. Tempo dopasowane do dziecka.`;else if(polish&&polish.length===0)el.textContent='Brak polskiego głosu w przeglądarce. Telefon może użyć głosu domyślnego.';else el.textContent='Głos zostanie wybrany automatycznie.'}
function selectVoice(name){state.voiceName=name||'';activeVoice=(name&&availableVoices.find(v=>v.name===name))||null;save();loadVoices();testVoice()}
function speechText(text){return String(text).replace(/(\d+)\s*\+\s*\?\s*=\s*(\d+)/g,'Do $1 dodaj taką liczbę, żeby otrzymać $2.').replace(/Start\s+(\d+)/gi,'Zaczynamy od $1').replace(/→/g,'. Następnie ').replace(/×/g,' razy ').replace(/÷/g,' podzielone przez ').replace(/−/g,' minus ').replace(/\+/g,' plus ').replace(/=\s*\?/g,'. Ile to jest?').replace(/=/g,' równa się ').replace(/\?/g,'').replace(/\s+/g,' ').trim()}
function speak(text,force=false){if((!state.voice&&!force)||!('speechSynthesis'in window))return;try{if(!availableVoices.length)loadVoices();speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(speechText(text));let v=(state.voiceName&&availableVoices.find(x=>x.name===state.voiceName))||activeVoice;if(v){u.voice=v;u.lang=v.lang||'pl-PL'}else u.lang='pl-PL';u.rate=.88;u.pitch=1.03;u.volume=1;speechSynthesis.speak(u)}catch(e){}}
function testVoice(){speak('Cześć Marysiu! Jestem twoim lektorem. Zrobimy dziś kilka krótkich zadań z matematyki.',true)}
if('speechSynthesis'in window){loadVoices();speechSynthesis.onvoiceschanged=loadVoices;setTimeout(loadVoices,250);setTimeout(loadVoices,1200)}
function soroHTML(id,digits,interactive){let places=['setki','dziesiątki','jedności'];return `<div class="sorobanWrap"><div class="soroban">${digits.map((d,i)=>rodHTML(id,i,d,places[i],interactive)).join('')}</div><div class="soroValue" id="${id}-value">${digits[0]*100+digits[1]*10+digits[2]}</div></div>`}
function rodHTML(id,i,d,place,interactive){let top=d>=5,low=d%5,attrs=interactive?`onclick="toggleTop('${id}',${i})"`:'';let earth=[0,1,2,3].map(k=>`<button class="bead ${k<low?'active':''}" ${interactive?`onclick="setEarth('${id}',${i},${k})"`:'disabled'} aria-label="koralik"></button>`).join('');return `<div class="rod"><div class="heaven heavenSlot"><button class="bead ${top?'active':''}" ${attrs} ${interactive?'':'disabled'} aria-label="koralik pięć"></button></div><div class="earth earthSlot">${earth}</div><div class="place">${place}</div></div>`}
function renderSoroban(id,digits,interactive){document.getElementById(id).innerHTML=soroHTML(id,digits,interactive);if(id==='taskSoroban')taskDigits=[...digits];if(id==='freeSoroban'){freeDigits=[...digits];freeValue=digits[0]*100+digits[1]*10+digits[2]}}
function renderNumberSoroban(id,num){let d=[Math.floor(num/100)%10,Math.floor(num/10)%10,num%10];document.getElementById(id).innerHTML=soroHTML(id,d,false)}
function getDigits(id){return id==='taskSoroban'?taskDigits:freeDigits}
function toggleTop(id,i){let d=getDigits(id),low=d[i]%5,top=d[i]>=5;d[i]=(top?0:5)+low;rerender(id,d)}
function setEarth(id,i,k){let d=getDigits(id),top=d[i]>=5?5:0,low=d[i]%5,newLow=k<low?k:k+1;d[i]=top+newLow;rerender(id,d)}
function rerender(id,d){renderSoroban(id,[...d],true)}
function renderFree(){renderSoroban('freeSoroban',freeDigits,true)}
function resetFreeSoroban(){freeDigits=[0,0,0];renderFree()}
function renderParent(){document.getElementById('statCorrect').textContent=state.correct;document.getElementById('statAccuracy').textContent=(state.total?Math.round(state.correct/state.total*100):0)+'%';document.getElementById('statStars').textContent=state.stars;document.getElementById('voiceToggle').checked=state.voice!==false;loadVoices();let w=document.getElementById('week');w.innerHTML='';for(let i=6;i>=0;i--){let d=new Date();d.setDate(d.getDate()-i);let k=dayKey(d),n=state.days[k]||0,el=document.createElement('div');el.className='day'+(n>=10?' done':'');el.innerHTML=`${['nd','pn','wt','śr','cz','pt','sb'][d.getDay()]}<b>${n>=10?'★':n}</b>`;w.appendChild(el)}document.getElementById('curriculum').innerHTML=CURRIC.map((c,i)=>`<div class="curr"><b>${c[0]} ${state.correct>=LESSONS[Math.min(i,LESSONS.length-1)].need?'<span class="badge">aktywne</span>':''}</b><small>${c[1]}</small></div>`).join('')}
function resetProgress(){if(confirm('Na pewno wyzerować wszystkie postępy Marysi?')){state={stars:0,correct:0,total:0,today:0,lastDay:dayKey(),days:{},voice:true,voiceName:''};save();renderLessons();renderParent()}}
if('serviceWorker'in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}))}
ensureDay();renderLessons();renderHeader();renderFree();
