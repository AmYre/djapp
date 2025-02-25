// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TournamentScore {
    struct Tournament {
        string winner;
        string score;
        string secondPlace;
        uint256 secondScore;
        string thirdPlace;
        uint256 thirdScore;
        uint256 timestamp;
    }

    Tournament[] public tournaments;
    
    function recordTournament(
        string memory _winner,
        uint256 _winnerScore,
        string memory _secondPlace,
        uint256 _secondScore,
        string memory _thirdPlace,
        uint256 _thirdScore
    ) public {
        tournaments.push(Tournament(
            _winner,
            _winnerScore,
            _secondPlace,
            _secondScore,
            _thirdPlace,
            _thirdScore,
            block.timestamp
        ));
    }

    function getTournamentCount() public view returns (uint256) {
        return tournaments.length;
    }

    function getTournament(uint256 index) public view returns (
        string memory,
        uint256,
        string memory,
        uint256,
        string memory,
        uint256,
        uint256
    ) {
        Tournament memory t = tournaments[index];
        return (
            t.winner,
            t.winnerScore,
            t.secondPlace,
            t.secondScore,
            t.thirdPlace,
            t.thirdScore,
            t.timestamp
        );
    }
}