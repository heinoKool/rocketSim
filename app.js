// Didaktische Validierung + Three.js Simulation

// Drag & Drop Puzzle Setup
const blanks = []; // legacy reference removed
const raketeErrorsEl = document.getElementById('raketeErrors');
const missionErrorsEl = document.getElementById('missionErrors');
const missionCodeEl = document.getElementById('missionCode');
const validateBtn = document.getElementById('validateBtn');
const launchBtn = document.getElementById('launchBtn');
const consoleEl = document.getElementById('console');
const modal = document.getElementById('launchModal');
const closeModalBtn = document.getElementById('closeModal');
const generateCodeBtn = document.getElementById('generateCode');
const fuelAmountLabel = document.getElementById('fuelAmountLabel');

// Starfield
(function makeStars(){
  const makeLayer = (id, count, scale, opacity)=>{
    const layer = document.getElementById(id);
    if(!layer) return;
    for(let i=0;i<count;i++){
      const s=document.createElement('div');
      s.className='star';
      const size=Math.random()*2*scale+1; s.style.width=size+'px'; s.style.height=size+'px';
      s.style.top=Math.random()*100+'%'; s.style.left=Math.random()*100+'%';
      s.style.opacity = opacity;
      s.style.animationDelay=(Math.random()*5)+'s';
      layer.appendChild(s);
    }
  };
  makeLayer('stars', 160, 1.0, 0.8);
  makeLayer('stars2', 120, 1.4, 0.6);
  makeLayer('stars3', 100, 1.8, 0.5);
})();

// Build mission code from form
function buildMissionCode(){
  const name = document.getElementById('rocketName').value.trim();
  const mode = document.querySelector('input[name="fuelMode"]:checked').value;
  const amountEl = document.getElementById('fuelAmount');
  const amount = parseInt(amountEl.value,10);
  let code = 'class MissionControl {\n    public static void main(String[] args) {\n        Rakete rakete = new Rakete("' + (name || '<NAME>') + '");\n';
  if(mode==='amount') {
    code += '        rakete.refuel('+ (isFinite(amount)? amount : '<MENGE>') +');\n';
  } else {
    code += '        rakete.refuel();\n';
  }
  code += '        rakete.start();\n    }\n}';
  missionCodeEl.textContent = code;
}

// Show/hide amount field
Array.from(document.querySelectorAll('input[name="fuelMode"]')).forEach(r=>{
  r.addEventListener('change',()=>{
    fuelAmountLabel.style.display = (r.value==='amount' && r.checked) ? 'block':'none';
    buildMissionCode();
  });
});

generateCodeBtn.addEventListener('click', buildMissionCode);

// Initial
buildMissionCode();

// Validation logic
// Puzzle tokens
const REQUIRED = {
  ctorParam: 'String rName',
  nameAssign: 'rName',
  fuelInit: '0',
  amountVar: 'amount',
  fuelFull: '100',
  fuelThresh: '80',
  countStart: '10'
};

const DECOYS = [
  'int rName', 'String name', 'fuel', 'amount + fuel', '50', '75', 'fuel > 50', 'fuel >= 80', '15', '5', 'rName()', 'null', 'String', 'new Rakete', 'i++'
];

function buildTokens(){
  const tokenContainer = document.getElementById('tokens');
  if(!tokenContainer) return;
  tokenContainer.innerHTML='';
  const all = [...Object.values(REQUIRED), ...DECOYS];
  // shuffle
  for(let i=all.length-1;i>0;i--){ const j=Math.floor(Math.random()* (i+1)); [all[i],all[j]]=[all[j],all[i]]; }
  all.forEach(txt=>{
    const el=document.createElement('div');
    el.className='token';
    el.textContent=txt;
    el.setAttribute('draggable','true');
    el.dataset.value=txt;
    tokenContainer.appendChild(el);
  });
}

