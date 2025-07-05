import { hookstate, useHookstate } from '@hookstate/core'

const versionState = hookstate<{
  version: string
}>({
  version: '',
})

export function setVersion(version: string) {
  versionState.version.set(version)
}

export function useVersionState() {
  return useHookstate(versionState)
}