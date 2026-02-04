// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ReputationSystem.sol";

contract SimpleVoting {
    struct Proposal {
        string description;
        uint256 voteCount;
        uint256 weightedVoteCount;  // New: reputation-weighted votes
        bool exists;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(address => mapping(uint256 => bool)) public hasVoted;
    uint256 public proposalCount;
    address public owner;
    ReputationSystem public reputationSystem;

    event ProposalCreated(uint256 proposalId, string description);
    event VoteCast(address voter, uint256 proposalId, uint256 weight);

    constructor(address _reputationSystem) {
        owner = msg.sender;
        reputationSystem = ReputationSystem(_reputationSystem);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function createProposal(string memory _description) public onlyOwner {
        proposals[proposalCount] = Proposal({
            description: _description,
            voteCount: 0,
            weightedVoteCount: 0,
            exists: true
        });
        
        emit ProposalCreated(proposalCount, _description);
        proposalCount++;
    }

    function vote(uint256 _proposalId) public {
        require(proposals[_proposalId].exists, "Proposal does not exist");
        require(!hasVoted[msg.sender][_proposalId], "You have already voted");

        // Get voting weight from reputation system
        uint256 weight = reputationSystem.getVotingWeight(msg.sender);
        
        proposals[_proposalId].voteCount++;
        proposals[_proposalId].weightedVoteCount += weight;
        hasVoted[msg.sender][_proposalId] = true;

        // Record vote in reputation system
        reputationSystem.recordVote(msg.sender);

        emit VoteCast(msg.sender, _proposalId, weight);
    }

    function getProposal(uint256 _proposalId) public view returns (
        string memory description, 
        uint256 voteCount,
        uint256 weightedVoteCount
    ) {
        require(proposals[_proposalId].exists, "Proposal does not exist");
        Proposal memory proposal = proposals[_proposalId];
        return (proposal.description, proposal.voteCount, proposal.weightedVoteCount);
    }

    function setReputationSystem(address _reputationSystem) public onlyOwner {
        reputationSystem = ReputationSystem(_reputationSystem);
    }
}