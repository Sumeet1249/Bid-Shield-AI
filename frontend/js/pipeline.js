/**
 * Verification Pipeline Runner
 * Controls the 6-stage animated pipeline and real-time streaming API log.
 */

const PIPELINE_STEPS = [
  { name: 'OCR', icon: '🧾' },
  { name: 'Text Extraction', icon: '📝' },
  { name: 'Entity Extraction', icon: '🔎' },
  { name: 'Field Validation', icon: '✅' },
  { name: 'Cross-Verification', icon: '🌐' },
  { name: 'Compliance Engine', icon: '⚙️' }
];

function buildPipelineUI() {
  const container = document.getElementById('pipeline-steps');
  if (!container) return;
  container.innerHTML = PIPELINE_STEPS.map((s, i) =>
    `<div class="pipe-step" id="step-${i}"><span class="pipe-icon">${s.icon}</span>${s.name}</div>` +
    (i < PIPELINE_STEPS.length - 1 ? '<span class="pipe-arrow">→</span>' : '')
  ).join('');
}

function runVerificationPipeline(bidder, onComplete) {
  const runBtn = document.getElementById('run-btn');
  if (runBtn) {
    runBtn.disabled = true;
    runBtn.textContent = 'Running verification…';
  }

  const log = document.getElementById('api-log');
  if (log) {
    log.style.display = 'block';
    log.innerHTML = '';
  }

  buildPipelineUI();

  const totalSteps = PIPELINE_STEPS.length;
  let currentStep = 0;

  const isABC = bidder.key === 'abc' || bidder.company_name?.includes('ABC');
  const isXYZ = bidder.key === 'xyz' || bidder.company_name?.includes('XYZ');
  const isPQR = bidder.key === 'pqr' || bidder.company_name?.includes('PQR');

  const gstStatus = isPQR ? 'INACTIVE' : 'ACTIVE';
  const gstClass = isPQR ? 'err' : 'ok';
  const mcaStatus = isPQR ? 'name variant flagged (PQR Enterprises vs P.Q.R. Enterprises Pvt Ltd)' : 'record consistent';
  const mcaClass = isPQR ? 'warn' : 'ok';
  const epfoStatus = isPQR ? 'NOT REGISTERED' : 'COMPLIANT';
  const epfoClass = isPQR ? 'err' : 'ok';
  const oemStatus = isXYZ ? 'MISMATCH (Claimed: Hitachi Power vs Issuer: Hitachi Energy)' : (isPQR ? 'DOCUMENT MISSING' : 'VALIDATED');
  const oemClass = (isXYZ || isPQR) ? 'err' : 'ok';
  const blacklistStatus = isPQR ? 'ACTIVE DEBARMENT FOUND (2024-2027)' : 'CLEAR';
  const blacklistClass = isPQR ? 'err' : 'ok';

  const apiLines = [
    `<div><span class="k">POST /api/verify/gst</span> {"gstin":"${bidder.gstin || '19ABCDE1234F1Z5'}"}</div>`,
    `<div>→ <span class="${gstClass}">${gstStatus}</span>, periodic returns analyzed</div>`,
    `<div><span class="k">POST /api/verify/pan</span> {"pan":"${bidder.pan || 'ABCDE1234F'}"}</div>`,
    `<div>→ <span class="ok">VALID</span>, entity name matched with CBDT</div>`,
    `<div><span class="k">POST /api/verify/mca</span> {"cin":"${bidder.cin || 'U29100TN2015PTC098211'}"}</div>`,
    `<div>→ MCA21 registry: <span class="${mcaClass}">${mcaStatus}</span></div>`,
    `<div><span class="k">POST /api/verify/epfo</span> {"company":"${bidder.company_name || 'Bidder'}"}</div>`,
    `<div>→ EPFO establishment check: <span class="${epfoClass}">${epfoStatus}</span></div>`,
    `<div><span class="k">POST /api/verify/oem</span> {"oem_authorization":"check"}</div>`,
    `<div>→ Manufacturer authorization: <span class="${oemClass}">${oemStatus}</span></div>`,
    `<div><span class="k">POST /api/verify/blacklist</span> {"identifier":"${bidder.pan || 'PAN'}"}</div>`,
    `<div>→ GeM Debarment Registry: <span class="${blacklistClass}">${blacklistStatus}</span></div>`
  ];

  function tick() {
    if (currentStep > 0) {
      const prev = document.getElementById(`step-${currentStep - 1}`);
      if (prev) prev.classList.replace('active', 'done');
    }

    if (currentStep < totalSteps) {
      const cur = document.getElementById(`step-${currentStep}`);
      if (cur) cur.classList.add('active');

      if (log && currentStep >= 2) {
        const lineIdx = (currentStep - 2) * 2;
        const chunk = apiLines.slice(lineIdx, lineIdx + 2).join('');
        log.innerHTML += chunk;
        log.scrollTop = log.scrollHeight;
      }

      currentStep++;
      setTimeout(tick, 480);
    } else {
      const last = document.getElementById(`step-${totalSteps - 1}`);
      if (last) last.classList.replace('active', 'done');

      if (runBtn) {
        runBtn.textContent = 'Re-run verification';
        runBtn.disabled = false;
      }

      if (typeof onComplete === 'function') {
        onComplete();
      }
    }
  }

  tick();
}
