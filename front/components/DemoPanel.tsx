'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useVotingContract } from '@/hooks/useVotingContract'
import { Info } from 'lucide-react'

interface DemoPanelProps {
  address: string
}

// Adresses de démo fictives (vous pouvez les remplacer par de vraies adresses de test)
const DEMO_VOTERS = [
  '0x0aa4fb3a1393e1bffa4a11139b38a3bfc581609d',
  '0x413845f25ce92c8d44fc94f32395149d0108beeb',
  '0xd98af8e2e331036a8c3ffbe9cec8134cd25bf9c1',
  '0x9b959a5dde40dd7c2685087d634b36e87e7bbe6a',
  '0x3b99aeaf1bdaf899b2b68302be3fc80c0a689fb5'
]

const DEMO_PROPOSALS = [
  'Augmenter le budget marketing de 20%',
  'Développer une nouvelle fonctionnalité mobile',
  'Organiser un événement communautaire annuel',
  'Créer un programme de récompenses pour les contributeurs',
  'Mettre en place un système de gouvernance décentralisée'
]

export function DemoPanel({ address }: DemoPanelProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [log, setLog] = useState<string[]>([])

  const {
    isOwner,
    workflowStatus,
    addVoters,
    addProposal,
    startProposalsRegistering,
    endProposalsRegistering,
    startVotingSession,
    endVotingSession,
    tallyVotes,
    isLoading
  } = useVotingContract(address)

  const addLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const runFullDemo = async () => {
    setIsRunning(true)
    setLog([])

    try {
      addLog('🚀 Démarrage de la démo complète...')

      // Phase 1: Enregistrer les voteurs
      if (workflowStatus === 0) {
        addLog('📝 Enregistrement des voteurs...')
        await addVoters(DEMO_VOTERS)
        await sleep(3000)

        addLog('✅ Démarrage de la phase de propositions...')
        await startProposalsRegistering()
        await sleep(3000)
      }

      // Phase 2: Ajouter des propositions
      if (workflowStatus === 1) {
        addLog('💡 Ajout des propositions de démo...')
        for (const proposal of DEMO_PROPOSALS) {
          await addProposal(proposal)
          addLog(`   ✓ Ajouté: ${proposal}`)
          await sleep(2000)
        }

        addLog('⏸️ Fin de la phase de propositions...')
        await sleep(2000)
        await endProposalsRegistering()
        await sleep(3000)

        addLog('🗳️ Démarrage de la phase de vote...')
        await startVotingSession()
        await sleep(3000)
      }

      // Note: Les votes doivent être faits manuellement par chaque adresse
      // car on ne peut pas voter pour d'autres adresses
      if (workflowStatus === 3) {
        addLog('⚠️ Phase de vote active - Les voteurs peuvent maintenant voter!')
        addLog('💡 Conseil: Changez de compte MetaMask pour voter avec différentes adresses')
      }

      addLog('✨ Configuration de démo terminée!')

    } catch (error) {
      addLog(`❌ Erreur: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  const setupVoters = async () => {
    setIsRunning(true)
    try {
      addLog('📝 Enregistrement des 5 voteurs de démo...')
      await addVoters(DEMO_VOTERS)
      addLog('✅ Voteurs enregistrés!')
    } catch (error) {
      addLog(`❌ Erreur: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  const setupProposals = async () => {
    setIsRunning(true)
    try {
      addLog('💡 Ajout des 5 propositions de démo...')
      for (let i = 0; i < DEMO_PROPOSALS.length; i++) {
        await addProposal(DEMO_PROPOSALS[i])
        addLog(`   ✓ ${i + 1}/${DEMO_PROPOSALS.length}: ${DEMO_PROPOSALS[i]}`)
        await sleep(2000)
      }
      addLog('✅ Propositions ajoutées!')
    } catch (error) {
      addLog(`❌ Erreur: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  const advanceWorkflow = async () => {
    setIsRunning(true)
    try {
      if (workflowStatus === 0) {
        addLog('➡️ Passage à la phase de propositions...')
        await startProposalsRegistering()
      } else if (workflowStatus === 1) {
        addLog('➡️ Fin de la phase de propositions...')
        await endProposalsRegistering()
      } else if (workflowStatus === 2) {
        addLog('➡️ Démarrage de la phase de vote...')
        await startVotingSession()
      } else if (workflowStatus === 3) {
        addLog('➡️ Fin de la phase de vote...')
        await endVotingSession()
      } else if (workflowStatus === 4) {
        addLog('➡️ Décompte des votes...')
        await tallyVotes()
      }
      addLog('✅ Phase avancée!')
    } catch (error) {
      addLog(`❌ Erreur: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  if (!isOwner) {
    return null
  }

  return (
    <Card className="border-dashed border-2 border-primary/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          <CardTitle>Panneau de Démonstration</CardTitle>
        </div>
        <CardDescription>
          Scripts automatisés pour faciliter les démos et tests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription className="text-xs">
            <strong>Info:</strong> Ces boutons sont visibles uniquement pour l'owner et facilitent
            la création de scénarios de démonstration sans devoir tout faire manuellement.
          </AlertDescription>
        </Alert>

        <Separator />

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Scripts rapides</h4>
          <div className="grid grid-cols-1 gap-2">
            <Button
              onClick={runFullDemo}
              disabled={isRunning || isLoading || workflowStatus !== 0}
              variant="default"
              className="w-full"
            >
              🚀 Démo Complète (Phase 0 uniquement)
            </Button>
            <Button
              onClick={setupVoters}
              disabled={isRunning || isLoading || workflowStatus !== 0}
              variant="outline"
              className="w-full"
            >
              👥 Ajouter 5 Voteurs
            </Button>
            <Button
              onClick={setupProposals}
              disabled={isRunning || isLoading || workflowStatus !== 1}
              variant="outline"
              className="w-full"
            >
              💡 Ajouter 5 Propositions
            </Button>
            <Button
              onClick={advanceWorkflow}
              disabled={isRunning || isLoading || workflowStatus === 5}
              variant="secondary"
              className="w-full"
            >
              ⏭️ Avancer au Workflow Suivant
            </Button>
          </div>
        </div>

        <Separator />

        {/* Log console */}
        {log.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Console</h4>
            <div className="bg-muted rounded-lg p-3 max-h-40 overflow-y-auto">
              {log.map((entry, i) => (
                <div key={i} className="text-xs font-mono mb-1">
                  {entry}
                </div>
              ))}
            </div>
            <Button
              onClick={() => setLog([])}
              variant="ghost"
              size="sm"
              className="w-full"
            >
              Effacer la console
            </Button>
          </div>
        )}

        <Alert>
          <AlertDescription className="text-xs">
            <strong>Note:</strong> Les votes ne peuvent pas être automatisés car chaque voteur
            doit voter avec sa propre adresse. Utilisez MetaMask pour changer de compte.
          </AlertDescription>
        </Alert>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Adresses de démo:</strong></p>
          {DEMO_VOTERS.slice(0, 3).map((addr, i) => (
            <p key={i} className="font-mono">{i + 1}. {addr.slice(0, 10)}...{addr.slice(-8)}</p>
          ))}
          <p className="text-muted-foreground">+ 2 autres adresses...</p>
        </div>
      </CardContent>
    </Card>
  )
}
