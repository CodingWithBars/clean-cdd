from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os, uuid, shutil
from dotenv import load_dotenv

# Load .env
base_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(base_dir, "..", ".env"))

# Internal imports
from app.services.model import predict_image
from app.services.scan_service import save_scan, get_all_scans

# FastAPI instance
app = FastAPI()

# Allow all CORS (customize this for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads folder if not exists
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Mount static folder for serving images
app.mount("/uploads", StaticFiles(directory=UPLOAD_FOLDER), name="uploads")


# Helper to generate full image URL
def upload_image(request: Request, filename: str) -> str:
    base_url = str(request.base_url).rstrip("/")
    return f"{base_url}/uploads/{filename}"


@app.post("/predict")
async def predict(
    request: Request,
    file: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    municipality: str = Form(...),
    barangay: str = Form(...),
    user_id: str = Form(...)
):
    try:
        # Save uploaded file
        filename = f"{uuid.uuid4().hex}_{file.filename}"
        file_path = os.path.join(UPLOAD_FOLDER, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print(f"📸 Received file: {filename}")

        # Run prediction
        prediction, probabilities = predict_image(file_path)
        confidence = float(max(probabilities.values()))

        # Generate public URL for the image
        image_url = upload_image(request, filename)

        # Save scan info to MongoDB
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

        # Return prediction result
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
        print(f"❌ Error in /predict: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def read_root():
    return {"message": "CDD backend running."}


@app.get("/scans")
def get_scans():
    try:
        return get_all_scans()
    except Exception as e:
        print(f"❌ Error in /scans: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/history")
def get_history():
    try:
        return get_all_scans()
    except Exception as e:
        print(f"❌ Error in /history: {e}")
        raise HTTPException(status_code=500, detail=str(e))
