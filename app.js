const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const complexity = {
  bubble: ['O(n²)', 'O(n²)', 'O(n²)', 'يقارن العناصر على تمريرات متتالية.'],
  selection: ['O(n²)', 'O(n²)', 'O(n²)', 'يبحث عن أصغر عنصر في الجزء غير المرتب.'],
  insertion: ['O(n)', 'O(n²)', 'O(n²)', 'سريع مع البيانات الصغيرة أو شبه المرتبة.'],
  merge: ['O(n log n)', 'O(n log n)', 'O(n log n)', 'يقسم المصفوفة ثم يدمج أجزاءها المرتبة.'],
  quick: ['O(n log n)', 'O(n log n)', 'O(n²)', 'يتأثر الأداء باختيار Pivot وتقسيم المصفوفة.']
};
const names = {bubble:'Bubble Sort',selection:'Selection Sort',insertion:'Insertion Sort',merge:'Merge Sort',quick:'QuickSort · Partition'};
const levels = [
  {name:'الفقاعات الأولى',algo:'bubble',arr:[4,2,3],order:'asc',goal:'اكتشف كيف تصعد القيم الصغيرة إلى مكانها.'},
  {name:'اختيار الأصغر',algo:'selection',arr:[5,1,4,2],order:'asc',goal:'اعثر على الأصغر في كل جزء غير مرتب.'},
  {name:'إدراج ذكي',algo:'insertion',arr:[3,1,4,2],order:'asc',goal:'أدرج كل قيمة في موضعها ضمن الجزء المرتب.'},
  {name:'قسّم ثم ادمج',algo:'merge',arr:[6,2,5,1],order:'asc',goal:'تابع التقسيم ثم اختر العنصر التالي أثناء الدمج.'},
  {name:'اختبار الـ Pivot',algo:'quick',arr:[7,3,5,2,6],order:'asc',goal:'قارن القيم بالـ Pivot ثم ثبّت مكانه.'}
];
let mode='sandbox', order='asc', view='bars', array=[8,3,6,1,5], events=[], eventIndex=0, running=false, timer=null;
let comparisons=0, operations=0, points=0, totalPoints=0, attempts=0, streak=0, hintUsed=false, locked=false, levelIndex=0, completedLevels=new Set();
const before=(a,b)=>order==='asc'?a<b:a>b;
const equalOrder=(a,b)=>a===b;
function makeEvent(meta, mutate=()=>{}) {
  const item={array:array.slice(),active:meta.active||[],pivot:meta.pivot??null,sorted:meta.sorted||[],type:meta.type||'compare',question:meta.question||'ما الخطوة التالية؟',options:meta.options||[],correct:meta.correct,explanation:meta.explanation||'',title:meta.title||'خطوة جديدة',comp:meta.comp||0,ops:meta.ops||0,tag:meta.tag||'تتبّع الخوارزمية',hint:meta.hint||''};
  mutate(); item.result=array.slice(); item.sortedResult=meta.sortedResult||item.sorted;
  events.push(item);
}
function choice(label,correct){return {label,correct};}
function optionList(labels,correctLabel){const unique=[...new Set(labels)]; return unique.map(x=>choice(x,x===correctLabel));}
function indexLabel(i,a=array){return `فهرس ${i} · القيمة ${a[i]}`;}
function createEvents(algo) {
  events=[]; array=readArray(); const n=array.length; let sorted=[];
  if(algo==='bubble'){
    for(let end=n-1;end>0;end--){
      for(let j=0;j<end;j++){
        const a=array[j],b=array[j+1],swap=before(b,a), opts=['بدّل العنصرين','أبقِهما كما هما'];
        makeEvent({active:[j,j+1],sorted:sorted.slice(),type:'compare',question:`${a} و ${b}: هل نبدّلهما؟`,options:opts.map(x=>choice(x,x===(swap?opts[0]:opts[1]))),correct:swap?opts[0]:opts[1],explanation:swap?`نعم. في الترتيب ${order==='asc'?'التصاعدي':'التنازلي'} يجب أن يسبق ${b} القيمة ${a}، لذا نبدّلهما.`:`لا. ${a} و${b} مرتبان بهذا الاتجاه، لذلك نتركهما كما هما.`,title:`مقارنة الفهرسين ${j} و${j+1}`,comp:1,ops:swap?1:0,tag:'مقارنة متجاورتين',hint:swap?'تحقق هل القيمة اليمنى يجب أن تسبق اليسرى.':'اسأل نفسك هل الزوج مرتب بالاتجاه المطلوب.'},()=>{if(swap)[array[j],array[j+1]]=[array[j+1],array[j]];});
      }
      sorted.push(end);
    }
    if(n)sorted.push(0);
  } else if(algo==='selection'){
    for(let i=0;i<n-1;i++){
      let min=i;
      for(let j=i+1;j<n;j++){
        const current=array[j],known=array[min],newMin=before(current,known);
        const opts=optionList([indexLabel(min),indexLabel(j)],indexLabel(newMin?j:min));
        makeEvent({active:[min,j],sorted:sorted.slice(),question:'أيّهما الأصغر في الجزء الجاري؟',options:opts,correct:indexLabel(newMin?j:min),explanation:newMin?`${current} يسبق ${known} في الترتيب ${order==='asc'?'التصاعدي':'التنازلي'}، لذا يصبح أصغر عنصر معروف.`:`${known} ما زال يسبق ${current}، لذلك نحتفظ به كأفضل اختيار حتى الآن.`,title:`البحث عن العنصر المختار · ${j-i} / ${n-i-1}`,comp:1,tag:'بحث عن الأصغر',hint:`قارن ${current} مع أفضل قيمة وجدناها (${known}).`},()=>{if(newMin)min=j;});
      }
      const target=min,to=array[target];
      if(target!==i) makeEvent({active:[i,target],sorted:sorted.slice(),type:'move',question:`وجدنا ${to}. ما الإجراء الآن؟`,options:['بدّل المختار مع أول غير مرتب','اترك المصفوفة كما هي'].map(x=>choice(x,x==='بدّل المختار مع أول غير مرتب')),correct:'بدّل المختار مع أول غير مرتب',explanation:`نضع العنصر المختار في بداية الجزء غير المرتب، عند الفهرس ${i}.`,title:`تثبيت العنصر ${to}`,ops:1,tag:'تبديل وتثبيت',hint:'كل دورة تضع عنصراً واحداً في موضعه النهائي.'},()=>{[array[i],array[target]]=[array[target],array[i]];});
      sorted.push(i);
    }
    if(n)sorted.push(n-1);
  } else if(algo==='insertion'){
    sorted=n?[0]:[];
    for(let i=1;i<n;i++){
      const key=array[i];let j=i-1;
      while(j>=0){
        const current=array[j],shift=before(key,current),opts=['نعم، انقل العنصر إلى اليمين','لا، توقف عن الإزاحة'];
        makeEvent({active:[j,j+1],sorted:sorted.slice(),question:`هل ${current} يجب أن ينتقل إلى اليمين لإدراج ${key}؟`,options:opts.map(x=>choice(x,x===(shift?opts[0]:opts[1]))),correct:shift?opts[0]:opts[1],explanation:shift?`${key} يجب أن يأتي قبل ${current}، فنزيح ${current} خانة إلى اليمين لفتح مكان.`:`${current} يسبق ${key} بالفعل؛ توقف هنا فالمكان الصحيح للمفتاح هو بعده.`,title:`إدراج المفتاح ${key}`,comp:1,ops:shift?1:0,tag:'مقارنة المفتاح',hint:`قارن المفتاح ${key} مع العنصر ${current} من الجزء المرتب.`},()=>{if(shift){array[j+1]=array[j];j--;}});
        if(!shift)break;
      }
      const dest=j+1;
      makeEvent({active:[dest],sorted:sorted.slice(),type:'move',question:`أين نضع المفتاح ${key}؟`,options:optionList([dest,Math.max(0,dest-1),Math.min(n-1,dest+1)].map(k=>`الفهرس ${k}`),`الفهرس ${dest}`),correct:`الفهرس ${dest}`,explanation:`الموضع ${dest} هو الفجوة التي تركتها الإزاحات؛ نضع المفتاح فيها لإكمال الجزء المرتب.`,title:`وضع ${key} في موضعه`,ops:1,tag:'إدراج المفتاح',hint:'توقف عند أول عنصر لا ينبغي أن يتحرك إلى اليمين.'},()=>{array[dest]=key;sorted=Array.from({length:i+1},(_,k)=>k);});
    }
  } else if(algo==='merge'){
    const merge=(lo,mid,hi)=>{
      let left=array.slice(lo,mid),right=array.slice(mid,hi),i=0,j=0,k=lo;
      while(i<left.length&&j<right.length){
        const takeLeft=before(left[i],right[j]),a=left[i],b=right[j],labels=optionList([`اليسار: ${a}`,`اليمين: ${b}`],takeLeft?`اليسار: ${a}`:`اليمين: ${b}`);
        makeEvent({active:[lo+i,mid+j],type:'merge',question:`أيهما نضع أولاً في الموضع ${k}؟`,options:labels,correct:takeLeft?`اليسار: ${a}`:`اليمين: ${b}`,explanation:'نختار الأصغر (أو الأكبر في الترتيب التنازلي) من مقدمة النصفين المرتبين؛ هكذا يبقى الدمج مرتباً.',title:`دمج النطاقين عند الفهرس ${k}`,comp:1,ops:1,tag:'اختيار أثناء الدمج',hint:`قارن مقدمة اليسار ${a} بمقدمة اليمين ${b}.`},()=>{array[k++]=takeLeft?left[i++]:right[j++];});
      }
      while(i<left.length||j<right.length){
        const takeLeft=j>=right.length||(i<left.length&&before(left[i],right[j])),v=takeLeft?left[i]:right[j],label=`القيمة ${v}`;
        makeEvent({active:[k],type:'merge',question:`أي قيمة متبقية تُنسخ إلى الموضع ${k}؟`,options:[choice(label,true),choice('قيمة أخرى من النصف',false)],correct:label,explanation:'انتهى أحد النصفين؛ ننسخ بقية النصف الآخر بالترتيب كما هي.',title:`إكمال الدمج · ${v}`,ops:1,tag:'نسخ بقية العناصر',hint:'عندما ينفد نصف، انسخ بقية النصف الآخر دون تغيير ترتيبها.'},()=>{array[k++]=takeLeft?left[i++]:right[j++];});
      }
    };
    const split=(lo,hi)=>{
      if(hi-lo<=1)return;
      const mid=Math.floor((lo+hi)/2),labels=optionList([`الفهرس ${mid}`,`الفهرس ${Math.max(lo,mid-1)}`,`الفهرس ${Math.min(hi-1,mid+1)}`],`الفهرس ${mid}`);
      makeEvent({active:Array.from({length:hi-lo},(_,k)=>lo+k),type:'split',question:`أين نقسم النطاق [${lo}، ${hi}) إلى نصفين؟`,options:labels,correct:`الفهرس ${mid}`,explanation:`منتصف النطاق هو ${mid}. نقسم إلى [${lo}، ${mid}) و[${mid}، ${hi}) ثم نرتب كل نصف.`,title:`تقسيم النطاق ${hi-lo} عناصر`,tag:'تقسيم النطاق',hint:'منتصف النطاق يساوي الجزء الصحيح من متوسط طرفيه.'});
      split(lo,mid);split(mid,hi);merge(lo,mid,hi);
    };
    split(0,n);sorted=Array.from({length:n},(_,i)=>i);
  } else if(algo==='quick'){
    const partition=(lo,hi)=>{
      if(lo>=hi)return;
      const pivot=array[hi];let i=lo;
      for(let j=lo;j<hi;j++){
        const current=array[j],goLeft=before(current,pivot)||equalOrder(current,pivot),opts=['نعم، انقله إلى جهة Pivot','لا، اتركه في الجهة الأخرى'];
        makeEvent({active:[j,hi],pivot:hi,type:'partition',sorted:sorted.slice(),question:`${current} مقارنةً بـ Pivot (${pivot}): هل يذهب إلى الجهة اليسرى؟`,options:opts.map(x=>choice(x,x===(goLeft?opts[0]:opts[1]))),correct:goLeft?opts[0]:opts[1],explanation:goLeft?`${current} يجب أن يسبق أو يساوي Pivot في الترتيب المطلوب، فينتمي إلى الجهة اليسرى.`:`${current} يأتي بعد Pivot، فيبقى ضمن الجهة اليمنى.`,title:`تقسيم حول Pivot = ${pivot}`,comp:1,tag:'مقارنة بالـ Pivot',hint:'في التصاعدي، القيم الأصغر أو المساوية تذهب يسار الـ Pivot.'},()=>{if(goLeft){[array[i],array[j]]=[array[j],array[i]];i++;}});
      }
      const p=i;
      makeEvent({active:[p,hi],pivot:hi,type:'move',sorted:sorted.slice(),question:`أين يستقر Pivot (${pivot}) بعد التقسيم؟`,options:optionList([`الفهرس ${p}`,`الفهرس ${lo}`,`الفهرس ${hi}`],`الفهرس ${p}`),correct:`الفهرس ${p}`,explanation:`كل العناصر التي تسبق Pivot أصبحت على يساره؛ لذلك مكانه النهائي هو الفهرس ${p}.`,title:'تثبيت Pivot',ops:1,tag:'تثبيت الـ Pivot',hint:'يأتي Pivot مباشرة بعد آخر عنصر صُنّف في الجهة اليسرى.'},()=>{[array[p],array[hi]]=[array[hi],array[p]];});
      sorted.push(p);partition(lo,p-1);partition(p+1,hi);
    };
    partition(0,n-1);sorted=Array.from({length:n},(_,i)=>i);
  }
  return events;
}
function readArray() {
  const values=$('#array-input').value.trim().split(/[\s,،;]+/).filter(Boolean).map(Number);
  if(!values.length||values.length>10||values.some(v=>!Number.isInteger(v)||v< -99||v>999))throw new Error('أدخل من 1 إلى 10 أعداد صحيحة بين −99 و999.');
  return values;
}
function showError(message=''){$('#input-error').textContent=message;}
function syncSize(){try{$('#array-size').textContent=readArray().length;showError();}catch{$('#array-size').textContent='—';}}
function currentEvent(){return events[eventIndex]||null;}
function describeAlgorithm(){
  const algo=$('#algorithm').value,info=complexity[algo];
  $('#algorithm-chips').innerHTML=`<span class="algo-chip">${names[algo]}</span><span class="complexity-chip">${info[0]}</span>`;
  $('#complexity').textContent=info[0];$('#complexity-case').textContent=`أفضل ${info[1]} · أسوأ ${info[2]}`;$('#complexity-note').textContent=info[3];
}
function setRunning(value){running=value;$('#run-state').classList.toggle('running',value);$('#state-text').textContent=value?'تعمل الآن':events.length?'متوقفة مؤقتاً':'جاهز للتجربة';$('#play-button').textContent=value?'Ⅱ':'▶';}
function renderArray(values,ev=null,final=false){
  const stage=$('#array-stage');stage.classList.toggle('cards-mode',view==='cards');
  if(!values?.length){stage.innerHTML='<div class="empty-state" id="empty-state"><span class="empty-glyph">↗</span><b>المصفوفة بانتظارك</b><small>ابدأ التجربة لمشاهدة العناصر تتحرك</small></div>';return;}
  const min=Math.min(...values),max=Math.max(...values),span=Math.max(1,max-min),marked=final?values.map((_,i)=>i):(ev?.sorted||[]);
  stage.innerHTML=values.map((v,i)=>{
    const active=ev?.active?.includes(i),pivot=ev?.pivot===i,height=26+((v-min)/span)*67;
    let cls='bar-item';if(marked.includes(i))cls+=' sorted';else if(pivot)cls+=' pivot';else if(active)cls+=(ev?.type==='move'?' moving':' compare');
    return `<div class="${cls}" style="animation-delay:${i*35}ms"><div class="bar" style="height:${view==='bars'?height+'%':''}">${v}</div><span class="index">${i}</span></div>`;
  }).join('');
}
function isInteractive(){return mode==='challenge'||mode==='levels';}
function render(){
  describeAlgorithm();const ev=currentEvent(),done=events.length>0&&eventIndex>=events.length;
  if(!events.length){renderArray([],null);$('#step-title').textContent='جاهز لاكتشاف الخطوة الأولى؟';$('#step-description').textContent='اختر خوارزمية ومصفوفة، ثم ابدأ لترى كيف تفكر.';$('#step-count').textContent='—';$('#explanation').textContent='تظهر هنا تفاصيل الحركة الحالية، مع السبب وراء قرار الخوارزمية.';$('#explanation-tag').textContent='بانتظار البدء';$('#counter-value').innerHTML='0 <small>/ 0</small>';$('#comparisons').textContent='0';$('#operations').textContent='0';$('#play-button').disabled=$('#step-button').disabled=$('#restart-button').disabled=true;$('#challenge-box').classList.add('hidden');$('#finish-card').classList.add('hidden');setRunning(false);return;}
  const values=ev?ev.array:array;renderArray(values,ev,done);
  $('#play-button').disabled=done||isInteractive();$('#step-button').disabled=done||isInteractive();$('#restart-button').disabled=false;
  $('#counter-value').innerHTML=`${done?events.length:eventIndex} <small>/ ${events.length}</small>`;
  $('#comparisons').textContent=comparisons;$('#operations').textContent=operations;$('#session-score').textContent=points;$('#total-score').textContent=String(totalPoints).padStart(3,'0');$('#attempts-label').textContent=mode==='sandbox'?'استكشف دون ضغط':`${attempts} محاولة · ${streak} متتالية`;$('#streak').textContent=`+${streak}`;
  if(done){
    $('#step-title').textContent='اكتمل الترتيب بنجاح!';$('#step-description').textContent=`النتيجة النهائية: ${array.join('  ·  ')}`;$('#step-count').textContent='تم';$('#explanation').textContent='أحسنت! أصبحت العناصر مرتبة حسب الاتجاه الذي اخترته. راجع عدد المقارنات والعمليات لمعرفة كفاءة هذه الطريقة.';$('#explanation-tag').textContent='اكتملت الخوارزمية';$('#challenge-box').classList.add('hidden');setRunning(false);
    if(mode==='levels')showLevelFinish();else $('#finish-card').classList.remove('hidden');return;
  }
  $('#finish-card').classList.add('hidden');$('#step-title').textContent=ev.title;$('#step-description').textContent=ev.question;$('#step-count').textContent=`${eventIndex+1} / ${events.length}`;$('#explanation').textContent=ev.explanation||'تابع القيم النشطة لتحديد الحركة التالية.';$('#explanation-tag').textContent=ev.tag;
  const interactive=isInteractive();$('#challenge-box').classList.toggle('hidden',!interactive);
  if(interactive){$('#quiz-title').textContent=ev.question;$('#quiz-hint').textContent=hintUsed?'تم استخدام التلميح لهذه الخطوة':'اختر الإجابة الصحيحة للمتابعة';$('#feedback').textContent='';$('#answer-options').innerHTML=ev.options.map((o,i)=>`<button data-answer="${i}">${o.label}</button>`).join('');}
  setRunning(running);
}
function applyEvent(){const ev=currentEvent();if(!ev)return;comparisons+=ev.comp;operations+=ev.ops;array=ev.result.slice();eventIndex++;hintUsed=false;render();}
function nextStep(){if(locked||!currentEvent())return;applyEvent();}
function startRun(){
  stopTimer();if(mode==='levels'){const l=levels[levelIndex];$('#algorithm').value=l.algo;order=l.order;$('#array-input').value=l.arr.join(', ');$$('#order-control button').forEach(b=>b.classList.toggle('selected',b.dataset.order===order));}
  try{array=readArray();}catch(e){showError(e.message);return;}showError();createEvents($('#algorithm').value);eventIndex=0;comparisons=0;operations=0;points=0;attempts=0;streak=0;hintUsed=false;locked=false;$('#feedback').textContent='';$('#array-stage').classList.remove('finished');
  if(!events.length){renderArray(array,null,true);$('#step-title').textContent='المصفوفة مرتبة بالفعل!';$('#step-description').textContent='لا توجد خطوات مطلوبة لهذه المصفوفة.';$('#step-count').textContent='تم';$('#counter-value').innerHTML='0 <small>/ 0</small>';$('#finish-card').classList.remove('hidden');$('#play-button').disabled=$('#step-button').disabled=true;return;}
  $('#visual-title').textContent=mode==='levels'?levels[levelIndex].goal:'شاهد الخوارزمية تعمل';render();
}
function stopTimer(){if(timer){clearInterval(timer);timer=null;}setRunning(false);}
function togglePlay(){if(running){stopTimer();render();return;}if(!events.length||eventIndex>=events.length||isInteractive())return;setRunning(true);const speed=Number($('#speed').value);timer=setInterval(()=>{if(eventIndex>=events.length){stopTimer();render();return;}applyEvent();},Math.max(260,1250-speed*180));}
function resetRun(){stopTimer();events=[];eventIndex=0;comparisons=0;operations=0;points=0;attempts=0;streak=0;hintUsed=false;$('#array-stage').classList.remove('finished');render();}
function answerQuestion(index){if(locked)return;const ev=currentEvent(),selected=ev?.options[index];if(!selected)return;attempts++;
  if(selected.correct){locked=true;points+=hintUsed?5:10;totalPoints+=hintUsed?5:10;streak++;$('#feedback').textContent=hintUsed?'صحيح! +5 نقاط — استخدمت التلميح.':'إجابة صحيحة! +10 نقاط';$('#feedback').style.color='var(--mint)';$$('#answer-options button').forEach(b=>b.disabled=true);$('#session-score').textContent=points;$('#total-score').textContent=String(totalPoints).padStart(3,'0');$('#attempts-label').textContent=`${attempts} محاولة · ${streak} متتالية`;setTimeout(()=>{locked=false;applyEvent();},550);
  }else{streak=0;$('#feedback').textContent=`ليس تماماً. ${ev.explanation}`;$('#feedback').style.color='var(--pink)';$('#attempts-label').textContent=`${attempts} محاولة · حاول مجدداً`;$('#streak').textContent='+0';}
}

