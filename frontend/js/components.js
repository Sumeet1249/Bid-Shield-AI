/**
 * BidShield AI UI Components
 */

function badge(status) {
  const s = (status || '').toLowerCase();
  if (s === 'pass') return '<span class="badge badge-pass">✓ PASS</span>';
  if (s === 'warn' || s === 'warning') return '<span class="badge badge-warn">⚠ WARNING</span>';
  return '<span class="badge badge-fail">✕ FAIL</span>';
}

function animateNumber(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let cur = 0;
  const step = Math.max(1, Math.round(target / 25));
  const t = setInterval(() => {
    cur += step;
    if (cur >= target) {
      cur = target;
      clearInterval(t);
    }
    el.textContent = cur;
  }, 25);
}

function renderScoreGauge(score, risk) {
  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (score / 100) * circumference;
  const circle = document.getElementById('gauge-circle');
  if (circle) {
    circle.style.stroke = score >= 85 ? '#33D17E' : (score >= 60 ? '#F5A623' : '#F2555A');
    circle.setAttribute('stroke-dasharray', circumference);
    setTimeout(() => {
      circle.style.transition = 'stroke-dashoffset 1s ease';
      circle.setAttribute('stroke-dashoffset', offset);
    }, 50);
  }
  animateNumber('gauge-num', score);

  const rlabel = document.getElementById('risk-label');
  if (rlabel) {
    rlabel.textContent = risk + ' RISK';
    rlabel.className = 'mono risk-' + risk.toLowerCase();
  }
}

function renderMatrixTable(matrix) {
  const tbody = document.getElementById('matrix-rows');
  if (!tbody) return;
  tbody.innerHTML = matrix.map(r => `
    <tr>
      <td><b>${r[0]}</b></td>
      <td>${r[1]}</td>
      <td>${badge(r[2])}</td>
      <td style="color:var(--text-dim);">${r[3]}</td>
    </tr>
  `).join('');
}

function renderDiscrepancies(discrepancies) {
  const dbody = document.getElementById('discrepancy-body');
  if (!dbody) return;
  if (!discrepancies || discrepancies.length === 0) {
    dbody.innerHTML = `<div style="padding:16px 18px; color:var(--text-dim); font-size:12.5px;">✅ No discrepancies detected across submitted documents and portal records.</div>`;
  } else {
    dbody.innerHTML = discrepancies.map(d => `
      <div class="discrepancy-box">
        <h4>⚠ DISCREPANCY DETECTED — ${d.label}</h4>
        <div class="row"><span>Source A:</span><b>${d.a}</b></div>
        <div class="row"><span>Source B:</span><b>${d.b}</b></div>
        <div class="row"><span>AI Confidence:</span><b style="color:var(--teal);">${d.conf}</b></div>
      </div>
    `).join('');
  }
}

function renderRiskIndicators(risks) {
  const el = document.getElementById('risk-indicators');
  if (!el) return;
  el.innerHTML = (risks || []).map(r => `<span class="risk-pill">${r}</span>`).join('');
}

function renderExplainChain(steps) {
  const el = document.getElementById('explain-chain');
  if (!el) return;
  el.innerHTML = (steps || []).map((step, idx) => `
    <div class="chain-step"><span class="chain-dot"></span>${step}</div>
    ${idx < steps.length - 1 ? '<div class="chain-arrow">↓</div>' : ''}
  `).join('');
}

function renderRecommendation(rec) {
  const el = document.getElementById('rec-box');
  if (!el) return;
  el.innerHTML = `
    <div class="rec-title" style="color:${rec.recTitleColor || 'var(--teal)'}">${rec.recTitle}</div>
    <ul>${(rec.reasons || []).map(r => `<li>${r}</li>`).join('')}</ul>
    <div style="margin-top:12px; padding-top:12px; border-top:1px solid var(--border-soft); font-size:12.5px;">
      <b style="color:var(--text);">Suggested action:</b> <span style="color:var(--text-dim);">${rec.action}</span>
    </div>
  `;
}

function renderAuditList(items) {
  const el = document.getElementById('audit-list');
  if (!el) return;
  el.innerHTML = items.map(a => `
    <div class="audit-item">
      <div class="audit-time">${a[0]}</div>
      <div class="audit-text">${a[1]}</div>
    </div>
  `).join('');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}
