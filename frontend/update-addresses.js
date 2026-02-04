const fs = require('fs');
const path = require('path');

// Read contract addresses
const contractsPath = path.join(__dirname, 'contracts.json');
if (!fs.existsSync(contractsPath)) {
    console.error('contracts.json not found. Please deploy contracts first.');
    process.exit(1);
}

const contracts = JSON.parse(fs.readFileSync(contractsPath, 'utf8'));

// Read app.js
const appJsPath = path.join(__dirname, 'app.js');
let appJsContent = fs.readFileSync(appJsPath, 'utf8');

// Update contract addresses
appJsContent = appJsContent.replace(
    /const VOTING_CONTRACT_ADDRESS = ".*";/,
    `const VOTING_CONTRACT_ADDRESS = "${contracts.SimpleVoting}";`
);

appJsContent = appJsContent.replace(
    /const TOKEN_CONTRACT_ADDRESS = ".*";/,
    `const TOKEN_CONTRACT_ADDRESS = "${contracts.SimpleToken}";`
);

// Write updated app.js
fs.writeFileSync(appJsPath, appJsContent);

console.log('Contract addresses updated in app.js:');
console.log('SimpleVoting:', contracts.SimpleVoting);
console.log('SimpleToken:', contracts.SimpleToken);