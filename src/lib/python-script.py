#!/usr/bin/env python
# python/calculate_team_rating.py

import sys
import json
import trueskill
from typing import Dict, Any, List

# Import your TrueSkill implementation 
# Assuming you've saved the earlier code as trueskill_impl.py
from trueskill_impl import Player, calculate_team_rating

def main():
    """
    Read input data from a JSON file, calculate new TrueSkill ratings,
    and print the results as JSON to stdout.
    """
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Missing input file path"}))
        sys.exit(1)
    
    input_file = sys.argv[1]
    
    try:
        # Read input data
        with open(input_file, 'r') as f:
            data = json.load(f)
        
        # Extract team information
        team1_data = data['team1']
        team2_data = data['team2']
        team1_score = data['team1_score']
        team2_score = data['team2_score']
        
        # Convert to Player objects
        team1 = [Player(
            id=p['id'], 
            name=p['name'], 
            rating=trueskill.Rating(mu=p.get('mu', 1000), sigma=p.get('sigma', 333.33))
        ) for p in team1_data]
        
        team2 = [Player(
            id=p['id'], 
            name=p['name'], 
            rating=trueskill.Rating(mu=p.get('mu', 1000), sigma=p.get('sigma', 333.33))
        ) for p in team2_data]
        
        # Calculate new ratings
        results = calculate_team_rating(team1, team2, team1_score, team2_score)
        
        # Print results as JSON to stdout
        print(json.dumps(results))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
