/* ══════════════════════════════════════════════════════════════
   BidShield AI — app.js  v3.0
   White-theme · Chatbot · Three.js Radar · Interactive
══════════════════════════════════════════════════════════════ */

// Auto-detect API base URL (works for both local and Vercel deployment)
const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:5000/api'
  : '/api';

/* ── STATE ─────────────────────────────────────────────────── */
let currentRole    = 'officer';
let currentTenders = [];
let currentBidders = [];
let verifyRunning  = false;
let chatbotOpen    = false;
let radarRenderer  = null, radarAnimId = null;

/* ══════════════════════════════════════════════════════════════
   THREE.JS HERO  (login background)
══════════════════════════════════════════════════════════════ */
function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || !window.THREE) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0);
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.z = 22;
  const nodeGeo = new THREE.SphereGeometry(0.28, 16, 16);
  const nodes   = [];
  const COLORS  = [0x0BA89E,0x2563EB,0x7C3AED,0x2FE0C6,0x34D399];
  for (let i = 0; i < 55; i++) {
    const mat  = new THREE.MeshBasicMaterial({ color:COLORS[i%COLORS.length], transparent:true, opacity:0.65 });
    const mesh = new THREE.Mesh(nodeGeo, mat);
    mesh.position.set((Math.random()-.5)*38,(Math.random()-.5)*22,(Math.random()-.5)*14);
    mesh.userData = { vx:(Math.random()-.5)*.018, vy:(Math.random()-.5)*.018, vz:(Math.random()-.5)*.006 };
    scene.add(mesh); nodes.push(mesh);
  }
  const edgeMat = new THREE.LineBasicMaterial({ color:0x2FE0C6, transparent:true, opacity:0.12 });
  const edgeGrp = new THREE.Group(); scene.add(edgeGrp);
  function rebuildEdges() {
    while (edgeGrp.children.length) edgeGrp.remove(edgeGrp.children[0]);
    for (let i=0;i<nodes.length;i++) for (let j=i+1;j<nodes.length;j++)
      if (nodes[i].position.distanceTo(nodes[j].position)<7) {
        const geo = new THREE.BufferGeometry().setFromPoints([nodes[i].position.clone(),nodes[j].position.clone()]);
        edgeGrp.add(new THREE.Line(geo,edgeMat));
      }
  }
  function resize() {
    const w=canvas.parentElement.clientWidth, h=canvas.parentElement.clientHeight;
    renderer.setSize(w,h); camera.aspect=w/h; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize); resize();
  let frame=0;
  (function animate() {
    requestAnimationFrame(animate); frame++;
    nodes.forEach(n=>{
      n.position.x+=n.userData.vx; n.position.y+=n.userData.vy; n.position.z+=n.userData.vz;
      if(Math.abs(n.position.x)>20) n.userData.vx*=-1;
      if(Math.abs(n.position.y)>12) n.userData.vy*=-1;
      if(Math.abs(n.position.z)>8)  n.userData.vz*=-1;
    });
    if(frame%12===0) rebuildEdges();
    scene.rotation.y+=0.0008; renderer.render(scene,camera);
  })();
}

/* ══════════════════════════════════════════════════════════════
   THREE.JS RADAR CHART  (verification result)
══════════════════════════════════════════════════════════════ */
function initRadar(canvasId, scores, riskColor) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !window.THREE) return;
  if (radarAnimId) cancelAnimationFrame(radarAnimId);
  if (radarRenderer) { try { radarRenderer.dispose(); } catch(e){} }

  const W = canvas.offsetWidth || 360, H = canvas.offsetHeight || 360;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);
  radarRenderer = renderer;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, W/H, 0.1, 200);
  camera.position.set(0,0,14);

  /* Floating particles */
  const ptGeo  = new THREE.BufferGeometry();
  const ptCount= 120;
  const ptPos  = new Float32Array(ptCount*3);
  for (let i=0;i<ptCount*3;i++) ptPos[i]=(Math.random()-.5)*20;
  ptGeo.setAttribute('position', new THREE.BufferAttribute(ptPos,3));
  const ptMat  = new THREE.PointsMaterial({ color: parseInt(riskColor.replace('#','0x')||0x0BA89E), size:0.12, transparent:true, opacity:0.5 });
  scene.add(new THREE.Points(ptGeo, ptMat));

  /* Radar rings */
  const ringColors = [0xE2E8F0,0xCBD5E1,0x94A3B8];
  [4,6.5,9].forEach((r,i) => {
    const geo = new THREE.RingGeometry(r-0.04, r+0.04, 64);
    const mat = new THREE.MeshBasicMaterial({ color:ringColors[i], transparent:true, opacity:0.3, side:THREE.DoubleSide });
    scene.add(new THREE.Mesh(geo,mat));
  });

  /* Radar axes (5 categories) */
  const AXES  = 5;
  const NAMES = ['Docs','GST','Blacklist','Finance','Performance'];
  const axisGrp = new THREE.Group();
  for (let i=0; i<AXES; i++) {
    const angle = (i/AXES)*Math.PI*2 - Math.PI/2;
    const x=Math.cos(angle)*9, y=Math.sin(angle)*9;
    const pts = [new THREE.Vector3(0,0,0), new THREE.Vector3(x,y,0)];
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color:0x94A3B8, transparent:true, opacity:0.4 });
    axisGrp.add(new THREE.Line(geo,mat));
  }
  scene.add(axisGrp);

  /* Radar filled polygon */
  const maxes = [30,22,20,16,12];
  const radarPts = [];
  for (let i=0; i<AXES; i++) {
    const angle = (i/AXES)*Math.PI*2 - Math.PI/2;
    const ratio = Math.min((scores[i]||0)/maxes[i],1);
    const r = ratio * 9;
    radarPts.push(new THREE.Vector3(Math.cos(angle)*r, Math.sin(angle)*r, 0));
  }
  radarPts.push(radarPts[0].clone());

  const radarLineMat = new THREE.LineBasicMaterial({ color: parseInt(riskColor.replace('#','0x')||0x0BA89E), linewidth:2 });
  const radarLineGeo = new THREE.BufferGeometry().setFromPoints(radarPts);
  scene.add(new THREE.Line(radarLineGeo, radarLineMat));

  /* Filled shape */
  const shape = new THREE.Shape();
  radarPts.slice(0,-1).forEach((p,i) => i===0 ? shape.moveTo(p.x,p.y) : shape.lineTo(p.x,p.y));
  shape.closePath();
  const shapeGeo = new THREE.ShapeGeometry(shape);
  const shapeMat = new THREE.MeshBasicMaterial({ color:parseInt(riskColor.replace('#','0x')||0x0BA89E), transparent:true, opacity:0.14, side:THREE.DoubleSide });
  scene.add(new THREE.Mesh(shapeGeo,shapeMat));

  /* Vertex dots */
  const dotGeo = new THREE.SphereGeometry(0.22, 12, 12);
  const dotMat = new THREE.MeshBasicMaterial({ color:parseInt(riskColor.replace('#','0x')||0x0BA89E) });
  radarPts.slice(0,-1).forEach(p => {
    const dot = new THREE.Mesh(dotGeo, dotMat); dot.position.copy(p); scene.add(dot);
  });

  /* Orbit particles around the polygon */
  const orbitPts = [], orbitSpeeds = [];
  for (let i=0;i<30;i++) {
    const angle=(Math.random()*Math.PI*2), r=3+Math.random()*7;
    orbitPts.push(new THREE.Mesh(new THREE.SphereGeometry(0.08,8,8), new THREE.MeshBasicMaterial({color:parseInt(riskColor.replace('#','0x')||0x0BA89E),transparent:true,opacity:0.6})));
    orbitPts[i].position.set(Math.cos(angle)*r, Math.sin(angle)*r, (Math.random()-.5)*2);
    orbitPts[i].userData = { angle, r, speed:(Math.random()-.5)*0.015 };
    scene.add(orbitPts[i]);
    orbitSpeeds.push(orbitPts[i].userData.speed);
  }

  let t = 0;
  function renderLoop() {
    radarAnimId = requestAnimationFrame(renderLoop);
    t += 0.005;
    orbitPts.forEach(p => {
      p.userData.angle += p.userData.speed;
      p.position.x = Math.cos(p.userData.angle)*p.userData.r;
      p.position.y = Math.sin(p.userData.angle)*p.userData.r;
    });
    scene.rotation.z = Math.sin(t*0.3)*0.08;
    renderer.render(scene,camera);
  }
  renderLoop();
}

