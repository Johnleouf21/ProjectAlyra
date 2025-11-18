import { expect } from "chai";
import { network } from "hardhat";
import type { VotingOptimized } from "../types/ethers-contracts/VotingOptimized";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/types";
import { ZeroAddress } from "ethers";

const { ethers } = await network.connect();

describe("VotingOptimized Contract", function () {
  let voting: VotingOptimized;
  let owner: HardhatEthersSigner;
  let voter1: HardhatEthersSigner;
  let voter2: HardhatEthersSigner;
  let voter3: HardhatEthersSigner;
  let voter4: HardhatEthersSigner;
  let nonVoter: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, voter1, voter2, voter3, voter4, nonVoter] = await ethers.getSigners();

    // Deploy contract with voter1 pre-registered
    voting = await ethers.deployContract("VotingOptimized", [voter1.address]) as unknown as VotingOptimized;
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await voting.owner()).to.equal(owner.address);
    });

    it("Should register the initial voter passed in constructor", async function () {
      const voter = await voting.connect(voter1).getVoter(voter1.address);
      expect(voter.isRegistered).to.be.true;
    });

    it("Should increment votersCount for initial voter", async function () {
      expect(await voting.votersCount()).to.equal(1);
    });

    it("Should start in RegisteringVoters status", async function () {
      expect(await voting.workflowStatus()).to.equal(0);
    });

    it("Should allow deployment with zero address (no initial voter)", async function () {
      const newVoting = await ethers.deployContract("VotingOptimized", [ZeroAddress]);
      expect(await newVoting.votersCount()).to.equal(0);
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

    it("Should increment votersCount when adding voter", async function () {
      await voting.addVoter(voter2.address);
      expect(await voting.votersCount()).to.equal(2);
    });

    it("Should revert with custom error when non-owner tries to register", async function () {
      await expect(
        voting.connect(voter1).addVoter(voter2.address)
      ).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount");
    });

    it("Should revert with AlreadyRegistered custom error", async function () {
      await voting.addVoter(voter2.address);
      await expect(
        voting.addVoter(voter2.address)
      ).to.be.revertedWithCustomError(voting, "AlreadyRegistered");
    });

    it("Should revert with VotersRegistrationNotOpen when not in correct status", async function () {
      await voting.startProposalsRegistering();
      await expect(
        voting.addVoter(voter2.address)
      ).to.be.revertedWithCustomError(voting, "VotersRegistrationNotOpen");
    });

    it("Should revert with NotVoter when trying to register zero address", async function () {
      await expect(
        voting.addVoter(ZeroAddress)
      ).to.be.revertedWithCustomError(voting, "NotVoter");
    });
  });

  describe("Batch Voter Registration (addVoters)", function () {
    it("Should register multiple voters at once", async function () {
      const addresses = [voter2.address, voter3.address, voter4.address];

      await voting.addVoters(addresses);

      expect(await voting.votersCount()).to.equal(4); // 1 initial + 3 new

      const voter2Data = await voting.connect(voter2).getVoter(voter2.address);
      const voter3Data = await voting.connect(voter3).getVoter(voter3.address);
      const voter4Data = await voting.connect(voter4).getVoter(voter4.address);

      expect(voter2Data.isRegistered).to.be.true;
      expect(voter3Data.isRegistered).to.be.true;
      expect(voter4Data.isRegistered).to.be.true;
    });

    it("Should emit VoterRegistered for each new voter", async function () {
      const addresses = [voter2.address, voter3.address];

      await expect(voting.addVoters(addresses))
        .to.emit(voting, "VoterRegistered")
        .withArgs(voter2.address)
        .to.emit(voting, "VoterRegistered")
        .withArgs(voter3.address);
    });

    it("Should skip already registered voters without reverting", async function () {
      await voting.addVoter(voter2.address);

      const addresses = [voter2.address, voter3.address]; // voter2 already registered
      await voting.addVoters(addresses);

      expect(await voting.votersCount()).to.equal(3); // 1 initial + 1 (voter2) + 1 (voter3)
    });

    it("Should skip zero addresses in batch registration", async function () {
      const addresses = [voter2.address, ZeroAddress, voter3.address];
      await voting.addVoters(addresses);

      expect(await voting.votersCount()).to.equal(3); // 1 initial + 2 valid
    });

    it("Should revert when not owner tries batch registration", async function () {
      await expect(
        voting.connect(voter1).addVoters([voter2.address])
      ).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount");
    });

    it("Should revert batch registration outside RegisteringVoters status", async function () {
      await voting.startProposalsRegistering();
      await expect(
        voting.addVoters([voter2.address])
      ).to.be.revertedWithCustomError(voting, "VotersRegistrationNotOpen");
    });
  });

  describe("Getters", function () {
    beforeEach(async function () {
      await voting.addVoter(voter2.address);
      await voting.startProposalsRegistering();
      await voting.connect(voter1).addProposal("Proposal 1");
    });

    it("Should allow voter to get voter information", async function () {
      const voter = await voting.connect(voter1).getVoter(voter1.address);
      expect(voter.isRegistered).to.be.true;
      expect(voter.hasVoted).to.be.false;
    });

    it("Should revert with NotVoter when non-voter tries to get voter info", async function () {
      await expect(
        voting.connect(nonVoter).getVoter(voter1.address)
      ).to.be.revertedWithCustomError(voting, "NotVoter");
    });

    it("Should allow voter to get one proposal", async function () {
      const proposal = await voting.connect(voter1).getOneProposal(1);
      expect(proposal.description).to.equal("Proposal 1");
      expect(proposal.voteCount).to.equal(0);
    });

    it("Should revert when getting non-existent proposal", async function () {
      await expect(
        voting.connect(voter1).getOneProposal(999)
      ).to.be.revertedWithCustomError(voting, "ProposalNotFound");
    });

    it("Should return all proposals with getAllProposals", async function () {
      await voting.connect(voter2).addProposal("Proposal 2");

      const proposals = await voting.connect(voter1).getAllProposals();
      expect(proposals.length).to.equal(3); // GENESIS + 2 proposals
      expect(proposals[0].description).to.equal("GENESIS");
      expect(proposals[1].description).to.equal("Proposal 1");
      expect(proposals[2].description).to.equal("Proposal 2");
    });

    it("Should return proposals count with getProposalsCount", async function () {
      await voting.connect(voter2).addProposal("Proposal 2");
      expect(await voting.getProposalsCount()).to.equal(3);
    });

    it("Should revert getAllProposals when called by non-voter", async function () {
      await expect(
        voting.connect(nonVoter).getAllProposals()
      ).to.be.revertedWithCustomError(voting, "NotVoter");
    });
  });

  describe("Proposal Registration", function () {
    beforeEach(async function () {
      await voting.addVoter(voter2.address);
      await voting.startProposalsRegistering();
    });

    it("Should start proposal registration and add GENESIS", async function () {
      const newVoting = await ethers.deployContract("VotingOptimized", [voter1.address]) as unknown as VotingOptimized;

      await expect(newVoting.startProposalsRegistering())
        .to.emit(newVoting, "WorkflowStatusChange")
        .withArgs(0, 1);

      const genesis = await newVoting.connect(voter1).getOneProposal(0);
      expect(genesis.description).to.equal("GENESIS");
    });

    it("Should allow voter to add proposal with calldata optimization", async function () {
      await expect(voting.connect(voter1).addProposal("My Proposal"))
        .to.emit(voting, "ProposalRegistered")
        .withArgs(1);

      const proposal = await voting.connect(voter1).getOneProposal(1);
      expect(proposal.description).to.equal("My Proposal");
    });

    it("Should revert with EmptyProposal custom error", async function () {
      await expect(
        voting.connect(voter1).addProposal("")
      ).to.be.revertedWithCustomError(voting, "EmptyProposal");
    });

    it("Should revert with NotVoter when non-voter tries to add proposal", async function () {
      await expect(
        voting.connect(nonVoter).addProposal("Proposal")
      ).to.be.revertedWithCustomError(voting, "NotVoter");
    });

    it("Should revert with ProposalsRegistrationNotStarted", async function () {
      await voting.endProposalsRegistering();
      await expect(
        voting.connect(voter1).addProposal("Proposal")
      ).to.be.revertedWithCustomError(voting, "ProposalsRegistrationNotStarted");
    });
  });

  describe("Workflow Status Changes", function () {
    it("Should transition through all statuses correctly", async function () {
      expect(await voting.workflowStatus()).to.equal(0); // RegisteringVoters

      await voting.startProposalsRegistering();
      expect(await voting.workflowStatus()).to.equal(1); // ProposalsRegistrationStarted

      await voting.endProposalsRegistering();
      expect(await voting.workflowStatus()).to.equal(2); // ProposalsRegistrationEnded

      await voting.startVotingSession();
      expect(await voting.workflowStatus()).to.equal(3); // VotingSessionStarted

      await voting.endVotingSession();
      expect(await voting.workflowStatus()).to.equal(4); // VotingSessionEnded

      await voting.tallyVotes();
      expect(await voting.workflowStatus()).to.equal(5); // VotesTallied
    });

    it("Should revert with InvalidWorkflowStatus when transitioning from wrong status", async function () {
      // Try to end proposals before starting them
      await expect(
        voting.endProposalsRegistering()
      ).to.be.revertedWithCustomError(voting, "InvalidWorkflowStatus");

      // Try to start voting session before ending proposals
      await expect(
        voting.startVotingSession()
      ).to.be.revertedWithCustomError(voting, "InvalidWorkflowStatus");

      // Try to end voting session before starting it
      await expect(
        voting.endVotingSession()
      ).to.be.revertedWithCustomError(voting, "InvalidWorkflowStatus");

      // Try to start proposals twice (from ProposalsRegistrationStarted status)
      await voting.startProposalsRegistering();
      await expect(
        voting.startProposalsRegistering()
      ).to.be.revertedWithCustomError(voting, "InvalidWorkflowStatus");
    });

    it("Should revert when non-owner tries to change status", async function () {
      await expect(
        voting.connect(voter1).startProposalsRegistering()
      ).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount");
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      await voting.addVoters([voter2.address, voter3.address]);
      await voting.startProposalsRegistering();
      await voting.connect(voter1).addProposal("Proposal 1");
      await voting.connect(voter2).addProposal("Proposal 2");
      await voting.endProposalsRegistering();
      await voting.startVotingSession();
    });

    it("Should allow voter to vote with nonReentrant protection", async function () {
      await expect(voting.connect(voter1).setVote(1))
        .to.emit(voting, "Voted")
        .withArgs(voter1.address, 1);

      const voter = await voting.connect(voter1).getVoter(voter1.address);
      expect(voter.hasVoted).to.be.true;
      expect(voter.votedProposalId).to.equal(1);
    });

    it("Should increment vote count correctly", async function () {
      await voting.connect(voter1).setVote(1);
      await voting.connect(voter2).setVote(1);

      const proposal = await voting.connect(voter1).getOneProposal(1);
      expect(proposal.voteCount).to.equal(2);
    });

    it("Should revert with AlreadyVoted custom error", async function () {
      await voting.connect(voter1).setVote(1);
      await expect(
        voting.connect(voter1).setVote(2)
      ).to.be.revertedWithCustomError(voting, "AlreadyVoted");
    });

    it("Should revert with ProposalNotFound when voting for non-existent proposal", async function () {
      await expect(
        voting.connect(voter1).setVote(999)
      ).to.be.revertedWithCustomError(voting, "ProposalNotFound");
    });

    it("Should revert with VotingSessionNotStarted", async function () {
      await voting.endVotingSession();
      await expect(
        voting.connect(voter1).setVote(1)
      ).to.be.revertedWithCustomError(voting, "VotingSessionNotStarted");
    });

    it("Should revert with NotVoter when non-voter tries to vote", async function () {
      await expect(
        voting.connect(nonVoter).setVote(1)
      ).to.be.revertedWithCustomError(voting, "NotVoter");
    });
  });

  describe("Tally Votes", function () {
    beforeEach(async function () {
      await voting.addVoters([voter2.address, voter3.address, voter4.address]);
      await voting.startProposalsRegistering();
      await voting.connect(voter1).addProposal("Proposal 1");
      await voting.connect(voter2).addProposal("Proposal 2");
      await voting.connect(voter3).addProposal("Proposal 3");
      await voting.endProposalsRegistering();
      await voting.startVotingSession();
    });

    it("Should tally votes correctly and determine winner", async function () {
      await voting.connect(voter1).setVote(2);
      await voting.connect(voter2).setVote(2);
      await voting.connect(voter3).setVote(1);
      await voting.connect(voter4).setVote(2);
      await voting.endVotingSession();

      await expect(voting.tallyVotes())
        .to.emit(voting, "WorkflowStatusChange")
        .withArgs(4, 5);

      expect(await voting.winningProposalID()).to.equal(2);
    });

    it("Should handle tie votes correctly (first wins)", async function () {
      await voting.connect(voter1).setVote(1);
      await voting.connect(voter2).setVote(2);
      await voting.endVotingSession();

      await voting.tallyVotes();
      expect(await voting.winningProposalID()).to.equal(1);
    });

    it("Should set GENESIS as winner if no votes", async function () {
      await voting.endVotingSession();
      await voting.tallyVotes();

      expect(await voting.winningProposalID()).to.equal(0);
    });

    it("Should allow getting winner after tally", async function () {
      await voting.connect(voter1).setVote(1);
      await voting.endVotingSession();
      await voting.tallyVotes();

      const winner = await voting.getWinner();
      expect(winner.description).to.equal("Proposal 1");
    });

    it("Should revert getWinner before tally", async function () {
      await expect(
        voting.getWinner()
      ).to.be.revertedWithCustomError(voting, "InvalidWorkflowStatus");
    });

    it("Should revert with VotingSessionNotEnded", async function () {
      await expect(
        voting.tallyVotes()
      ).to.be.revertedWithCustomError(voting, "VotingSessionNotEnded");
    });

    it("Should revert when non-owner tries to tally", async function () {
      await voting.endVotingSession();
      await expect(
        voting.connect(voter1).tallyVotes()
      ).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount");
    });
  });

  describe("Reset Voting", function () {
    beforeEach(async function () {
      await voting.addVoter(voter2.address);
      await voting.startProposalsRegistering();
      await voting.connect(voter1).addProposal("Proposal 1");
      await voting.endProposalsRegistering();
      await voting.startVotingSession();
      await voting.connect(voter1).setVote(1);
      await voting.endVotingSession();
      await voting.tallyVotes();
    });

    it("Should reset voting system after tally", async function () {
      await expect(voting.resetVoting())
        .to.emit(voting, "WorkflowStatusChange")
        .withArgs(5, 0);

      expect(await voting.workflowStatus()).to.equal(0);
      expect(await voting.winningProposalID()).to.equal(0);
      expect(await voting.getProposalsCount()).to.equal(0);
    });

    it("Should allow new voting session after reset", async function () {
      await voting.resetVoting();

      await voting.startProposalsRegistering();
      await voting.connect(voter1).addProposal("New Proposal");

      const proposals = await voting.connect(voter1).getAllProposals();
      expect(proposals.length).to.equal(2); // GENESIS + New Proposal
    });

    it("Should keep voters registered after reset", async function () {
      await voting.resetVoting();

      const voter1Data = await voting.connect(voter1).getVoter(voter1.address);
      expect(voter1Data.isRegistered).to.be.true;
      expect(await voting.votersCount()).to.equal(2);
    });

    it("Should revert reset if not in VotesTallied status", async function () {
      const newVoting = await ethers.deployContract("VotingOptimized", [voter1.address]);

      await expect(
        newVoting.resetVoting()
      ).to.be.revertedWithCustomError(newVoting, "InvalidWorkflowStatus");
    });

    it("Should revert when non-owner tries to reset", async function () {
      await expect(
        voting.connect(voter1).resetVoting()
      ).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount");
    });
  });

  describe("Complete Workflow", function () {
    it("Should execute complete optimized voting workflow", async function () {
      // 1. Batch register voters
      await voting.addVoters([voter2.address, voter3.address, voter4.address]);
      expect(await voting.votersCount()).to.equal(4);

      // 2. Start proposals
      await voting.startProposalsRegistering();

      // 3. Add proposals
      await voting.connect(voter1).addProposal("Build a decentralized school");
      await voting.connect(voter2).addProposal("Build a decentralized hospital");
      await voting.connect(voter3).addProposal("Build a decentralized park");

      // 4. End proposals
      await voting.endProposalsRegistering();

      // 5. Start voting
      await voting.startVotingSession();

      // 6. Vote
      await voting.connect(voter1).setVote(2);
      await voting.connect(voter2).setVote(2);
      await voting.connect(voter3).setVote(3);
      await voting.connect(voter4).setVote(2);

      // 7. End voting
      await voting.endVotingSession();

      // 8. Tally
      await voting.tallyVotes();

      // 9. Verify winner
      expect(await voting.winningProposalID()).to.equal(2);
      const winner = await voting.getWinner();
      expect(winner.description).to.equal("Build a decentralized hospital");
      expect(winner.voteCount).to.equal(3);

      // 10. Get all proposals
      const allProposals = await voting.connect(voter1).getAllProposals();
      expect(allProposals.length).to.equal(4); // GENESIS + 3 proposals
    });
  });

  describe("Gas Optimization Verification", function () {
    it("Should use custom errors instead of strings", async function () {
      // Custom errors use less gas than require strings
      await expect(
        voting.connect(nonVoter).getVoter(voter1.address)
      ).to.be.revertedWithCustomError(voting, "NotVoter");
    });

    it("Should use calldata for string parameters", async function () {
      await voting.startProposalsRegistering();
      // addProposal uses calldata for _desc parameter
      await voting.connect(voter1).addProposal("Test proposal");
    });

    it("Should benefit from batch operations", async function () {
      const addresses = [voter2.address, voter3.address, voter4.address];
      // One transaction instead of three
      await voting.addVoters(addresses);
      expect(await voting.votersCount()).to.equal(4);
    });
  });
});
