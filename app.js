/* ═══════════════════════════════════════════════════════════════
   FRONTENDGEN — app.js v4.1
   Flow: Prompt → 3 auto-generated designs → Pick → Edit → Download
   ═══════════════════════════════════════════════════════════════ */

// ─── API (xAI Grok) ──────────────────────────────────────────────
// XAI_API_KEY is loaded from config.js (gitignored — see config.example.js)
const XAI_URL = 'https://api.x.ai/v1/chat/completions';
const XAI_MODEL = 'grok-3-latest';
const GALLERY_KEY = 'frontendgen_gallery';

// ─── STATE ───────────────────────────────────────────────────────
const state = {
  prompt: '',
  variants: [],
  selectedVariant: null,
  activeTab: null,
  isGenerating: false,
  isApplying: false,
};



// ─── STYLE DEFINITIONS ──────────────────────────────────────────
const STYLES = [
  {
    id: 'modern-dark',
    label: '🌑 Modern Dark',
    accent: '#7c3aed',
    guide: `
STYLE: Modern Dark  —  premium, award-winning dark UI
- Background: #0a0a0f primary, #0d0d1a sections, glass cards rgba(255,255,255,0.04)
- Accents: purple #7c3aed + cyan #06b6d4, gradient text and buttons (purple→cyan)
- Typography: Inter/system-ui, hero 60-80px, weight 900, letter-spacing -2px
- Cards: 1px solid rgba(255,255,255,0.08), backdrop-filter blur(12px), border-radius 16px
- Buttons: gradient bg, hover translateY(-2px) + box-shadow glow rgba(124,58,237,0.5)
- Animations: CSS fadeInUp on sections, scale hover on cards, glowing CTAs
- Dark footer, full-bleed hero with gradient orb decorations
`,
  },
  {
    id: 'glassmorphism',
    label: '🪟 Glassmorphism',
    accent: '#a78bfa',
    guide: `
STYLE: Glassmorphism  —  deep purple, frosted glass layers
- Background: gradient linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95) fixed
- Add 2-3 floating blur blobs: position absolute, border-radius 50%, filter blur(80px)
- ALL cards & nav: background rgba(255,255,255,0.1), backdrop-filter blur(20px), border 1px solid rgba(255,255,255,0.2)
- Buttons: rgba(255,255,255,0.15), hover rgba(255,255,255,0.25)
- box-shadow: 0 8px 32px rgba(0,0,0,0.37) on all cards
`,
  },
  {
    id: 'minimal-light',
    label: '☀️ Minimal Light',
    accent: '#6366f1',
    guide: `
STYLE: Minimal Light  —  editorial, clean, typography-first
- Background: #ffffff, sections #f8fafc and #f1f5f9
- Accent: indigo #6366f1, used only for CTAs and key highlights
- Cards: white, shadow 0 1px 3px rgba(0,0,0,0.06), border 1px solid #e2e8f0, radius 12px
- Text: #0f172a headings, #475569 body, #94a3b8 muted
- Hero: large 72px+ bold heading on white, generous vertical padding
- Buttons: solid indigo or black outline, no gradients
- Clean editorial feel, lots of whitespace
`,
  },
];



// ─── RANDOM PROMPTS ─────────────────────────────────────────────
const RANDOM_PROMPTS = [
  "Portfolio for a senior UX designer — hero with animated headline, case studies grid, about, skills, contact form",
  "SaaS landing page for 'Clarity AI' — AI analytics tool. Hero, features (with icons), 3-tier pricing, testimonials, FAQ accordion",
  "Restaurant website for an upscale Italian bistro — full-screen hero, menu by category, chef bio, photo gallery, reservations form",
  "E-commerce homepage for a premium sneaker brand — hero with featured drop, product grid, brand story, newsletter signup",
  "Crypto DeFi platform — animated hero with live stats, tokenomics diagram, roadmap timeline, team, community links",
  "Personal finance app landing — feature showcase, animated dashboard mockup, social proof, download CTAs for iOS/Android",
  "Digital marketing agency — big typographic hero, scrolling client logos, services grid, case studies, start project CTA",
  "Online course platform — hero, featured courses grid, instructor bio, student testimonials, free trial signup",
  "Creative photography portfolio — fullscreen image hero, gallery masonry, about, contact with availability calendar",
  "Tech startup landing page — hero with product video section, integration logos, pricing, FAQ, investor section",
];

