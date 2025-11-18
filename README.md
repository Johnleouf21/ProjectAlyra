# Voting Smart Contract

Projet de smart contract de vote décentralisé développé avec Hardhat et Solidity.

## Description

Ce smart contract implémente un système de vote complet avec différentes phases de workflow :
- Enregistrement des votants
- Enregistrement des propositions
- Session de vote
- Dépouillement des votes

## Fonctionnalités

### Gestion des votants
- Enregistrement des votants par le propriétaire du contrat
- Vérification du statut d'enregistrement
- Un votant ne peut être enregistré qu'une seule fois

### Gestion des propositions
- Les votants peuvent soumettre des propositions
- Une proposition GENESIS est automatiquement créée au démarrage
- Les propositions vides sont interdites

### Système de vote
- Chaque votant peut voter une seule fois
- Les votes sont comptabilisés pour chaque proposition
- Protection contre le double vote

### Workflow
Le contrat suit un workflow strict en 6 étapes :
1. **RegisteringVoters** : Enregistrement des votants
2. **ProposalsRegistrationStarted** : Début de l'enregistrement des propositions
3. **ProposalsRegistrationEnded** : Fin de l'enregistrement des propositions
4. **VotingSessionStarted** : Début de la session de vote
5. **VotingSessionEnded** : Fin de la session de vote
6. **VotesTallied** : Votes dépouillés et résultat disponible

## Technologies utilisées

- **Solidity 0.8.28** : Langage de programmation du smart contract
- **Hardhat 3.0** : Framework de développement Ethereum
- **TypeScript** : Pour les tests et scripts
- **Ethers.js v6** : Bibliothèque pour interagir avec Ethereum
- **Chai** : Framework de tests
- **OpenZeppelin Contracts** : Bibliothèque de contrats sécurisés (Ownable)
- **Husky** : Hooks Git pour automatiser les vérifications
- **lint-staged** : Exécution de commandes sur les fichiers stagés

## Installation

```bash
# Cloner le repository
git clone <votre-repo>
cd Alyra

# Installer les dépendances
pnpm install
```

## Configuration

Créer un fichier `.env` à la racine du projet avec les variables suivantes :

```env
SEPOLIA_RPC_URL=votre_url_rpc_sepolia
SEPOLIA_PRIVATE_KEY=votre_clé_privée
ETHERSCAN_API_KEY=votre_clé_api_etherscan
```

## Compilation

```bash
pnpm compile
# ou
npx hardhat compile
```

## Tests

Le projet contient une suite de tests complète couvrant :
- Déploiement du contrat
- Enregistrement des votants (succès et échecs)
- Gestion des propositions (succès et échecs)
- Processus de vote (succès et échecs)
- Changements de statut du workflow
- Dépouillement des votes
- Workflow complet de bout en bout

### Exécuter les tests

```bash
# Exécuter tous les tests
pnpm test
# ou
npx hardhat test

# Exécuter les tests avec le rapport de couverture
npx hardhat coverage

# Exécuter un fichier de test spécifique
npx hardhat test test/Voting.ts
```

### Couverture des tests

Les tests couvrent :
- ✅ Tous les événements (VoterRegistered, WorkflowStatusChange, ProposalRegistered, Voted)
- ✅ Tous les revert avec messages d'erreur appropriés
- ✅ Les modifications d'état
- ✅ Les contrôles d'accès (onlyOwner, onlyVoters)
- ✅ Les cas limites (égalité, proposition vide, etc.)

## Déploiement

### Déploiement local

```bash
npx hardhat ignition deploy ignition/modules/Voting.ts --network hardhatMainnet
```

### Déploiement sur Sepolia

```bash
npx hardhat ignition deploy ignition/modules/Voting.ts --network sepolia --verify
```

## CI/CD

Le projet utilise **deux niveaux de CI/CD** pour garantir la qualité du code :

### 1. Hooks Git locaux avec Husky (Pre-commit & Pre-push)

Les hooks Git s'exécutent **automatiquement sur votre machine locale** avant chaque commit et push :

#### Pre-commit Hook
Exécuté avant chaque commit :
- ✅ Compilation des contrats Solidity modifiés
- ✅ Vérification TypeScript des fichiers .ts modifiés (via lint-staged)

#### Pre-push Hook
Exécuté avant chaque push :
- ✅ Exécution de tous les tests unitaires

Ces hooks vous permettent de détecter les erreurs **avant même de pousser sur GitHub**.

```bash
# Les hooks s'exécutent automatiquement
git add .
git commit -m "Update contract"  # Pre-commit hook s'exécute ici
git push                          # Pre-push hook s'exécute ici
```

