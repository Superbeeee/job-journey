// 高度 auto 無法用純 CSS 過渡，改用 JS hooks 量測 scrollHeight 做展開／收合動畫
export function expandEnter(el, done) {
  el.style.overflow = 'hidden'
  el.style.height = '0'
  el.style.opacity = '0'
  requestAnimationFrame(() => {
    el.style.transition = 'height 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.24s ease'
    el.style.height = el.scrollHeight + 'px'
    el.style.opacity = '1'
  })
  el.addEventListener('transitionend', function handler(e) {
    if (e.propertyName !== 'height') return
    el.style.height = 'auto'
    el.style.overflow = ''
    el.style.transition = ''
    el.removeEventListener('transitionend', handler)
    done()
  })
}

export function expandLeave(el, done) {
  el.style.overflow = 'hidden'
  el.style.height = el.scrollHeight + 'px'
  requestAnimationFrame(() => {
    el.style.transition = 'height 0.22s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.16s ease'
    el.style.height = '0'
    el.style.opacity = '0'
  })
  el.addEventListener('transitionend', function handler(e) {
    if (e.propertyName !== 'height') return
    el.removeEventListener('transitionend', handler)
    done()
  })
}