function initPuzzleDrag(){
  const drops = Array.from(document.querySelectorAll('.drop'));
  const tokens = () => Array.from(document.querySelectorAll('.token'));

  function handleDragStart(e){
    e.dataTransfer.setData('text/plain', e.target.dataset.value);
  }
  function handleDragOver(e){ e.preventDefault(); e.currentTarget.classList.add('over'); }
  function handleDragLeave(e){ e.currentTarget.classList.remove('over'); }
  function handleDrop(e){
    e.preventDefault();
    e.currentTarget.classList.remove('over');
    const val = e.dataTransfer.getData('text/plain');
    // Prevent replacing if already filled with same
    e.currentTarget.textContent = val;
    e.currentTarget.classList.add('filled');
    // mark token used
    const tk = tokens().find(t=>t.dataset.value===val && !t.classList.contains('used'));
    if(tk){ tk.classList.add('used'); tk.setAttribute('draggable','false'); }
    validatePuzzle(false);
  }
  tokens().forEach(t=> t.addEventListener('dragstart', handleDragStart));
  drops.forEach(d=>{ d.addEventListener('dragover', handleDragOver); d.addEventListener('dragleave', handleDragLeave); d.addEventListener('drop', handleDrop); });
}

function resetPuzzle(){
  document.querySelectorAll('.drop').forEach(d=>{ d.textContent=''; d.className='drop'; });
  buildTokens();
  initPuzzleDrag();
  raketeErrorsEl.textContent=''; raketeErrorsEl.classList.remove('ok');
}

function validatePuzzle(showSummary=true){
  let errors=[]; let correct=0; const total = Object.keys(REQUIRED).length;
  document.querySelectorAll('.drop').forEach(d=>{
    const slot = d.dataset.slot; const expected = REQUIRED[slot]; const actual = d.textContent.trim();
    if(!actual){ d.classList.remove('correct','wrong'); return; }
    if(actual === expected){ d.classList.add('correct'); d.classList.remove('wrong'); correct++; }
    else { d.classList.add('wrong'); d.classList.remove('correct'); errors.push(slot+': erwartet "'+expected+'"'); }
  });
  if(showSummary){
    if(errors.length){
      raketeErrorsEl.textContent='Fehler:\n'+errors.join('\n'); raketeErrorsEl.classList.remove('ok');
    } else if(correct === total){
      raketeErrorsEl.textContent='Alle Puzzleteile korrekt!'; raketeErrorsEl.classList.add('ok');
    } else {
      raketeErrorsEl.textContent='Noch nicht alle Lücken gefüllt.'; raketeErrorsEl.classList.remove('ok');
    }
  }
  return correct===total && errors.length===0;
}

function validateRakete(){
  return validatePuzzle(true);
}

// 'Puzzle prüfen' entfällt – 'Code prüfen' übernimmt die Prüfung
document.getElementById('resetPuzzle')?.addEventListener('click', resetPuzzle);
buildTokens();
initPuzzleDrag();

function validateMission(){
  const name = document.getElementById('rocketName').value.trim();
  const mode = document.querySelector('input[name="fuelMode"]:checked').value;
  const amount = parseInt(document.getElementById('fuelAmount').value,10);
  let errors=[];
  if(!name) errors.push('Raketenname fehlt.');
  if(mode==='amount') {
    if(!(amount>=0 && amount<=100)) errors.push('Menge zwischen 0 und 100 wählen.');
  }
  // Update HUD elements
  const hudMission = document.getElementById('hudMission');
  const hudFuelFill = document.getElementById('hudFuelFill');
  const hudFuelPct = document.getElementById('hudFuelPct');
  const hudLamp = document.getElementById('hudStatusLamp');
  const hudText = document.getElementById('hudStatusText');
  if(hudMission) hudMission.textContent = name || '—';
  const pct = (mode==='full') ? 100 : Math.max(0, Math.min(100, isFinite(amount)?amount:0));
  if(hudFuelFill) hudFuelFill.style.width = pct + '%';
  if(hudFuelPct) hudFuelPct.textContent = pct + '%';
  if(errors.length){
    missionErrorsEl.textContent = 'Fehler:\n' + errors.join('\n');
    missionErrorsEl.classList.remove('ok');
    if(hudLamp) hudLamp.className = 'lamp err';
    if(hudText) hudText.textContent = 'Fehler';
    return false;
  } else {
    missionErrorsEl.textContent = 'Mission bereit!';
    missionErrorsEl.classList.add('ok');
    if(hudLamp) hudLamp.className = 'lamp ok';
    if(hudText) hudText.textContent = 'Bereit';
    return true;
  }
}

