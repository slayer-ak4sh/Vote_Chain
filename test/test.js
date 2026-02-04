const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Vote Chain System", function () {
  let simpleToken, simpleVoting, reputationSystem;
  let owner, addr1, addr2, addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Deploy SimpleToken
    const SimpleToken = await ethers.getContractFactory("SimpleToken");
    simpleToken = await SimpleToken.deploy(1000000);
    await simpleToken.waitForDeployment();

    // Deploy ReputationSystem
    const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
    reputationSystem = await ReputationSystem.deploy();
    await reputationSystem.waitForDeployment();

    // Deploy SimpleVoting
    const SimpleVoting = await ethers.getContractFactory("SimpleVoting");
    simpleVoting = await SimpleVoting.deploy(await reputationSystem.getAddress());
    await simpleVoting.waitForDeployment();

    // Authorize voting contract in reputation system
    await reputationSystem.authorizeContract(await simpleVoting.getAddress(), true);
  });

  describe("SimpleToken", function () {
    it("Should have correct initial supply", async function () {
      const totalSupply = await simpleToken.totalSupply();
      expect(totalSupply).to.equal(ethers.parseUnits("1000000", 18));
    });

    it("Should allow owner to mint tokens", async function () {
      await simpleToken.mint(addr1.address, ethers.parseUnits("100", 18));
      const balance = await simpleToken.balanceOf(addr1.address);
      expect(balance).to.equal(ethers.parseUnits("100", 18));
    });
  });

  describe("ReputationSystem", function () {
    it("Should initialize with correct badge count", async function () {
      const badgeCount = await reputationSystem.badgeCount();
      expect(Number(badgeCount)).to.equal(5);
    });

    it("Should record vote and update reputation", async function () {
      await reputationSystem.recordVote(addr1.address);
      
      const [score, totalVotes, consecutiveVotes, achievementLevel, votingWeight, isActive] = 
        await reputationSystem.getUserReputation(addr1.address);
      
      expect(Number(score)).to.be.gt(0);
      expect(Number(totalVotes)).to.equal(1);
      expect(isActive).to.be.true;
    });

    it("Should award first vote badge", async function () {
      await reputationSystem.recordVote(addr1.address);
      const hasBadge = await reputationSystem.hasBadge(addr1.address, 0);
      expect(hasBadge).to.be.true;
    });

    it("Should calculate voting weight correctly", async function () {
      await reputationSystem.recordVote(addr1.address);
      const weight = await reputationSystem.getVotingWeight(addr1.address);
      expect(Number(weight)).to.be.gte(1);
    });
  });

  describe("SimpleVoting", function () {
    beforeEach(async function () {
      await simpleVoting.createProposal("Test Proposal");
    });

    it("Should create proposal correctly", async function () {
      const [description, voteCount, weightedVoteCount] = await simpleVoting.getProposal(0);
      expect(description).to.equal("Test Proposal");
      expect(Number(voteCount)).to.equal(0);
      expect(Number(weightedVoteCount)).to.equal(0);
    });

    it("Should allow voting and update reputation", async function () {
      await simpleVoting.connect(addr1).vote(0);
      
      const [description, voteCount, weightedVoteCount] = await simpleVoting.getProposal(0);
      expect(Number(voteCount)).to.equal(1);
      expect(Number(weightedVoteCount)).to.be.gt(0);

      // Check reputation was updated
      const [score] = await reputationSystem.getUserReputation(addr1.address);
      expect(Number(score)).to.be.gt(0);
    });

    it("Should prevent double voting", async function () {
      await simpleVoting.connect(addr1).vote(0);
      try {
        await simpleVoting.connect(addr1).vote(0);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("You have already voted");
      }
    });

    it("Should use reputation-based voting weight", async function () {
      // First vote to build reputation
      await simpleVoting.connect(addr1).vote(0);
      
      // Create another proposal
      await simpleVoting.createProposal("Second Proposal");
      
      // Vote again - should have same weight initially
      await simpleVoting.connect(addr1).vote(1);
      
      const [, , weightedVoteCount] = await simpleVoting.getProposal(1);
      expect(Number(weightedVoteCount)).to.be.gte(1); // Should be at least 1
    });
  });

  describe("Integration Tests", function () {
    it("Should handle multiple users voting", async function () {
      await simpleVoting.createProposal("Multi-user Proposal");
      
      // Multiple users vote
      await simpleVoting.connect(addr1).vote(0);
      await simpleVoting.connect(addr2).vote(0);
      await simpleVoting.connect(addr3).vote(0);
      
      const [, voteCount, weightedVoteCount] = await simpleVoting.getProposal(0);
      expect(Number(voteCount)).to.equal(3);
      expect(Number(weightedVoteCount)).to.be.gte(3);
    });

    it("Should track user achievements across multiple votes", async function () {
      // Create multiple proposals
      for (let i = 0; i < 5; i++) {
        await simpleVoting.createProposal(`Proposal ${i}`);
      }
      
      // User votes on all proposals
      for (let i = 0; i < 5; i++) {
        await simpleVoting.connect(addr1).vote(i);
      }
      
      const [score, totalVotes] = await reputationSystem.getUserReputation(addr1.address);
      expect(Number(totalVotes)).to.equal(5);
      expect(Number(score)).to.be.gt(50); // Should have earned badges
    });
  });
});