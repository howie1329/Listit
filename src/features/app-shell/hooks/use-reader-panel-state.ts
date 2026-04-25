import { useState } from 'react'

export function useReaderPanelState(defaultOpen = true) {
  const [isReaderOpen, setIsReaderOpen] = useState(defaultOpen)

  function toggleReaderPanel() {
    setIsReaderOpen((previous) => !previous)
  }

  return {
    isReaderOpen,
    toggleReaderPanel,
  }
}