validateBtn.addEventListener('click', ()=>{
  const ok1 = validateRakete();
  const ok2 = validateMission();
  launchBtn.disabled = !(ok1 && ok2);
});

// ASCII 2D Simulation (Three.js legacy removed)
let ascii = { raf:null, rows:0, cols:0, pre:null, stars:[], phase:0, lastTime:0 };

function measureChar(pre){
  // Ensure deterministic font metrics
  const cs = getComputedStyle(pre);
  if(cs.lineHeight === 'normal') pre.style.lineHeight = '1em';
  if(!pre.style.fontSize) pre.style.fontSize = cs.fontSize || '14px';

  // Width via long run to average spacing
  const span = document.createElement('span');
  span.style.visibility='hidden';
  span.style.whiteSpace='pre';
  const count = 100;
  span.textContent = 'M'.repeat(count);
  pre.appendChild(span);
  const rect = span.getBoundingClientRect();
  pre.removeChild(span);
  const cw = Math.max(5, rect.width / count);

  // Height via computed line-height
  const lineH = parseFloat(getComputedStyle(pre).lineHeight);
  const ch = Math.max(8, isFinite(lineH) ? lineH : parseFloat(getComputedStyle(pre).fontSize));
  return { cw, ch };
}

function initAsciiSim(){
  const container = document.getElementById('simContainer');
  container.innerHTML='';
  const pre = document.createElement('pre');
  pre.id = 'asciiDisplay';
  pre.style.margin='0';
  pre.style.width='100%';
  pre.style.height='100%';
  pre.style.overflow='hidden';
  pre.style.fontFamily='"Roboto Mono", monospace';
  pre.style.lineHeight='1.1em';
  container.appendChild(pre);
  ascii.pre = pre;
  const { cw, ch } = measureChar(pre);
  ascii.cols = Math.max(20, Math.floor(pre.clientWidth / cw));
  ascii.rows = Math.max(12, Math.floor(pre.clientHeight / ch));
  // init stars
  const starCount = Math.floor((ascii.cols*ascii.rows)/18);
  ascii.stars = Array.from({length:starCount},()=>({
    x: Math.floor(Math.random()*ascii.cols),
    y: Math.floor(Math.random()*ascii.rows),
    b: Math.random()<0.2 ? '*' : '.'
  }));
  ascii.phase = 0; ascii.lastTime = 0;
}

