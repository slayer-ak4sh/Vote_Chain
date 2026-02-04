# Simple Blockchain Project

A basic blockchain project built with Solidity, featuring an ERC20 token and a voting system.

## Features

- **SimpleToken**: ERC20 token with minting functionality
- **SimpleVoting**: Basic voting contract for proposals

## Setup

1. Install dependencies:
```bash
npm install
```

2. Compile contracts:
```bash
npm run compile
```

3. Run tests:
```bash
npm run test
```

## Deployment

1. Start local Hardhat network:
```bash
npx hardhat node
```

2. Deploy contracts:
```bash
npm run deploy
```

## Contract Details

### SimpleToken
- Standard ERC20 token
- Owner can mint new tokens
- Initial supply: 1,000,000 STK

### SimpleVoting
- Create proposals (owner only)
- Vote on proposals (any address)
- Track vote counts
- Prevent double voting

## Usage Example

```javascript
// Create a proposal
await simpleVoting.createProposal("Should we upgrade the contract?");

// Vote on proposal
await simpleVoting.vote(0);

// Get proposal details
const proposal = await simpleVoting.getProposal(0);
console.log(proposal.description, proposal.voteCount);
```