'use client'

import { useEffect } from 'react'
import { useReadContract, useWriteContract, useWatchContractEvent, useWaitForTransactionReceipt } from 'wagmi'
import { VOTING_OPTIMIZED_ABI } from '@/lib/votingOptimizedABI'
import { toast } from 'sonner'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS as `0x${string}`

interface Proposal {
  description: string
  voteCount: bigint
}

interface Voter {
  isRegistered: boolean
  hasVoted: boolean
  votedProposalId: bigint
}

export function useVotingContract(address: string) {

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Read contract owner (static, no need for frequent polling)
  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VOTING_OPTIMIZED_ABI,
    functionName: 'owner',
    query: {
      refetchInterval: 2000,
    },
  })

  // Read workflow status
  const { data: workflowStatus, refetch: refetchStatus } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VOTING_OPTIMIZED_ABI,
    functionName: 'workflowStatus',
    query: {
      refetchInterval: 2000,
    },
  })

  // Read voter info
  const { data: voterData, refetch: refetchVoter, error: voterError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VOTING_OPTIMIZED_ABI,
    functionName: 'getVoter',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address, // Only fetch if address is available
      refetchInterval: 2000, 
    },
  })

  // Read all proposals
  const { data: proposalsData, refetch: refetchProposals } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VOTING_OPTIMIZED_ABI,
    functionName: 'getAllProposals',
    query: {
      refetchInterval: 2000, 
    },
  })

  // Read winner
  const { data: winner, refetch: refetchWinner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VOTING_OPTIMIZED_ABI,
    functionName: 'getWinner',
    query: {
      enabled: workflowStatus === 5, // Only fetch if votes are tallied
      refetchInterval: 2000, 
    },
  })

  // Watch for events with polling interval to avoid rate limiting
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: VOTING_OPTIMIZED_ABI,
    eventName: 'VoterRegistered',
    pollingInterval: 2000, 
    onLogs() {
      refetchVoter()
      toast.success('New voter registered')
    },
  })

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: VOTING_OPTIMIZED_ABI,
    eventName: 'ProposalRegistered',
    pollingInterval: 2000, 
    onLogs() {
      refetchProposals()
      toast.success('New proposal registered')
    },
  })

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: VOTING_OPTIMIZED_ABI,
    eventName: 'Voted',
    pollingInterval: 2000, 
    onLogs() {
      refetchVoter()
      refetchProposals()
      toast.success('Vote recorded')
    },
  })

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: VOTING_OPTIMIZED_ABI,
    eventName: 'WorkflowStatusChange',
    pollingInterval: 2000, 
    onLogs() {
      refetchStatus()
      toast.info('Workflow status changed')
    },
  })

  // Show success message and refetch data
  useEffect(() => {
    if (isSuccess) {
      toast.success('Transaction confirmed!')
      refetchStatus()
      refetchVoter()
      refetchProposals()
      refetchWinner()
    }
  }, [isSuccess, refetchStatus, refetchVoter, refetchProposals, refetchWinner])

  // Handle the case where getVoter reverts with NotVoter error
  // If there's an error, it means the user is not registered
  const voter = voterData as Voter | undefined
  const isOwner = owner && address ? (owner as string).toLowerCase() === address.toLowerCase() : false
  const isVoter = voterError ? false : (voter?.isRegistered ?? false)
  const hasVoted = voterError ? false : (voter?.hasVoted ?? false)

  // Write functions
  const addVoter = async (voterAddress: string) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: VOTING_OPTIMIZED_ABI,
        functionName: 'addVoter',
        args: [voterAddress as `0x${string}`],
      })
    } catch (error) {
      toast.error('Failed to add voter')
      console.error(error)
    }
  }

  const addVoters = async (addresses: string[]) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: VOTING_OPTIMIZED_ABI,
        functionName: 'addVoters',
        args: [addresses as `0x${string}`[]],
      })
    } catch (error) {
      toast.error('Failed to add voters')
      console.error(error)
    }
  }

  const addProposal = async (description: string) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: VOTING_OPTIMIZED_ABI,
        functionName: 'addProposal',
        args: [description],
      })
    } catch (error) {
      toast.error('Failed to add proposal')
      console.error(error)
    }
  }

  const vote = async (proposalId: number) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: VOTING_OPTIMIZED_ABI,
        functionName: 'setVote',
        args: [BigInt(proposalId)],
      })
    } catch (error) {
      toast.error('Failed to vote')
      console.error(error)
    }
  }

  const startProposalsRegistering = async () => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: VOTING_OPTIMIZED_ABI,
        functionName: 'startProposalsRegistering',
      })
    } catch (error) {
      toast.error('Failed to start proposals registration')
      console.error(error)
    }
  }

  const endProposalsRegistering = async () => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: VOTING_OPTIMIZED_ABI,
        functionName: 'endProposalsRegistering',
      })
    } catch (error) {
      toast.error('Failed to end proposals registration')
      console.error(error)
    }
  }

  const startVotingSession = async () => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: VOTING_OPTIMIZED_ABI,
        functionName: 'startVotingSession',
      })
    } catch (error) {
      toast.error('Failed to start voting session')
      console.error(error)
    }
  }

  const endVotingSession = async () => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: VOTING_OPTIMIZED_ABI,
        functionName: 'endVotingSession',
      })
    } catch (error) {
      toast.error('Failed to end voting session')
      console.error(error)
    }
  }

  const tallyVotes = async () => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: VOTING_OPTIMIZED_ABI,
        functionName: 'tallyVotes',
      })
    } catch (error) {
      toast.error('Failed to tally votes')
      console.error(error)
    }
  }

  const resetVoting = async () => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: VOTING_OPTIMIZED_ABI,
        functionName: 'resetVoting',
      })
    } catch (error) {
      toast.error('Failed to reset voting')
      console.error(error)
    }
  }

  return {
    isOwner,
    isVoter,
    hasVoted,
    workflowStatus: workflowStatus as number | undefined,
    proposals: (proposalsData as Proposal[]) || [],
    winner: winner as number | undefined,
    isLoading: isPending || isConfirming,
    addVoter,
    addVoters,
    addProposal,
    vote,
    startProposalsRegistering,
    endProposalsRegistering,
    startVotingSession,
    endVotingSession,
    tallyVotes,
    resetVoting,
  }
}
