// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ReputationSystem
 * @dev Advanced reputation tracking system for voting participants
 * @author Your Name - Summer of Bitcoin 2024 Candidate
 * 
 * Features:
 * - Dynamic reputation scoring based on voting patterns
 * - Streak bonuses for consistent participation
 * - Penalty system for inactive users
 * - Reputation-based voting weight
 * - Achievement system with NFT-like badges
 */
contract ReputationSystem is Ownable, ReentrancyGuard {
    
    struct UserReputation {
        uint256 score;              // Current reputation score
        uint256 totalVotes;         // Total votes cast
        uint256 consecutiveVotes;   // Current voting streak
        uint256 lastVoteTimestamp;  // Last voting activity
        uint256 achievementLevel;   // User achievement level (0-5)
        bool isActive;              // Active status
        mapping(uint256 => bool) earnedBadges; // Badge ID => earned status
    }
    
    struct Badge {
        string name;
        string description;
        uint256 requirement;
        uint256 reputationBonus;
        bool exists;
    }
    
    // State variables
    mapping(address => UserReputation) public userReputations;
    mapping(uint256 => Badge) public badges;
    mapping(address => bool) public authorizedContracts;
    
    uint256 public constant BASE_VOTE_REWARD = 10;
    uint256 public constant STREAK_MULTIPLIER = 2;
    uint256 public constant INACTIVITY_PENALTY = 5;
    uint256 public constant DECAY_PERIOD = 30 days;
    uint256 public badgeCount;
    
    // Events
    event ReputationUpdated(address indexed user, uint256 newScore, uint256 change);
    event StreakAchieved(address indexed user, uint256 streakCount);
    event BadgeEarned(address indexed user, uint256 badgeId, string badgeName);
    event AchievementLevelUp(address indexed user, uint256 newLevel);
    event ContractAuthorized(address indexed contractAddress, bool authorized);
    
    constructor() Ownable(msg.sender) {
        _initializeBadges();
    }
    
    modifier onlyAuthorized() {
        require(authorizedContracts[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    /**
     * @dev Initialize achievement badges
     */
    function _initializeBadges() private {
        _createBadge("First Vote", "Cast your first vote", 1, 50);
        _createBadge("Consistent Voter", "Vote 10 times", 10, 100);
        _createBadge("Democracy Champion", "Vote 50 times", 50, 250);
        _createBadge("Streak Master", "Achieve 10 consecutive votes", 10, 200);
        _createBadge("Community Leader", "Reach 1000 reputation", 1000, 500);
    }
    
    /**
     * @dev Create a new achievement badge
     */
    function _createBadge(string memory name, string memory description, uint256 requirement, uint256 bonus) private {
        badges[badgeCount] = Badge({
            name: name,
            description: description,
            requirement: requirement,
            reputationBonus: bonus,
            exists: true
        });
        badgeCount++;
    }
    
    /**
     * @dev Record a vote and update reputation
     * @param voter Address of the voter
     */
    function recordVote(address voter) external onlyAuthorized nonReentrant {
        UserReputation storage user = userReputations[voter];
        
        // Initialize user if first time
        if (!user.isActive) {
            user.isActive = true;
            user.achievementLevel = 0;
        }
        
        // Apply decay if user was inactive
        _applyDecay(voter);
        
        // Calculate reputation reward
        uint256 reward = _calculateVoteReward(voter);
        
        // Update user stats
        user.totalVotes++;
        user.score += reward;
        
        // Update streak
        if (block.timestamp - user.lastVoteTimestamp <= 7 days) {
            user.consecutiveVotes++;
            if (user.consecutiveVotes % 5 == 0) {
                emit StreakAchieved(voter, user.consecutiveVotes);
            }
        } else {
            user.consecutiveVotes = 1;
        }
        
        user.lastVoteTimestamp = block.timestamp;
        
        // Check for badge achievements
        _checkBadgeEligibility(voter);
        
        // Check for level up
        _checkLevelUp(voter);
        
        emit ReputationUpdated(voter, user.score, reward);
    }
    
    /**
     * @dev Calculate voting reward based on current reputation and streak
     */
    function _calculateVoteReward(address voter) private view returns (uint256) {
        UserReputation storage user = userReputations[voter];
        
        uint256 baseReward = BASE_VOTE_REWARD;
        
        // Streak bonus
        if (user.consecutiveVotes >= 5) {
            baseReward += (user.consecutiveVotes / 5) * STREAK_MULTIPLIER;
        }
        
        // Achievement level bonus
        baseReward += user.achievementLevel * 5;
        
        return baseReward;
    }
    
    /**
     * @dev Apply reputation decay for inactive users
     */
    function _applyDecay(address voter) private {
        UserReputation storage user = userReputations[voter];
        
        if (user.lastVoteTimestamp > 0 && 
            block.timestamp - user.lastVoteTimestamp > DECAY_PERIOD) {
            
            uint256 decayAmount = INACTIVITY_PENALTY;
            if (user.score > decayAmount) {
                user.score -= decayAmount;
                user.consecutiveVotes = 0; // Reset streak
            }
        }
    }
    
    /**
     * @dev Check if user is eligible for any badges
     */
    function _checkBadgeEligibility(address voter) private {
        UserReputation storage user = userReputations[voter];
        
        for (uint256 i = 0; i < badgeCount; i++) {
            if (!user.earnedBadges[i] && badges[i].exists) {
                bool eligible = false;
                
                // Check different badge requirements
                if (i == 0 && user.totalVotes >= 1) eligible = true;
                else if (i == 1 && user.totalVotes >= 10) eligible = true;
                else if (i == 2 && user.totalVotes >= 50) eligible = true;
                else if (i == 3 && user.consecutiveVotes >= 10) eligible = true;
                else if (i == 4 && user.score >= 1000) eligible = true;
                
                if (eligible) {
                    user.earnedBadges[i] = true;
                    user.score += badges[i].reputationBonus;
                    emit BadgeEarned(voter, i, badges[i].name);
                }
            }
        }
    }
    
    /**
     * @dev Check if user should level up
     */
    function _checkLevelUp(address voter) private {
        UserReputation storage user = userReputations[voter];
        
        uint256 newLevel = user.score / 200; // Level up every 200 points
        if (newLevel > 5) newLevel = 5; // Max level 5
        
        if (newLevel > user.achievementLevel) {
            user.achievementLevel = newLevel;
            emit AchievementLevelUp(voter, newLevel);
        }
    }
    
    /**
     * @dev Get user's voting weight based on reputation
     */
    function getVotingWeight(address voter) external view returns (uint256) {
        UserReputation storage user = userReputations[voter];
        
        if (!user.isActive) return 1;
        
        // Base weight is 1, increases with reputation
        uint256 weight = 1 + (user.score / 100);
        
        // Cap at 10x weight
        if (weight > 10) weight = 10;
        
        return weight;
    }
    
    /**
     * @dev Get comprehensive user reputation data
     */
    function getUserReputation(address voter) external view returns (
        uint256 score,
        uint256 totalVotes,
        uint256 consecutiveVotes,
        uint256 achievementLevel,
        uint256 votingWeight,
        bool isActive
    ) {
        UserReputation storage user = userReputations[voter];
        return (
            user.score,
            user.totalVotes,
            user.consecutiveVotes,
            user.achievementLevel,
            this.getVotingWeight(voter),
            user.isActive
        );
    }
    
    /**
     * @dev Check if user has earned a specific badge
     */
    function hasBadge(address voter, uint256 badgeId) external view returns (bool) {
        return userReputations[voter].earnedBadges[badgeId];
    }
    
    /**
     * @dev Get badge information
     */
    function getBadge(uint256 badgeId) external view returns (
        string memory name,
        string memory description,
        uint256 requirement,
        uint256 reputationBonus
    ) {
        require(badges[badgeId].exists, "Badge does not exist");
        Badge storage badge = badges[badgeId];
        return (badge.name, badge.description, badge.requirement, badge.reputationBonus);
    }
    
    /**
     * @dev Authorize a contract to update reputations
     */
    function authorizeContract(address contractAddress, bool authorized) external onlyOwner {
        authorizedContracts[contractAddress] = authorized;
        emit ContractAuthorized(contractAddress, authorized);
    }
    
    /**
     * @dev Emergency function to adjust user reputation (owner only)
     */
    function adjustReputation(address voter, int256 adjustment, string calldata reason) external onlyOwner {
        UserReputation storage user = userReputations[voter];
        
        if (adjustment > 0) {
            user.score += uint256(adjustment);
        } else {
            uint256 decrease = uint256(-adjustment);
            if (user.score > decrease) {
                user.score -= decrease;
            } else {
                user.score = 0;
            }
        }
        
        emit ReputationUpdated(voter, user.score, uint256(adjustment));
    }
    
    /**
     * @dev Get top users by reputation (for leaderboard)
     */
    function getTopUsers(address[] calldata users) external view returns (
        address[] memory topUsers,
        uint256[] memory scores
    ) {
        uint256 length = users.length;
        address[] memory sortedUsers = new address[](length);
        uint256[] memory sortedScores = new uint256[](length);
        
        // Simple insertion sort for demonstration
        for (uint256 i = 0; i < length; i++) {
            sortedUsers[i] = users[i];
            sortedScores[i] = userReputations[users[i]].score;
        }
        
        // Sort by score (descending)
        for (uint256 i = 1; i < length; i++) {
            uint256 key = sortedScores[i];
            address keyUser = sortedUsers[i];
            int256 j = int256(i) - 1;
            
            while (j >= 0 && sortedScores[uint256(j)] < key) {
                sortedScores[uint256(j + 1)] = sortedScores[uint256(j)];
                sortedUsers[uint256(j + 1)] = sortedUsers[uint256(j)];
                j--;
            }
            sortedScores[uint256(j + 1)] = key;
            sortedUsers[uint256(j + 1)] = keyUser;
        }
        
        return (sortedUsers, sortedScores);
    }
}