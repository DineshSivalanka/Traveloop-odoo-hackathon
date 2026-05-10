import urllib.request
import json

def test_api(url, method="GET"):
    req = urllib.request.Request(url, method=method)
    try:
        with urllib.request.urlopen(req) as res:
            print("Status:", res.status)
            print("Response:", json.dumps(json.loads(res.read().decode('utf-8')), indent=2))
    except urllib.error.HTTPError as e:
        print("Status:", e.code)
        print("Response:", json.loads(e.read().decode('utf-8')))
    except Exception as e:
        print("Error:", e)

print("Testing GET /dashboard/1")
test_api("http://localhost:5000/dashboard/1")
