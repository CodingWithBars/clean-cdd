from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os, uuid, shutil
from dotenv import load_dotenv

# Load env before any other import
base_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(base_dir, "..", ".env"))

from app.services.model import predict_image
from app.services.supabase_client import upload_image, save_scan

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    municipality: str = Form(...),
    barangay: str = Form(...),
    user_id: str = Form(...)
):
    try:
        filename = f"{uuid.uuid4().hex}_{file.filename}"
        file_path = os.path.join(UPLOAD_FOLDER, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print(f"📸 Received file: {filename}")

        prediction, probabilities = predict_image(file_path)
        confidence = float(max(probabilities.values()))
        image_url = upload_image(file_path, filename)

        save_scan(
            user_id=user_id,
            image_url=image_url,
            prediction=prediction,
            confidence=confidence,
            latitude=latitude,
            longitude=longitude,
            municipality=municipality,
            barangay=barangay
        )

        return {
            "prediction": prediction,
            "confidence": confidence,
            "image_url": image_url,
            "latitude": latitude,
            "longitude": longitude,
            "municipality": municipality,
            "barangay": barangay,
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

