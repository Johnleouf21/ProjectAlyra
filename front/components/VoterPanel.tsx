'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useVotingContract } from '@/hooks/useVotingContract'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface VoterPanelProps {
  address: string
}

export function VoterPanel({ address }: VoterPanelProps) {
  const [proposalDescription, setProposalDescription] = useState('')
  const [selectedProposalId, setSelectedProposalId] = useState<string>('')

  const {
    isVoter,
    workflowStatus,
    proposals,
    hasVoted,
    addProposal,
    vote,
    isLoading
  } = useVotingContract(address)

  const handleAddProposal = async () => {
    if (!proposalDescription) return
    await addProposal(proposalDescription)
    setProposalDescription('')
  }

  const handleVote = async () => {
    if (!selectedProposalId) return
    await vote(Number(selectedProposalId))
  }

  if (!isVoter) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            You are not registered as a voter. Please contact the administrator.
          </AlertDescription>
        </Alert>
        <Card>
          <CardHeader>
            <CardTitle>Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your Address:</span>
              <Badge variant="outline" className="text-xs">{address}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Is Registered:</span>
              <Badge variant="outline">{isVoter ? 'Yes' : 'No'}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Workflow Status:</span>
              <Badge variant="outline">{workflowStatus ?? 'Loading...'}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
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
      {/* Status Info - Always visible first */}
      <Card>
        <CardHeader>
          <CardTitle>Voting Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Phase:</span>
              <Badge>{workflowStatusLabels[workflowStatus ?? 0]}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Workflow Status Code:</span>
              <Badge variant="outline">{workflowStatus ?? 'Loading...'}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your Status:</span>
              <Badge variant={hasVoted ? "secondary" : "outline"}>
                {hasVoted ? "Voted" : "Not Voted"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Proposal Section */}
      {workflowStatus === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Submit a Proposal</CardTitle>
            <CardDescription>
              Add your proposal during the registration period
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proposal">Proposal Description</Label>
              <Input
                id="proposal"
                placeholder="Enter your proposal..."
                value={proposalDescription}
                onChange={(e) => setProposalDescription(e.target.value)}
              />
            </div>
            <Button
              onClick={handleAddProposal}
              disabled={!proposalDescription || isLoading}
              className="w-full"
            >
              Submit Proposal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Info when not in proposal phase */}
      {workflowStatus === 0 && (
        <Alert>
          <AlertDescription>
            Waiting for proposal registration to start. The admin needs to start the proposals registration phase from the Admin tab.
          </AlertDescription>
        </Alert>
      )}

      {workflowStatus === 2 && (
        <Alert>
          <AlertDescription>
            Proposal registration has ended. Waiting for the voting session to start.
          </AlertDescription>
        </Alert>
      )}

      {/* Voting Section */}
      {workflowStatus === 3 && !hasVoted && (
        <Card>
          <CardHeader>
            <CardTitle>Cast Your Vote</CardTitle>
            <CardDescription>
              Select a proposal to vote for
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={selectedProposalId} onValueChange={setSelectedProposalId}>
              {proposals.map((proposal, index) => (
                <div key={index} className="flex items-center space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value={index.toString()} id={`proposal-${index}`} />
                  <Label htmlFor={`proposal-${index}`} className="flex-1 cursor-pointer">
                    <div className="font-medium">{proposal.description}</div>
                    <div className="text-sm text-muted-foreground">
                      Proposal #{index}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <Button
              onClick={handleVote}
              disabled={!selectedProposalId || isLoading}
              className="w-full"
            >
              Vote
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Already Voted */}
      {hasVoted && (
        <Alert>
          <AlertDescription>
            You have already cast your vote. Thank you for participating!
          </AlertDescription>
        </Alert>
      )}

      {/* Info for ended phases */}
      {(workflowStatus === 4 || workflowStatus === 5) && (
        <Alert>
          <AlertDescription>
            Voting has ended. Check the Results tab to see the outcome.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
