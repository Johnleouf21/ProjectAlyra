'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OwnerPanel } from './OwnerPanel'
import { VoterPanel } from './VoterPanel'
import { ProposalsList } from './ProposalsList'
import { VotingResults } from './VotingResults'

interface VotingDashboardProps {
  address: string
}

export function VotingDashboard({ address }: VotingDashboardProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Voting Dashboard</CardTitle>
          <CardDescription>
            Manage proposals, vote, and view results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="vote" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="vote">Vote</TabsTrigger>
              <TabsTrigger value="proposals">Proposals</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            <TabsContent value="vote" className="space-y-4">
              <VoterPanel address={address} />
            </TabsContent>

            <TabsContent value="proposals" className="space-y-4">
              <ProposalsList />
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <VotingResults />
            </TabsContent>

            <TabsContent value="admin" className="space-y-4">
              <OwnerPanel address={address} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