function renderAsciiFrame(){
  const cols = ascii.cols, rows = ascii.rows;
  const gridCh = Array.from({length:rows}, ()=>Array(cols).fill(' '));
  const gridCol = Array.from({length:rows}, ()=>Array(cols).fill(null));

  // Move stars right -> left to simulate rightward flight
  ascii.stars.forEach(s=>{ s.x -= 0.4; if(s.x < 0){ s.x += cols; s.y = Math.random()*rows; } });
  ascii.stars.forEach(s=>{ const yy=Math.floor(s.y); if(yy>=0 && yy<rows) { gridCh[yy][Math.floor(s.x)] = s.b; gridCol[yy][Math.floor(s.x)] = '#5aa0ff'; } });

  // ASCII rocket ship centered facing right
  function setChar(x,y,ch,color=null){ if(x>=0&&x<cols&&y>=0&&y<rows){ gridCh[y][x]=ch; gridCol[y][x]=color; } }
  const centerRow = Math.floor(rows/2);
  const centerCol = Math.floor(cols/2);
  const rocketStr = '>>>===( ^ ‿ ^ )===>>';
  const startX = Math.max(0, centerCol - Math.floor(rocketStr.length/2));

  // Nyan-like rainbow trail to the left with stronger wave (relative to rocket center)
  const rainbow = ['#ff0033','#ff7f00','#ffee00','#33cc33','#3399ff','#cc33ff'];
  const baseY = centerRow - Math.floor(rainbow.length/2);
  ascii.phase += 0.8;
  const amp = 3; // stronger amplitude
  const freqDiv = 4; // wave frequency divisor
  for(let band=0; band<rainbow.length; band++){
    const color = rainbow[band];
    // draw far enough left so it doesn't overlap the rocket body
    for(let x=0; x<startX - 6; x++){
      const wave = Math.round(amp * Math.sin((x + ascii.phase + band*2)/freqDiv));
      const y = baseY + band + wave;
      if(y>=0 && y<rows) setChar(x, y, '=', color);
    }
  }

  // Stronger flame: multiple rows with warm colors, placed to the LEFT (rear) of rocket
  const flameColors = ['#ffd700','#ff8c00','#ff4500'];
  const flameCenterY = centerRow;
  const flameBaseX = startX - 10; // further behind tail to avoid overlap
  const flameRows = [
    { dy: -1, chars: '<~<<-<<<' },
    { dy:  0, chars: '<<<===<<<' },
    { dy:  1, chars: '<-<<-<<' }
  ];
  for(let k=0;k<flameRows.length;k++){
    const row = flameRows[k];
    const y = flameCenterY + row.dy;
    if(y<0 || y>=rows) continue;
    const pat = row.chars;
    // slight horizontal jitter for flicker
    const start = flameBaseX - (Math.random()<0.5?1:0);
    for(let j=0;j<pat.length;j++) {
      const x = start + j;
      setChar(x, y, pat[j], flameColors[Math.min(k,flameColors.length-1)]);
    }
  }

  // Draw rocket last to ensure it stays fully visible above trail/flames
  for(let j=0;j<rocketStr.length;j++){
    setChar(startX + j, centerRow, rocketStr[j], '#e6eefc');
  }

  // Build HTML with color runs
  function esc(ch){
    if(ch==='&') return '&amp;';
    if(ch==='<') return '&lt;';
    if(ch==='>') return '&gt;';
    if(ch==='\t') return '    ';
    return ch;
  }
  let html='';
  for(let y=0;y<rows;y++){
    let curColor = null, buf='';
    function flush(){
      if(buf.length===0) return;
      const safe = buf.split('').map(esc).join('');
      if(curColor){ html += '<span style="color:'+curColor+'">'+safe+'</span>'; }
      else { html += safe; }
      buf='';
    }
    for(let x=0;x<cols;x++){
      const ch = gridCh[y][x];
      const col = gridCol[y][x];
      if(col!==curColor){ flush(); curColor=col; }
      buf += ch;
    }
    flush();
    html += '\n';
  }
  ascii.pre.innerHTML = html;
}

function startAsciiFlight(){
  initAsciiSim();
  const targetFPS = 24;
  const frameTime = 1000/targetFPS;
  function loop(ts){
    if(!ascii.lastTime) ascii.lastTime = ts;
    const dt = ts - ascii.lastTime;
    if(dt >= frameTime){ renderAsciiFrame(); ascii.lastTime = ts; }
    ascii.raf = requestAnimationFrame(loop);
  }
  ascii.raf = requestAnimationFrame(loop);
  window.addEventListener('resize', onAsciiResize);
}

function stopAsciiFlight(){
  if(ascii.raf){ cancelAnimationFrame(ascii.raf); ascii.raf=null; }
  window.removeEventListener('resize', onAsciiResize);
}

function onAsciiResize(){
  // Reinitialize to fit new size
  initAsciiSim();
}

function runCountdown(onFinish, missionName){
  consoleEl.textContent='';
  let i=10; // muss übereinstimmen mit countStart
  const interval = setInterval(()=>{
    consoleEl.textContent += '['+(missionName||'Mission')+'] T-Minus '+i+'\n';
    if(i===0){
      clearInterval(interval);
      consoleEl.textContent += '['+(missionName||'Mission')+'] Rakete startet!\n';
      onFinish();
    }
    i--;
  },400);
}

function launchSuccess(){
  startAsciiFlight();
}

