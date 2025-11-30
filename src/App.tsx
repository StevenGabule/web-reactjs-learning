import './App.css'
import { UseInViewport } from './components/MouseTracker/viewport'

export default function App() {
  const { ref, isInView } = UseInViewport({ threshold: 0.5 })
  return (
    <>
      {/* <h4>Accordion Controlled</h4>
      <AccordionControlled />
      <h4>Accordion UnControlled</h4>
      <AccordionUncontrolled /> */}
      {/* <MouseTracker>
        {({ x, y }) => <p>Mouse is at ({x}, {y})</p>}
      </MouseTracker> */}
      {/* <MouseTracker>
        {({ x, y }) => <div style={{
          position: 'fixed',
          left: x - 10,
          top: y - 10,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'red',
          pointerEvents: 'none'
        }} />} */}
      {/* </MouseTracker> */}
      {/* <MouseTracker>
        {({ x, y }) => {
          const hue = (x / window.innerWidth) * 360;
          const lightness = (y / window.innerHeight) * 100;
          return (
            <div style={{
              background: `hsl(${hue}, 70%, ${lightness}%)`,
              width: '100vw',
              height: '100vh'
            }} />
          )
        }}
      </MouseTracker> */}

      <div ref={ref}>
        {isInView ? 'Visible' : 'Not Invisible'}
      </div>
    </>
  )
}