Pour désactiver temporairement les hooks (à utiliser avec précaution) :
```bash
git commit --no-verify
git push --no-verify
```

### 2. GitHub Actions CI/CD (Post-push)

Le fichier `.github/workflows/ci.yml` définit 3 jobs qui s'exécutent **sur GitHub après le push** :

1. **Test** : Compile les contrats et exécute tous les tests + coverage
2. **Lint** : Vérifie la qualité du code TypeScript
3. **Build** : Compile les contrats et sauvegarde les artifacts

#### Déclenchement

Les workflows GitHub Actions sont déclenchés automatiquement sur :
- Push vers les branches `main` et `develop`
- Pull requests vers les branches `main` et `develop`

#### Statut des builds

Le badge de statut CI/CD s'affichera ici une fois le premier workflow exécuté :

```markdown
![CI/CD Status](https://github.com/<votre-username>/<votre-repo>/actions/workflows/ci.yml/badge.svg)
```

### Résumé : Différence entre Husky et GitHub Actions

| Aspect | Husky (Local) | GitHub Actions (Remote) |
|--------|---------------|-------------------------|
| **Quand** | Avant commit/push | Après push sur GitHub |
| **Où** | Sur votre machine | Sur les serveurs GitHub |
| **Avantages** | Feedback immédiat, évite les pushs défectueux | Environnement isolé, validation finale |
| **Utilisation** | Développement quotidien | Validation avant merge, déploiements |

## Structure du projet

```
Alyra/
├── contracts/
│   └── Voting.sol          # Smart contract principal
├── ignition/
│   └── modules/
│       └── Voting.ts       # Script de déploiement Hardhat Ignition
├── test/
│   └── Voting.ts           # Tests unitaires complets
├── .github/
│   └── workflows/
│       └── ci.yml          # Configuration CI/CD GitHub Actions
├── .husky/
│   ├── pre-commit          # Hook Git pre-commit
│   └── pre-push            # Hook Git pre-push
├── hardhat.config.ts       # Configuration Hardhat
├── package.json            # Dépendances et scripts
└── README.md               # Documentation
```

## Scripts disponibles

```bash
# Compiler les contrats
pnpm compile

# Exécuter les tests
pnpm test

# Vérifier TypeScript
pnpm lint
```

## Détails des tests implémentés

### 1. Tests de déploiement
- Vérification du propriétaire du contrat
- Vérification de l'enregistrement du votant initial
- Vérification du statut initial du workflow

### 2. Tests d'enregistrement des votants
- ✅ Enregistrement réussi avec émission d'événement `VoterRegistered`
- ❌ Revert si non-propriétaire tente d'enregistrer
- ❌ Revert si votant déjà enregistré
- ❌ Revert si enregistrement hors de la phase appropriée

### 3. Tests des getters
- ✅ Accès autorisé pour les votants
- ❌ Revert pour les non-votants

### 4. Tests d'enregistrement des propositions
- ✅ Démarrage avec émission d'événement `WorkflowStatusChange`
- ✅ Création automatique de la proposition GENESIS
- ✅ Ajout de proposition avec émission d'événement `ProposalRegistered`
- ❌ Revert si proposition vide
- ❌ Revert si non-votant
- ❌ Revert si hors période d'enregistrement

### 5. Tests de changement de statut
- ✅ Tous les changements de statut avec événements
- ❌ Revert si changement depuis un mauvais statut
- ❌ Revert si non-propriétaire

### 6. Tests de vote
- ✅ Vote réussi avec émission d'événement `Voted`
- ✅ Incrémentation correcte du compteur de votes
- ❌ Revert si non-votant
- ❌ Revert si double vote
- ❌ Revert si proposition inexistante
- ❌ Revert si hors session de vote

### 7. Tests de dépouillement
- ✅ Dépouillement correct avec émission d'événement
- ✅ Gestion des égalités (première proposition gagne)
- ✅ Gestion du cas sans votes
- ❌ Revert si dépouillement prématuré
- ❌ Revert si non-propriétaire

### 8. Test du workflow complet
- ✅ Exécution complète de bout en bout du processus de vote

## Sécurité

Le contrat utilise les meilleures pratiques de sécurité :
- Utilisation d'OpenZeppelin Ownable pour la gestion des accès
- Modificateurs pour contrôler les accès (onlyOwner, onlyVoters)
- Vérifications de l'état du workflow avant chaque action
- Protection contre le double vote
- Validation des entrées

## Améliorations futures possibles

- Ajout de la possibilité de déléguer son vote
- Système de vote pondéré
- Support de plusieurs sessions de vote simultanées
- Interface frontend avec React
- Notifications off-chain via The Graph

## Auteur

Projet réalisé dans le cadre de la formation Alyra

## Licence

MIT
