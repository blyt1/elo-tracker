import math
import trueskill
from typing import List, Dict, Tuple, Any, Optional

# Configure default TrueSkill parameters
# These can be adjusted based on your game's characteristics
trueskill.setup(mu=1000, sigma=333.33, beta=166.67, tau=1.0, draw_probability=0.10)

class Player:
    """Represents a player with TrueSkill rating."""
    def __init__(self, id: str, name: str, rating: Optional[trueskill.Rating] = None):
        self.id = id
        self.name = name
        # Create a new rating if none provided
        self.rating = rating if rating else trueskill.Rating()
    
    @property
    def conservative_rating(self) -> float:
        """Returns the conservative rating (μ - 3σ)."""
        return trueskill.expose(self.rating)
    
    @property
    def mu(self) -> float:
        """Returns the mean value of the rating."""
        return self.rating.mu
    
    @property
    def sigma(self) -> float:
        """Returns the standard deviation of the rating."""
        return self.rating.sigma
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "name": self.name,
            "mu": self.rating.mu,
            "sigma": self.rating.sigma,
            "conservative_rating": self.conservative_rating
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Player':
        """Create a Player object from a dictionary."""
        rating = trueskill.Rating(mu=data.get("mu", 1000), sigma=data.get("sigma", 333.33))
        return cls(id=data["id"], name=data["name"], rating=rating)


def calculate_team_rating(
    team1: List[Player], 
    team2: List[Player], 
    team1_score: float, 
    team2_score: float
) -> Dict[str, Any]:
    """
    Calculate new TrueSkill ratings for a team match.
    
    Args:
        team1: List of Player objects in team 1
        team2: List of Player objects in team 2
        team1_score: Score for team 1
        team2_score: Score for team 2
        
    Returns:
        Dict containing updated rating values for all players
    """
    # Determine match outcome
    if team1_score > team2_score:
        ranks = [0, 1]  # Team 1 wins
    elif team1_score < team2_score:
        ranks = [1, 0]  # Team 2 wins
    else:
        ranks = [0, 0]  # Draw
    
    # Store original ratings for reporting changes
    original_ratings = {
        "team1": [{"id": p.id, "rating_before": p.to_dict()} for p in team1],
        "team2": [{"id": p.id, "rating_before": p.to_dict()} for p in team2]
    }
    
    # Group players by team for the TrueSkill calculation
    team1_ratings = [p.rating for p in team1]
    team2_ratings = [p.rating for p in team2]
    
    # Calculate new ratings
    new_team1_ratings, new_team2_ratings = trueskill.rate([team1_ratings, team2_ratings], ranks=ranks)
    
    # Update player ratings
    for i, player in enumerate(team1):
        player.rating = new_team1_ratings[i]
    
    for i, player in enumerate(team2):
        player.rating = new_team2_ratings[i]
    
    # Prepare results
    results = {
        "team1": [
            {
                "id": player.id,
                "rating_before": original_ratings["team1"][i]["rating_before"],
                "rating_after": player.to_dict(),
                "mu_change": player.mu - original_ratings["team1"][i]["rating_before"]["mu"],
                "sigma_change": player.sigma - original_ratings["team1"][i]["rating_before"]["sigma"],
                "conservative_rating_change": player.conservative_rating - original_ratings["team1"][i]["rating_before"]["conservative_rating"]
            }
            for i, player in enumerate(team1)
        ],
        "team2": [
            {
                "id": player.id,
                "rating_before": original_ratings["team2"][i]["rating_before"],
                "rating_after": player.to_dict(),
                "mu_change": player.mu - original_ratings["team2"][i]["rating_before"]["mu"],
                "sigma_change": player.sigma - original_ratings["team2"][i]["rating_before"]["sigma"],
                "conservative_rating_change": player.conservative_rating - original_ratings["team2"][i]["rating_before"]["conservative_rating"]
            }
            for i, player in enumerate(team2)
        ],
        "team1Won": team1_score > team2_score,
        "team2Won": team1_score < team2_score,
        "isDraw": team1_score == team2_score
    }
    
    return results


def calculate_player_rating(
    player1: Player, 
    player2: Player, 
    player1_score: float, 
    player2_score: float
) -> Dict[str, Any]:
    """
    Calculate new TrueSkill ratings for individual players.
    
    Args:
        player1: First player
        player2: Second player
        player1_score: Score for player 1
        player2_score: Score for player 2
        
    Returns:
        Dict containing updated rating values for both players
    """
    # Create single-player "teams" and use the team calculation
    return calculate_team_rating([player1], [player2], player1_score, player2_score)


# Utility functions for your application

def create_player_from_db_record(record: Dict[str, Any]) -> Player:
    """
    Create a Player object from a database record.
    
    This function adapts your database player records to the Player class.
    You'll need to modify this based on your actual database schema.
    """
    # In your database, you might store mu and sigma separately
    # or you might store a single "elo" value
    mu = record.get("mu", 1000)
    sigma = record.get("sigma", 333.33)
    
    return Player(
        id=record["id"],
        name=record["name"],
        rating=trueskill.Rating(mu=mu, sigma=sigma)
    )


def convert_trueskill_to_elo_like_value(player: Player) -> int:
    """
    Convert TrueSkill rating to a single ELO-like integer value.
    
    This helps maintain compatibility with your current UI that displays ELO ratings.
    """
    # This uses the conservative rating (μ - 3σ) which is a good approximation
    # for ranking purposes, and then scales it to be in a similar range as ELO
    return int(player.conservative_rating)
