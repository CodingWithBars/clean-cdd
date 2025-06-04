from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.services.model import predict_image
from app.services.supabase_client import upload_image
import shutil
import os
import uuid

app = FastAPI()

# Allow cross-origin requests (adjust allowed origins for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        # Save uploaded image with a unique name
        filename = f"{uuid.uuid4().hex}_{file.filename}"
        file_path = os.path.join(UPLOAD_FOLDER, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Predict the disease
        prediction, probabilities = predict_image(file_path)

        # Upload to Supabase (optional)
        supabase_url = upload_image(file_path, filename)

        return {
            "prediction": prediction,
            "probabilities": probabilities,
            "image_url": supabase_url,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
