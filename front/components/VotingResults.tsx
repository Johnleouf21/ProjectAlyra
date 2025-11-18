'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useVotingContract } from '@/hooks/useVotingContract'
import { useAccount } from 'wagmi'
import { Trophy } from 'lucide-react'

export function VotingResults() {
  const { address } = useAccount()
  const { proposals, winner, workflowStatus } = useVotingContract(address!)

  if ((workflowStatus ?? -1) < 5) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Results will be available after votes are tallied
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!proposals || proposals.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No proposals available
          </p>
        </CardContent>
      </Card>
    )
  }

  // Calculate total votes
  const totalVotes = proposals.reduce((sum, p) => sum + Number(p.voteCount), 0)

  // Sort proposals by vote count (descending)
  const sortedProposals = [...proposals].sort((a, b) =>
    Number(b.voteCount) - Number(a.voteCount)
  )

  const winningProposal = winner !== undefined ? proposals[winner] : null

  return (
    <div className="space-y-6">
      {/* Winner Card */}
      {winningProposal && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-600" />
              <CardTitle>Winner</CardTitle>
            </div>
            <CardDescription>
              The proposal with the most votes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge>#{winner}</Badge>
                <h3 className="text-lg font-semibold">{winningProposal.description}</h3>
              </div>
              <p className="text-muted-foreground">
                Total Votes: {winningProposal.voteCount.toString()}
                {totalVotes > 0 && ` (${Math.round((Number(winningProposal.voteCount) / totalVotes) * 100)}%)`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Results */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
          <CardDescription>
            All proposals ranked by vote count
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedProposals.map((proposal) => {
              const originalIndex = proposals.findIndex(p => p.description === proposal.description)
              const percentage = totalVotes > 0
                ? Math.round((Number(proposal.voteCount) / totalVotes) * 100)
                : 0

              return (
                <div key={originalIndex} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{originalIndex}</Badge>
                      <span className="font-medium">{proposal.description}</span>
                      {originalIndex === winner && (
                        <Trophy className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {proposal.voteCount.toString()} votes ({percentage}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}

            {totalVotes === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No votes were cast
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
