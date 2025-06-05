import os
import uuid
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env before anything else
base_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(base_dir, "..", ".env")
load_dotenv(dotenv_path)

# Internal service imports (after env is loaded)
from app.services.model import predict_image
from app.services.supabase_client import upload_image, save_scan

app = FastAPI()

# Enable CORS (adjust in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploads directory setup
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.post("/predict/")
async def predict(
    file: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...)
):
    try:
        filename = f"{uuid.uuid4().hex}_{file.filename}"
        file_path = os.path.join(UPLOAD_FOLDER, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Predict using model
        prediction, probabilities = predict_image(file_path)

        # Upload image to Supabase
        image_url = upload_image(file_path, filename)

        # Save scan result to Supabase
        save_scan(prediction, probabilities, image_url, latitude, longitude)

        return {
            "prediction": prediction,
            "probabilities": probabilities,
            "image_url": image_url,
            "lat": latitude,
            "lon": longitude
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def read_root():
    return {"message": "CDD backend running."}

@app.get("/scans")
def get_scans():
    return {"message": "CDD backend scan running."}

@app.get("/history")
def get_history():
    return {"message": "CDD backend get_history running."}

