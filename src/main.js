import './styles.css'
import QRCode from 'qrcode'
import jsQR from 'jsqr'

const PREFIX = '323232323232#'
const FIELDS = ['小时', '分钟', '白光', '深蓝光', '绿色光', 'UV', '浅蓝光', '红色光']
const LIGHT_FIELDS = ['白光', '深蓝光', '绿色光', 'UV', '浅蓝光', '红色光']
const LIMITS = {
  '小时': [0, 23], '分钟': [0, 59],
  '白光': [0, 100], '深蓝光': [0, 100], '绿色光': [0, 100],
  'UV': [0, 100], '浅蓝光': [0, 100], '红色光': [0, 100]
}
const DEFAULT_GROUPS = [
  "0000000000000000","0100000000000000","0200000000000000","0300000000000000",
  "0400000000000000","0500000000000000","0600000000000000","0700000000000000",
  "0800000000000000","0900051414141400","0a000a2828282805","0b001e5a5a465a14",
  "0c001e5a5a465a14","0d001e5a5a465a14","0e001e5a5a465a14","0f001e5a5a465a14",
  "10001e5a5a465a14","11001e5a5a465a14","12001e5a5a465a14","13000a2828282805",
  "1400051414141400","1500000000000000","1600000000000000","1700000000000000",
]
const SPS_GROUPS = [
  "0000000000000000","0100000000000000","0200000000000000","0300000000000000",
  "0400000000000000","0500000000000000","0600000000000000","0700000000000000",
  "0800000000000000","09001e1e1e1e1e1e","0a00323232323232","0b005f5f5f5f5f5f",
  "0c005f5f5f5f5f5f","0d005f5f5f5f5f5f","0e005f5f5f5f5f5f","0f005f5f5f5f5f5f",
  "10005f5f5f5f5f5f","11005f5f5f5f5f5f","12005f5f5f5f5f5f","1300323232323232",
  "14001e1e1e1e1e1e","1500000000000000","1600000000000000","1700000000000000",
]

const LPS_GROUPS = [
  "0000000000000000","0100000000000000","0200000000000000","0300000000000000",
  "0400000000000000","0500000000000000","0600000000000000","0700000000000000",
  "0800000000000000","0900000a00030a00","0a00011e14051e00","0b000550320a5000",
  "0c000550320a5000","0d000550320a5000","0e000550320a5000","0f000550320a5000",
  "10000550320a5000","11000550320a5000","12000550320a5000","1300011e14051e00",
  "1400000a00030a00","1500000000000000","1600000000000000","1700000000000000",
]

const COLORS = {
  '白光': ['#e2e8f0', '#cbd5e1'],
  '深蓝光': ['#dbeafe', '#60a5fa'],
  '绿色光': ['#dcfce7', '#4ade80'],
  'UV': ['#ede9fe', '#a78bfa'],
  '浅蓝光': ['#cffafe', '#22d3ee'],
  '红色光': ['#fee2e2', '#f87171'],
}

const state = { rows: [], qrVisible: true, decimalVisible: false }

const app = document.getElementById('app')
app.innerHTML = `
<div class="app">
  <div class="layout" id="layout">
    <div class="left-col editor-only">
      <div class="card">
        <div class="card-head">
          <div class="card-title">24 组时间点编辑</div>
          <div class="card-sub">分钟可填，光通道用彩色条形滑块调节，改动后二维码自动刷新</div>
        </div>
        <div class="card-body table-wrap">
          <table>
            <colgroup>
              <col style="width:150px" />
              <col style="width:65px" />
              <col style="width:65px" />
              <col style="width:65px" />
              <col />
              <col />
              <col />
              <col />
              <col />
              <col />
              <col class="decimal-col hidden-col" data-decimal-col />
              <col class="decimal-col hidden-col" data-decimal-col />
              <col class="decimal-col hidden-col" data-decimal-col />
              <col class="decimal-col hidden-col" data-decimal-col />
              <col class="decimal-col hidden-col" data-decimal-col />
              <col class="decimal-col hidden-col" data-decimal-col />
            </colgroup>
            <thead>
              <tr>
                <th class="group-neutral">合成数据</th>
                <th class="group-neutral">小时</th>
                <th class="group-neutral">分钟</th>
                <th class="group-neutral">向下复制</th>
                <th class="group-white">白光</th>
                <th class="group-blue">深蓝光</th>
                <th class="group-green">绿色光</th>
                <th class="group-violet">UV</th>
                <th class="group-cyan">浅蓝光</th>
                <th class="group-red">红色光</th>
                <th class="group-white decimal-col hidden-col" data-decimal-col>白光值</th>
                <th class="group-blue decimal-col hidden-col" data-decimal-col>深蓝光值</th>
                <th class="group-green decimal-col hidden-col" data-decimal-col>绿色光值</th>
                <th class="group-violet decimal-col hidden-col" data-decimal-col>UV值</th>
                <th class="group-cyan decimal-col hidden-col" data-decimal-col>浅蓝光值</th>
                <th class="group-red decimal-col hidden-col" data-decimal-col>红色光值</th>
              </tr>
            </thead>
            <tbody id="rows"></tbody>
          </table>
        </div>
      </div>
  <div class="card" style="margin-top:12px;">
    <div class="card-head">
      <div class="card-title">数据趋势图</div>
      <div class="card-sub">按 24 个时间点展示白光、蓝光、绿光、紫光、浅蓝、红光的变化趋势</div>
    </div>
    <div class="card-body">
      <div class="chart-wrap">
        <canvas id="trendChart"></canvas>
      </div>
      <div class="chart-legend" id="chartLegend"></div>
    </div>
  </div>

    </div>

    <div class="right-col">
      <div class="qr-side" id="qrPanel">
        <div class="card qr-card">
          <div class="card-head">
            <div class="card-title">二维码预览</div>
            <div class="card-sub">数据变化后自动刷新，可直接保存 PNG</div>
          </div>
          <div class="card-body qr-wrap">
            <canvas id="qrCanvas"></canvas>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div class="card-title">操作区</div>
          <div class="card-sub">导入、导出、预览开关和快捷操作</div>
        </div>
        <div class="card-body">
          <div class="toolbar-grid">
            <button id="btnDefault">应用SPS/LPS</button>
            <button id="btnSps">应用 SPS</button>
            <button id="btnLps">应用 LPS</button>
            <button id="btnRefresh">刷新合成数据</button>
            <button id="btnImportRaw">从原始串导入</button>
            <label class="file-label toolbar-btn">从二维码图片导入<input id="qrFile" type="file" accept="image/*" /></label>
            <button id="btnCopyRaw">复制原始串</button>
            <button id="btnSaveQr">保存二维码 PNG</button>
            <button id="btnToggleDecimal">显示/隐藏输入</button>
            <button id="btnToggleQr">显示/隐藏二维码区</button>
          </div>
          <div class="status" id="status">已就绪</div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div class="card-title">汇总 / 原始串</div>
          <div class="card-sub">完整格式：323232323232# + 24 组 16 位合成数据</div>
        </div>
        <div class="card-body">
          <textarea id="rawBox" class="raw-box"></textarea>
          <div class="toolbar-row" style="margin-top:8px">
            <button id="btnFromTable">从表格刷新原始串</button>
            <button id="btnApplyRaw">从原始串回填表格</button>
          </div>
          <div class="muted" id="lengthInfo"></div>
        </div>
      </div>

      <div class="card footer-card">
        <div class="card-body footer-body">
          <div class="footer-line"><strong>Author:</strong> OpenAI ChatGPT · GPT-5.4 Thinking</div>
          <div class="footer-line"><strong>Creator:</strong> <a href="https://github.com/MisakaAldrich/Noo-Psyche-Seawater-Coral-Light-VisualizationTool" target="_blank" rel="noopener noreferrer">https://github.com/MisakaAldrich/Noo-Psyche-Seawater-Coral-Light-VisualizationTool</a></div>
          <div class="footer-line"><strong>Official Website:</strong> <a href="https://www.noo-psyche.com/" target="_blank" rel="noopener noreferrer">https://www.noo-psyche.com/</a></div>
          <div class="footer-line"><strong>Copyright:</strong> © 2026 All rights reserved.</div>
          <div class="footer-line">“Noo-Psyche”及其相关名称、标识、品牌识别元素，为佛山纽斯科技有限公司及其相关权利人所拥有、使用或主张权利的品牌名称、商标、商号或相关商业标识。</div>
          <div class="footer-line">本项目为便捷使用与兼容性目的制作的非官方可视化/编辑工具页面；除非相关权利人另有明确声明，否则不代表官方网站、官方应用或官方背书产品。</div>
        </div>
      </div>
      </div>
      </div>
</div>
`

function clamp(v, lo, hi) {
  const n = Number.parseInt(v, 10)
  if (Number.isNaN(n)) return lo
  return Math.max(lo, Math.min(hi, n))
}
function cleanText(text) { return String(text || '').replace(/\t|\r|\n/g, '').trim() }
function chunk16(payload) {
  if (payload.length % 16 !== 0) throw new Error("'#' 后的数据长度不是 16 的倍数")
  const arr = []
  for (let i = 0; i < payload.length; i += 16) arr.push(payload.slice(i, i + 16))
  return arr
}
function parseGroup(group) {
  if (group.length !== 16) throw new Error('单组长度必须是 16 位')
  const out = []
  for (let i = 0; i < 16; i += 2) out.push(parseInt(group.slice(i, i + 2), 16))
  return out
}
function composeGroup(vals) {
  return vals.map((v, i) => {
    const field = FIELDS[i]
    const [lo, hi] = LIMITS[field]
    return clamp(v, lo, hi).toString(16).padStart(2, '0')
  }).join('')
}
function setStatus(msg) { document.getElementById('status').textContent = msg }


function renderChartLegend() {
  const legend = document.getElementById('chartLegend')
  if (!legend) return
  legend.innerHTML = ''
  for (const field of LIGHT_FIELDS) {
    const item = document.createElement('div')
    item.className = 'chart-legend-item'
    item.innerHTML = `<span class="chart-legend-dot" style="background:${COLORS[field][1]}"></span><span>${field}</span>`
    legend.appendChild(item)
  }
}

