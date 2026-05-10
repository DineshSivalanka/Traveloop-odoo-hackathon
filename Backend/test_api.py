import urllib.request
import json

def test_api(url, data):
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as res:
            print("Status:", res.status)
            print("Response:", json.loads(res.read().decode('utf-8')))
    except urllib.error.HTTPError as e:
        print("Status:", e.code)
        print("Response:", json.loads(e.read().decode('utf-8')))
    except Exception as e:
        print("Error:", e)

print("Testing POST /signup")
test_api("http://localhost:5000/signup", {"name": "Dinesh", "email": "test@gmail.com", "password": "1234"})

print("\nTesting POST /login")
test_api("http://localhost:5000/login", {"email": "test@gmail.com", "password": "1234"})