function showHint(){
  const ev=currentEvent();
  if(!ev||locked)return;
  hintUsed=true;
  $('#quiz-hint').textContent=`تلميح: ${ev.hint||ev.explanation}`;
}

function showLevelFinish(){
  completedLevels.add(levelIndex);
  $('#finish-card').classList.remove('hidden');
  $('#finish-title').textContent='أكملت المرحلة!';
  $('#finish-copy').textContent=levels[levelIndex].name;
  const last=levelIndex>=levels.length-1;
  $('#next-level').textContent=last?'ابدأ من المرحلة الأولى ↺':'المرحلة التالية ←';
  $('#next-level').disabled=false;
  $('#level-progress').classList.remove('hidden');
  updateLevelProgress();
}

function updateLevelProgress(){
  $('#level-count').textContent=`${levelIndex+1} / ${levels.length}`;
  $('#level-bar').style.width=`${((levelIndex+1)/levels.length)*100}%`;
}

function switchMode(nextMode){
  stopTimer();
  mode=nextMode;
  $$('.mode-tab').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
  $('#level-progress').classList.toggle('hidden',mode!== 'levels');
  if(mode==='levels'){
    const l=levels[levelIndex];
    $('#algorithm').value=l.algo;
    order=l.order;
    $('#array-input').value=l.arr.join(', ');
    $$('#order-control button').forEach(b=>b.classList.toggle('selected',b.dataset.order===order));
    updateLevelProgress();
  }
  resetRun();
}

