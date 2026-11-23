import { useContext } from 'react'
import { ActionsContext, StateContext } from './store'

export const useOSState = () => useContext(StateContext)

export function useOSActions() {
  const actions = useContext(ActionsContext)
  if (!actions) throw new Error('useOSActions must be used inside <OSProvider>')
  return actions
}
