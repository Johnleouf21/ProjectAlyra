import { expect } from "chai";
import { network } from "hardhat";
import { Voting } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

const { ethers } = await network.connect();

describe("Voting Contract", function () {
  let voting: Voting;
  let owner: SignerWithAddress;
  let voter1: SignerWithAddress;
  let voter2: SignerWithAddress;
  let voter3: SignerWithAddress;
  let nonVoter: SignerWithAddress;

  beforeEach(async function () {
    [owner, voter1, voter2, voter3, nonVoter] = await ethers.getSigners();

    // Déployer le contrat avec voter1 pré-enregistré
    voting = await ethers.deployContract("Voting", [voter1.address], {
      value: ethers.parseEther("0.000001")
    });
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await voting.owner()).to.equal(owner.address);
    });

    it("Should register the initial voter passed in constructor", async function () {
      const voter = await voting.connect(voter1).getVoter(voter1.address);
      expect(voter.isRegistered).to.be.true;
    });

    it("Should start in RegisteringVoters status", async function () {
      expect(await voting.workflowStatus()).to.equal(0); // RegisteringVoters
    });
  });

  describe("Voter Registration", function () {
    it("Should register a new voter and emit VoterRegistered event", async function () {
      await expect(voting.addVoter(voter2.address))
        .to.emit(voting, "VoterRegistered")
        .withArgs(voter2.address);

      const voter = await voting.connect(voter2).getVoter(voter2.address);
      expect(voter.isRegistered).to.be.true;
    });

    it("Should revert when non-owner tries to register a voter", async function () {
      await expect(
        voting.connect(voter1).addVoter(voter2.address)
      ).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount");
    });

    it("Should revert when trying to register an already registered voter", async function () {
      await voting.addVoter(voter2.address);
      await expect(
        voting.addVoter(voter2.address)
      ).to.be.revertedWith("Already registered");
    });

    it("Should revert when trying to register voter outside RegisteringVoters status", async function () {
      await voting.startProposalsRegistering();
      await expect(
        voting.addVoter(voter2.address)
      ).to.be.revertedWith("Voters registration is not open yet");
    });
  });

  describe("Getters", function () {
    it("Should allow a voter to get voter information", async function () {
      const voter = await voting.connect(voter1).getVoter(voter1.address);
      expect(voter.isRegistered).to.be.true;
      expect(voter.hasVoted).to.be.false;
    });

    it("Should revert when non-voter tries to get voter information", async function () {
      await expect(
        voting.connect(nonVoter).getVoter(voter1.address)
      ).to.be.revertedWith("You're not a voter");
    });

    it("Should allow a voter to get proposal information", async function () {
      await voting.startProposalsRegistering();
      const proposal = await voting.connect(voter1).getOneProposal(0);
      expect(proposal.description).to.equal("GENESIS");
      expect(proposal.voteCount).to.equal(0);
    });

    it("Should revert when non-voter tries to get proposal information", async function () {
      await voting.startProposalsRegistering();
      await expect(
        voting.connect(nonVoter).getOneProposal(0)
      ).to.be.revertedWith("You're not a voter");
    });
  });

  describe("Proposal Registration", function () {
    beforeEach(async function () {
      await voting.addVoter(voter2.address);
      await voting.startProposalsRegistering();
    });

    it("Should start proposal registration and emit WorkflowStatusChange event", async function () {
      // Déployer un nouveau contrat pour tester le startProposalsRegistering
      const newVoting = await ethers.deployContract("Voting", [voter1.address], {
        value: ethers.parseEther("0.000001")
      });

      await expect(newVoting.startProposalsRegistering())
        .to.emit(newVoting, "WorkflowStatusChange")
        .withArgs(0, 1); // RegisteringVoters to ProposalsRegistrationStarted
    });

    it("Should add GENESIS proposal when starting proposal registration", async function () {
      const proposal = await voting.connect(voter1).getOneProposal(0);
      expect(proposal.description).to.equal("GENESIS");
    });

    it("Should allow voter to register a proposal and emit ProposalRegistered event", async function () {
      await expect(voting.connect(voter1).addProposal("Proposal 1"))
        .to.emit(voting, "ProposalRegistered")
        .withArgs(1); // ID 0 is GENESIS, so new proposal is ID 1

      const proposal = await voting.connect(voter1).getOneProposal(1);
      expect(proposal.description).to.equal("Proposal 1");
      expect(proposal.voteCount).to.equal(0);
    });

    it("Should revert when non-voter tries to register a proposal", async function () {
      await expect(
        voting.connect(nonVoter).addProposal("Proposal 1")
      ).to.be.revertedWith("You're not a voter");
    });

    it("Should revert when trying to register empty proposal", async function () {
      await expect(
        voting.connect(voter1).addProposal("")
      ).to.be.revertedWith("Vous ne pouvez pas ne rien proposer");
    });

    it("Should revert when trying to register proposal outside registration period", async function () {
      await voting.endProposalsRegistering();
      await expect(
        voting.connect(voter1).addProposal("Proposal 1")
      ).to.be.revertedWith("Proposals are not allowed yet");
    });
  });

  describe("Workflow Status Changes", function () {
    it("Should end proposals registration and emit WorkflowStatusChange event", async function () {
      await voting.startProposalsRegistering();

      await expect(voting.endProposalsRegistering())
        .to.emit(voting, "WorkflowStatusChange")
        .withArgs(1, 2); // ProposalsRegistrationStarted to ProposalsRegistrationEnded
    });

    it("Should start voting session and emit WorkflowStatusChange event", async function () {
      await voting.startProposalsRegistering();
      await voting.endProposalsRegistering();

      await expect(voting.startVotingSession())
        .to.emit(voting, "WorkflowStatusChange")
        .withArgs(2, 3); // ProposalsRegistrationEnded to VotingSessionStarted
    });

    it("Should end voting session and emit WorkflowStatusChange event", async function () {
      await voting.startProposalsRegistering();
      await voting.endProposalsRegistering();
      await voting.startVotingSession();

      await expect(voting.endVotingSession())
        .to.emit(voting, "WorkflowStatusChange")
        .withArgs(3, 4); // VotingSessionStarted to VotingSessionEnded
    });

    it("Should revert when trying to start proposals registration from wrong status", async function () {
      await voting.startProposalsRegistering();
      await expect(
        voting.startProposalsRegistering()
      ).to.be.revertedWith("Registering proposals cant be started now");
    });

    it("Should revert when trying to end proposals registration from wrong status", async function () {
      await expect(
        voting.endProposalsRegistering()
      ).to.be.revertedWith("Registering proposals havent started yet");
    });

    it("Should revert when trying to start voting session from wrong status", async function () {
      await voting.startProposalsRegistering();
      await expect(
        voting.startVotingSession()
      ).to.be.revertedWith("Registering proposals phase is not finished");
    });

    it("Should revert when trying to end voting session from wrong status", async function () {
      await voting.startProposalsRegistering();
      await voting.endProposalsRegistering();
      await expect(
        voting.endVotingSession()
      ).to.be.revertedWith("Voting session havent started yet");
    });

    it("Should revert when non-owner tries to change workflow status", async function () {
      await expect(
        voting.connect(voter1).startProposalsRegistering()
      ).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount");
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      await voting.addVoter(voter2.address);
      await voting.addVoter(voter3.address);
      await voting.startProposalsRegistering();
      await voting.connect(voter1).addProposal("Proposal 1");
      await voting.connect(voter2).addProposal("Proposal 2");
      await voting.endProposalsRegistering();
      await voting.startVotingSession();
    });

    it("Should allow voter to vote and emit Voted event", async function () {
      await expect(voting.connect(voter1).setVote(1))
        .to.emit(voting, "Voted")
        .withArgs(voter1.address, 1);

      const voter = await voting.connect(voter1).getVoter(voter1.address);
      expect(voter.hasVoted).to.be.true;
      expect(voter.votedProposalId).to.equal(1);

      const proposal = await voting.connect(voter1).getOneProposal(1);
      expect(proposal.voteCount).to.equal(1);
    });

    it("Should increment vote count correctly", async function () {
      await voting.connect(voter1).setVote(1);
      await voting.connect(voter2).setVote(1);
      await voting.connect(voter3).setVote(1);

      const proposal = await voting.connect(voter1).getOneProposal(1);
      expect(proposal.voteCount).to.equal(3);
    });

    it("Should revert when non-voter tries to vote", async function () {
      await expect(
        voting.connect(nonVoter).setVote(1)
      ).to.be.revertedWith("You're not a voter");
    });

    it("Should revert when voter tries to vote twice", async function () {
      await voting.connect(voter1).setVote(1);
      await expect(
        voting.connect(voter1).setVote(2)
      ).to.be.revertedWith("You have already voted");
    });

    it("Should revert when voting for non-existent proposal", async function () {
      await expect(
        voting.connect(voter1).setVote(999)
      ).to.be.revertedWith("Proposal not found");
    });

    it("Should revert when trying to vote outside voting session", async function () {
      await voting.endVotingSession();
      await expect(
        voting.connect(voter1).setVote(1)
      ).to.be.revertedWith("Voting session havent started yet");
    });
  });

  describe("Tally Votes", function () {
    beforeEach(async function () {
      await voting.addVoter(voter2.address);
      await voting.addVoter(voter3.address);
      await voting.startProposalsRegistering();
      await voting.connect(voter1).addProposal("Proposal 1");
      await voting.connect(voter2).addProposal("Proposal 2");
      await voting.connect(voter3).addProposal("Proposal 3");
      await voting.endProposalsRegistering();
      await voting.startVotingSession();
    });

    it("Should tally votes correctly and emit WorkflowStatusChange event", async function () {
      await voting.connect(voter1).setVote(2);
      await voting.connect(voter2).setVote(2);
      await voting.connect(voter3).setVote(1);
      await voting.endVotingSession();

      await expect(voting.tallyVotes())
        .to.emit(voting, "WorkflowStatusChange")
        .withArgs(4, 5); // VotingSessionEnded to VotesTallied

      expect(await voting.winningProposalID()).to.equal(2);
    });

    it("Should handle tie votes (first proposal wins)", async function () {
      await voting.connect(voter1).setVote(1);
      await voting.connect(voter2).setVote(2);
      await voting.connect(voter3).setVote(3);
      await voting.endVotingSession();

      await voting.tallyVotes();

      // En cas d'égalité, c'est la première proposition qui gagne
      expect(await voting.winningProposalID()).to.equal(1);
    });

    it("Should set GENESIS as winner if no votes", async function () {
      await voting.endVotingSession();
      await voting.tallyVotes();

      expect(await voting.winningProposalID()).to.equal(0); // GENESIS
    });

    it("Should revert when trying to tally votes before voting session ends", async function () {
      await expect(
        voting.tallyVotes()
      ).to.be.revertedWith("Current status is not voting session ended");
    });

    it("Should revert when non-owner tries to tally votes", async function () {
      await voting.endVotingSession();
      await expect(
        voting.connect(voter1).tallyVotes()
      ).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount");
    });
  });

  describe("Complete Workflow", function () {
    it("Should execute complete voting workflow successfully", async function () {
      // 1. Enregistrement des votants
      await voting.addVoter(voter2.address);
      await voting.addVoter(voter3.address);

      // 2. Début de l'enregistrement des propositions
      await voting.startProposalsRegistering();

      // 3. Enregistrement des propositions
      await voting.connect(voter1).addProposal("Build a school");
      await voting.connect(voter2).addProposal("Build a hospital");
      await voting.connect(voter3).addProposal("Build a park");

      // 4. Fin de l'enregistrement des propositions
      await voting.endProposalsRegistering();

      // 5. Début de la session de vote
      await voting.startVotingSession();

      // 6. Votes
      await voting.connect(voter1).setVote(2); // hospital
      await voting.connect(voter2).setVote(2); // hospital
      await voting.connect(voter3).setVote(3); // park

      // 7. Fin de la session de vote
      await voting.endVotingSession();

      // 8. Dépouillement
      await voting.tallyVotes();

      // 9. Vérification du résultat
      expect(await voting.winningProposalID()).to.equal(2);
      expect(await voting.workflowStatus()).to.equal(5); // VotesTallied
    });
  });
});