function randomizeArray(){
  const count=$('#array-size').textContent==='—'?5:Number($('#array-size').textContent);
  const safeCount=Math.max(1,Math.min(10,count));
  const values=Array.from({length:safeCount},()=>Math.floor(Math.random()*20)-9);
  $('#array-input').value=values.join(', ');
  syncSize();
}

function init(){
  syncSize();
  describeAlgorithm();

  $$('.mode-tab').forEach(b=>b.addEventListener('click',()=>switchMode(b.dataset.mode)));
  $$('#order-control button').forEach(b=>b.addEventListener('click',()=>{
    order=b.dataset.order;
    $$('#order-control button').forEach(x=>x.classList.toggle('selected',x===b));
  }));
  $$('.view-switch button').forEach(b=>b.addEventListener('click',()=>{
    view=b.dataset.view;
    $$('.view-switch button').forEach(x=>x.classList.toggle('selected',x===b));
    render();
  }));

  $('#algorithm').addEventListener('change',()=>{describeAlgorithm();resetRun();});
  $('#array-input').addEventListener('input',syncSize);
  $('#start-button').addEventListener('click',startRun);
  $('#reset-button').addEventListener('click',resetRun);
  $('#restart-button').addEventListener('click',()=>{
    if(events.length){stopTimer();eventIndex=0;comparisons=0;operations=0;render();}
  });
  $('#play-button').addEventListener('click',togglePlay);
  $('#step-button').addEventListener('click',()=>{if(!isInteractive())nextStep();});
  $('#hint-button').addEventListener('click',showHint);
  $('#randomize').addEventListener('click',randomizeArray);

  $('#size-minus').addEventListener('click',()=>{
    let values=[];
    try{values=readArray();}catch{values=[...array];}
    if(values.length>1){values.pop();$('#array-input').value=values.join(', ');syncSize();}
  });
  $('#size-plus').addEventListener('click',()=>{
    let values=[];
    try{values=readArray();}catch{values=[];}
    if(values.length<10){values.push(Math.floor(Math.random()*20)-9);$('#array-input').value=values.join(', ');syncSize();}
  });

  $('#answer-options').addEventListener('click',(e)=>{
    const button=e.target.closest('[data-answer]');
    if(button)answerQuestion(Number(button.dataset.answer));
  });

  $('#speed').addEventListener('input',(e)=>{
    $('#speed-label').textContent=`${e.target.value}×`;
  });

  $('#next-level').addEventListener('click',()=>{
    levelIndex=(levelIndex+1)%levels.length;
    $('#finish-card').classList.add('hidden');
    switchMode('levels');
    startRun();
  });

  $('#sound-toggle').addEventListener('click',(e)=>e.currentTarget.classList.toggle('selected'));
  render();
}

document.addEventListener('DOMContentLoaded',init);
