# Vote Chain - Blockchain Voting System

Ek complete decentralized voting platform jo Ethereum blockchain par built hai. Is project me ERC20 token aur voting smart contracts ke saath ek beautiful web interface bhi hai.

## 🚀 Project Overview

**Vote Chain** ek modern blockchain-based voting system hai jo transparency aur security provide karta hai. Users proposals create kar sakte hain, vote kar sakte hain, aur tokens mint kar sakte hain.

### 🎯 Main Components:
- **Smart Contracts**: Solidity me likhe gaye secure contracts
- **Frontend**: Beautiful web interface with Web3 integration
- **Token System**: ERC20 STK tokens for governance
- **Reputation System**: Advanced user reputation tracking with achievements

## ✨ Features

### 🔗 Blockchain Features:
- **SimpleToken (STK)**: ERC20 token with minting functionality
- **SimpleVoting**: Decentralized voting contract with reputation integration
- **ReputationSystem**: Advanced reputation tracking with achievements and badges
- **Weighted Voting**: Vote weight based on user reputation
- **Achievement System**: NFT-like badges for user milestones
- **Owner Controls**: Proposal creation aur token minting
- **Security**: Double voting prevention, reentrancy protection

### 🎨 Frontend Features:
- **Modern UI**: Gradient design with animations
- **MetaMask Integration**: Wallet connection
- **Real-time Stats**: Live proposal aur vote counts
- **Responsive Design**: Mobile aur desktop friendly
- **Error Handling**: User-friendly messages

## 🛠️ Quick Start

### 1. Setup Project
```bash
npm install
```

### 2. Start Development
```bash
# Terminal 1: Blockchain network
npm run dev

# Terminal 2: Deploy contracts
npm run deploy

# Terminal 3: Start frontend
npm run frontend
```

### 3. Access Website
- Open: `http://localhost:3000`
- Connect MetaMask to `localhost:8545`
- Import Account #0 from Hardhat (owner account)

## 📋 Available Scripts

```bash
npm run compile    # Compile smart contracts
npm run test      # Run contract tests
npm run dev       # Start local blockchain
npm run deploy    # Deploy contracts + update frontend
npm run frontend  # Start web server
```

## 🏗️ Project Structure

```
Vote_Chain/
├── contracts/              # Smart contracts
│   ├── SimpleToken.sol        # ERC20 token
│   ├── SimpleVoting.sol       # Voting logic with reputation
│   └── ReputationSystem.sol   # Advanced reputation tracking
├── frontend/               # Web interface
│   ├── index.html            # Main page
│   ├── style.css             # Styling
│   ├── app.js               # Web3 logic
│   └── server.js            # HTTP server
├── scripts/
│   └── deploy.js            # Deployment script
└── test/
    └── test.js              # Contract tests
```

## 🎮 How to Use

### For Contract Owner:
1. **Create Proposals**: Naye voting proposals banayein
2. **Mint Tokens**: Users ko STK tokens distribute karein

### For Users:
1. **Connect Wallet**: MetaMask se connect karein
2. **View Proposals**: Active proposals dekh sakte hain
3. **Cast Votes**: Proposals par vote kar sakte hain
4. **Check Balance**: Apna STK token balance check karein

## 🔧 Technical Details

### Smart Contracts:
- **SimpleToken**: 1M initial supply, owner can mint more
- **SimpleVoting**: Proposal creation, voting, reputation-weighted votes
- **ReputationSystem**: Dynamic scoring, achievements, voting weight calculation
- **Security**: Ownable pattern, reentrancy protection, decay mechanisms

### Frontend Tech:
- **Web3**: Ethers.js for blockchain interaction
- **UI**: Modern CSS with glassmorphism effects
- **Responsive**: Works on all screen sizes

## 🚨 Important Notes

- **Owner Account**: Account #0 se contracts deploy hote hain
- **Network**: Local Hardhat network (Chain ID: 31337)
- **Gas**: Local network me free transactions
- **MetaMask**: Required for Web3 functionality

## 🐛 Troubleshooting

**Common Issues:**
- MetaMask not connected → Install aur unlock karein
- Wrong network → localhost:8545 select karein
- Transaction failed → Hardhat node running check karein
- Owner functions → Account #0 use karein

## 📱 Screenshots

Frontend includes:
- Dashboard with stats
- Proposal creation form
- Active proposals list
- Token minting interface
- Wallet connection status

## 🔮 Future Enhancements

- Multi-choice voting
- Proposal deadlines
- Token-weighted voting
- IPFS integration
- Mobile app

---

**Built with ❤️ using Solidity, Hardhat, and modern web technologies**