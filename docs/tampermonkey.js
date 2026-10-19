// ==UserScript==
// @name         收藏网址 → CSE
// @namespace    https://cse.local
// @version      1.0.0
// @description  悬浮按钮，把当前页面标题/logo/网址发送到 CSE 本地助手
// @match        *://*/*
// @grant        none
// @noframes
// @run-at       document-idle
// ==/UserScript==

;(function () {
  'use strict'

  const SCHEME = 'cse'

  /* ---------- 1. 采集 logo ---------- */
  function abs(u) {
    try {
      return new URL(u, location.href).href
    } catch {
      return ''
    }
  }

  function getLogo() {
    const links = [...document.querySelectorAll('link[rel]')]
    // 优先级：高清 touch icon → 普通 icon
    const order = [
      (l) => /apple-touch-icon/i.test(l.rel),
      (l) => /\bicon\b/i.test(l.rel),
      (l) => /mask-icon/i.test(l.rel)
    ]
    for (const test of order) {
      const el = links.find((l) => test(l) && l.href)
      if (el) {
        const href = abs(el.href)
        // data: URI 可能超长，丢弃
        if (href && !href.startsWith('data:') && href.length < 2048) return href
      }
    }
    const og = document.querySelector('meta[property="og:image"], meta[name="og:image"]')
    if (og && og.content) {
      const href = abs(og.content)
      if (href && href.length < 2048) return href
    }
    return abs('/favicon.ico')
  }

  /* ---------- 2. 编码 ---------- */
  function toBase64Url(str) {
    const bytes = new TextEncoder().encode(str) // 正确处理中文
    let bin = ''
    for (const b of bytes) bin += String.fromCharCode(b)
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }

  function buildProtocolUrl(payload) {
    return `${SCHEME}://import?d=${toBase64Url(JSON.stringify(payload))}`
  }

  /* ---------- 3. 触发 ---------- */
  function send() {
    const payload = {
      v: 1,
      title: (document.title || '').slice(0, 500),
      url: location.href,
      logo: getLogo(),
      ts: Date.now()
    }

    const protoUrl = buildProtocolUrl(payload)

    // 必须在用户手势的同步调用栈里执行，不能 await / setTimeout
    // 如果浏览器把未知协议当成导航，可能留下空白页，兜底回退
    let navigatedAway = false
    const onBlur = () => {
      navigatedAway = true
    }
    window.addEventListener('blur', onBlur, { once: true })

    location.href = protoUrl

    setTimeout(() => {
      window.removeEventListener('blur', onBlur)
      if (!navigatedAway && document.readyState === 'loading') {
        history.back()
      }
    }, 1500)
  }

  /* ---------- 4. 悬浮按钮（Shadow DOM 隔离样式） ---------- */
  function mount() {
    if (document.getElementById('__cse_host__')) return

    const host = document.createElement('div')
    host.id = '__cse_host__'
    host.style.cssText =
      'position:fixed;right:0;top:50%;transform:translateY(-50%);z-index:2147483647;'

    const shadow = host.attachShadow({ mode: 'open' })
    shadow.innerHTML = `
      <style>
        .btn {
          width: 44px; height: 44px; border-radius: 10px 0 0 10px;
          background: #f08928; color: #fff; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: -2px 2px 8px rgba(0,0,0,.25);
          font: 600 13px/1 system-ui, sans-serif;
          transition: transform .12s, background .12s;
        }
        .btn:hover  { background: #f75802; transform: translateX(-2px); }
        .btn:active { transform: translateX(0) scale(.96); }
      </style>
      <button class="btn" id="__cse__btn" title="收藏到 CSE">CSE</button>
    `

    document.documentElement.appendChild(host)

    shadow.getElementById('__cse__btn').addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      send()
    })
  }
  console.log('cse-loading')
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true })
  } else {
    mount()
  }
})()
