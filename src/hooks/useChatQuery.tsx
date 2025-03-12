'use client'

import useSWR from 'swr'
import { getMessagesByConversationId } from '@/actions/messages'
import { useSocket } from '@/providers/SocketProvider'
import { useParams } from 'next/navigation'

export const useChatQuery = () => {
  const { isConnected } = useSocket()
  const params = useParams<{ conversationId: string }>()

  const fetchMessages = async () => {
    if (!params?.conversationId) return []

    console.log('fetching messages')
    return await getMessagesByConversationId(params.conversationId) ?? []
  }

  const { data: messages, error, isLoading } = useSWR(
    params?.conversationId ? `/api/messages/${params.conversationId}` : null,
    fetchMessages,
    {
      refreshInterval: isConnected ? 0 : 100,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return { messages, error, isLoading }
}
