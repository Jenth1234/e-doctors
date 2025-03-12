'use client'

import '../tailwinds.css'
import { usePathname, useRouter } from 'next/navigation'
import { MountainIcon } from 'lucide-react'

const Icon: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()

  const back = () => {
    if (['/admin'].includes(pathname ?? '/')) {
      router.push('/')
    }
  }

  return <MountainIcon className="h-6 w-6" onClick={back} />
}

export default Icon