// ─── INIT ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Prompt counter
  const ta = document.getElementById('main-prompt');
  if (ta) {
    ta.addEventListener('input', () => {
      const n = ta.value.length;
      const el = document.getElementById('prompt-counter');
      if (el) el.textContent = `${n} / 2000`;
    });
  }

  // Keyboard shortcut: Ctrl+Enter on Screen 1
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      const s1 = document.getElementById('screen-prompt');
      if (s1 && s1.classList.contains('active')) startGeneration();
      else if (document.getElementById('screen-editor').classList.contains('active')) applyChanges();
    }
    if (e.key === 'Escape') {
      if (document.body.classList.contains('is-fullscreen')) exitFullscreen();
    }
  });
});

// ─── PROMPT HELPERS ─────────────────────────────────────────────
function fillRandom() {
  const p = RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)];
  setPrompt(p);
  showToast('🎲 Random idea loaded!', 'info');
}

function setPrompt(text) {
  const el = document.getElementById('main-prompt');
  if (!el) return;
  el.value = text;
  el.dispatchEvent(new Event('input'));
  el.focus();
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ─── SCREEN TRANSITIONS ─────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active', 'slide-in', 'slide-out');
  });
  const target = document.getElementById(`screen-${id}`);
  if (target) {
    target.classList.add('active', 'slide-in');
    setTimeout(() => target.classList.remove('slide-in'), 450);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function goBack(screenId) {
  showScreen(screenId);
  if (screenId === 'prompt') {
    state.variants = [];
    state.selectedVariant = null;
    // Reset pick screen
    document.getElementById('template-cards').style.display = 'none';
    document.getElementById('pick-loading').style.display = 'flex';
    stopProgressBar();
  }
}

// ─── PROGRESS BAR ───────────────────────────────────────────────
let _progInterval = null;

function startProgress(speed = 'fast') {
  const bar = document.getElementById('progress-bar');
  const wrap = document.getElementById('progress-wrap');
  if (!bar || !wrap) return;
  wrap.classList.add('visible');
  bar.style.width = '0%';
  bar.style.background = '';
  let pct = 0;
  clearInterval(_progInterval);
  _progInterval = setInterval(() => {
    if (speed === 'fast') {
      if (pct < 40) pct += 4;
      else if (pct < 75) pct += 1.2;
      else if (pct < 88) pct += 0.4;
    } else {
      if (pct < 60) pct += 2;
      else if (pct < 85) pct += 0.6;
    }
    bar.style.width = Math.min(pct, 88) + '%';
  }, 100);
}

function finishProgress(ok = true) {
  clearInterval(_progInterval);
  const bar = document.getElementById('progress-bar');
  const wrap = document.getElementById('progress-wrap');
  if (!bar || !wrap) return;
  bar.style.width = '100%';
  bar.style.background = ok
    ? 'linear-gradient(90deg,#7c3aed,#06b6d4)'
    : '#ef4444';
  setTimeout(() => { wrap.classList.remove('visible'); bar.style.width = '0%'; }, 600);
}

function stopProgressBar() {
  clearInterval(_progInterval);
  const bar = document.getElementById('progress-bar');
  const wrap = document.getElementById('progress-wrap');
  if (bar) bar.style.width = '0%';
  if (wrap) wrap.classList.remove('visible');
}

// ─── GENERATE (SEQUENTIAL, 3 VARIANTS) ──────────────────────────
async function startGeneration() {
  const promptEl = document.getElementById('main-prompt');
  const prompt = promptEl?.value.trim() ?? '';

  if (prompt.length < 8) {
    shake(promptEl);
    showToast('Tell me more — describe what you want to build!', 'error');
    return;
  }
  if (state.isGenerating) return;

  state.prompt = prompt;
  state.isGenerating = true;
  state.variants = [];

  setGenBtnLoading(true);
  startProgress('fast');

  // Show pick screen immediately with skeleton cards
  showScreen('pick');
  const subEl = document.getElementById('pick-sub-prompt');
  if (subEl) subEl.textContent = `"${prompt.length > 80 ? prompt.slice(0, 80) + '\u2026' : prompt}"`;
  document.getElementById('pick-loading').style.display = 'flex';
  document.getElementById('template-cards').style.display = 'none';

  const statusEl = document.getElementById('loading-status-text');
  let lastError = '';

  // Sequential generation — avoids Gemini rate-limits
  for (let i = 0; i < STYLES.length; i++) {
    const style = STYLES[i];
    if (statusEl) {
      statusEl.textContent = `✨ Generating ${i + 1}/${STYLES.length}: ${style.label}...`;
    }
    const result = await generateVariant(prompt, style);
    if (result) {
      state.variants.push(result);
    } else {
      lastError = style.label + ' failed';
    }
    // Small delay between requests to respect rate limits
    if (i < STYLES.length - 1) await sleep(1200);
  }

  if (state.variants.length === 0) {
    finishProgress(false);
    const wasQuota = /quota|RESOURCE_EXHAUSTED/i.test(lastError);
    if (wasQuota) {
      showToast('⚠️ API quota exceeded. Add your own key to continue.', 'error');
      setTimeout(() => promptForKey(), 500);
    } else {
      showToast(`❌ Generation failed: ${lastError}. Check console (F12) for details.`, 'error');
    }
    goBack('prompt');
    state.isGenerating = false;
    setGenBtnLoading(false);
    return;
  }

  finishProgress(true);
  renderTemplateCards(state.variants);
  saveToGallery();
  state.isGenerating = false;
  setGenBtnLoading(false);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateVariant(prompt, style) {
  try {
    const fullPrompt = buildVariantPrompt(prompt, style);
    console.log(`[FrontendGen] Generating: ${style.label}`);

    const res = await fetch(XAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: XAI_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert frontend developer. Output only code blocks, no explanations.' },
          { role: 'user', content: fullPrompt },
        ],
        temperature: 0.85,
        max_tokens: 8192,
        stream: false,
      }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const msg = errBody?.error?.message || errBody?.message || `HTTP ${res.status}`;
      console.error(`[FrontendGen] ${style.id} API error:`, msg, errBody);
      throw new Error(msg);
    }

    const data = await res.json();
    console.log(`[FrontendGen] ${style.label} response received`);

    const rawText = data?.choices?.[0]?.message?.content;
    if (!rawText) {
      console.error(`[FrontendGen] ${style.id} empty response:`, data);
      throw new Error('Empty response from Grok');
    }

    const files = parseCodeBlocks(rawText);
    if (!files['index.html'] || files['index.html'].length < 100) {
      console.error(`[FrontendGen] ${style.id} incomplete HTML, length=${files['index.html']?.length}`);
      throw new Error('Grok returned incomplete HTML');
    }

    const previewHTML = buildPreviewHTML(files);
    console.log(`[FrontendGen] ✅ ${style.label} ready!`);

    return { id: style.id, label: style.label, accent: style.accent, files, previewHTML };

  } catch (err) {
    console.error(`[FrontendGen] ❌ ${style.id} failed:`, err.message, err);
    if (isQuotaError(err.message)) {
      // Signal caller that it's a quota error
      err._quota = true;
    }
    return null;
  }
}

