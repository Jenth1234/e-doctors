'use client'

import { Card, CardContent } from "@/components/ui/card"
import { User } from "@/payload-types"
import { useAuth } from "@/providers/AuthProvider";
import { Badge } from "../ui/badge";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

interface ConversationCardProps {
    id: string,
    name: string,
    description?: string,
    participants: (string | User)[];
}

export default function ConversationCard({ id, name, description = 'Your Medical Respondent', participants }: ConversationCardProps) {
  const {user } = useAuth()
  const router = useRouter()

  if(!user || !user.id || !id) {
    return null
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 group h-full" onClick={() => router.push(`/conversations/chat/${id}`)}>
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex flex-col items-center text-center space-y-2 mb-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300"
            style={{ backgroundColor: `#FF4A0020` }}
          >
            <Zap
              className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
              style={{ color: `#FF4A00` }}
            />
          </div>
          <h3 className="font-bold text-xl">{name}</h3>
          <Badge variant="outline">{description}</Badge>
        </div>

        <p className="text-xs text-gray-500 flex-grow overflow-hidden text-center">
          {
            participants.map((participant) => {
              if(typeof participant === 'string' && participant !== user?.id) {
                return participant
              }

              if(typeof participant === 'object' && participant.id !== user?.id) {
                return participant.name
              }
            })
          }
        </p>
      </CardContent>
    </Card>
  )
}

