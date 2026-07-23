import urllib.request
import json
import urllib.error
import time

url = "http://localhost:8000/api/designs/generate"
data = json.dumps({"designType": "INTERIOR", "spaceType": "LIVING_ROOM", "budget": 1000, "currency": "USD", "style": "MODERN", "location": {"city": "New York", "country": "US"}, "selectedItems": [{"itemType": "sofa"}], "description": "A cozy living room"}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

print(f"Sending request at {time.time()}")
try:
    with urllib.request.urlopen(req) as response:
        print(f"Response at {time.time()}")
        print(response.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code} at {time.time()}")
    print(e.read().decode())
except Exception as e:
    print(f"Error: {e} at {time.time()}")
