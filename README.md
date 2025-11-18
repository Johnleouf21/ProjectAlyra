# Voting DApp - Monorepo

Projet de DApp de vote décentralisé développé avec Hardhat, Solidity et Next.js.

## 📁 Structure du Projet

```
Alyra/
├── backend/           # Smart contracts Solidity + Hardhat
│   ├── contracts/     # Contrats Solidity (Voting.sol, VotingOptimized.sol)
│   ├── test/          # Tests unitaires (91 tests, 100% coverage)
│   ├── ignition/      # Scripts de déploiement Hardhat Ignition
│   └── types/         # Types TypeScript générés
├── front/             # Application Next.js
│   ├── app/           # Pages et routes Next.js App Router
│   └── public/        # Assets statiques
└── .github/
    └── workflows/     # CI/CD GitHub Actions (monorepo)
```

## 🚀 Quick Start

### Prérequis
- Node.js 24+
- pnpm 9+

### Installation

```bash
# Cloner le repository
git clone <votre-repo>
cd Alyra

# Installer Husky à la racine
pnpm install

# Installer les dépendances du backend
cd backend && pnpm install

# Installer les dépendances du frontend
cd ../front && pnpm install
```

## 🔧 Développement

### Backend (Smart Contracts)

```bash
cd backend

# Compiler les contrats
pnpm compile

# Lancer les tests
pnpm test

# Tests avec couverture
npx hardhat test --coverage

# Tests avec statistiques de gas
npx hardhat test --gas-stats

# Déployer sur Sepolia
npx hardhat ignition deploy ignition/modules/VotingOptimized.ts --network sepolia --verify
```

### Frontend (Next.js)

```bash
cd front

# Développement
pnpm dev

# Build production
pnpm build

# Lancer en production
pnpm start

# Lint
pnpm lint
```

### Scripts à la Racine

```bash
# Backend
pnpm backend:test       # Run backend tests
pnpm backend:compile    # Compile contracts
pnpm backend:lint       # TypeScript check

# Frontend
pnpm frontend:dev       # Dev server
pnpm frontend:build     # Production build
pnpm frontend:lint      # Lint frontend

# All
pnpm test              # Run all tests
pnpm lint              # Lint everything
```

## 🧪 Tests & Coverage

### Backend
- **91 tests** (37 pour Voting.sol + 54 pour VotingOptimized.sol)
- **100% de couverture** sur les deux contrats
- Tests de déploiement, enregistrement, propositions, votes, tally
- Tests de tous les cas d'erreur et events

### Smart Contracts

#### Voting.sol (Original)
Contrat de base avec fonctionnalités standard :
- Enregistrement des votants
- Propositions
- Vote
- Dépouillement

#### VotingOptimized.sol (Optimisé)
Version optimisée avec :
- ✅ **Custom errors** (économie de gas)
- ✅ **ReentrancyGuard** (sécurité anti-reentrancy)
- ✅ **Batch operations** (`addVoters` - 70% d'économie pour l'ajout multiple)
- ✅ **Nouvelles fonctions** :
  - `getAllProposals()` - Récupérer toutes les propositions
  - `getWinner()` - Obtenir le gagnant direct
  - `getProposalsCount()` - Nombre de propositions
  - `resetVoting()` - Réinitialiser le système de vote

## 📊 Comparaison Gas Usage

| Fonction | Voting | VotingOptimized | Économie |
|----------|--------|-----------------|----------|
| Déploiement | 2,016,676 gas | 2,272,438 gas | -12.7% (sécurité) |
| addVoter | 50,184 gas | 55,284 gas | -10.2% (sécurité) |
| addVoters (5×) | 250,920 gas | 92,862 gas | **+63% économie** |
| addProposal | 59,235 gas | 58,385 gas | +1.4% |
| setVote | 73,099 gas | 75,808 gas | -3.7% (ReentrancyGuard) |
| tallyVotes | 60,982 gas | 58,187 gas | +4.6% |

## 🔐 CI/CD

### Husky (Local - Pre-commit/Pre-push)

Les hooks Git s'exécutent automatiquement :

**Pre-commit** :
- Compilation des contrats Solidity modifiés
- Lint TypeScript du backend et frontend

**Pre-push** :
- Exécution de tous les tests backend

### GitHub Actions (Remote)

Workflow monorepo avec 4 jobs en parallèle :

1. **backend-test** : Compile + Tests + Coverage
2. **backend-lint** : TypeScript check + Solidity compilation
3. **frontend-test** : Lint + Tests frontend
4. **frontend-build** : Build Next.js

Tous les jobs doivent passer pour merge.

## 🌐 Déploiement

### Backend (Smart Contracts)
- Testnet Sepolia via Hardhat Ignition
- Vérification automatique sur Etherscan

### Frontend (Next.js)
- Déploiement sur Vercel
- Variables d'environnement pour le contrat address
- Auto-deploy depuis GitHub (via CI/CD)

## 🛠 Technologies

### Backend
- **Solidity 0.8.28**
- **Hardhat 3.0**
- **TypeScript**
- **Ethers.js v6**
- **Chai + Mocha**
- **OpenZeppelin Contracts**

### Frontend
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Wagmi + Viem** (pour l'interaction Web3)
- **RainbowKit** (wallet connection)

## 📝 License

MIT

## 👨‍💻 Auteur

Projet réalisé dans le cadre de la formation Alyra
