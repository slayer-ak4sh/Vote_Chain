const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleToken", function () {
  let simpleToken;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const SimpleToken = await ethers.getContractFactory("SimpleToken");
    simpleToken = await SimpleToken.deploy(1000);
  });

  it("Should have correct initial supply", async function () {
    const totalSupply = await simpleToken.totalSupply();
    expect(totalSupply).to.equal(ethers.parseEther("1000"));
  });

  it("Should mint tokens to specified address", async function () {
    await simpleToken.mint(addr1.address, ethers.parseEther("100"));
    const balance = await simpleToken.balanceOf(addr1.address);
    expect(balance).to.equal(ethers.parseEther("100"));
  });
});

describe("SimpleVoting", function () {
  let simpleVoting;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const SimpleVoting = await ethers.getContractFactory("SimpleVoting");
    simpleVoting = await SimpleVoting.deploy();
  });

  it("Should create a proposal", async function () {
    await simpleVoting.createProposal("Test proposal");
    const proposal = await simpleVoting.getProposal(0);
    expect(proposal.description).to.equal("Test proposal");
    expect(proposal.voteCount).to.equal(0);
  });

  it("Should allow voting on proposals", async function () {
    await simpleVoting.createProposal("Test proposal");
    await simpleVoting.connect(addr1).vote(0);
    const proposal = await simpleVoting.getProposal(0);
    expect(proposal.voteCount).to.equal(1);
  });
});