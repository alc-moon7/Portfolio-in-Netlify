import { useEffect, useRef } from 'react'
import pageHtml from './content.html?raw'
import './App.css'

const scriptSources = [
  '/igneous/js/jquery.min.js',
  '/igneous/js/jquery.ui.min.js',
  '/igneous/js/qtip.min.js',
  '/igneous/js/easing.min.js',
  '/igneous/js/parallax.min.js',
  '/igneous/js/keyframes.min.js',
  '/igneous/js/touchswipe.min.js',
  '/igneous/js/mousewheel.min.js',
  '/igneous/js/viewport.min.js',
  '/igneous/js/loop.min.js',
  '/igneous/js/lettering.min.js',
  '/igneous/js/textillate.min.js',
  '/igneous/js/fittext.min.js',
  '/igneous/js/addtohomescreen.min.js',
  '/igneous/js/spritespin.min.js',
  '/igneous/js/script.min56b8.js?v=fast2',
]

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.body.appendChild(script)
  })

function App() {
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = pageHtml
    }

    ;(async () => {
      for (const src of scriptSources) {
        await loadScript(src)
      }
    })()
  }, [])

  return <div id="page-root" ref={containerRef} />
}

export default App
