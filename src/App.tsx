import { AnimatePresence, MotionConfig } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { useSettings } from './lib/settings'
import { installClickSounds } from './lib/sound'
import { BootScreen } from './os/BootScreen'
import { OS } from './os/OS'
import { OSProvider } from './os/OSProvider'

export default function App() {
  const [booting, setBooting] = useState(true)
  const finishBoot = useCallback(() => setBooting(false), [])
  const { motion } = useSettings()
  useEffect(installClickSounds, [])

  return (
    <MotionConfig reducedMotion={motion === 'system' ? 'user' : motion === 'reduced' ? 'always' : 'never'}>
      <OSProvider>
        {/* the desktop mounts straight away; the boot screen simply fades out over it */}
        <OS />
        <AnimatePresence>{booting && <BootScreen key="boot" onDone={finishBoot} />}</AnimatePresence>
      </OSProvider>
    </MotionConfig>
  )
}
