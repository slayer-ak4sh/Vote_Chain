const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  // Deploy SimpleToken
  const SimpleToken = await hre.ethers.getContractFactory("SimpleToken");
  const simpleToken = await SimpleToken.deploy(1000000); // 1 million tokens
  await simpleToken.waitForDeployment();
  
  const tokenAddress = await simpleToken.getAddress();
  console.log("SimpleToken deployed to:", tokenAddress);

  // Deploy SimpleVoting
  const SimpleVoting = await hre.ethers.getContractFactory("SimpleVoting");
  const simpleVoting = await SimpleVoting.deploy();
  await simpleVoting.waitForDeployment();
  
  const votingAddress = await simpleVoting.getAddress();
  console.log("SimpleVoting deployed to:", votingAddress);

  // Create a sample proposal
  await simpleVoting.createProposal("Should we increase the token supply?");
  console.log("Sample proposal created");

  // Save contract addresses to frontend
  const addresses = {
    SimpleToken: tokenAddress,
    SimpleVoting: votingAddress
  };

  const frontendDir = path.join(__dirname, '../frontend');
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir);
  }

  fs.writeFileSync(
    path.join(frontendDir, 'contracts.json'),
    JSON.stringify(addresses, null, 2)
  );

  console.log('Contract addresses saved to frontend/contracts.json');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});