function launchFailure(){
  initAsciiSim();
  let frames = 0;
  const maxFrames = 160;
  function renderFail(){
    const cols = ascii.cols, rows = ascii.rows;
    const gridCh = Array.from({length:rows}, ()=>Array(cols).fill(' '));
    const gridCol = Array.from({length:rows}, ()=>Array(cols).fill(null));
    ascii.phase += 0.6;
    // Background star drift slow
    ascii.stars.forEach(s=>{ s.x -= 0.2; if(s.x < 0){ s.x += cols; s.y = Math.random()*rows; } });
    ascii.stars.forEach(s=>{ const yy=Math.floor(s.y); const xx=Math.floor(s.x); if(yy>=0&&yy<rows&&xx>=0&&xx<cols){ gridCh[yy][xx] = '.'; gridCol[yy][xx] = '#335588'; } });
    // Cracked rocket area (reuse body geometry bounds)
    const bodyW = Math.min(42, Math.floor(cols*0.45));
    const bodyH = Math.min(18, Math.floor(rows*0.55));
    const centerY = Math.floor(rows/2);
    const bodyX = Math.max(4, Math.floor(cols/2 - bodyW/2));
    const bodyY = Math.max(1, centerY - Math.floor(bodyH/2));
    for(let y=bodyY; y<bodyY+bodyH; y++){
      for(let x=bodyX; x<bodyX+bodyW; x++){
        const nx = (x - (bodyX + bodyW/2)) / (bodyW/2);
        const ny = (y - (bodyY + bodyH/2)) / (bodyH/2);
        if(nx*nx + ny*ny <= 1){
          // break pattern: random gaps
          if((x+y+frames)%3===0){
            const ch = (frames%10<5)?'x':'X';
            gridCh[y][x] = ch;
            gridCol[y][x] = '#ff2d2d';
          }
        }
      }
    }
    // Sparks
    for(let s=0;s<50;s++){
      const sx = bodyX + Math.floor(Math.random()*bodyW);
      const sy = bodyY + Math.floor(Math.random()*bodyH);
      if(Math.random()<0.25){
        gridCh[sy][sx] = '*';
        gridCol[sy][sx] = ['#ffa200','#ff6200','#ff3b00'][Math.floor(Math.random()*3)];
      }
    }
    // Message banner
    const msg = 'SYSTEM FAIL: TREIBSTOFF ZU NIEDRIG';
    const msgY = Math.max(0, bodyY-2);
    const startX = Math.max(0, Math.floor(cols/2 - msg.length/2));
    for(let i=0;i<msg.length;i++){ const x = startX+i; if(x<cols){ gridCh[msgY][x] = msg[i]; gridCol[msgY][x] = '#ff4545'; } }
    // Build HTML
    function esc(ch){ if(ch==='&')return '&amp;'; if(ch==='<')return '&lt;'; if(ch==='>')return '&gt;'; return ch; }
    let html='';
    for(let y=0;y<rows;y++){
      let curC=null, buf='';
      function flush(){ if(!buf) return; const safe=buf.split('').map(esc).join(''); html += curC?('<span style="color:'+curC+'">'+safe+'</span>'):safe; buf=''; }
      for(let x=0;x<cols;x++){
        const ch=gridCh[y][x]; const col=gridCol[y][x];
        if(col!==curC){ flush(); curC=col; }
        buf+=ch;
      }
      flush(); html+='\n';
    }
    ascii.pre.innerHTML = html;
    if(frames++ < maxFrames){ ascii.raf = requestAnimationFrame(renderFail); }
  }
  renderFail();
}

launchBtn.addEventListener('click', ()=>{
  // Modal öffnen
  modal.style.display='flex';
  // Evaluate mission fuel condition again
  const mode = document.querySelector('input[name="fuelMode"]:checked').value;
  const amount = parseInt(document.getElementById('fuelAmount').value,10);
  const missionName = document.getElementById('rocketName').value.trim() || 'Mission';
  const modalMissionName = document.getElementById('modalMissionName');
  if(modalMissionName) modalMissionName.textContent = missionName;
  const successful = (mode==='full') || (amount>80);
  consoleEl.textContent='';
  if(successful){
    runCountdown(()=>{ launchSuccess(); }, missionName);
  } else {
    consoleEl.textContent += 'Start nicht möglich.\n';
    launchFailure();
  }
});

closeModalBtn.addEventListener('click', ()=>{
  modal.style.display='none';
  stopAsciiFlight();
});
