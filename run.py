import os
import subprocess
import signal
import sys

def signal_handler(sig, frame):
    print('Stopping servers...')
    # Send SIGTERM to the process group to ensure all child processes are terminated
    os.killpg(os.getpgid(pro.pid), signal.SIGTERM)
    sys.exit(0)

# Run the signal_generator service
try:
    pro = subprocess.Popen("npm start", stdout=subprocess.PIPE, shell=True, preexec_fn=os.setsid, cwd='signal_generator')
    signal.signal(signal.SIGINT, signal_handler)
    print("Starting signal_generator service...")
    pro.wait()
except Exception as e:
    print(f"Error starting signal_generator service: {e}")
