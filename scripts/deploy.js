const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("Deploying Vote Chain contracts...");
  
  // Deploy SimpleToken
  const SimpleToken = await hre.ethers.getContractFactory("SimpleToken");
  const simpleToken = await SimpleToken.deploy(1000000); // 1 million tokens
  await simpleToken.waitForDeployment();
  
  const tokenAddress = await simpleToken.getAddress();
  console.log("SimpleToken deployed to:", tokenAddress);

  // Deploy ReputationSystem
  const ReputationSystem = await hre.ethers.getContractFactory("ReputationSystem");
  const reputationSystem = await ReputationSystem.deploy();
  await reputationSystem.waitForDeployment();
  
  const reputationAddress = await reputationSystem.getAddress();
  console.log("ReputationSystem deployed to:", reputationAddress);

  // Deploy SimpleVoting with ReputationSystem
  const SimpleVoting = await hre.ethers.getContractFactory("SimpleVoting");
  const simpleVoting = await SimpleVoting.deploy(reputationAddress);
  await simpleVoting.waitForDeployment();
  
  const votingAddress = await simpleVoting.getAddress();
  console.log("SimpleVoting deployed to:", votingAddress);

  // Authorize voting contract to update reputations
  await reputationSystem.authorizeContract(votingAddress, true);
  console.log("Voting contract authorized in ReputationSystem");

  // Create sample proposals
  await simpleVoting.createProposal("Should we increase the token supply?");
  await simpleVoting.createProposal("Implement reputation-based governance?");
  console.log("Sample proposals created");

  // Save contract addresses to frontend
  const addresses = {
    SimpleToken: tokenAddress,
    SimpleVoting: votingAddress,
    ReputationSystem: reputationAddress
  };

  const frontendDir = path.join(__dirname, '../frontend');
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir);
  }

  fs.writeFileSync(
    path.join(frontendDir, 'contracts.json'),
    JSON.stringify(addresses, null, 2)
  );

  console.log('\n=== Deployment Summary ===');
  console.log('SimpleToken:', tokenAddress);
  console.log('ReputationSystem:', reputationAddress);
  console.log('SimpleVoting:', votingAddress);
  console.log('Contract addresses saved to frontend/contracts.json');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});