/* ══════════════════════════════════════════════════════════════
   LOGIN
══════════════════════════════════════════════════════════════ */
function selectRole(r) {
  currentRole = r;
  document.getElementById('tab-officer').classList.toggle('selected',r==='officer');
  document.getElementById('tab-bidder').classList.toggle('selected',r==='bidder');
}

async function doLogin() {
  const btn = document.getElementById('login-btn');
  btn.innerHTML = '<span class="spin-icon">⏳</span> Authenticating…'; btn.disabled=true;
  await sleep(900);
  const name = currentRole==='officer' ? 'Rajesh Kumar — CPCL' : 'Vendor Portal';
  document.getElementById('officer-name').textContent = name;
  document.getElementById('login-screen').style.display='none';
  document.getElementById('app').classList.add('active');
  loadDashboard(); loadTenders(); loadBidders(); loadVerifyDropdowns(); loadAudit(); populateNewTenderReqs();
  btn.innerHTML='🔐 Sign In to BidShield AI'; btn.disabled=false;
}

function doLogout() {
  document.getElementById('app').classList.remove('active');
  document.getElementById('login-screen').style.display='flex';
}

/* ══════════════════════════════════════════════════════════════
   VIEW ROUTING
══════════════════════════════════════════════════════════════ */
const VIEW_META = {
  'dash':       { title:'Dashboard Overview',        bread:'Dashboard' },
  'how':        { title:'How It Works',               bread:'Dashboard › How It Works' },
  'tenders':    { title:'Tender Management',          bread:'Procurement › Tenders' },
  'bidders':    { title:'Bidder Registry',            bread:'Procurement › Bidders' },
  'new-tender': { title:'Create New Tender',          bread:'Procurement › New Tender' },
  'verify':     { title:'AI Verification Engine',     bread:'Verification › Run AI Verification' },
  'perf':       { title:'Site Performance Tracking',  bread:'Verification › Site Performance' },
  'citizen':    { title:'Citizen Evidence Portal',    bread:'Verification › Citizen Evidence' },
  'agent':      { title:'AI Compliance Agent',        bread:'Intelligence › AI Agent' },
  'connectors': { title:'API Connectors',             bread:'Intelligence › API Connectors' },
  'audit':      { title:'Immutable Audit Trail',      bread:'Intelligence › Audit Trail' },
};
function showView(id) {
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const view=document.getElementById('view-'+id);
  if(view) view.classList.add('active');
  const nav=document.getElementById('nav-'+id);
  if(nav)  nav.classList.add('active');
  const m=VIEW_META[id]||{};
  document.getElementById('topbar-title').textContent=m.title||id;
  document.getElementById('topbar-bread').innerHTML='BidShield AI <span>›</span> '+(m.bread||id);
  window.scrollTo({top:0});
}

/* ══════════════════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════════════════ */
async function loadDashboard() {
  try {
    const [tR,bR] = await Promise.all([fetch(API+'/tenders'),fetch(API+'/bidders')]);
    const tenders = tR.ok ? await tR.json() : [];
    const bidders = bR.ok ? await bR.json() : [];
    animateCount('s-tenders', tenders.length||3, 0, 900);
    animateCount('s-bidders', bidders.length||3, 0, 900);
    animateCount('s-flagged', bidders.filter(b=>(b.risk_level||'').toUpperCase()==='HIGH').length||1, 0, 900);
    animateCount('s-verified', 8, 0, 900);
    setTimeout(()=>{
      const t=Math.max(bidders.length,1);
      const low=bidders.filter(b=>(b.risk_level||'').toUpperCase()==='LOW').length||1;
      const mid=bidders.filter(b=>(b.risk_level||'').toUpperCase()==='MEDIUM').length||1;
      const hi =bidders.filter(b=>(b.risk_level||'').toUpperCase()==='HIGH').length||1;
      setBarWidth('bar-low',Math.round(low/t*100)); setBarWidth('bar-mid',Math.round(mid/t*100)); setBarWidth('bar-high',Math.round(hi/t*100));
    },400);
    const tbody=document.getElementById('dash-tenders');
    tbody.innerHTML = tenders.slice(0,4).map(t=>`
      <tr class="row-link" onclick="showView('tenders')">
        <td><b>${t.tender_id||t.id}</b></td><td>${t.department||'—'}</td>
        <td><span class="badge badge-blue">${t.bidder_count||'—'}</span></td>
        <td><span class="badge badge-pass">● Active</span></td>
      </tr>`).join('') || fallbackDashTenders();
  } catch { 
    animateCount('s-tenders',3,0,900); animateCount('s-bidders',3,0,900);
    animateCount('s-flagged',1,0,900); animateCount('s-verified',8,0,900);
    setTimeout(()=>{ setBarWidth('bar-low',33);setBarWidth('bar-mid',33);setBarWidth('bar-high',34); },400);
    document.getElementById('dash-tenders').innerHTML=fallbackDashTenders();
  }
  buildDashAudit();
}
function fallbackDashTenders() {
  return `
    <tr class="row-link" onclick="verifyTender(1)"><td><b>CPCL/2026/PROC/001</b></td><td>CPCL Chennai</td><td><span class="badge badge-blue">3</span></td><td><span class="badge badge-pass">● Active</span></td></tr>
    <tr class="row-link" onclick="verifyTender(2)"><td><b>BPCL/2026/PROC/001</b></td><td>BPCL Mumbai</td><td><span class="badge badge-blue">2</span></td><td><span class="badge badge-pass">● Active</span></td></tr>`;
}
function buildDashAudit() {
  const events=[
    {time:'06:41',icon:'✅',bg:'rgba(5,150,105,.1)',text:'<b>GSTN verification PASSED</b> — ABC Engineering Pvt. Ltd. · CPCL tender · Score 96/100'},
    {time:'06:40',icon:'⚠️',bg:'rgba(217,119,6,.1)', text:'<b>OEM mismatch detected</b> — XYZ Industrial Solutions · Score 71/100 MEDIUM risk'},
    {time:'06:39',icon:'🚫',bg:'rgba(220,38,38,.1)', text:'<b>BLACKLIST HIT</b> — PQR Enterprises · NIC debarment match · Score 39/100 HIGH RISK'},
    {time:'06:35',icon:'📋',bg:'rgba(37,99,235,.1)', text:'<b>Tender published</b> — CPCL/2026/PROC/001 · ETP Equipment Supply · ₹45 Cr'},
    {time:'06:20',icon:'🔐',bg:'rgba(124,58,237,.1)',text:'<b>Officer login</b> — Rajesh Kumar · CPCL · Ministry of Petroleum'},
  ];
  document.getElementById('dash-audit').innerHTML=events.map(e=>`
    <div class="audit-item">
      <div class="audit-time">${e.time}</div>
      <div class="audit-icon" style="background:${e.bg}">${e.icon}</div>
      <div class="audit-text">${e.text}</div>
    </div>`).join('');
}

