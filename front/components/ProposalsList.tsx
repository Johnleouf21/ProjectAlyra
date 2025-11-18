'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useVotingContract } from '@/hooks/useVotingContract'
import { useAccount } from 'wagmi'

export function ProposalsList() {
  const { address } = useAccount()
  const { proposals, workflowStatus } = useVotingContract(address!)

  if (!proposals || proposals.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No proposals yet. Wait for the proposals registration phase.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Proposals</CardTitle>
        <CardDescription>
          View all submitted proposals and their vote counts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {proposals.map((proposal, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 hover:bg-accent transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">#{index}</Badge>
                    <h3 className="font-medium">{proposal.description}</h3>
                  </div>
                  {(workflowStatus ?? -1) >= 4 && (
                    <p className="text-sm text-muted-foreground">
                      Votes: {proposal.voteCount.toString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
