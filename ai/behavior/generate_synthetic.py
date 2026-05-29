import statistics
import json
import random

def generate_sample(base_dwell, base_flight, noise=10):
    """
    Generate synthetic keystroke timing vectors cleanly mapped to Privacy Postures.
    """
    length = random.randint(8, 12) # e.g. 8-12 char password
    dwells = [max(0.0, float(random.gauss(base_dwell, noise))) for _ in range(length)]
    flights = [max(0.0, float(random.gauss(base_flight, noise * 2))) for _ in range(length-1)]
    return {
        "dwell": {
            "median": round(statistics.median(dwells), 2),
            "stddev": round(statistics.stdev(dwells), 2) if len(dwells) > 1 else 0.0
        },
        "flight": {
            "median": round(statistics.median(flights), 2),
            "stddev": round(statistics.stdev(flights), 2) if len(flights) > 1 else 0.0
        }
    }

def main():
    user = "alice"
    # Alice is a fast, consistent typer
    alice_samples = [generate_sample(80, 150, 5) for _ in range(5)]
    
    # Export for dev mock testing
    dev_enroll_payload = {
        "userId": user,
        "samples": alice_samples
    }
    
    # Attacker tries to mimic but is slow
    attacker_sample = generate_sample(150, 400, 30)
    
    dev_verify_payload = {
        "userId": user,
        "sample": attacker_sample
    }
    
    with open("synthetic_enroll.json", "w") as f:
        json.dump(dev_enroll_payload, f, indent=2)
        
    with open("synthetic_verify.json", "w") as f:
        json.dump(dev_verify_payload, f, indent=2)
        
    print("Generated synthetic_enroll.json and synthetic_verify.json")

if __name__ == "__main__":
    main()
