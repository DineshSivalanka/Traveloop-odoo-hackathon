import urllib.request
import json

def test_api(url, data=None, method="GET"):
    if data:
        req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'}, method=method)
    else:
        req = urllib.request.Request(url, method=method)
    try:
        with urllib.request.urlopen(req) as res:
            print("Status:", res.status)
            print("Response:", json.loads(res.read().decode('utf-8')))
    except urllib.error.HTTPError as e:
        print("Status:", e.code)
        print("Response:", json.loads(e.read().decode('utf-8')))
    except Exception as e:
        print("Error:", e)

print("Testing POST /trips")
test_api("http://localhost:5000/trips", {"user_id": 1, "title": "Goa Trip", "description": "Fun", "start_date": "2026-05-20", "end_date": "2026-05-25"}, "POST")

print("\nTesting GET /trips/1")
test_api("http://localhost:5000/trips/1")
