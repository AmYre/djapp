class BlockchainManager {
    constructor() {
        this.web3 = null;
        this.contract = null;
        this.contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        //this.initialize();
    }

	async initialize() {
	// Check for ethereum object in different ways
	const ethereum = window.ethereum || window.web3?.currentProvider;

	if (!ethereum) {
		console.error("No Web3 provider found. Please make sure MetaMask is installed and unlocked");
		return;
	}
		try {
			// Request account access
			await ethereum.request({ method: 'eth_requestAccounts' });
			this.web3 = new Web3(ethereum);
			
			// Log connection details for debugging
			console.log("Web3 version:", this.web3.version);
			console.log("Is MetaMask:", ethereum.isMetaMask);
			console.log("Selected network:", await this.web3.eth.net.getId());
			
			await this.initializeContract();
			console.log("Blockchain Manager initialized successfully");
			
			const accountInfo = await this.getAccountInfo();
			console.log("Connected account:", accountInfo);
		} catch (error) {
			console.error("Failed to initialize BlockchainManager:", error);
		}
	}

    initializeContract() {
        const contractABI = [{
            "inputs": [{"internalType": "uint256", "name": "index", "type": "uint256"}],
            "name": "getTournament",
            "outputs": [
                {"internalType": "string", "name": "", "type": "string"},
                {"internalType": "uint256", "name": "", "type": "uint256"},
                {"internalType": "string", "name": "", "type": "string"},
                {"internalType": "uint256", "name": "", "type": "uint256"},
                {"internalType": "string", "name": "", "type": "string"},
                {"internalType": "uint256", "name": "", "type": "uint256"},
                {"internalType": "uint256", "name": "", "type": "uint256"}
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getTournamentCount",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {"internalType": "string", "name": "_winner", "type": "string"},
                {"internalType": "uint256", "name": "_winnerScore", "type": "uint256"},
                {"internalType": "string", "name": "_secondPlace", "type": "string"},
                {"internalType": "uint256", "name": "_secondScore", "type": "uint256"},
                {"internalType": "string", "name": "_thirdPlace", "type": "string"},
                {"internalType": "uint256", "name": "_thirdScore", "type": "uint256"}
            ],
            "name": "recordTournament",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }]; // Add your contract ABI here
        this.contract = new this.web3.eth.Contract(contractABI, this.contractAddress);
    }

	async recordTournamentScore(winner, winnerScore, secondPlace, secondScore, thirdPlace, thirdScore) {
        if (!this.web3 || !this.contract) {
            console.error("Blockchain connection not initialized");
            await this.initialize(); // Try to initialize if not ready
        }

        try {
            const accounts = await this.web3.eth.getAccounts();
            const result = await this.contract.methods.recordTournament(
                winner,
                winnerScore,
                secondPlace,
                secondScore,
                thirdPlace,
                thirdScore
            ).send({ from: accounts[0] });
            
            console.log("Tournament recorded to blockchain:", result);
            
            // Print proof of storage
            const count = await this.getTournamentCount();
            console.log(`Total tournaments stored: ${count}`);
            const tournaments = await this.getAllTournaments();
            console.table(tournaments);
            
            return result;
        } catch (error) {
            console.error("Error recording tournament score:", error);
            throw error;
        }
    }
	// check blockchain stored tournament info
	async verifyTournament(tournamentId) {
        //if (!this.contract) return;
        
        try {
            const tournament = await this.contract.methods.getTournament(tournamentId).call();
            return {
                verified: true,
                tournament: {
                    winner: tournament[0],
                    winnerScore: tournament[1],
                    secondPlace: tournament[2],
                    secondScore: tournament[3],
                    thirdPlace: tournament[4],
                    thirdScore: tournament[5],
                    timestamp: tournament[6]
                }
            };
        } catch (error) {
            console.error("Error verifying tournament:", error);
            return { verified: false, error: error.message };
        }
    }
	
	// print tournament info to prove stored in blockchain
    async getTournamentCount() {
        if (!this.contract) return 0;
        try {
            const count = await this.contract.methods.getTournamentCount().call();
            console.log("Total tournaments stored:", count);
            return count;
        } catch (error) {
            console.error("Error getting tournament count:", error);
            return 0;
        }
    }

    async getAccountInfo() {
        if (!this.web3) return null;
        try {
            const accounts = await this.web3.eth.getAccounts();
            const balance = await this.web3.eth.getBalance(accounts[0]);
            console.log("Connected account:", accounts[0]);
            console.log("Account balance:", this.web3.utils.fromWei(balance, 'ether'), "ETH");
            return { account: accounts[0], balance };
        } catch (error) {
            console.error("Error getting account info:", error);
            return null;
        }
    }

    async getAllTournaments() {
        if (!this.contract) return [];
        try {
            const count = await this.getTournamentCount();
            const tournaments = [];
            
            for (let i = 0; i < count; i++) {
                const tournament = await this.verifyTournament(i);
                if (tournament.verified) {
                    tournaments.push(tournament.tournament);
                }
            }
            
            console.table(tournaments);
            return tournaments;
        } catch (error) {
            console.error("Error fetching all tournaments:", error);
            return [];
        }
    }
}

const blockchainManager = new BlockchainManager();
// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    blockchainManager.initialize();
});
