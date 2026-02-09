import sys
import os
from fastapi import FastAPI

# Add the backend directory to the sys.path so we can import modules from it
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from main import app as fastapi_app

# Vercel needs the app object to be named 'app'
app = fastapi_app
