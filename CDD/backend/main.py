# --- Imports ---
import os, uuid, json, traceback, base64
from datetime import datetime
from typing import Optional, Tuple, Dict
from fastapi import FastAPI, File, UploadFile, Form, Request, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from supabase import create_client, Client
from PIL import Image
import numpy as np
import tensorflow as tf
import logging
from logging.handlers import RotatingFileHandler
from io import BytesIO
from config import *
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict

# --- Setup Logging ---
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        RotatingFileHandler(LOG_FILE, maxBytes=10485760, backupCount=5),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# --- Configuration ---
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://twhpxhnukyvhplphiflm.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3aHB4aG51a3l2aHBscGhpZmxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5Njg0ODUsImV4cCI6MjA2NDU0NDQ4NX0.LCqnMBhh_yIajrvuP7M8A0qUyApmVIgqmxGx0KUwMTU")
APP_BASE_URL = os.getenv("APP_BASE_URL", "http://192.168.2.7:8080")

# --- Supabase Client ---
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    logger.info("Supabase client initialized successfully")
except Exception as e:
    logger.error(f"Error initializing Supabase client: {str(e)}")
    supabase = None

# --- FastAPI Setup ---
app = FastAPI(
    title="Chicken Disease Detection API",
    description="API for detecting chicken diseases from images",
    version="1.0.0",
    docs_url="/docs" if DEBUG else None,
    redoc_url="/redoc" if DEBUG else None
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Key Dependency (if needed) ---
api_key_header = APIKeyHeader(name=API_KEY_HEADER, auto_error=False)

async def verify_api_key(api_key: Optional[str] = Depends(api_key_header)):
    if API_KEY_ENABLED and api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid or missing API key")

# --- ML Model and Inference ---
class_names = ['Coccidiosis', 'Newcastle Disease', 'Salmonellosis', 'Healthy', 'Nonfecal']
model = tf.keras.models.load_model("cdd_convert_model.tflite")

def preprocess_image(image: Image.Image) -> np.ndarray:
    image = image.resize((224, 224))
    image_array = np.array(image) / 255.0
    return np.expand_dims(image_array, axis=0)

def run_model(image_array: np.ndarray) -> Tuple[str, Dict[str, float]]:
    predictions = model.predict(image_array)[0]
    predicted_index = int(np.argmax(predictions))
    prediction = class_names[predicted_index]
    probabilities = {class_names[i]: float(predictions[i]) for i in range(len(class_names))}
    return prediction, probabilities

@app.get("/")
def read_root():
    return {"message": "API is up and running!"}

# --- Predict Endpoint ---
@app.post("/predict")
async def predict(request: Request, _: None = Depends(verify_api_key)):
    try:
        body = await request.json()
        base64_data = body.get("image")

        if not base64_data:
            raise HTTPException(status_code=400, detail="Missing image data")

        # Decode base64 to image
        image_bytes = base64.b64decode(base64_data)
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
        img_array = preprocess_image(image)

        # Run prediction
        prediction, probabilities = run_model(img_array)

        return {
            "prediction": prediction,
            "probabilities": probabilities
        }

    except Exception as e:
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Prediction failed: " + str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