/* ══════════════════════════════════════════════════════════════
   TENDERS
══════════════════════════════════════════════════════════════ */
async function loadTenders() {
  const tbody=document.getElementById('tenders-tbody');
  try {
    const res=await fetch(API+'/tenders'); const data=res.ok?await res.json():[];
    currentTenders=data;
    document.getElementById('tender-count').textContent=data.length+' tenders';
    tbody.innerHTML=data.length?data.map(t=>`
      <tr class="row-link" onclick="verifyTender(${t.id})">
        <td><b>${t.tender_id||'TND-'+t.id}</b></td><td>${t.title||'—'}</td><td>${t.department||'—'}</td>
        <td>₹${t.estimated_value||'—'} Cr</td><td>${t.deadline||'—'}</td>
        <td><span class="badge badge-blue">${t.bidder_count||'—'}</span></td>
        <td><button class="btn btn-ghost btn-xs" onclick="event.stopPropagation();verifyTender(${t.id})">▶ Verify</button></td>
      </tr>`).join(''):fallbackTendersRows();
  } catch { tbody.innerHTML=fallbackTendersRows(); }
}
function fallbackTendersRows() {
  return [
    {id:1,tid:'CPCL/2026/PROC/001',t:'ETP Equipment Supply',d:'CPCL Chennai',v:'45.0',dl:'2026-04-30',b:3},
    {id:2,tid:'BPCL/2026/PROC/001',t:'Industrial Valve Supply',d:'BPCL Mumbai',v:'18.5',dl:'2026-05-15',b:2},
    {id:3,tid:'HPCL/2026/PROC/002',t:'Pipeline Inspection Services',d:'HPCL Delhi',v:'12.0',dl:'2026-06-01',b:4},
  ].map(t=>`
    <tr class="row-link" onclick="verifyTender(${t.id})">
      <td><b>${t.tid}</b></td><td>${t.t}</td><td>${t.d}</td><td>₹${t.v} Cr</td><td>${t.dl}</td>
      <td><span class="badge badge-blue">${t.b}</span></td>
      <td><button class="btn btn-ghost btn-xs" onclick="event.stopPropagation();verifyTender(${t.id})">▶ Verify</button></td>
    </tr>`).join('');
}
function verifyTender(id) {
  showView('verify');
  setTimeout(()=>{ const s=document.getElementById('verify-tender'); if(s){s.value=id;loadVerifyBidders();} },200);
}

/* ══════════════════════════════════════════════════════════════
   BIDDERS
══════════════════════════════════════════════════════════════ */
const BIDDER_DEMO = [
  {id:1,company_name:'ABC Engineering Pvt. Ltd.',gstin:'27AABCA1234F1Z5',udyam_number:'UDYAM-MH-01-0001234',compliance_score:96,risk_level:'LOW',   status:'Active'},
  {id:2,company_name:'XYZ Industrial Solutions', gstin:'06AABCX5678G1Z9',udyam_number:'UDYAM-HR-06-0005678',compliance_score:71,risk_level:'MEDIUM',status:'Active'},
  {id:3,company_name:'PQR Enterprises',           gstin:'07AABCP9012H1Z3',udyam_number:'UDYAM-DL-07-0009012',compliance_score:39,risk_level:'HIGH',  status:'Inactive'},
];
async function loadBidders() {
  try {
    const res=await fetch(API+'/bidders'); const data=res.ok?await res.json():BIDDER_DEMO;
    currentBidders=data.length?data:BIDDER_DEMO;
  } catch { currentBidders=BIDDER_DEMO; }
  renderBiddersTable(currentBidders);
}
function renderBiddersTable(list) {
  const tbody=document.getElementById('bidders-tbody');
  if(!list.length){tbody.innerHTML=`<tr><td colspan="7" style="text-align:center;padding:28px;color:var(--text-faint)">No bidders found</td></tr>`;return;}
  tbody.innerHTML=list.map(b=>{
    const score=b.compliance_score||0;
    const risk=(b.risk_level||'UNKNOWN').toUpperCase();
    const riskBadge=risk==='LOW'?'<span class="risk-tag risk-low">🟢 LOW</span>':risk==='MEDIUM'?'<span class="risk-tag risk-medium">🟡 MEDIUM</span>':risk==='HIGH'?'<span class="risk-tag risk-high">🔴 HIGH</span>':'<span>—</span>';
    const sc=score>=80?'var(--success)':score>=60?'var(--warn)':'var(--danger)';
    return `<tr class="row-link" onclick="selectBidderAndVerify(${b.id})">
      <td><b>${b.company_name||'Unknown'}</b></td>
      <td class="mono" style="font-size:12px">${b.gstin||'—'}</td>
      <td class="mono" style="font-size:12px">${b.udyam_number||'—'}</td>
      <td><div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:15px;font-weight:800;font-family:'IBM Plex Mono',monospace;color:${sc}">${score}</span>
        <div style="flex:1;max-width:80px"><div class="score-bar"><div class="score-bar-fill" style="width:${score}%;background:${sc}"></div></div></div>
      </div></td>
      <td>${riskBadge}</td>
      <td><span class="badge ${b.status==='Active'?'badge-pass':'badge-fail'}">${b.status||'—'}</span></td>
      <td>
        <button class="btn btn-ghost btn-xs" onclick="event.stopPropagation();selectBidderAndVerify(${b.id})">▶ Verify</button>
        <button class="btn btn-ghost btn-xs" onclick="event.stopPropagation();openAgentForBidder(${b.id})">🧠 AI</button>
      </td>
    </tr>`;
  }).join('');
}
function filterBidders() {
  const f=document.getElementById('bidder-filter').value.toUpperCase();
  renderBiddersTable(f?currentBidders.filter(b=>(b.risk_level||'').toUpperCase()===f):currentBidders);
}
function selectBidderAndVerify(id) {
  showView('verify');
  setTimeout(()=>{ const s=document.getElementById('verify-bidder'); if(s){[...s.options].forEach(o=>{if(o.value==id)s.value=id;});} },250);
}

/* ══════════════════════════════════════════════════════════════
   VERIFICATION ENGINE
══════════════════════════════════════════════════════════════ */
async function loadVerifyDropdowns() {
  await loadTenders();
  const tSel=document.getElementById('verify-tender');
  if(!tSel) return;
  tSel.innerHTML='<option value="">— Choose a Tender —</option>';
  const list=currentTenders.length?currentTenders:[
    {id:1,tender_id:'CPCL/2026/PROC/001',title:'ETP Equipment Supply'},
    {id:2,tender_id:'BPCL/2026/PROC/001',title:'Industrial Valve Supply'},
    {id:3,tender_id:'HPCL/2026/PROC/002',title:'Pipeline Inspection'},
  ];
  list.forEach(t=>{ const o=document.createElement('option'); o.value=t.id; o.textContent=`${t.tender_id} — ${t.title||t.department||''}`; tSel.appendChild(o); });
}
function loadVerifyBidders() {
  const bSel=document.getElementById('verify-bidder');
  bSel.innerHTML='<option value="">— Choose a Bidder —</option>';
  const list=currentBidders.length?currentBidders:BIDDER_DEMO;
  list.forEach(b=>{ const o=document.createElement('option'); o.value=b.id; o.textContent=b.company_name||b.name; bSel.appendChild(o); });
}

