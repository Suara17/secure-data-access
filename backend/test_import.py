#!/usr/bin/env python3
import sys
import os

print(f"Current working directory: {os.getcwd()}")
print(f"Script directory: {os.path.dirname(os.path.abspath(__file__))}")

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
print(f"Added to sys.path: {current_dir}")
print(f"sys.path: {sys.path}")

try:
    import database
    print("database import successful")
except ImportError as e:
    print(f"database import failed: {e}")

try:
    import models
    print("models import successful")
except ImportError as e:
    print(f"models import failed: {e}")

try:
    import security_engine
    print("security_engine import successful")
except ImportError as e:
    print(f"security_engine import failed: {e}")

try:
    import main
    print("main import successful")
except ImportError as e:
    print(f"main import failed: {e}")