function renderTrendChart() {
  const canvas = document.getElementById('trendChart')
  if (!canvas) return
  const dpr = Math.max(1, window.devicePixelRatio || 1)
  const rect = canvas.getBoundingClientRect()
  const width = Math.max(300, Math.floor(rect.width))
  const height = Math.max(240, Math.floor(rect.height))
  canvas.width = Math.floor(width * dpr)
  canvas.height = Math.floor(height * dpr)
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)

  const pad = { top: 20, right: 18, bottom: 28, left: 34 }
  const plotW = width - pad.left - pad.right
  const plotH = height - pad.top - pad.bottom

  // background
  ctx.fillStyle = '#fbfdff'
  ctx.fillRect(0, 0, width, height)

  // grid + y labels
  ctx.strokeStyle = '#e6edf5'
  ctx.lineWidth = 1
  ctx.fillStyle = '#64748b'
  ctx.font = '12px Microsoft YaHei UI, sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  for (let i = 0; i <= 5; i++) {
    const value = 100 - i * 20
    const y = pad.top + (i / 5) * plotH
    ctx.beginPath()
    ctx.moveTo(pad.left, y)
    ctx.lineTo(width - pad.right, y)
    ctx.stroke()
    ctx.fillText(String(value), pad.left - 6, y)
  }

  // x axis labels
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  const steps = state.rows.length || 24
  for (let i = 0; i < steps; i++) {
    const x = pad.left + (steps === 1 ? 0 : (i / (steps - 1)) * plotW)
    if (steps <= 12 || i % 2 === 0) {
      ctx.fillStyle = '#64748b'
      ctx.fillText(String(i), x, height - pad.bottom + 8)
    }
  }

  // axes
  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(pad.left, pad.top)
  ctx.lineTo(pad.left, height - pad.bottom)
  ctx.lineTo(width - pad.right, height - pad.bottom)
  ctx.stroke()

  // lines
  for (const field of LIGHT_FIELDS) {
    const color = COLORS[field][1]
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    state.rows.forEach((row, idx) => {
      const v = Number(row.values[field] || 0)
      const x = pad.left + (steps === 1 ? 0 : (idx / (steps - 1)) * plotW)
      const y = pad.top + (1 - v / 100) * plotH
      if (idx === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // points
    ctx.fillStyle = color
    state.rows.forEach((row, idx) => {
      const v = Number(row.values[field] || 0)
      const x = pad.left + (steps === 1 ? 0 : (idx / (steps - 1)) * plotW)
      const y = pad.top + (1 - v / 100) * plotH
      ctx.beginPath()
      ctx.arc(x, y, 2.5, 0, Math.PI * 2)
      ctx.fill()
    })
  }
}

function makeBar(field, rowIdx) {
  const [bg, accent] = COLORS[field]
  const wrap = document.createElement('div')
  wrap.className = 'bar-slider'
  wrap.style.background = bg
  wrap.innerHTML = `<div class="bar-fill" style="background:${accent}"></div><div class="bar-value">0</div>`
  const fill = wrap.querySelector('.bar-fill')
  const val = wrap.querySelector('.bar-value')

  const setValue = (n, trigger=true) => {
    n = clamp(n, 0, 100)
    fill.style.width = `${n}%`
    val.textContent = n
    state.rows[rowIdx].values[field] = n
    if (state.rows[rowIdx].decimalInputs[field]) {
      state.rows[rowIdx].decimalInputs[field].value = n
    }
    if (trigger) refreshRow(rowIdx)
  }

  wrap.addEventListener('click', (e) => {
    const rect = wrap.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    setValue(Math.round(ratio * 100))
  })
  wrap.addEventListener('wheel', (e) => {
    e.preventDefault()
    setValue((state.rows[rowIdx].values[field] || 0) + (e.deltaY < 0 ? 1 : -1))
  }, { passive: false })

  return { el: wrap, setValue }
}

function buildRows() {
  const tbody = document.getElementById('rows')
  tbody.innerHTML = ''
  state.rows = []

  for (let r = 0; r < 24; r++) {
    const tr = document.createElement('tr')
    const row = { values: { '小时': r, '分钟': 0 }, sliders: {}, decimalInputs: {}, composeInput: null }

    const composeTd = document.createElement('td')
    const composeInput = document.createElement('input')
    composeInput.className = 'cell-input'
    composeInput.maxLength = 16
    composeInput.addEventListener('change', () => applyComposeToRow(r))
    composeTd.appendChild(composeInput)
    row.composeInput = composeInput

    const hourTd = document.createElement('td')
    hourTd.innerHTML = `<div class="cell-label">${r}</div>`

    const minuteTd = document.createElement('td')
    const minuteInput = document.createElement('input')
    minuteInput.className = 'cell-input'
    minuteInput.value = '0'
    minuteInput.addEventListener('input', () => refreshRow(r))
    row.values['分钟'] = 0
    minuteTd.appendChild(minuteInput)
    row.minuteInput = minuteInput

    const copyTd = document.createElement('td')
    const copyBtn = document.createElement('button')
    copyBtn.className = 'cell-btn'
    copyBtn.textContent = '↓'
    copyBtn.addEventListener('click', () => copyToNextRow(r))
    copyTd.appendChild(copyBtn)

    tr.append(composeTd, hourTd, minuteTd, copyTd)

    for (const field of LIGHT_FIELDS) {
      row.values[field] = 0
      const td = document.createElement('td')
      const bar = makeBar(field, r)
      td.appendChild(bar.el)
      tr.appendChild(td)
      row.sliders[field] = bar
    }

    for (const field of LIGHT_FIELDS) {
      const td = document.createElement('td')
      td.className = 'decimal-col hidden-col'
      td.dataset.decimalCol = '1'
      td.dataset.decimalCol = '1'
      const inp = document.createElement('input')
      inp.className = 'cell-input'
      inp.value = '0'
      inp.addEventListener('input', () => {
        row.values[field] = clamp(inp.value, 0, 100)
        row.sliders[field].setValue(row.values[field], false)
        refreshRow(r)
      })
      td.appendChild(inp)
      tr.appendChild(td)
      row.decimalInputs[field] = inp
    }

    tbody.appendChild(tr)
    state.rows.push(row)
  }
}

function refreshRow(r) {
  const row = state.rows[r]
  row.values['小时'] = r
  row.values['分钟'] = clamp(row.minuteInput.value, 0, 59)
  row.minuteInput.value = row.values['分钟']
  for (const field of LIGHT_FIELDS) {
    row.values[field] = clamp(row.values[field], 0, 100)
    row.sliders[field].setValue(row.values[field], false)
    row.decimalInputs[field].value = row.values[field]
  }
  row.composeInput.value = composeGroup(FIELDS.map(f => row.values[f]))
  updateRawText()
  renderTrendChart()
}

function setRowFromGroup(r, group) {
  const vals = parseGroup(group)
  const row = state.rows[r]
  FIELDS.forEach((field, idx) => {
    let v = vals[idx]
    const [lo, hi] = LIMITS[field]
    v = clamp(v, lo, hi)
    row.values[field] = v
    if (field === '分钟') row.minuteInput.value = v
    if (LIGHT_FIELDS.includes(field)) {
      row.sliders[field].setValue(v, false)
      row.decimalInputs[field].value = v
    }
  })
  row.composeInput.value = composeGroup(FIELDS.map(f => row.values[f]))
}

function applyComposeToRow(r) {
  const text = cleanText(state.rows[r].composeInput.value).toLowerCase()
  if (text.length !== 16) return setStatus(`第 ${r} 行合成数据长度不是 16`)
  try {
    setRowFromGroup(r, text)
    updateRawText()
    renderTrendChart()
    setStatus(`第 ${r} 行已按合成数据回填`)
  } catch (e) {
    setStatus(`第 ${r} 行回填失败: ${e.message}`)
  }
}

function copyToNextRow(r) {
  if (r >= 23) return setStatus('最后一行不能再往下复制')
  const src = state.rows[r]
  const dst = state.rows[r + 1]
  dst.minuteInput.value = src.values['分钟']
  LIGHT_FIELDS.forEach(f => {
    dst.values[f] = src.values[f]
    dst.sliders[f].setValue(src.values[f], false)
    dst.decimalInputs[f].value = src.values[f]
  })
  refreshRow(r + 1)
  setStatus(`已复制第 ${r} 行到第 ${r + 1} 行`)
  renderTrendChart()
}

function updateRawText() {
  const groups = state.rows.map(r => r.composeInput.value.trim().toLowerCase())
  const raw = PREFIX + groups.join('')
  document.getElementById('rawBox').value = raw
  const payloadLen = raw.includes('#') ? raw.split('#')[1].length : 0
  document.getElementById('lengthInfo').textContent = `总长度: ${raw.length} | 照明参数长度: ${payloadLen} | 分组数: ${Math.floor(payloadLen / 16)}`
  scheduleQrRefresh()
}

let qrJob = null
function scheduleQrRefresh() {
  if (qrJob) clearTimeout(qrJob)
  qrJob = setTimeout(generateQr, 30)
}

async function generateQr() {
  qrJob = null
  const raw = cleanText(document.getElementById('rawBox').value)
  if (!raw) return
  const canvas = document.getElementById('qrCanvas')
  const panel = document.getElementById('qrPanel')
  const sideW = panel?.clientWidth || 360
  const target = Math.max(220, Math.min(520, sideW - 36))
  canvas.width = target
  canvas.height = target
  try {
    await QRCode.toCanvas(canvas, raw, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: target,
      color: { dark: '#000000', light: '#ffffff' }
    })
    setStatus('二维码已自动刷新')
  } catch (e) {
    setStatus('二维码生成失败: ' + e.message)
  }
}

function saveQr() {
  const canvas = document.getElementById('qrCanvas')
  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = 'coral_light_qr.png'
  a.click()
}

function applyRawToTable() {
  const raw = cleanText(document.getElementById('rawBox').value)
  try {
    if (!raw.includes('#')) throw new Error('缺少 # 分隔符')
    const payload = raw.split('#')[1]
    const groups = chunk16(payload)
    if (groups.length !== 24) throw new Error(`当前是 ${groups.length} 组，不是 24 组`)
    groups.forEach((g, i) => setRowFromGroup(i, g))
    updateRawText()
    generateQr()
    renderTrendChart()
    setStatus('已从原始串回填表格')
  } catch (e) {
    alert('导入失败：' + e.message)
  }
}

async function importQrImage(file) {
  if (!file) return
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const result = jsQR(imageData.data, imageData.width, imageData.height)
  if (!result?.data) {
    alert('二维码导入失败：未识别到二维码，请换更清晰的图片再试。')
    return
  }
  document.getElementById('rawBox').value = cleanText(result.data)
  applyRawToTable()
  setStatus('已从二维码图片导入')
}

function toggleQrPanel() {
  state.qrVisible = !state.qrVisible
  document.getElementById('qrPanel').classList.toggle('hidden', !state.qrVisible)
  if (state.qrVisible) generateQr()
  setStatus(state.qrVisible ? '已显示二维码区' : '已隐藏二维码区')
}

function toggleDecimalInputs() {
  state.decimalVisible = !state.decimalVisible

  document.querySelectorAll('col[data-decimal-col]').forEach(el => {
    el.classList.toggle('hidden-col', !state.decimalVisible)
    el.style.display = state.decimalVisible ? 'table-column' : 'none'
  })

  document.querySelectorAll('th[data-decimal-col], td[data-decimal-col]').forEach(el => {
    el.classList.toggle('hidden-col', !state.decimalVisible)
    el.style.display = state.decimalVisible ? 'table-cell' : 'none'
  })

  setStatus(state.decimalVisible ? '已显示十进制输入框' : '已隐藏十进制输入框')
}

function copyRaw() {
  navigator.clipboard.writeText(cleanText(document.getElementById('rawBox').value))
  setStatus('已复制原始串')
}

function refreshAll() {
  state.rows.forEach((_, i) => refreshRow(i))
  generateQr()
}

function applyPreset(groups, name) {
  groups.forEach((g, i) => setRowFromGroup(i, g))
  refreshAll()
  renderTrendChart()
  setStatus(`已应用 ${name} 预设`)
}

function loadDefaultData() {
  DEFAULT_GROUPS.forEach((g, i) => setRowFromGroup(i, g))
  refreshAll()
  renderTrendChart()
  setStatus('已载入默认示例')
}

function wireActions() {
  document.getElementById('btnDefault').onclick = loadDefaultData
  document.getElementById('btnSps').onclick = () => applyPreset(SPS_GROUPS, 'SPS')
  document.getElementById('btnLps').onclick = () => applyPreset(LPS_GROUPS, 'LPS')
  document.getElementById('btnImportRaw').onclick = () => {
    const raw = prompt('请粘贴完整原始串：', cleanText(document.getElementById('rawBox').value) || PREFIX)
    if (raw != null) {
      document.getElementById('rawBox').value = cleanText(raw)
      applyRawToTable()
    }
  }
  document.getElementById('qrFile').addEventListener('change', (e) => importQrImage(e.target.files[0]))
  document.getElementById('btnToggleQr').onclick = toggleQrPanel
  document.getElementById('btnToggleDecimal').onclick = toggleDecimalInputs
  document.getElementById('btnRefresh').onclick = refreshAll
  document.getElementById('btnSaveQr').onclick = saveQr
  document.getElementById('btnCopyRaw').onclick = copyRaw
  document.getElementById('btnFromTable').onclick = refreshAll
  document.getElementById('btnApplyRaw').onclick = applyRawToTable
  document.getElementById('rawBox').addEventListener('input', scheduleQrRefresh)
  window.addEventListener('resize', scheduleQrRefresh)
}

buildRows()
wireActions()
renderChartLegend()
loadDefaultData()
window.addEventListener('resize', renderTrendChart)