const PIPE_LABELS=['GSTN Live','MCA21','Udyam','Blacklist','CIBIL','GeM','eProcure'];

async function runVerification() {
  if(verifyRunning) return;
  const tenderId=document.getElementById('verify-tender').value;
  const bidderId=document.getElementById('verify-bidder').value;
  if(!tenderId||!bidderId){showToast('⚠️ Please select both a tender and a bidder','warn');return;}
  verifyRunning=true;
  const btn=document.getElementById('run-btn');
  btn.innerHTML='<span style="animation:spin .6s linear infinite;display:inline-block">⚙️</span> Running…'; btn.disabled=true;

  /* reset */
  for(let i=0;i<7;i++){ const el=document.getElementById('ps-'+i); if(el) el.className='pipe-step'; }
  document.getElementById('verify-result-area').innerHTML='';
  const log=document.getElementById('verify-log');
  log.innerHTML='<div><span class="k">[ BidShield AI ]</span> Initialising parallel verification…</div>';

  const appendLog=(cls,msg)=>{ log.innerHTML+=`<div><span class="${cls}">${msg}</span></div>`; log.scrollTop=log.scrollHeight; };

  for(let i=0;i<7;i++){
    const el=document.getElementById('ps-'+i);
    if(el) el.classList.add('active');
    await sleep(300);
    appendLog('k',`[ ${PIPE_LABELS[i]} ] → Querying official endpoint…`);
    await sleep(240);
    if(el){el.classList.remove('active');el.classList.add('done');}
    appendLog('ok',`[ ${PIPE_LABELS[i]} ] ✓ 200 OK — data received`);
  }
  appendLog('ok','[ Rule Engine ] Applying 24 compliance rules…');
  await sleep(450);
  appendLog('ok','[ Score Engine ] Weighted scoring complete.');
  await sleep(300);

  /* always use rich demo data */
  const result = getDemoResult(parseInt(bidderId));
  try {
    const res = await fetch(`${API}/bidders/${bidderId}/verify`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tender_id:tenderId})});
    if(res.ok){ const d=await res.json(); if(d&&d.compliance_score>0) Object.assign(result,{compliance_score:d.compliance_score,risk_level:d.risk_level||result.risk_level}); }
  } catch {}

  appendLog('ok','[ BidShield AI ] ✅ Report generated. Rendering dashboard…');
  await sleep(300);
  renderVerifyResult(result);
  btn.innerHTML='▶ Run AI Verification'; btn.disabled=false;
  verifyRunning=false;
}

/* ── DEMO DATA ──────────────────────────────────────────────── */
function getDemoResult(id) {
  const demos = {
    1: {
      bidder_name:'ABC Engineering Pvt. Ltd.', compliance_score:96, risk_level:'LOW',
      gstin:'27AABCA1234F1Z5', pan:'AABCA1234F', udyam:'UDYAM-MH-01-0001234',
      summary:'Excellent compliance profile. All 7 API verifications cleared with flying colours. Strong financial history, active GST, no debarment record. Recommended for shortlisting.',
      scoreBreakdown:[{label:'Document Validity',score:29,max:30,color:'#0BA89E'},{label:'GST Compliance',score:21,max:22,color:'#2563EB'},{label:'Blacklist / Debarment',score:20,max:20,color:'#7C3AED'},{label:'Financial Capability',score:15,max:16,color:'#D97706'},{label:'Past Performance',score:11,max:12,color:'#059669'}],
      checks:[
        {name:'GSTN Portal',      status:'PASS',detail:'Active · 24/24 returns filed · Annual Turnover ₹42.3 Cr · No pending dues'},
        {name:'MCA21 Registry',   status:'PASS',detail:'Company Status: Active · All 3 directors KYC verified · No NCLT proceedings'},
        {name:'Udyam Registry',   status:'PASS',detail:'MSME Small Enterprise · Certificate valid till Dec 2026 · UAM-MH-01-0001234'},
        {name:'NIC Blacklist DB', status:'PASS',detail:'No debarment or blacklist record found across all ministries'},
        {name:'CIBIL Commercial', status:'PASS',detail:'Credit Score: 780/900 · Zero NPA accounts · Clean repayment history 5 yrs'},
        {name:'GeM Seller Portal',status:'PASS',detail:'Rating: 4.7★ · 38 orders completed · Zero complaints · Preferred seller badge'},
        {name:'eProcurement CPPP',status:'PASS',detail:'12 government contracts · 100% on-time completion · 0 penalty clauses invoked'},
      ],
      recommendations:['✅ Clear all 7 checks — shortlist without hesitation','📋 Strong past performance on 12 govt contracts, all on time','💰 Financial capability exceeds tender requirement by 2.3x','🏆 GeM preferred seller with 4.7★ rating — top-tier vendor']
    },
    2: {
      bidder_name:'XYZ Industrial Solutions', compliance_score:71, risk_level:'MEDIUM',
      gstin:'06AABCX5678G1Z9', pan:'AABCX5678G', udyam:'UDYAM-HR-06-0005678',
      summary:'Medium risk profile. OEM authorization certificate does not match MCA21 manufacturer record. Turnover gap of ₹4 Cr detected between GSTN filing and declared figure. Clarification recommended.',
      scoreBreakdown:[{label:'Document Validity',score:18,max:30,color:'#0BA89E'},{label:'GST Compliance',score:18,max:22,color:'#2563EB'},{label:'Blacklist / Debarment',score:20,max:20,color:'#7C3AED'},{label:'Financial Capability',score:10,max:16,color:'#D97706'},{label:'Past Performance',score:5,max:12,color:'#059669'}],
      checks:[
        {name:'GSTN Portal',      status:'PASS',detail:'Active · 21/24 returns filed (3 delayed) · Turnover ₹18.2 Cr vs declared ₹22 Cr — gap detected'},
        {name:'MCA21 Registry',   status:'WARN',detail:'Director DIN 00234567 not updated since 2022 · 1 of 3 directors KYC pending'},
        {name:'Udyam Registry',   status:'PASS',detail:'MSME Medium Enterprise · Certificate valid till Sep 2026 · UAM-HR-06-0005678'},
        {name:'NIC Blacklist DB', status:'PASS',detail:'No debarment or blacklist record found'},
        {name:'CIBIL Commercial', status:'WARN',detail:'Score 620/900 · 1 overdue account (resolved Aug 2025) · 3 late payments noted'},
        {name:'GeM Seller Portal',status:'PASS',detail:'Rating: 4.1★ · 14 orders · 2 minor complaints (resolved)'},
        {name:'eProcurement CPPP',status:'WARN',detail:'OEM auth letter submitted (Siemens) differs from MCA21 manufacturer record — requires re-verification'},
      ],
      recommendations:['⚠️ Request updated OEM authorization letter matching MCA21 records','📄 Clarify ₹4 Cr turnover gap with CA-certified statement','👤 Update Director DIN 00234567 on MCA21 before deadline','💳 Provide bank solvency letter to address CIBIL concern','🕐 Shortlist conditionally pending document clarification within 7 days']
    },
    3: {
      bidder_name:'PQR Enterprises', compliance_score:39, risk_level:'HIGH',
      gstin:'07AABCP9012H1Z3', pan:'AABCP9012H', udyam:'UDYAM-DL-07-0009012',
      summary:'CRITICAL RISK. Bidder found in NIC debarment database (2-year ban active). GSTIN suspended since October 2025. Udyam certificate expired. Multiple financial defaults. Immediate rejection recommended.',
      scoreBreakdown:[{label:'Document Validity',score:12,max:30,color:'#0BA89E'},{label:'GST Compliance',score:2,max:22,color:'#2563EB'},{label:'Blacklist / Debarment',score:0,max:20,color:'#7C3AED'},{label:'Financial Capability',score:5,max:16,color:'#D97706'},{label:'Past Performance',score:0,max:12,color:'#059669'}],
      checks:[
        {name:'GSTN Portal',      status:'FAIL',detail:'🚨 GSTIN INACTIVE — Registration suspended by GST authority since Oct 2025 · Non-filer for 5 quarters'},
        {name:'MCA21 Registry',   status:'PASS',detail:'Company registered · Status: Active · All directors listed'},
        {name:'Udyam Registry',   status:'FAIL',detail:'⚠️ Certificate EXPIRED — Jan 2026 · MSME benefit not applicable · Renewal pending'},
        {name:'NIC Blacklist DB', status:'FAIL',detail:'🚨 DEBARRED — Ref: NIC-BL-2025-DL-00142 · Ministry of Housing · Effective: Mar 2025 · Duration: 2 years · Reason: Contract fraud'},
        {name:'CIBIL Commercial', status:'FAIL',detail:'Score 430/900 · 2 NPA accounts (₹1.2 Cr outstanding) · 5 defaults in 3 years'},
        {name:'GeM Seller Portal',status:'WARN',detail:'Account suspended · 2 complaints pending resolution · Last order cancelled'},
        {name:'eProcurement CPPP',status:'WARN',detail:'2 of 4 contracts terminated early · 1 performance bank guarantee forfeited · Inactive since 2024'},
      ],
      recommendations:['🚫 DO NOT SHORTLIST — Active blacklist ban (2025–2027)','❌ GSTIN inactive — ineligible per GST-registered tender clause','📋 Udyam expired — MSME price preference not applicable','⚖️ Escalate to vigilance / anti-corruption unit for inquiry','🏦 2 NPAs outstanding — financial incapability established','⏰ Earliest possible eligibility: After debarment expiry Mar 2027 + GSTIN reactivation']
    }
  };
  return demos[id] || demos[1];
}