function buildVariantPrompt(userPrompt, style) {
  return `You are an expert frontend developer creating a ${style.label} themed website.

USER REQUEST:
"${userPrompt}"

VISUAL STYLE:
${style.guide}

OUTPUT FORMAT — Return exactly THREE fenced code blocks in this exact order:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Page Title]</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- ALL HTML content here -->
  <script src="script.js" defer><\/script>
</body>
</html>
\`\`\`

\`\`\`css
/* Complete style.css — all styles matching the style guide above */
\`\`\`

\`\`\`javascript
// Complete script.js — scroll effects, animations, interactions
\`\`\`

RULES:
1. REAL CONTENT — write actual text, not placeholder text
2. COMPLETE — include every section the user asked for
3. BEAUTIFUL — premium ${style.label} aesthetic, not generic
4. RESPONSIVE — mobile-first, works 320px to 1920px
5. ANIMATED — smooth CSS transitions + JS scroll effects
6. NO LOREM IPSUM — write real, relevant content
7. Output ONLY the three code blocks, nothing else`;
}

// ─── PARSE CODE BLOCKS ─────────────────────────────────────────
function parseCodeBlocks(text) {
  function extract(lang) {
    const re = new RegExp('```' + lang + '\\s*\\n([\\s\\S]*?)\\n```', 'gi');
    let last = '';
    let m;
    while ((m = re.exec(text)) !== null) last = m[1].trim();
    if (!last) {
      const r2 = new RegExp('```' + lang + '[^\\n]*\\n([\\s\\S]*?)```', 'i');
      const m2 = text.match(r2);
      if (m2) last = m2[1].trim();
    }
    return last;
  }

  let html = extract('html');
  let css = extract('css');
  let js = extract('javascript') || extract('js');

  // Fallback: extract inline style/script from HTML
  if (html && !css) {
    const m = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    if (m) {
      css = m[1].trim();
      html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/i, '<link rel="stylesheet" href="style.css">');
    }
  }
  if (html && !js) {
    const m = html.match(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/i);
    if (m && m[1].trim().length > 10) {
      js = m[1].trim();
      html = html.replace(/<script(?![^>]*src)[^>]*>[\s\S]*?<\/script>/i, '<script src="script.js" defer></script>');
    }
  }

  return {
    'index.html': html || '',
    'style.css': css || '',
    'script.js': js || '',
  };
}

