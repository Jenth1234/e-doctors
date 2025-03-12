'use client'

import axios from 'axios'
import { zodResolver } from '@hookform/resolvers/zod'
import { DoorOpen, ImageIcon, LinkIcon, Scissors, Send, Settings, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import { CHAT_KEY, MAX_ATTACHMENTS } from '@/constants'
import { Loader } from '@/components/Loader'
import { SettingsDialog } from '@/components/SettingDialog'
import SocketIndicator from '@/components/SocketIndicator'
import { Badge } from '../ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormField } from '../ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useChatQuery } from '@/hooks/useChatQuery'
import { useAuth } from '@/providers/AuthProvider'
import { useSocket } from '@/providers/SocketProvider'
import { Conversation, Message } from '@/payload-types'
import { PayloadMessageValidator, TPayloadMessageValidator } from '@/validations'
import { MediaBlock } from '@/components/MediaBlock'



export function Chat({
  conversations,
  currentConversationId,
}: {
  conversations: Conversation[]
  currentConversationId: string
}) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const imageInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { messages, isLoading, error } = useChatQuery()
  const [messagesClient, setMessagesClient] = useState<Message[]>([])
  const { user } = useAuth()
  const { isConnected, socket } = useSocket()
  const chatKey = `${CHAT_KEY}:${currentConversationId}`
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [attachmentClients, setAttachmentClients] = useState<File[]>([])

  const form = useForm<TPayloadMessageValidator>({
    resolver: zodResolver(PayloadMessageValidator),
    defaultValues: {
      conversationId: currentConversationId,
      content: '',
      attachments: [],
      role: user?.roles.includes('doctor') ? 'Doctor' : 'User',
    },
  })

  const {isSubmitting} = form.formState

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }

  const currentConversation =
    conversations.find((conv) => conv.id === currentConversationId) || conversations[0]

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {

      if (attachmentClients.length >= MAX_ATTACHMENTS) {
        toast.error('You can only upload up to 3 attachments')
        return
      }

      const files = e.target.files;
      if (files && files.length > 0) {
        const newAttachments = Array.from(files);
        setAttachmentClients((prev) => [...prev, ...newAttachments]);
        form.setValue('attachments', [...(form.getValues('attachments') || []), ...newAttachments]);
      }
    };
    

  const handleCut = () => {
    if (inputRef.current) {
      const start = inputRef.current.selectionStart
      const end = inputRef.current.selectionEnd
      const content = form.getValues('content')

      if (start !== null && end !== null && start !== end && content) {
        navigator.clipboard.writeText(content.slice(start, end))
        const newText = content.slice(0, start) + content.slice(end)
        form.setValue('content', newText)
      }
    }
  }

  const handleLinkInsert = () => {
    const content = form.getValues('content')

    if (linkUrl) {
      const newText = content + ` [Link](${linkUrl})`
      form.setValue('content', newText)
      setLinkUrl('')
      setIsLinkDialogOpen(false)
    }
  }

  const handleConversationChange = (id: string) => {
    router.push(`/conversations/chat/${id}`)
  }

  const handleAttachmentRemove = (attachment: File) => {
    setAttachmentClients((prev) => prev.filter((a) => a.name !== attachment.name))
    form.setValue('attachments', form.getValues('attachments')?.filter((a) => a.name !== attachment.name) || [])
  }

  const onSubmit = async (values: TPayloadMessageValidator) => {
    if (!user) {
      toast.error('Please login to send a message')
      return
    }

    const { success, data } = PayloadMessageValidator.safeParse(values)

    if (!success) {
      toast.error('Please fill in all fields')
      return
    }

    const { content, attachments } = data

    if (!content && !attachments.length) {
      toast.error('Content or attachment is required')
      return
    }

    const formData = new FormData()

    formData.append('conversationId', currentConversationId);
    formData.append('role', data.role);
    if (data.content) {
      formData.append('content', data.content);
    }
    if (data.attachments && data.attachments.length > 0) {
      for (const file of data.attachments) {
        formData.append('attachments', file, file.name);
      }
    }

    axios
      .post('/api/socket/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        toast.success(res.data.message)
      })
      .catch((err) => {
        toast.error(err.response.data.message)
      })

    setAttachmentClients([])
    // clean up
    form.setValue('content', '')
    form.setValue('attachments', [])
  }

  // side effects
  useEffect(() => {
    if (isConnected) {
      socket?.on(chatKey, (message: any) => {
        setMessagesClient((prev) => [...prev, message])
      })
    }
    return () => {
      socket?.off(chatKey)
    }
  }, [isConnected, socket, chatKey])

  useEffect(() => {
    if (messages) {
      setMessagesClient(messages)
    }
  }, [messages])

  useEffect(() => {
    setTimeout(scrollToBottom, 1000)
  }, [messagesClient, messages])

  useEffect(() => {
    if (user?.roles?.includes('doctor')) {
      form.setValue('role', 'Doctor')
    }
  }, [user, form])

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-64 border-r p-4 overflow-y-auto bg-background">
        <h2 className="text-lg font-semibold mb-4">Conversations</h2>
        {conversations.map((conv) => (
          <Button
            key={conv.id}
            variant={conv.id === currentConversationId ? 'default' : 'ghost'}
            className="w-full justify-start mb-2 mr-2 text-sm md:text-base truncate"
            onClick={() => handleConversationChange(conv.id)}
          >
            {conv.name}
            {conv.id === currentConversationId && <DoorOpen className="w-4 h-4" />}
          </Button>
        ))}
      </div>

      <div className="flex-1 flex flex-col bg-background">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <span>{currentConversation?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
            <SocketIndicator />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {!isLoading &&
            messagesClient?.map((message, index) => {
              
              const currentUserIsDoctor = user?.roles?.includes('doctor');
              const isDoctor = message.role === 'Doctor';
              const shouldShowOnRight = (currentUserIsDoctor && isDoctor) || (!currentUserIsDoctor && !isDoctor);
              const isCurrentUser = message.sender === user?.id;
              const senderId = typeof message.sender === 'string' ? message.sender : message.sender.id;

              return (
                <div
                  key={index}
                  className={`flex ${shouldShowOnRight ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  <Card
                    className={cn(
                      'p-4 max-w-[80%]',
                      isDoctor ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900',
                    )}
                  >
                    <div
                      className={`flex gap-4 ${shouldShowOnRight ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div
                        className={cn(
                          'h-8 w-8 rounded-full flex items-center justify-center text-white',
                          isDoctor ? 'bg-blue-500' : 'bg-green-500'
                        )}
                      >
                        {user?.name?.charAt(0) || 'N/A'}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">
                          {
                            isCurrentUser ? 'You' : (isDoctor ? `Doctor #${senderId}` : `User ${senderId}`)
                          }
                        </div>
                        <div className="text-foreground">{message.content}</div>
                        {message.attachments &&
                          message.attachments.length > 0 &&
                          message.attachments.map((attachment) => (
                            <div key={attachment.id} className="mt-2">
                              <MediaBlock
                                media={attachment.media}
                                aspectRatio="auto"
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          <div ref={messagesEndRef} />
          {(isLoading || error) && <Loader className="text-blue-500" />}
        </div>

        <div className="p-4 border-t">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
              <div className="flex flex-col gap-2">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <Input
                      disabled={isLoading || isSubmitting}
                      ref={inputRef}
                      className="w-full"
                      placeholder="Type your question here..."
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <div className="flex justify-between items-center">
                  <div className="flex gap-3">
                    <Button
                      disabled={isLoading || isSubmitting}
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      disabled={isLoading || isSubmitting}
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsLinkDialogOpen(true)}
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleCut}
                      disabled={isLoading || isSubmitting}
                    >
                      <Scissors className="h-4 w-4" />
                    </Button>
                    {attachmentClients.length > 0 &&
                      attachmentClients.map((attachment) => (
                        <Badge
                          key={attachment.name}
                          variant="outline"
                          onClick={() => handleAttachmentRemove(attachment)}
                        >
                          {attachment.name}
                          <X className="w-4 h-4" />
                        </Badge>
                      ))}
                  </div>
                  <Button type="submit" size="icon" disabled={isLoading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Input
                type="file"
                ref={imageInputRef}
                className="hidden"
                onChange={handleImageUpload}
                accept="image/*"
              />
            </form>
          </Form>
        </div>

        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Link</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  placeholder="Please enter the URL"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsLinkDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleLinkInsert}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      </div>
    </div>
  )
}
