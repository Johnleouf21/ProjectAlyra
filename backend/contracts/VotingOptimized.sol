// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Voting Contract - Optimized and Secured
/// @author Alyra
/// @notice This contract implements a secure and gas-optimized voting system
/// @dev Implements Checks-Effects-Interactions pattern and uses ReentrancyGuard
contract VotingOptimized is Ownable, ReentrancyGuard {

    /// @notice ID of the winning proposal after tally
    uint256 public winningProposalID;

    /// @notice Struct representing a voter
    /// @dev Packed to optimize storage (1 slot)
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedProposalId;
    }

    /// @notice Struct representing a proposal
    struct Proposal {
        string description;
        uint256 voteCount;
    }

    /// @notice Enum representing the different workflow statuses
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    /// @notice Current workflow status
    WorkflowStatus public workflowStatus;

    /// @notice Array of all proposals
    Proposal[] public proposalsArray;

    /// @notice Mapping of voter addresses to their info
    mapping(address => Voter) public voters;

    /// @notice Total number of registered voters (for optimization)
    uint256 public votersCount;

    // Events
    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint256 proposalId);
    event Voted(address voter, uint256 proposalId);

    // Custom Errors (more gas efficient than require strings)
    error NotVoter();
    error AlreadyRegistered();
    error VotersRegistrationNotOpen();
    error ProposalsRegistrationNotStarted();
    error EmptyProposal();
    error ProposalNotFound();
    error AlreadyVoted();
    error VotingSessionNotStarted();
    error InvalidWorkflowStatus();
    error VotingSessionNotEnded();

    /// @notice Constructor that registers the initial voter
    /// @param _initialVoter Address of the first voter to register
    constructor(address _initialVoter) Ownable(msg.sender) {
        if(_initialVoter != address(0)) {
            _addVoter(_initialVoter);
        }
    }

    /// @notice Modifier to check if caller is a registered voter
    modifier onlyVoters() {
        if(!voters[msg.sender].isRegistered) revert NotVoter();
        _;
    }

    // ::::::::::::: GETTERS ::::::::::::: //

    /// @notice Get voter information
    /// @param _addr Address of the voter
    /// @return Voter struct with voter information
    function getVoter(address _addr) external view onlyVoters returns (Voter memory) {
        return voters[_addr];
    }

    /// @notice Get a specific proposal
    /// @param _id ID of the proposal
    /// @return Proposal struct with proposal information
    function getOneProposal(uint256 _id) external view onlyVoters returns (Proposal memory) {
        if(_id >= proposalsArray.length) revert ProposalNotFound();
        return proposalsArray[_id];
    }

    /// @notice Get all proposals at once (for frontend efficiency)
    /// @return Array of all proposals
    function getAllProposals() external view onlyVoters returns (Proposal[] memory) {
        return proposalsArray;
    }

    /// @notice Get the number of proposals
    /// @return Number of proposals
    function getProposalsCount() external view returns (uint256) {
        return proposalsArray.length;
    }

    /// @notice Get the winning proposal details after tally
    /// @return Proposal struct of the winner
    function getWinner() external view returns (Proposal memory) {
        if(workflowStatus != WorkflowStatus.VotesTallied) revert InvalidWorkflowStatus();
        return proposalsArray[winningProposalID];
    }

    // ::::::::::::: REGISTRATION ::::::::::::: //

    /// @notice Register a new voter (only owner)
    /// @param _addr Address of the voter to register
    function addVoter(address _addr) external onlyOwner {
        _addVoter(_addr);
    }

    /// @notice Internal function to register a voter
    /// @param _addr Address of the voter to register
    function _addVoter(address _addr) private {
        if(workflowStatus != WorkflowStatus.RegisteringVoters) revert VotersRegistrationNotOpen();
        if(voters[_addr].isRegistered) revert AlreadyRegistered();
        if(_addr == address(0)) revert NotVoter();

        voters[_addr].isRegistered = true;
        unchecked {
            ++votersCount; // Safe: unlikely to overflow
        }

        emit VoterRegistered(_addr);
    }

    /// @notice Register multiple voters at once (gas optimization)
    /// @param _addresses Array of voter addresses to register
    function addVoters(address[] calldata _addresses) external onlyOwner {
        if(workflowStatus != WorkflowStatus.RegisteringVoters) revert VotersRegistrationNotOpen();

        uint256 length = _addresses.length;
        for(uint256 i; i < length;) {
            address addr = _addresses[i];
            if(!voters[addr].isRegistered && addr != address(0)) {
                voters[addr].isRegistered = true;
                unchecked {
                    ++votersCount;
                }
                emit VoterRegistered(addr);
            }
            unchecked {
                ++i; // Safe: array length is bounded
            }
        }
    }

    // ::::::::::::: PROPOSAL ::::::::::::: //

    /// @notice Add a new proposal (only registered voters)
    /// @param _desc Description of the proposal
    function addProposal(string calldata _desc) external onlyVoters {
        if(workflowStatus != WorkflowStatus.ProposalsRegistrationStarted) revert ProposalsRegistrationNotStarted();
        if(bytes(_desc).length == 0) revert EmptyProposal();

        proposalsArray.push(Proposal({
            description: _desc,
            voteCount: 0
        }));

        emit ProposalRegistered(proposalsArray.length - 1);
    }

    // ::::::::::::: VOTE ::::::::::::: //

    /// @notice Vote for a proposal (only registered voters)
    /// @param _id ID of the proposal to vote for
    function setVote(uint256 _id) external onlyVoters nonReentrant {
        if(workflowStatus != WorkflowStatus.VotingSessionStarted) revert VotingSessionNotStarted();

        Voter storage voter = voters[msg.sender];
        if(voter.hasVoted) revert AlreadyVoted();
        if(_id >= proposalsArray.length) revert ProposalNotFound();

        // Checks-Effects-Interactions pattern
        voter.votedProposalId = _id;
        voter.hasVoted = true;

        unchecked {
            ++proposalsArray[_id].voteCount; // Safe: unlikely to overflow
        }

        emit Voted(msg.sender, _id);
    }

    // ::::::::::::: WORKFLOW STATE CHANGES ::::::::::::: //

    /// @notice Start the proposals registration session
    function startProposalsRegistering() external onlyOwner {
        if(workflowStatus != WorkflowStatus.RegisteringVoters) revert InvalidWorkflowStatus();

        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;

        // Add GENESIS proposal
        proposalsArray.push(Proposal({
            description: "GENESIS",
            voteCount: 0
        }));

        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    /// @notice End the proposals registration session
    function endProposalsRegistering() external onlyOwner {
        if(workflowStatus != WorkflowStatus.ProposalsRegistrationStarted) revert InvalidWorkflowStatus();

        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    /// @notice Start the voting session
    function startVotingSession() external onlyOwner {
        if(workflowStatus != WorkflowStatus.ProposalsRegistrationEnded) revert InvalidWorkflowStatus();

        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    /// @notice End the voting session
    function endVotingSession() external onlyOwner {
        if(workflowStatus != WorkflowStatus.VotingSessionStarted) revert InvalidWorkflowStatus();

        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    /// @notice Tally the votes and determine the winner
    /// @dev Optimized loop with unchecked arithmetic
    function tallyVotes() external onlyOwner {
        if(workflowStatus != WorkflowStatus.VotingSessionEnded) revert VotingSessionNotEnded();

        uint256 winningVoteCount;
        uint256 winningProposalIndex;
        uint256 proposalsLength = proposalsArray.length;

        // Optimized loop
        for(uint256 p; p < proposalsLength;) {
            if(proposalsArray[p].voteCount > winningVoteCount) {
                winningVoteCount = proposalsArray[p].voteCount;
                winningProposalIndex = p;
            }
            unchecked {
                ++p; // Safe: bounded by array length
            }
        }

        winningProposalID = winningProposalIndex;
        workflowStatus = WorkflowStatus.VotesTallied;

        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }

    /// @notice Reset the voting system for a new session (only owner)
    /// @dev Allows reusing the contract for multiple voting sessions
    function resetVoting() external onlyOwner {
        if(workflowStatus != WorkflowStatus.VotesTallied) revert InvalidWorkflowStatus();

        // Reset workflow
        workflowStatus = WorkflowStatus.RegisteringVoters;

        // Clear proposals
        delete proposalsArray;

        // Reset winning proposal
        winningProposalID = 0;

        emit WorkflowStatusChange(WorkflowStatus.VotesTallied, WorkflowStatus.RegisteringVoters);
    }
}
