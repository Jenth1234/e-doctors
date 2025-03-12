'use client'

import Image from 'next/image'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useModals } from '@/stores'
import { ModalType } from '@/constants'

export function ImageDialog() {
  const { isOpen, type, close, data } = useModals()
  const { src, alt, title, description } = data as any

  if (!data || !src || !alt) return null

  return (
    <Dialog open={isOpen && type === ModalType.IMAGE_DIALOG} onOpenChange={close}>
      <DialogTrigger asChild />
      <DialogContent className="sm:max-w-5xl md:max-w-6xl lg:max-w-7xl p-6">
        {title ? (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        ) : (
          <DialogTitle />
        )}
        <div className="relative w-full h-[70vh] overflow-hidden rounded-md">
          <Image
            src={src || '/image-dialog-placeholder.svg'}
            alt={alt}
            fill
            className="object-contain"
            priority
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
