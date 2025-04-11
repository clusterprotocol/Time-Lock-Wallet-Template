const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
  try {
    // Load compiled contract artifacts
    const buildPath = path.join(__dirname, "build");
    if (!fs.existsSync(path.join(buildPath, "TimeLockedWallet.json"))) {
      console.log("Contract not compiled. Running compilation...");
      require("./compile");
    }

    const contractJson = JSON.parse(
      fs.readFileSync(path.join(buildPath, "TimeLockedWallet.json"), "utf8")
    );

    const abi = contractJson.abi;
    const bytecode = contractJson.bytecode;

    // Provider setup - updated for ethers v6
    const providerUrl = process.env.ETH_PROVIDER_URL || "https://eth-sepolia.g.alchemy.com/v2/b20Yg4jZMHRLeuzNknS1pSAgta1Plerw";
    if (!providerUrl) {
      console.error("No provider URL found. Please set ETH_PROVIDER_URL in environment variables or .env file.");
      process.exit(1);
    }
    
    const provider = new ethers.JsonRpcProvider(providerUrl);

    // Get current network gas prices - updated for ethers v6
    const feeData = await provider.getFeeData();
    console.log(`Current gas price: ${ethers.formatUnits(feeData.gasPrice || 0, "gwei")} gwei`);

    // Wallet setup
    const privateKey = process.env.PRIVATE_KEY || "927a3cd5505fca7322b0ceb2b4b9abe12604234d1940ccb81249ca3a0e95e81f";
    if (!privateKey) {
      console.error("No private key found. Please set PRIVATE_KEY in environment variables or .env file.");
      process.exit(1);
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);

    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`Deploying from wallet: ${wallet.address}`);
    console.log(`Current wallet balance: ${ethers.formatEther(balance)} ETH`);

    if (parseFloat(ethers.formatEther(balance)) < 0.01) {
      console.warn("Warning: Low ETH balance. You may need more ETH to deploy.");
    }

    console.log("Deploying TimeLockedWallet contract...");

    // Create contract factory - updated for ethers v6
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);

    // Using EIP-1559 gas settings if available
    let deploymentOptions = {};
    
    if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
      // EIP-1559 transaction
      const maxFeePerGas = feeData.maxFeePerGas * BigInt(130) / BigInt(100); // 30% higher than current
      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas * BigInt(110) / BigInt(100); // 10% higher than current
      
      console.log(`Using maxFeePerGas: ${ethers.formatUnits(maxFeePerGas, "gwei")} gwei`);
      console.log(`Using maxPriorityFeePerGas: ${ethers.formatUnits(maxPriorityFeePerGas, "gwei")} gwei`);
      
      deploymentOptions = {
        maxFeePerGas,
        maxPriorityFeePerGas,
        gasLimit: 3000000 // Gas limit for the deployment
      };
    } else {
      // Legacy transaction
      deploymentOptions = {
        gasPrice: feeData.gasPrice * BigInt(120) / BigInt(100), // 20% higher than current
        gasLimit: 3000000 // Gas limit for the deployment
      };
      console.log(`Using gasPrice: ${ethers.formatUnits(deploymentOptions.gasPrice, "gwei")} gwei`);
    }

    // Deploy contract
    const deployTx = await factory.deploy(deploymentOptions);
    const contract = await deployTx.waitForDeployment();
    const deploymentTransaction = deployTx.deploymentTransaction();
    console.log(`Deployment transaction hash: ${deploymentTransaction.hash}`);

    console.log(`Contract deployed successfully at address: ${await contract.getAddress()}`);

    // Get network information
    const network = await provider.getNetwork();
    const networkName = network.name === 'homestead' ? 'mainnet' : network.name;

    // Save deployment information
    const receipt = await provider.getTransactionReceipt(deploymentTransaction.hash);
    const contractAddress = await contract.getAddress();
    const deploymentInfo = {
      contractAddress: contractAddress,
      transactionHash: deploymentTransaction.hash,
      deployer: wallet.address,
      timestamp: new Date().toISOString(),
      network: networkName,
      gasUsed: receipt.gasUsed.toString(),
      blockNumber: receipt.blockNumber,
      effectiveGasPrice: receipt.gasPrice.toString(),
      totalCost: ethers.formatEther(receipt.gasUsed * receipt.gasPrice),
    };

    fs.writeFileSync(
      path.join(__dirname, "deployment-info.json"),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log(`Deployment information saved to deployment-info.json`);

    // Update contract addresses in the frontend
    console.log("Updating contract address in frontend...");
    const frontendAddressesPath = path.join(__dirname, "..", "frontend", "contracts", "addresses.ts");
    
    if (fs.existsSync(frontendAddressesPath)) {
      let addressesContent = fs.readFileSync(frontendAddressesPath, 'utf8');
      
      // Update the address in the relevant network section
      if (networkName === 'sepolia') {
        addressesContent = addressesContent.replace(
          /\[Network\.SEPOLIA\]: \{\s*address: "0x[0-9a-fA-F]*"/,
          `[Network.SEPOLIA]: {\n      address: "${contractAddress}"`
        );
      } else if (networkName === 'mainnet') {
        addressesContent = addressesContent.replace(
          /\[Network\.MAINNET\]: \{\s*address: "0x[0-9a-fA-F]*"/,
          `[Network.MAINNET]: {\n      address: "${contractAddress}"`
        );
      } else if (networkName === 'localhost' || networkName === 'unknown') {
        addressesContent = addressesContent.replace(
          /\[Network\.LOCALHOST\]: \{\s*address: "0x[0-9a-fA-F]*"/,
          `[Network.LOCALHOST]: {\n      address: "${contractAddress}"`
        );
      }
      
      fs.writeFileSync(frontendAddressesPath, addressesContent);
      console.log(`Updated contract address in ${frontendAddressesPath}`);
    } else {
      console.warn(`Warning: Could not find ${frontendAddressesPath} to update contract address.`);
    }

    // Also export ABI to the frontend
    const frontendAbiPath = path.join(__dirname, "..", "frontend", "contracts", "abi.ts");
    const abiExport = `// Auto-generated from contract deployment
export const TimeLockedWalletABI = ${JSON.stringify(abi, null, 2)};
`;
    fs.writeFileSync(frontendAbiPath, abiExport);
    console.log(`Exported contract ABI to ${frontendAbiPath}`);

    console.log(`\nDeployment Summary:`);
    console.log(`- Contract address: ${contractAddress}`);
    console.log(`- Network: ${networkName}`);
    console.log(`- Transaction hash: ${deploymentTransaction.hash}`);
    console.log(`- Gas used: ${receipt.gasUsed.toString()}`);
    console.log(`- Total cost: ${ethers.formatEther(receipt.gasUsed * receipt.gasPrice)} ETH`);
    console.log(`\nNext Steps:`);
    console.log(`1. The contract address has been updated in the frontend.`);
    console.log(`2. Run the frontend application to interact with the newly deployed contract.`);
    console.log(`3. Users can now deposit ETH with custom lock periods and withdraw after the lock period.`);

  } catch (error) {
    console.error("Error during deployment:", error);
    process.exit(1);
  }
}

main();