// ─── BUILD PREVIEW HTML ─────────────────────────────────────────
function buildPreviewHTML(files) {
  let html = files['index.html'] || '';
  const css = files['style.css'] || '';
  const js = files['script.js'] || '';

  // Inject CSS
  if (css) {
    const cssTag = `<style>\n${css}\n</style>`;
    if (html.includes('href="style.css"')) {
      html = html.replace(/<link[^>]*href="style\.css"[^>]*>/i, cssTag);
    } else if (html.includes('</head>')) {
      html = html.replace('</head>', `${cssTag}\n</head>`);
    } else {
      html = cssTag + html;
    }
  }

  // Inject JS
  if (js && js.trim().length > 3) {
    const jsTag = `<script>\n${js}\n</script>`;
    if (html.includes('src="script.js"')) {
      html = html.replace(/<script[^>]*src="script\.js"[^>]*>\s*<\/script>/i, jsTag);
    } else if (html.includes('</body>')) {
      html = html.replace('</body>', `${jsTag}\n</body>`);
    } else {
      html += jsTag;
    }
  }

  return html;
}

// ─── RENDER TEMPLATE CARDS ──────────────────────────────────────
function renderTemplateCards(variants) {
  const grid = document.getElementById('template-cards');
  const loading = document.getElementById('pick-loading');
  if (!grid) return;

  grid.innerHTML = variants.map((v, i) => `
    <div class="tpl-card" data-idx="${i}" onclick="selectVariant(${i})" style="--accent:${v.accent}">
      <div class="tpl-card-preview">
        <div class="tpl-card-browser">
          <div class="tpl-card-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
        <iframe
          class="tpl-card-iframe"
          srcdoc="${escapeAttr(v.previewHTML)}"
          sandbox="allow-scripts allow-same-origin"
          scrolling="no"
          title="${v.label} preview"
          loading="lazy"
        ></iframe>
        <div class="tpl-card-overlay">
          <button class="tpl-select-btn">Choose This Design →</button>
        </div>
      </div>
      <div class="tpl-card-footer">
        <span class="tpl-card-label">${v.label}</span>
        <span class="tpl-card-action">Select ▶</span>
      </div>
    </div>
  `).join('');

  loading.style.display = 'none';
  grid.style.display = 'grid';
}

function escapeAttr(html) {
  return html
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
}

// ─── SELECT VARIANT ─────────────────────────────────────────────
function selectVariant(idx) {
  const variant = state.variants[idx];
  if (!variant) return;
  state.selectedVariant = variant;

  // Highlight selection
  document.querySelectorAll('.tpl-card').forEach((c, i) => {
    c.classList.toggle('selected', i === idx);
  });

  // Short delay for visual feedback then open editor
  setTimeout(() => openEditor(variant), 300);
}

function openEditor(variant) {
  // Set editor header
  const nameEl = document.getElementById('editor-tpl-name');
  if (nameEl) nameEl.textContent = variant.label;
  const statusEl = document.getElementById('editor-status');
  if (statusEl) { statusEl.textContent = '● Ready'; statusEl.style.color = '#10b981'; }

  // Set up code tabs
  buildCodeTabs(variant.files);

  // Show preview
  const iframe = document.getElementById('preview-iframe');
  if (iframe) iframe.srcdoc = variant.previewHTML;

  // Build download buttons
  buildDownloadBtns(variant.files);

  showScreen('editor');
}

// ─── CODE TABS ──────────────────────────────────────────────────
const FILE_META = {
  'index.html': { label: 'index.html', lang: 'html' },
  'style.css': { label: 'style.css', lang: 'css' },
  'script.js': { label: 'script.js', lang: 'js' },
};

function makeTabId(key) {
  return 'tab-' + key.replace(/[^a-zA-Z0-9]/g, '-');
}

function buildCodeTabs(files) {
  const tabBar = document.getElementById('code-tab-bar');
  if (!tabBar) return;

  const keys = Object.keys(files).filter(k => files[k]?.length > 0);
  tabBar.innerHTML = keys.map(key => {
    const meta = FILE_META[key] || { label: key };
    return `<button class="code-tab-btn" id="${makeTabId(key)}" onclick="showTab('${key}')">${meta.label}</button>`;
  }).join('');

  // Show first tab
  if (keys.length > 0) {
    state.activeTab = keys[0];
    showTab(keys[0]);
  }
}

function showTab(key) {
  state.activeTab = key;

  document.querySelectorAll('.code-tab-btn').forEach(b => {
    b.classList.toggle('active', b.id === makeTabId(key));
  });

  const files = state.selectedVariant?.files || {};
  const code = files[key] || '';
  const el = document.getElementById('code-display');
  if (el) el.textContent = code || `// No content for ${key}`;

  const meta = document.getElementById('code-meta');
  if (meta && code) {
    const lines = code.split('\n').length;
    const ext = key.split('.').pop().toUpperCase();
    meta.textContent = `${ext} · ${lines} lines · ${code.length.toLocaleString()} chars`;
  }
}

// ─── COPY CODE ─────────────────────────────────────────────────
function copyCode() {
  const key = state.activeTab;
  const code = state.selectedVariant?.files?.[key] || '';
  if (!code) { showToast('Nothing to copy!', 'error'); return; }

  const btn = document.getElementById('copy-btn');
  navigator.clipboard.writeText(code)
    .then(() => {
      showToast('📋 Copied to clipboard!', 'success');
      if (btn) { btn.textContent = '✅ Copied'; setTimeout(() => (btn.textContent = '📋 Copy'), 2000); }
    })
    .catch(() => {
      try {
        const ta = document.createElement('textarea');
        ta.value = code;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('📋 Copied!', 'success');
      } catch { showToast('Copy failed', 'error'); }
    });
}

