# Vote Chain Frontend

A beautiful and functional web interface for the blockchain voting system.

## Features

- 🎨 Modern, responsive design with gradient backgrounds
- 🔗 MetaMask wallet integration
- 📊 Real-time statistics dashboard
- 🗳️ Create and vote on proposals
- 🪙 Token minting functionality
- 📱 Mobile-friendly interface

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Blockchain
```bash
npm run dev
```
This starts a Hardhat local network on `localhost:8545`

### 3. Deploy Contracts
```bash
npm run deploy
```
This deploys contracts and automatically updates frontend addresses

### 4. Start Frontend Server
```bash
npm run frontend
```
Frontend will be available at `http://localhost:3000`

### 5. Configure MetaMask

1. Open MetaMask extension
2. Add new network:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

3. Import test account:
   - Use private key from Hardhat node output
   - Account #0 is the contract owner

## Usage

### Connect Wallet
- Click "Connect Wallet" button
- Approve MetaMask connection
- Your address will appear in the header

### Create Proposals (Owner Only)
- Enter proposal description
- Click "Create Proposal"
- Confirm transaction in MetaMask

### Vote on Proposals
- View active proposals
- Click "Vote" button on any proposal
- Confirm transaction in MetaMask
- You can only vote once per proposal

### Mint Tokens (Owner Only)
- Enter recipient address
- Enter amount to mint
- Click "Mint Tokens"
- Confirm transaction in MetaMask

## File Structure

```
frontend/
├── index.html          # Main HTML structure
├── style.css           # Modern CSS styling
├── app.js             # Web3 integration logic
├── server.js          # Simple HTTP server
├── update-addresses.js # Contract address updater
└── contracts.json     # Deployed contract addresses
```

## Features Explained

### Dashboard Statistics
- **Total Proposals**: Number of created proposals
- **STK Balance**: Your token balance
- **Total Votes**: Sum of all votes cast

### Responsive Design
- Works on desktop, tablet, and mobile
- Gradient backgrounds and smooth animations
- Card-based layout for better organization

### Error Handling
- Clear error messages for common issues
- Loading indicators during transactions
- Success confirmations

### Security Features
- Prevents double voting
- Owner-only functions protected
- Address validation for token minting

## Troubleshooting

### Common Issues

1. **"Please install MetaMask"**
   - Install MetaMask browser extension
   - Refresh the page

2. **"Failed to connect wallet"**
   - Make sure MetaMask is unlocked
   - Check if correct network is selected

3. **"Only owner can create proposals"**
   - Use Account #0 from Hardhat node
   - This account deployed the contracts

4. **"Transaction failed"**
   - Check if you have enough ETH for gas
   - Make sure Hardhat node is running

### Reset Everything
If you encounter issues:
```bash
# Stop all processes
# Restart Hardhat node
npm run dev

# In new terminal, redeploy
npm run deploy

# Start frontend
npm run frontend
```

## Development

### Customization
- Modify `style.css` for design changes
- Update `app.js` for functionality changes
- Edit contract addresses in `app.js` if needed

### Adding Features
- New contract functions need ABI updates
- Add corresponding UI elements in HTML
- Implement logic in `app.js`

## Browser Compatibility
- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

Requires MetaMask extension for Web3 functionality.