'use client'

import React, { useEffect, useState } from 'react'
import { ImageDialog } from '@/components/ImageDialog'

export default function ModalsProvider() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  return (
    <React.Fragment>
      <ImageDialog />
    </React.Fragment>
  )
}
