import { useEffect, useRef, useState } from 'react'

// A deliberately small bottom-sheet primitive: it owns the gesture, while the
// ride screens own the content and the snap point that makes sense for a stage.
const DriverBottomSheet = ({ children, initialSnap = 'peek', className = '' }) => {
    const [snap, setSnap] = useState(initialSnap)
    const startY = useRef(null)

    useEffect(() => setSnap(initialSnap), [initialSnap])

    const onPointerDown = (event) => {
        startY.current = event.clientY
        event.currentTarget.setPointerCapture?.(event.pointerId)
    }

    const onPointerUp = (event) => {
        if (startY.current === null) return
        const deltaY = event.clientY - startY.current
        // A short decisive swipe is more reliable than following every pixel,
        // especially when the sheet content itself is scrollable.
        if (deltaY > 45) setSnap('peek')
        if (deltaY < -45) setSnap('expanded')
        startY.current = null
    }

    const translate = snap === 'expanded' ? 'translate-y-0' : 'translate-y-[calc(100%-5.5rem)]'

    return (
        <section
            className={`fixed inset-x-0 bottom-0 z-30 max-h-[88dvh] rounded-t-3xl bg-white shadow-[0_-12px_35px_rgba(0,0,0,.18)] transition-transform duration-300 ease-out ${translate} ${className}`}
            aria-label="Ride details"
        >
            <button
                type="button"
                aria-label={snap === 'expanded' ? 'Collapse ride details' : 'Expand ride details'}
                className="flex h-14 w-full touch-none cursor-grab items-center justify-center active:cursor-grabbing"
                onClick={() => setSnap((value) => value === 'expanded' ? 'peek' : 'expanded')}
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
            >
                <span className="h-1.5 w-11 rounded-full bg-gray-300" />
            </button>
            <div className="max-h-[calc(88dvh-3.5rem)] overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                {children}
            </div>
        </section>
    )
}

export default DriverBottomSheet
