'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useVotingContract } from '@/hooks/useVotingContract'
import { DemoPanel } from './DemoPanel'

interface OwnerPanelProps {
  address: string
}

export function OwnerPanel({ address }: OwnerPanelProps) {
  const [voterAddress, setVoterAddress] = useState('')
  const [votersAddresses, setVotersAddresses] = useState('')

  const {
    isOwner,
    workflowStatus,
    addVoter,
    addVoters,
    startProposalsRegistering,
    endProposalsRegistering,
    startVotingSession,
    endVotingSession,
    tallyVotes,
    resetVoting,
    isLoading
  } = useVotingContract(address)

  const handleAddVoter = async () => {
    if (!voterAddress) return
    await addVoter(voterAddress)
    setVoterAddress('')
  }

  const handleAddVoters = async () => {
    if (!votersAddresses) return
    const addresses = votersAddresses.split(',').map(addr => addr.trim()).filter(addr => addr)
    await addVoters(addresses)
    setVotersAddresses('')
  }

  if (!isOwner) {
    return (
      <Alert>
        <AlertDescription>
          You are not the contract owner. Only the owner can access this panel.
        </AlertDescription>
      </Alert>
    )
  }

  const workflowStatusLabels = [
    'Registering Voters',
    'Proposals Registration Started',
    'Proposals Registration Ended',
    'Voting Session Started',
    'Voting Session Ended',
    'Votes Tallied'
  ]

  return (
    <div className="space-y-6">
      {/* Demo Panel - only visible for owner */}
      <DemoPanel address={address} />

      <Card>
        <CardHeader>
          <CardTitle>Owner Panel</CardTitle>
          <CardDescription>
            Manage voters and workflow status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Label>Current Status:</Label>
              <Badge variant="outline">
                {workflowStatusLabels[workflowStatus ?? 0]}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Add Single Voter */}
          <div className="space-y-2">
            <Label htmlFor="voter-address">Add Single Voter</Label>
            <div className="flex gap-2">
              <Input
                id="voter-address"
                placeholder="0x..."
                value={voterAddress}
                onChange={(e) => setVoterAddress(e.target.value)}
                disabled={workflowStatus !== 0}
              />
              <Button
                onClick={handleAddVoter}
                disabled={!voterAddress || workflowStatus !== 0 || isLoading}
              >
                Add Voter
              </Button>
            </div>
          </div>

          {/* Add Multiple Voters */}
          <div className="space-y-2">
            <Label htmlFor="voters-addresses">Add Multiple Voters (comma-separated)</Label>
            <div className="flex gap-2">
              <Input
                id="voters-addresses"
                placeholder="0x..., 0x..., 0x..."
                value={votersAddresses}
                onChange={(e) => setVotersAddresses(e.target.value)}
                disabled={workflowStatus !== 0}
              />
              <Button
                onClick={handleAddVoters}
                disabled={!votersAddresses || workflowStatus !== 0 || isLoading}
              >
                Add Voters
              </Button>
            </div>
          </div>

          <Separator />

          {/* Workflow Controls */}
          <div className="space-y-2">
            <Label>Workflow Controls</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={startProposalsRegistering}
                disabled={workflowStatus !== 0 || isLoading}
                variant="outline"
              >
                Start Proposals Registration
              </Button>
              <Button
                onClick={endProposalsRegistering}
                disabled={workflowStatus !== 1 || isLoading}
                variant="outline"
              >
                End Proposals Registration
              </Button>
              <Button
                onClick={startVotingSession}
                disabled={workflowStatus !== 2 || isLoading}
                variant="outline"
              >
                Start Voting Session
              </Button>
              <Button
                onClick={endVotingSession}
                disabled={workflowStatus !== 3 || isLoading}
                variant="outline"
              >
                End Voting Session
              </Button>
              <Button
                onClick={tallyVotes}
                disabled={workflowStatus !== 4 || isLoading}
                variant="default"
              >
                Tally Votes
              </Button>
              <Button
                onClick={resetVoting}
                disabled={workflowStatus !== 5 || isLoading}
                variant="destructive"
              >
                Reset Voting
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
