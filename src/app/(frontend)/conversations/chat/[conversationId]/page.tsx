import { getConversations } from '@/actions/conversation'
import { Chat } from '@/components/Chat'
import { redirect } from 'next/navigation'

export default async function Page({
  params,
}: {
  params: Promise<{
    conversationId: string
  }>
}) {
  const { conversationId } = await params

  if (!conversationId) {
    redirect('/conversations')
  }

  const { data: conversations } = await getConversations()

  if (!conversations) {
    redirect('/conversations')
  }

  return <Chat conversations={conversations} currentConversationId={conversationId} />
}
