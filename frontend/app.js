// Contract addresses (update these after deployment)
const VOTING_CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const TOKEN_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Contract ABIs
const VOTING_ABI = [
    "function createProposal(string memory _description) public",
    "function vote(uint256 _proposalId) public",
    "function getProposal(uint256 _proposalId) public view returns (string memory description, uint256 voteCount)",
    "function proposalCount() public view returns (uint256)",
    "function hasVoted(address, uint256) public view returns (bool)",
    "function owner() public view returns (address)",
    "event ProposalCreated(uint256 proposalId, string description)",
    "event VoteCast(address voter, uint256 proposalId)"
];

const TOKEN_ABI = [
    "function name() public view returns (string)",
    "function symbol() public view returns (string)",
    "function decimals() public view returns (uint8)",
    "function totalSupply() public view returns (uint256)",
    "function balanceOf(address owner) public view returns (uint256)",
    "function mint(address to, uint256 amount) public",
    "function owner() public view returns (address)"
];

class VoteChainApp {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.votingContract = null;
        this.tokenContract = null;
        this.userAddress = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.checkWalletConnection();
    }

    setupEventListeners() {
        document.getElementById('connectWallet').addEventListener('click', () => this.connectWallet());
        document.getElementById('createProposal').addEventListener('click', () => this.createProposal());
        document.getElementById('mintTokens').addEventListener('click', () => this.mintTokens());
        
        // Close modal
        document.querySelector('.close').addEventListener('click', () => this.hideModal('messageModal'));
        
        // Close modal on outside click
        document.getElementById('messageModal').addEventListener('click', (e) => {
            if (e.target.id === 'messageModal') this.hideModal('messageModal');
        });
    }

    async checkWalletConnection() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    await this.connectWallet();
                }
            } catch (error) {
                console.error('Error checking wallet connection:', error);
            }
        }
    }

    async connectWallet() {
        try {
            if (typeof window.ethereum === 'undefined') {
                this.showMessage('Please install MetaMask to use this application!', 'error');
                return;
            }

            this.showLoading();

            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Initialize provider and signer
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            this.userAddress = await this.signer.getAddress();

            // Initialize contracts
            this.votingContract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_ABI, this.signer);
            this.tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, this.signer);

            // Update UI
            this.updateWalletUI();
            await this.loadData();

            this.hideLoading();
            this.showMessage('Wallet connected successfully!', 'success');

        } catch (error) {
            this.hideLoading();
            console.error('Error connecting wallet:', error);
            this.showMessage('Failed to connect wallet: ' + error.message, 'error');
        }
    }

    updateWalletUI() {
        const connectBtn = document.getElementById('connectWallet');
        const walletAddress = document.getElementById('walletAddress');
        
        connectBtn.textContent = 'Connected';
        connectBtn.disabled = true;
        connectBtn.style.opacity = '0.7';
        
        walletAddress.textContent = `${this.userAddress.slice(0, 6)}...${this.userAddress.slice(-4)}`;
        walletAddress.classList.remove('hidden');
    }

    async loadData() {
        try {
            await Promise.all([
                this.loadProposals(),
                this.loadTokenBalance(),
                this.loadStats()
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async loadStats() {
        try {
            const proposalCount = await this.votingContract.proposalCount();
            document.getElementById('totalProposals').textContent = proposalCount.toString();
            
            // Calculate total votes
            let totalVotes = 0;
            for (let i = 0; i < proposalCount; i++) {
                const proposal = await this.votingContract.getProposal(i);
                totalVotes += parseInt(proposal.voteCount);
            }
            document.getElementById('totalVotes').textContent = totalVotes.toString();
            
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async loadTokenBalance() {
        try {
            const balance = await this.tokenContract.balanceOf(this.userAddress);
            const decimals = await this.tokenContract.decimals();
            const formattedBalance = ethers.utils.formatUnits(balance, decimals);
            document.getElementById('tokenBalance').textContent = parseFloat(formattedBalance).toFixed(2) + ' STK';
        } catch (error) {
            console.error('Error loading token balance:', error);
        }
    }

    async loadProposals() {
        try {
            const proposalCount = await this.votingContract.proposalCount();
            const proposalsList = document.getElementById('proposalsList');
            
            if (proposalCount.eq(0)) {
                proposalsList.innerHTML = `
                    <div class="no-proposals">
                        <i class="fas fa-inbox"></i>
                        <p>No proposals yet. Create the first one!</p>
                    </div>
                `;
                return;
            }

            let proposalsHTML = '';
            for (let i = 0; i < proposalCount; i++) {
                const proposal = await this.votingContract.getProposal(i);
                const hasVoted = await this.votingContract.hasVoted(this.userAddress, i);
                
                proposalsHTML += `
                    <div class="proposal-card">
                        <div class="proposal-header">
                            <span class="proposal-id">Proposal #${i}</span>
                        </div>
                        <div class="proposal-description">${proposal.description}</div>
                        <div class="proposal-footer">
                            <div class="vote-count">
                                <i class="fas fa-thumbs-up"></i>
                                <span>${proposal.voteCount} votes</span>
                            </div>
                            ${hasVoted ? 
                                '<span style="color: #28a745; font-weight: bold;"><i class="fas fa-check"></i> Voted</span>' :
                                `<button class="btn btn-vote" onclick="app.vote(${i})">
                                    <i class="fas fa-vote-yea"></i> Vote
                                </button>`
                            }
                        </div>
                    </div>
                `;
            }
            
            proposalsList.innerHTML = proposalsHTML;
        } catch (error) {
            console.error('Error loading proposals:', error);
        }
    }

    async createProposal() {
        try {
            const description = document.getElementById('proposalDescription').value.trim();
            
            if (!description) {
                this.showMessage('Please enter a proposal description!', 'error');
                return;
            }

            if (!this.votingContract) {
                this.showMessage('Please connect your wallet first!', 'error');
                return;
            }

            this.showLoading();

            const tx = await this.votingContract.createProposal(description);
            await tx.wait();

            document.getElementById('proposalDescription').value = '';
            await this.loadData();

            this.hideLoading();
            this.showMessage('Proposal created successfully!', 'success');

        } catch (error) {
            this.hideLoading();
            console.error('Error creating proposal:', error);
            
            if (error.message.includes('Only owner')) {
                this.showMessage('Only the contract owner can create proposals!', 'error');
            } else {
                this.showMessage('Failed to create proposal: ' + error.message, 'error');
            }
        }
    }

    async vote(proposalId) {
        try {
            if (!this.votingContract) {
                this.showMessage('Please connect your wallet first!', 'error');
                return;
            }

            this.showLoading();

            const tx = await this.votingContract.vote(proposalId);
            await tx.wait();

            await this.loadData();

            this.hideLoading();
            this.showMessage('Vote cast successfully!', 'success');

        } catch (error) {
            this.hideLoading();
            console.error('Error voting:', error);
            
            if (error.message.includes('already voted')) {
                this.showMessage('You have already voted on this proposal!', 'error');
            } else if (error.message.includes('does not exist')) {
                this.showMessage('This proposal does not exist!', 'error');
            } else {
                this.showMessage('Failed to vote: ' + error.message, 'error');
            }
        }
    }

    async mintTokens() {
        try {
            const address = document.getElementById('mintAddress').value.trim();
            const amount = document.getElementById('mintAmount').value.trim();
            
            if (!address || !amount) {
                this.showMessage('Please enter both address and amount!', 'error');
                return;
            }

            if (!ethers.utils.isAddress(address)) {
                this.showMessage('Please enter a valid Ethereum address!', 'error');
                return;
            }

            if (!this.tokenContract) {
                this.showMessage('Please connect your wallet first!', 'error');
                return;
            }

            this.showLoading();

            const decimals = await this.tokenContract.decimals();
            const amountWei = ethers.utils.parseUnits(amount, decimals);
            
            const tx = await this.tokenContract.mint(address, amountWei);
            await tx.wait();

            document.getElementById('mintAddress').value = '';
            document.getElementById('mintAmount').value = '';
            await this.loadTokenBalance();

            this.hideLoading();
            this.showMessage('Tokens minted successfully!', 'success');

        } catch (error) {
            this.hideLoading();
            console.error('Error minting tokens:', error);
            
            if (error.message.includes('Ownable')) {
                this.showMessage('Only the contract owner can mint tokens!', 'error');
            } else {
                this.showMessage('Failed to mint tokens: ' + error.message, 'error');
            }
        }
    }

    showLoading() {
        document.getElementById('loadingModal').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingModal').classList.add('hidden');
    }

    showMessage(message, type) {
        const messageContent = document.getElementById('messageContent');
        messageContent.innerHTML = `<div class="${type}">${message}</div>`;
        document.getElementById('messageModal').classList.remove('hidden');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }
}

// Initialize the app
const app = new VoteChainApp();

// Handle account changes
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            location.reload();
        } else {
            app.connectWallet();
        }
    });

    window.ethereum.on('chainChanged', () => {
        location.reload();
    });
}