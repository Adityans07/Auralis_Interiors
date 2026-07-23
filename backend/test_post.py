import urllib.request
import json
import urllib.error

url = "http://localhost:8000/api/designs/generate"
data = json.dumps({"designType": "KITCHEN", "spaceType": "LIVING_ROOM", "budget": 1000, "currency": "USD", "style": "MODERN", "location": {"city": "New York", "country": "US"}, "selectedItems": []}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(e.read().decode())
except Exception as e:
    print(f"Error: {e}")
