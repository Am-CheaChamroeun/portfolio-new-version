import { AnimatePresence, MotionConfig } from 'motion/react'
import { useCallback, useState } from 'react'
import { BootScreen } from './os/BootScreen'
import { OS } from './os/OS'
import { OSProvider } from './os/OSProvider'

export default function App() {
  const [booting, setBooting] = useState(true)
  const finishBoot = useCallback(() => setBooting(false), [])

  return (
    <MotionConfig reducedMotion="user">
      <OSProvider>
        {/* the desktop mounts straight away; the boot screen simply fades out over it */}
        <OS />
        <AnimatePresence>{booting && <BootScreen key="boot" onDone={finishBoot} />}</AnimatePresence>
      </OSProvider>
    </MotionConfig>
  )
}
