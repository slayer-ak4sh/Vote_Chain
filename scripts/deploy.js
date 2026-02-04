const hre = require("hardhat");

async function main() {
  // Deploy SimpleToken
  const SimpleToken = await hre.ethers.getContractFactory("SimpleToken");
  const simpleToken = await SimpleToken.deploy(1000000); // 1 million tokens
  await simpleToken.waitForDeployment();
  
  console.log("SimpleToken deployed to:", await simpleToken.getAddress());

  // Deploy SimpleVoting
  const SimpleVoting = await hre.ethers.getContractFactory("SimpleVoting");
  const simpleVoting = await SimpleVoting.deploy();
  await simpleVoting.waitForDeployment();
  
  console.log("SimpleVoting deployed to:", await simpleVoting.getAddress());

  // Create a sample proposal
  await simpleVoting.createProposal("Should we increase the token supply?");
  console.log("Sample proposal created");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});