import requests
import subprocess
import time

def main():
    print("Starting backend...")
    p = subprocess.Popen(["python", "-m", "uvicorn", "main:app", "--port", "8000"], cwd="C:/Users/Suraj Sharma/testproject/backend")
    time.sleep(4)
    print("Sending request...")
    try:
        r = requests.post("http://localhost:8000/api/chat", json={"message": "a task to buy groceries"})
        print(f"Status: {r.status_code}")
        print(f"Body: {r.text}")
    except Exception as e:
        print(f"Failed to request: {e}")
    finally:
        p.terminate()

main()
