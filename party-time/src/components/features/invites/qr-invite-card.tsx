'use client'

import { useEffect, useState } from 'react'
import { generateQRCode } from '@/lib/qr'
import { buildInviteUrl } from '@/server/services/invite.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

export function QRInviteCard({
  eventId,
  eventTitle,
}: {
  eventId: string
  eventTitle: string
}) {
  const [qrCode, setQrCode] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}/invite`

  useEffect(() => {
    generateQRCode(inviteUrl).then(setQrCode)
  }, [inviteUrl])

  async function copyLink() {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Share link or QR code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {qrCode && (
          <div className="flex justify-center">
            <img
              src={qrCode}
              alt={`QR code for ${eventTitle}`}
              className="w-40 h-40 rounded-lg"
            />
          </div>
        )}
        <Button
          onClick={copyLink}
          variant="outline"
          className="w-full"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy invite link
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}