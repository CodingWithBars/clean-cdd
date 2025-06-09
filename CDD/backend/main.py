from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from datetime import datetime
import shutil, os, uuid

app = FastAPI()

# CORS for mobile access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["cdd"]
scans_col = db["scans"]

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def root():
    return {"message": "CDD backend running."}

@app.post("/predict")
async def predict(
    file: UploadFile,
    latitude: float = Form(...),
    longitude: float = Form(...),
    municipality: str = Form(...),
    barangay: str = Form(...),
    user_id: str = Form(...)
):
    # Save image
    ext = os.path.splitext(file.filename)[-1]
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Simulated prediction
    prediction = "Newcastle Disease"
    confidence = 0.92

    # Save to MongoDB
    scan_data = {
        "user_id": user_id,
        "image_url": f"/uploads/{filename}",
        "prediction": prediction,
        "confidence": confidence,
        "latitude": latitude,
        "longitude": longitude,
        "municipality": municipality,
        "barangay": barangay,
        "created_at": datetime.utcnow()
    }
    scans_col.insert_one(scan_data)

    return JSONResponse(content={"message": "Scan uploaded", "scan": scan_data})

@app.get("/scans")
def get_scans():
    return list(scans_col.find({}, {"_id": 0}))
