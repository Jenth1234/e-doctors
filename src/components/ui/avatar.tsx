import Image from 'next/image'

interface AvatarProps {
  src: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Avatar({ src, alt = 'Avatar', size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 32, // 32px
    md: 48, // 48px
    lg: 64, // 64px
    xl: 96, // 96px
  }

  return (
    <div className="relative rounded-full overflow-hidden" style={{ width: sizeClasses[size], height: sizeClasses[size] }}>
      <Image
        src={src || '/default-avatar.png'}
        alt={alt}
        layout="fill"
        objectFit="cover"
        priority
      />
    </div>
  )
}