// ─── REFRESH PREVIEW ────────────────────────────────────────────
function refreshPreview() {
  const v = state.selectedVariant;
  if (!v) return;
  const iframe = document.getElementById('preview-iframe');
  if (iframe) {
    iframe.srcdoc = '';
    setTimeout(() => { iframe.srcdoc = v.previewHTML; }, 50);
  }
  showToast('🔄 Preview refreshed', 'info');
}

// ─── OPEN IN NEW TAB ────────────────────────────────────────────
function openInTab() {
  const v = state.selectedVariant;
  if (!v) { showToast('No design selected', 'error'); return; }
  const blob = new Blob([v.previewHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ─── FULLSCREEN ─────────────────────────────────────────────────
let _isFullscreen = false;
function toggleFullscreen() {
  _isFullscreen = !_isFullscreen;
  const panel = document.getElementById('preview-panel');
  const btn = document.getElementById('fullscreen-btn');
  const body = document.body;
  if (panel) panel.classList.toggle('fullscreen', _isFullscreen);
  body.classList.toggle('is-fullscreen', _isFullscreen);
  if (btn) btn.textContent = _isFullscreen ? '⊡ Exit Full' : '⊞ Fullscreen';
}
function exitFullscreen() {
  if (_isFullscreen) toggleFullscreen();
}

// ─── APPLY CHANGES ─────────────────────────────────────────────
async function applyChanges() {
  if (state.isApplying || !state.selectedVariant) return;

  const editEl = document.getElementById('edit-prompt');
  const changes = editEl?.value.trim() ?? '';
  if (!changes) {
    shake(editEl);
    showToast('Describe what you want to change!', 'error');
    return;
  }

  state.isApplying = true;
  setApplyBtnLoading(true);
  startProgress('fast');

  const statusEl = document.getElementById('editor-status');
  if (statusEl) { statusEl.textContent = '● Applying changes...'; statusEl.style.color = '#f59e0b'; }

  try {
    const v = state.selectedVariant;
    const style = STYLES.find(s => s.id === v.id) || STYLES[0];

    const changePrompt = buildChangePrompt(state.prompt, v.files, changes, style);

    const res = await fetch(XAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: XAI_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert frontend developer. Output only code blocks, no explanations.' },
          { role: 'user', content: changePrompt },
        ],
        temperature: 0.7,
        max_tokens: 8192,
        stream: false,
      }),
    });

    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      const msg = e?.error?.message || e?.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }

    const data = await res.json();
    const rawText = data?.choices?.[0]?.message?.content;
    if (!rawText) throw new Error('Empty response from Grok');

    const newFiles = parseCodeBlocks(rawText);
    const newPreview = buildPreviewHTML(newFiles);

    // Merge: only update files that have content
    if (newFiles['index.html']?.length > 100) state.selectedVariant.files['index.html'] = newFiles['index.html'];
    if (newFiles['style.css']?.length > 5) state.selectedVariant.files['style.css'] = newFiles['style.css'];
    if (newFiles['script.js']?.length > 5) state.selectedVariant.files['script.js'] = newFiles['script.js'];
    state.selectedVariant.previewHTML = buildPreviewHTML(state.selectedVariant.files);

    // Refresh preview
    const iframe = document.getElementById('preview-iframe');
    if (iframe) iframe.srcdoc = state.selectedVariant.previewHTML;

    // Refresh code tab
    if (state.activeTab) showTab(state.activeTab);

    // Clear edit input
    if (editEl) editEl.value = '';

    finishProgress(true);
    showToast('✅ Changes applied!', 'success');
    if (statusEl) { statusEl.textContent = '● Updated'; statusEl.style.color = '#10b981'; }

  } catch (err) {
    console.error('[FrontendGen] Apply error:', err);
    finishProgress(false);
    showToast(`❌ ${friendlyError(err.message)}`, 'error');
    if (statusEl) { statusEl.textContent = '● Error'; statusEl.style.color = '#ef4444'; }
  } finally {
    state.isApplying = false;
    setApplyBtnLoading(false);
  }
}