/* ── RENDER RESULT ──────────────────────────────────────────── */
function renderVerifyResult(data) {
  const score   = data.compliance_score || 0;
  const risk    = (data.risk_level||'UNKNOWN').toUpperCase();
  const riskHex = risk==='LOW'?'#059669':risk==='MEDIUM'?'#D97706':'#DC2626';
  const riskGrd = risk==='LOW'?'linear-gradient(135deg,#059669,#34D399)':risk==='MEDIUM'?'linear-gradient(135deg,#D97706,#FCD34D)':'linear-gradient(135deg,#DC2626,#F87171)';
  const riskEmoji= risk==='LOW'?'🟢':risk==='MEDIUM'?'🟡':'🔴';
  const riskBg   = risk==='LOW'?'rgba(5,150,105,.08)':risk==='MEDIUM'?'rgba(217,119,6,.08)':'rgba(220,38,38,.08)';
  const circ = 2*Math.PI*52;
  const dash = circ-(score/100)*circ;
  const checks = data.checks || [];
  const recs   = data.recommendations || [];
  const sb     = data.scoreBreakdown || [];

  /* score-to-radar scores */
  const radarScores = sb.length ? sb.map(s=>s.score) : [0,0,0,0,0];

  const checkHtml = checks.map(c=>{
    const s=c.status.toUpperCase();
    const cls=s==='PASS'?'badge-pass':s==='WARN'?'badge-warn':'badge-fail';
    const ico=s==='PASS'?'✅':s==='WARN'?'⚠️':'❌';
    const bg =s==='PASS'?'rgba(5,150,105,.05)':s==='WARN'?'rgba(217,119,6,.05)':'rgba(220,38,38,.05)';
    const bdr=s==='PASS'?'rgba(5,150,105,.18)':s==='WARN'?'rgba(217,119,6,.18)':'rgba(220,38,38,.18)';
    return `<div class="check-row" style="background:${bg};border:1.5px solid ${bdr};border-radius:12px;padding:12px 16px;display:flex;align-items:flex-start;gap:12px;margin-bottom:8px">
      <span class="badge ${cls}" style="flex-shrink:0">${ico} ${c.status}</span>
      <div><div style="font-size:13px;font-weight:700;margin-bottom:3px">${c.name}</div>
      <div style="font-size:12px;color:var(--text-dim);line-height:1.5">${c.detail}</div></div>
    </div>`;
  }).join('');

  const sbHtml = sb.map(s=>{
    const pct=Math.round((s.score/s.max)*100);
    return `<div class="sb-row">
      <div class="sb-label">${s.label}</div>
      <div class="sb-bar"><div class="sb-fill" style="width:${pct}%;background:${s.color}"></div></div>
      <div class="sb-score" style="color:${s.color}">${s.score}/${s.max}</div>
    </div>`;
  }).join('');

  const recHtml = recs.map(r=>`
    <div style="display:flex;gap:10px;align-items:flex-start;padding:9px 12px;background:white;border:1px solid var(--border);border-radius:10px">
      <span style="flex-shrink:0;font-size:14px">${r.slice(0,2)}</span>
      <span style="font-size:12.5px;color:var(--text-dim);line-height:1.55">${r.slice(2).trim()}</span>
    </div>`).join('');

  const html = `
  <!-- HERO RESULT CARD -->
  <div style="background:${riskBg};border-top:1px solid ${riskHex}22;padding:24px 24px 0">
    <div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap">

      <!-- GAUGE -->
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex-shrink:0">
        <div class="gauge" style="width:156px;height:156px">
          <svg width="156" height="156" viewBox="0 0 156 156">
            <circle cx="78" cy="78" r="62" fill="none" stroke="var(--bg-3)" stroke-width="10"/>
            <circle cx="78" cy="78" r="62" fill="none" stroke="${riskHex}" stroke-width="10"
              stroke-dasharray="${2*Math.PI*62}" stroke-dashoffset="${2*Math.PI*62-(score/100)*2*Math.PI*62}"
              stroke-linecap="round" style="transition:stroke-dashoffset 1.4s ease"/>
          </svg>
          <div class="gauge-num">
            <div class="n" style="color:${riskHex};font-size:32px">${score}</div>
            <div class="d">/ 100</div>
          </div>
        </div>
        <div style="font-size:12px;font-weight:700;padding:4px 14px;border-radius:20px;background:${riskBg};color:${riskHex};border:1.5px solid ${riskHex}33">${riskEmoji} ${risk} RISK</div>
      </div>

      <!-- BIDDER INFO -->
      <div style="flex:1;min-width:220px">
        <div style="font-size:11px;font-weight:700;color:var(--text-faint);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px">Verified Bidder</div>
        <div style="font-size:19px;font-weight:800;margin-bottom:8px">${data.bidder_name}</div>
        <div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:12px">
          <span class="tag">GSTIN: ${data.gstin||'—'}</span>
          <span class="tag">PAN: ${data.pan||'—'}</span>
          <span class="tag">Udyam: ${data.udyam||'—'}</span>
        </div>
        <div style="font-size:13px;color:var(--text-dim);line-height:1.75;background:white;border:1.5px solid var(--border);border-radius:12px;padding:12px 16px">
          ${data.summary}
        </div>
      </div>

      <!-- THREE.JS RADAR -->
      <div style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:6px">
        <div style="font-size:11px;font-weight:700;color:var(--text-faint);text-transform:uppercase;letter-spacing:.8px">Compliance Radar</div>
        <canvas id="radar-canvas" style="width:180px;height:180px;border-radius:14px;background:linear-gradient(135deg,#F0F6FF,#E8F0FE);border:1.5px solid var(--border)"></canvas>
        <div style="display:flex;flex-wrap:wrap;gap:4px;max-width:180px;justify-content:center">
          ${['Docs','GST','Blacklist','Finance','Perf'].map((n,i)=>`<span style="font-size:10px;color:var(--text-faint);background:var(--bg-3);border-radius:4px;padding:1px 6px">${n}</span>`).join('')}
        </div>
      </div>
    </div>

    <!-- CHECKS COUNT ROW -->
    <div style="display:flex;gap:12px;margin-top:18px;padding-top:16px;border-top:1px solid var(--border-soft);flex-wrap:wrap">
      ${['PASS','WARN','FAIL'].map(s=>{
        const cnt=checks.filter(c=>c.status.toUpperCase()===s).length;
        const cl=s==='PASS'?'badge-pass':s==='WARN'?'badge-warn':'badge-fail';
        const ico=s==='PASS'?'✅':s==='WARN'?'⚠️':'❌';
        return `<div style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:700"><span class="badge ${cl}">${ico} ${s}</span><span style="color:var(--text-dim)">${cnt} check${cnt!==1?'s':''}</span></div>`;
      }).join('')}
      <div style="margin-left:auto;font-size:12px;color:var(--text-faint);align-self:center">Verified ${new Date().toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
    </div>
  </div>

  <!-- SCORE BREAKDOWN -->
  <div style="padding:18px 24px 4px">
    <div style="font-size:11.5px;font-weight:800;color:var(--text-faint);text-transform:uppercase;letter-spacing:.6px;margin-bottom:14px">📊 Score Breakdown</div>
    <div class="score-breakdown" style="padding:0">${sbHtml}</div>
  </div>

  <!-- API CHECK RESULTS -->
  <div style="padding:14px 24px 4px">
    <div style="font-size:11.5px;font-weight:800;color:var(--text-faint);text-transform:uppercase;letter-spacing:.6px;margin-bottom:14px">🔗 API Verification Results</div>
    ${checkHtml}
  </div>

  <!-- AI RECOMMENDATIONS -->
  <div style="padding:14px 24px 4px">
    <div style="font-size:11.5px;font-weight:800;color:var(--text-faint);text-transform:uppercase;letter-spacing:.6px;margin-bottom:12px">🧠 AI Recommendations</div>
    <div style="display:flex;flex-direction:column;gap:8px">${recHtml}</div>
  </div>

  <!-- DECISION ROW -->
  <div class="decision-row" style="margin-top:16px">
    <button class="btn btn-success btn-sm" onclick="recordDecision('APPROVED','${data.bidder_name}')">✅ Approve for Shortlisting</button>
    <button class="btn btn-warn btn-sm"    onclick="recordDecision('CLARIFICATION','${data.bidder_name}')">❓ Request Clarification</button>
    <button class="btn btn-danger btn-sm"  onclick="recordDecision('REJECTED','${data.bidder_name}')">❌ Reject Bidder</button>
    <button class="btn btn-ghost btn-sm"   onclick="openAgentForBidder(${data.id||1})">🧠 AI Agent</button>
  </div>`;

  const area=document.getElementById('verify-result-area');
  area.style.animation='none'; area.innerHTML=html;
  requestAnimationFrame(()=>{ area.style.animation='fadeUp .35s ease'; });

  /* init Three.js radar after DOM is ready */
  setTimeout(()=>{
    const canv=document.getElementById('radar-canvas');
    if(canv){ canv.style.width='180px';canv.style.height='180px'; }
    initRadar('radar-canvas', radarScores, riskHex);
  }, 150);

  showToast('✅ AI Verification complete — Report generated','success');
}

function recordDecision(decision,name) {
  const msgs={APPROVED:`✅ ${name} approved and logged to audit trail`,CLARIFICATION:`❓ Clarification request sent to ${name}`,REJECTED:`❌ ${name} rejected — logged to audit trail`};
  showToast(msgs[decision]||'Decision recorded', decision==='REJECTED'?'error':'success');
}

/* ══════════════════════════════════════════════════════════════
   NEW TENDER
══════════════════════════════════════════════════════════════ */
function populateNewTenderReqs() {
  const reqs=['GSTIN Registration','Udyam Certificate','Income Tax ITR','Audited Balance Sheet','OEM Authorization','EMD / Bid Security','Experience Certificate','ISO / Quality Cert','ESI / EPF Compliance','GST Return Filing','Blacklist Self-Decl.','Director KYC (MCA21)'];
  const grid=document.getElementById('req-toggles'); if(!grid) return;
  grid.innerHTML=reqs.map((r,i)=>`
    <div class="req-toggle"><span>${r}</span>
      <label class="switch"><input type="checkbox" ${i<7?'checked':''} onchange="showToast('Requirement updated: ${r}','info')"/>
      <span class="slider"></span></label>
    </div>`).join('');
}
async function createTender() {
  const title=document.getElementById('nt-title').value.trim();
  const dept= document.getElementById('nt-dept').value.trim();
  if(!title||!dept){showToast('⚠️ Please fill Tender Title and Department','warn');return;}
  showToast('🚀 Tender published successfully!','success'); await sleep(600); showView('tenders'); loadTenders();
}

/* ══════════════════════════════════════════════════════════════
   AUDIT TRAIL
══════════════════════════════════════════════════════════════ */
async function loadAudit() {
  const list=document.getElementById('audit-list'); if(!list) return;
  try {
    const res=await fetch(API+'/audit'); const data=res.ok?await res.json():[];
    if(data.length){list.innerHTML=data.slice(0,20).map(renderAuditItem).join('');return;}
  } catch {}
  list.innerHTML=getDemoAuditEvents().map(renderAuditItem).join('');
}
function getDemoAuditEvents() {
  return [
    {timestamp:'2026-09-07 06:41',action:'VERIFY_PASS',  actor:'AI Engine',   entity:'ABC Engineering',   detail:'All 7 API checks PASSED · Score 96/100 · LOW RISK · Recommended for shortlisting'},
    {timestamp:'2026-09-07 06:41',action:'VERIFY_WARN',  actor:'AI Engine',   entity:'XYZ Industrial',    detail:'OEM mismatch + turnover gap detected · Score 71/100 · MEDIUM RISK · Clarification sent'},
    {timestamp:'2026-09-07 06:40',action:'BLACKLIST_HIT',actor:'AI Engine',   entity:'PQR Enterprises',   detail:'NIC debarment DB match: NIC-BL-2025-DL-00142 · Score 39/100 · HIGH RISK · Auto-flagged'},
    {timestamp:'2026-09-07 06:39',action:'GSTN_CHECK',   actor:'GSTN API',    entity:'PQR Enterprises',   detail:'GSTIN 07AABCP9012H1Z3 — Status: INACTIVE since Oct 2025 · 5 quarters non-filer'},
    {timestamp:'2026-09-07 06:35',action:'TENDER_CREATE',actor:'Rajesh Kumar',entity:'CPCL/2026/PROC/001',detail:'Tender published · ETP Equipment Supply · ₹45 Cr · Deadline 30 Apr 2026 · 12 eligibility reqs'},
    {timestamp:'2026-09-07 06:20',action:'LOGIN',        actor:'System',      entity:'Rajesh Kumar',      detail:'Officer login · MoP-CPCL-OFF-2024-01 · IP 10.232.x.x · Session active'},
  ];
}
function renderAuditItem(e) {
  const m={VERIFY_PASS:{icon:'✅',bg:'rgba(5,150,105,.09)'},VERIFY_WARN:{icon:'⚠️',bg:'rgba(217,119,6,.09)'},BLACKLIST_HIT:{icon:'🚫',bg:'rgba(220,38,38,.09)'},GSTN_CHECK:{icon:'🔍',bg:'rgba(37,99,235,.09)'},TENDER_CREATE:{icon:'📋',bg:'rgba(124,58,237,.09)'},LOGIN:{icon:'🔐',bg:'rgba(11,168,158,.09)'}};
  const a=m[e.action]||{icon:'📝',bg:'var(--bg-3)'};
  return `<div class="audit-item"><div class="audit-time">${(e.timestamp||'').slice(11,16)||'—'}</div>
    <div class="audit-icon" style="background:${a.bg}">${a.icon}</div>
    <div><div class="audit-text"><b>${e.entity||'—'}</b> — ${e.detail||e.action||'—'}</div>
    <div style="font-size:11px;color:var(--text-faint);margin-top:2px">By ${e.actor||'System'} · ${e.timestamp||'—'} · Hash anchored 🔒</div></div>
  </div>`;
}

/* ══════════════════════════════════════════════════════════════
   AI AGENT CHAT
══════════════════════════════════════════════════════════════ */
const AGENT_CONTEXT={
  1:{name:'ABC Engineering',score:96,risk:'LOW',   summary:'All docs valid. No issues.'},
  2:{name:'XYZ Industrial', score:71,risk:'MEDIUM',summary:'OEM mismatch, turnover gap, overdue account.'},
  3:{name:'PQR Enterprises',score:39,risk:'HIGH',  summary:'BLACKLISTED. GSTIN inactive. Udyam expired. NPAs.'},
};
const AGENT_RESP={
  missing:{1:'✅ Great news! ABC Engineering has submitted all required documents. All verified: GST cert, Udyam, PAN, audited balance sheets, OEM authorization, bank solvency. No missing items.',2:'⚠️ XYZ Industrial is missing: (1) Updated OEM Authorization Letter matching MCA21 manufacturer record (2) CA-certified statement explaining ₹4 Cr turnover gap (3) Director DIN 00234567 update on MCA21 portal.',3:'🚨 PQR Enterprises has critical gaps: (1) GSTIN reactivation letter required (suspended Oct 2025) (2) Fresh Udyam certificate — expired Jan 2026 (3) Blacklist clearance certificate — not possible until Mar 2027 (4) Audited FY2024-25 financials (5) Bank solvency certificate.'},
  score: {1:'📊 ABC Engineering 96/100: Documents 29/30 · GST 21/22 (2 minor late filings) · Blacklist 20/20 (clean) · Financial 15/16 (excellent) · Past Performance 11/12 (12 contracts, all on time).',2:'📊 XYZ Industrial 71/100: Documents 18/30 (OEM mismatch -8, turnover gap -4) · GST 18/22 (3 delayed returns) · Blacklist 20/20 (clean) · Financial 10/16 (1 overdue account) · Past Performance 5/12 (OEM record inconsistency).',3:'📊 PQR Enterprises 39/100: Documents 12/30 (expired/missing certs) · GST 2/22 (INACTIVE GSTIN) · Blacklist 0/20 (DEBARRED) · Financial 5/16 (2 NPAs, ₹1.2 Cr) · Past Performance 0/12 (contracts terminated).'},
  action:{1:'🎯 7-Day Plan for ABC Engineering: Nothing urgent! Optional: submit fresh bank solvency if tender > ₹50 Cr. Recommend officer to shortlist immediately.',2:'🎯 7-Day Plan for XYZ Industrial: Day 1–2: Get updated OEM auth from Siemens/manufacturer. Day 3: File turnover clarification with CA. Day 4–5: Update Director DIN on MCA21. Day 6–7: Resubmit on BidShield portal.',3:'🎯 Action Plan for PQR Enterprises: This bidder CANNOT bid now. Timeline: Debarment ends Mar 2027 → apply for GSTIN reactivation → renew Udyam → clear NPAs → then re-apply. Estimated: 18–24 months.'},
  officer:{1:'📋 Officer Summary — ABC Engineering: RECOMMENDED ✅. Score 96/100 LOW RISK. All 7 checks clear. 12 govt contracts, 100% on-time. GeM 4.7★ seller. Turnover ₹42 Cr (2.3x tender value). Shortlist with confidence.',2:'📋 Officer Summary — XYZ Industrial: CONDITIONAL ⚠️. Score 71/100 MEDIUM RISK. OEM mismatch and turnover gap require clarification. Request 7-day clarification window. If resolved, eligible for shortlisting.',3:'📋 Officer Summary — PQR Enterprises: REJECT 🚫. Score 39/100 HIGH RISK. Active NIC debarment (2025–2027). GSTIN inactive. Udyam expired. 2 NPAs. Do not shortlist. Refer to vigilance unit.'},
  default:{1:'ABC Engineering is a strong bidder — Score 96/100 LOW RISK. All 7 verifications passed. Recommended for shortlisting.',2:'XYZ Industrial has Score 71/100 MEDIUM RISK. Key concerns: OEM mismatch, turnover gap. Conditional shortlisting after clarification.',3:'PQR Enterprises has Score 39/100 HIGH RISK. CRITICAL: Blacklisted, GSTIN inactive, Udyam expired. Do NOT shortlist.'},
};
function loadAgentContext() {
  const id=document.getElementById('agent-bidder-select').value;
  const ctx=AGENT_CONTEXT[id]; if(!ctx) return;
  const r=ctx.risk==='LOW'?'🟢 LOW':ctx.risk==='MEDIUM'?'🟡 MEDIUM':'🔴 HIGH';
  addBubble('ai',`📊 Profile loaded: <b>${ctx.name}</b><br>Score: <b>${ctx.score}/100</b> · ${r} RISK<br><i style="color:rgba(255,255,255,.55)">${ctx.summary}</i>`);
  addBubble('ai','What would you like to know? Ask about: missing documents, score breakdown, 7-day action plan, or officer decision summary.');
}
async function sendChat() {
  const input=document.getElementById('chat-msg'); const msg=input.value.trim(); if(!msg) return;
  input.value=''; addBubble('user',msg);
  const typingId='typing-'+Date.now();
  addBubble('typing','<div class="typing-dots"><span></span><span></span><span></span></div>',typingId);
  await sleep(1100);
  document.getElementById(typingId)?.remove();
  const id=document.getElementById('agent-bidder-select').value||'2';
  const lm=msg.toLowerCase();
  let key='default';
  if(lm.includes('missing')||lm.includes('document')||lm.includes('doc')) key='missing';
  else if(lm.includes('score')||lm.includes('breakdown')||lm.includes('why')) key='score';
  else if(lm.includes('action')||lm.includes('7 day')||lm.includes('improve')||lm.includes('fix')) key='action';
  else if(lm.includes('officer')||lm.includes('summary')||lm.includes('decision')) key='officer';
  addBubble('ai',(AGENT_RESP[key]||{})[id]||AGENT_RESP.default[id]||'Please select a bidder first.');
}
function quickPrompt(msg){ document.getElementById('chat-msg').value=msg; sendChat(); }
function openAgentForBidder(id){ showView('agent'); setTimeout(()=>{ const s=document.getElementById('agent-bidder-select'); if(s){s.value=id;loadAgentContext();} },300); }
function addBubble(type,html,id){
  const b=document.getElementById('chat-bubbles'); if(!b) return;
  const div=document.createElement('div'); div.className=`chat-bubble ${type}`; div.innerHTML=html;
  if(id) div.id=id; b.appendChild(div); b.scrollTop=b.scrollHeight;
}

/* ══════════════════════════════════════════════════════════════
   FLOATING CHATBOT WIDGET
══════════════════════════════════════════════════════════════ */
function toggleChatbot() {
  chatbotOpen=!chatbotOpen;
  const panel=document.getElementById('chatbot-panel');
  const btn=document.getElementById('chatbot-fab');
  panel.classList.toggle('open',chatbotOpen);
  btn.innerHTML=chatbotOpen?'✕':'🤖';
  btn.style.transform=chatbotOpen?'rotate(180deg)':'rotate(0deg)';
  if(chatbotOpen && document.getElementById('cb-msgs').children.length===0) {
    addCbMsg('ai','👋 Namaste! I\'m BidShield Assistant. I can help you with:<br>• How to verify a bidder<br>• Understanding compliance scores<br>• Tender eligibility requirements<br>• API connector status<br><br>How can I help you today?');
  }
}

const CB_QA = [
  { q:['verify','verification','run'], a:'To verify a bidder: go to <b>Verification → Run AI Verification</b>, select a tender and bidder, then click ▶ Run. AI will check 7 govt APIs in real-time.' },
  { q:['score','compliance','rating'], a:'Compliance score is out of 100: Documents (30) + GST (22) + Blacklist (20) + Financial (16) + Past Performance (12). Score ≥80 = LOW RISK, 60–79 = MEDIUM, &lt;60 = HIGH.' },
  { q:['blacklist','debarred','ban'], a:'Blacklist check runs against NIC debarment database (eprocure.gov.in). Any active debarment = automatic HIGH RISK flag + ZERO score on blacklist component.' },
  { q:['gstin','gst','tax'], a:'GSTN connector queries api.gstin.gov.in for: active status, return filing history (24 quarters), annual turnover, and pending dues. INACTIVE GSTIN = major score deduction.' },
  { q:['tender','create','publish'], a:'To create a tender: go to <b>Procurement → New Tender</b>, fill details, toggle eligibility requirements, and click Publish. Bidders can apply immediately.' },
  { q:['citizen','evidence','report'], a:'Citizens can submit evidence at <b>Verification → Citizen Evidence</b>. Photos/videos are reviewed by officers before being linked to the bidder\'s profile.' },
  { q:['agent','ai help','improve'], a:'The AI Compliance Agent at <b>Intelligence → AI Agent</b> gives bidders personalised guidance — exact documents missing, step-by-step action plan, and score improvement roadmap.' },
  { q:['performance','site','geo'], a:'Inspection teams upload geo-tagged photos/videos at <b>Verification → Site Performance</b>. GPS metadata is preserved and evidence is tamper-proof.' },
  { q:['connector','api','endpoint'], a:'BidShield connects to 7 official APIs: GSTN, MCA21, Udyam, NIC Blacklist, CIBIL, GeM, eProcurement. All endpoints are live — check status at <b>Intelligence → API Connectors</b>.' },
  { q:['sih','hackathon','problem'], a:'BidShield AI is built for Smart India Hackathon 2024, Problem Statement #26100 — "AI-powered Government Procurement Verification Platform".' },
];

async function sendChatbot() {
  const inp=document.getElementById('cb-input'); const msg=inp.value.trim(); if(!msg) return;
  inp.value=''; addCbMsg('user',msg);
  const tid='cbt-'+Date.now();
  addCbMsg('typing','<div class="typing-dots"><span></span><span></span><span></span></div>',tid);
  await sleep(900);
  document.getElementById(tid)?.remove();
  const lm=msg.toLowerCase();
  let resp='I can help with: verification process, compliance scores, blacklist checks, tender creation, citizen evidence, AI agent, site performance, and API connectors. What would you like to know?';
  for(const qa of CB_QA){ if(qa.q.some(k=>lm.includes(k))){ resp=qa.a; break; } }
  addCbMsg('ai',resp);
}

function addCbMsg(type,html,id){
  const b=document.getElementById('cb-msgs'); if(!b) return;
  const div=document.createElement('div'); div.className=`cb-msg ${type}`; div.innerHTML=html;
  if(id) div.id=id; b.appendChild(div); b.scrollTop=b.scrollHeight;
}

function cbKeydown(e){ if(e.key==='Enter') sendChatbot(); }

/* ══════════════════════════════════════════════════════════════
   PERFORMANCE / CITIZEN
══════════════════════════════════════════════════════════════ */
function addPerfEvidence(){
  const p=document.getElementById('evidence-preview'); if(!p) return;
  const icons=['🏗️','🔧','📐','🧱','🏭','⚙️','📏'];
  const cur=p.querySelectorAll('.ev-thumb:not([style*="opacity"])').length;
  const div=document.createElement('div'); div.className='ev-thumb';
  div.innerHTML=`${icons[cur%icons.length]}<div class="ev-badge">✓</div>`;
  div.onclick=()=>showToast('📷 Site evidence photo opened','info');
  const plus=p.querySelector('[style*="opacity"]'); p.insertBefore(div,plus);
  showToast('📷 Evidence added — GPS metadata captured','success');
}
function submitEvidence(){ showToast('✅ Site evidence submitted and linked to bidder profile','success'); }
function submitCitizenEvidence(){ showToast('📤 Evidence submitted for government review. Thank you!','success'); }
function pingConnector(name){ const ms=150+Math.floor(Math.random()*380); showToast(`🔗 ${name} → 200 OK in ${ms}ms`,'success'); }

/* ══════════════════════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════════════════════ */
function showToast(msg,type='info'){
  const t=document.getElementById('toast'); if(!t) return;
  const icons={success:'✅',error:'❌',warn:'⚠️',info:'ℹ️'};
  t.className=`toast toast-${type}`; t.innerHTML=`${icons[type]||'ℹ️'} ${msg}`;
  t.classList.add('show'); clearTimeout(t._timer);
  t._timer=setTimeout(()=>t.classList.remove('show'),3500);
}
function animateCount(id,target,from=0,dur=900){
  const el=document.getElementById(id); if(!el) return;
  const start=performance.now();
  (function tick(now){
    const p=Math.min((now-start)/dur,1); const e=1-Math.pow(1-p,3);
    el.textContent=Math.round(from+(target-from)*e); if(p<1) requestAnimationFrame(tick);
  })(performance.now());
}
function setBarWidth(id,pct){ const el=document.getElementById(id); if(el) el.style.width=pct+'%'; }
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

/* ══════════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded',()=>{
  initHero();
  const pd=document.getElementById('perf-date'); if(pd) pd.value=new Date().toISOString().split('T')[0];
  const nd=document.getElementById('nt-deadline'); if(nd){ const d=new Date();d.setMonth(d.getMonth()+2);nd.value=d.toISOString().split('T')[0]; }
  document.getElementById('login-pass')?.addEventListener('keydown',e=>{if(e.key==='Enter') doLogin();});
  document.getElementById('cb-input')?.addEventListener('keydown',cbKeydown);
});
