const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const TournamentScore = await hre.ethers.getContractFactory("TournamentScore");
  
  // Deploy the contract
  const tournamentScore = await TournamentScore.deploy();
  
  // Wait for the contract to be deployed
  await tournamentScore.waitForDeployment();

  // Get the contract address
  const address = await tournamentScore.getAddress();
  
  console.log("TournamentScore deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });