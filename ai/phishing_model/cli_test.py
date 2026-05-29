import argparse
from serve import app

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test predictive score of URL")
    parser.add_argument("--test-url", type=str, required=True, help="URL to predict")
    args = parser.parse_args()
    
    # Simple CLI test bypassing the FastAPI server layer
    import asyncio
    import json
    from serve import predict_url, PredictRequest
    
    async def run_test():
        try:
            req = PredictRequest(url=args.test_url, html="")
            res = predict_url(req)
            print(json.dumps(res, indent=2))
        except Exception as e:
            print(f"Error predicting URL: {e}")
            
    asyncio.run(run_test())