function buildChangePrompt(originalPrompt, currentFiles, changes, style) {
  const htmlSnippet = (currentFiles['index.html'] || '').slice(0, 3000);
  const cssSnippet = (currentFiles['style.css'] || '').slice(0, 2000);
  const jsSnippet = (currentFiles['script.js'] || '').slice(0, 1000);

  return `You are updating an existing ${style.label} themed website.

ORIGINAL WEBSITE PURPOSE:
"${originalPrompt}"

REQUESTED CHANGES:
"${changes}"

CURRENT HTML (may be truncated):
\`\`\`html
${htmlSnippet}
\`\`\`

CURRENT CSS (may be truncated):
\`\`\`css
${cssSnippet}
\`\`\`

CURRENT JS:
\`\`\`javascript
${jsSnippet}
\`\`\`

Return the COMPLETE updated files with the requested changes applied:

\`\`\`html
[complete updated HTML]
\`\`\`

\`\`\`css
[complete updated CSS]
\`\`\`

\`\`\`javascript
[complete updated JS]
\`\`\`

RULES:
- Apply ONLY the requested changes, keep everything else intact
- Return COMPLETE files, not just the changed parts
- Maintain the ${style.label} visual style
- Keep all existing content and sections`;
}

function applyPreset(text) {
  const el = document.getElementById('edit-prompt');
  if (el) {
    el.value = text;
    el.focus();
  }
  applyChanges();
}

// ─── DOWNLOAD ──────────────────────────────────────────────────
function buildDownloadBtns(files) {
  const wrap = document.getElementById('download-btns');
  if (!wrap) return;
  const mimeMap = { html: 'text/html', css: 'text/css', js: 'text/javascript' };
  wrap.innerHTML = Object.keys(files)
    .filter(k => files[k]?.length > 0)
    .map(filename => {
      const ext = filename.split('.').pop();
      const icons = { html: '📄', css: '🎨', js: '⚡', jsx: '⚛️', vue: '💚' };
      return `<button class="dl-file-btn" onclick="downloadFile('${filename}')">${icons[ext] || '📄'} ${filename}</button>`;
    }).join('');
}

function downloadFile(filename) {
  const files = state.selectedVariant?.files;
  const content = files?.[filename];
  if (!content) { showToast(`No content for ${filename}`, 'error'); return; }
  const ext = filename.split('.').pop();
  const mimeMap = { html: 'text/html', css: 'text/css', js: 'text/javascript', jsx: 'text/javascript', vue: 'text/plain' };
  triggerDownload(content, filename, mimeMap[ext] || 'text/plain');
  showToast(`⬇️ Downloading ${filename}`, 'info');
}

async function downloadZip() {
  const v = state.selectedVariant;
  if (!v) { showToast('No design selected!', 'error'); return; }

  const btn = document.getElementById('dl-zip-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Packaging...'; }

  try {
    const zip = new JSZip();
    const date = new Date().toLocaleString();

    for (const [name, code] of Object.entries(v.files)) {
      if (code) zip.file(name, code);
    }

    const readme = [
      `# Generated Website — ${v.label}`,
      ``,
      `Generated by **FrontendGen** using Gemini 2.0 Flash.`,
      ``,
      `**Style:** ${v.label}`,
      `**Generated:** ${date}`,
      `**Original prompt:** ${state.prompt}`,
      ``,
      `## Files`,
      Object.keys(v.files).map(f => `- \`${f}\``).join('\n'),
      ``,
      `## How to Open`,
      `1. Extract the ZIP`,
      `2. Open \`index.html\` in any browser`,
      `3. Works fully offline — no server needed`,
    ].join('\n');

    zip.file('README.md', readme);

    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    const name = `frontendgen-${v.id}-${Date.now()}.zip`;
    triggerDownload(blob, name, 'application/zip', true);
    showToast('📦 ZIP downloaded!', 'success');

  } catch (err) {
    console.error('[FrontendGen] ZIP error:', err);
    showToast('ZIP failed — try individual file downloads', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '📦 Download ZIP'; }
  }
}

