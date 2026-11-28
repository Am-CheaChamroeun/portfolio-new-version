import { useEffect, useState } from 'react'
import { cvAvailable } from '../lib/links'

/** True once the CV file is really being served (so a dead download is never shown). */
export function useCvAvailable() {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    let on = true
    cvAvailable().then((v) => on && setOk(v))
    return () => {
      on = false
    }
  }, [])
  return ok
}
