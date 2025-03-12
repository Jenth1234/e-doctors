'use client'

import { Media } from '@/payload-types'
import React, { Fragment, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { ImageError } from '../CustomIcon/ImageError'
import { getMedia } from '@/actions/media'
import { useModals } from '@/stores'
import { ModalType } from '@/constants'

interface MediaBlockProps {
  media: Media | string
  alt?: string
  className?: string
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto'
  width?: number
  height?: number
}

export const MediaBlock = ({
  media,
  alt = 'Media content',
  className,
  aspectRatio = 'auto',
  width = 400,
  height = 400,
}: MediaBlockProps) => {
  const [mediaUrl, setMediaUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const { open, data } = useModals()

  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: '',
  }

  useEffect(() => {
    if (typeof media === 'string') {
      getMedia(media).then((res) => setMediaUrl(res?.url ?? ''))
    } else {
      setMediaUrl(media.url || '')
    }
  }, [media])

  const handleClick = () => {
    if (mediaUrl) {
      open({
        modal: ModalType.IMAGE_DIALOG,
        data: { src: mediaUrl, alt },
      })
    }
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md border border-border shadow-sm bg-card max-w-[300px] m-2',
        aspectRatioClass[aspectRatio],
        className,
      )}
      onClick={handleClick}
    >
      {mediaUrl ? (
        <Fragment>
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-muted transition-opacity duration-300',
              isLoading ? 'opacity-100' : 'opacity-0',
            )}
          >
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
          <Image
            src={mediaUrl || '/placeholder.svg'}
            alt={alt}
            width={width}
            height={height}
            className={cn(
              'object-cover w-full h-full transition-all duration-300',
              isLoading ? 'scale-110 blur-sm' : 'scale-100 blur-0',
              error ? 'hidden' : 'block',
            )}
            onLoadingComplete={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false)
              setError(true)
            }}
          />
          {error && <ImageError />}
        </Fragment>
      ) : (
        <div className="flex items-center justify-center h-full p-2 text-muted-foreground">
          <p className="text-center text-xs">No media</p>
        </div>
      )}
    </div>
  )
}