function triggerDownload(content, filename, mime, isBlob = false) {
  const blob = isBlob ? content : new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename, style: 'display:none' });
  document.body.appendChild(a);
  a.click();
  requestAnimationFrame(() => { document.body.removeChild(a); URL.revokeObjectURL(url); });
}

// ─── LOCAL STORAGE: GALLERY ────────────────────────────────────
function saveToGallery() {
  try {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      prompt: state.prompt,
      variants: state.variants.map(v => ({
        id: v.id,
        label: v.label,
        accent: v.accent,
        files: v.files,
        preview: v.previewHTML?.slice(0, 150_000) ?? '',
      })),
    };
    let gallery = JSON.parse(localStorage.getItem(GALLERY_KEY) || '[]');
    gallery.push(entry);
    if (gallery.length > 20) gallery = gallery.slice(-20);
    localStorage.setItem(GALLERY_KEY, JSON.stringify(gallery));
  } catch (e) {
    console.warn('[FrontendGen] Gallery save failed:', e);
  }
}

// ─── UI HELPERS ────────────────────────────────────────────────
function setGenBtnLoading(on) {
  const btn = document.getElementById('gen-btn');
  if (!btn) return;
  btn.classList.toggle('loading', on);
  btn.disabled = on;
}

function setApplyBtnLoading(on) {
  const btn = document.getElementById('apply-btn');
  if (!btn) return;
  btn.classList.toggle('loading', on);
  btn.disabled = on;
}

function shake(el) {
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth; // reflow
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 500);
}

function friendlyError(msg) {
  if (!msg) return 'Something went wrong.';
  if (/API_KEY_INVALID|not valid|invalid.*key/i.test(msg)) return 'Invalid API key.';
  if (/RESOURCE_EXHAUSTED|quota/i.test(msg)) return 'API quota exceeded. Wait a moment.';
  if (/fetch|network|Failed to fetch/i.test(msg)) return 'Network error. Check your connection.';
  if (/empty|parse|incomplete/i.test(msg)) return 'Generation incomplete. Try a different prompt.';
  return msg.length > 120 ? msg.slice(0, 120) + '…' : msg;
}

// ─── TOAST ────────────────────────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  // Limit visible toasts
  while (container.children.length > 3) container.children[0].remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { success: '✅', error: '🚨', info: '💡', warning: '⚠️' };
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || '💡'}</span>
    <span class="toast-msg">${message}</span>
    <button class="toast-x" onclick="this.parentElement.remove()">×</button>`;
  container.appendChild(toast);

  const dur = type === 'error' ? 6000 : 3500;
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 350);
    }
  }, dur);
}

// ─── QUOTA ERROR HELPER ────────────────────────────────────────
function isQuotaError(msg) {
  return /quota|RESOURCE_EXHAUSTED|limit.*0|free_tier/i.test(msg || '');
}

// ─── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Init API key status dot
  const hasUserKey = !!localStorage.getItem(USER_KEY_STORAGE);
  updateKeyStatus(hasUserKey);

  // Prompt counter live update
  const ta = document.getElementById('main-prompt');
  if (ta) {
    ta.addEventListener('input', () => {
      const n = ta.value.length;
      const el = document.getElementById('prompt-counter');
      if (el) el.textContent = `${n} / 2000`;
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      const s1 = document.getElementById('screen-prompt');
      if (s1?.classList.contains('active')) startGeneration();
      else if (document.getElementById('screen-editor')?.classList.contains('active')) applyChanges();
    }
    if (e.key === 'Escape') {
      if (_isFullscreen) exitFullscreen();
    }
  });
});
