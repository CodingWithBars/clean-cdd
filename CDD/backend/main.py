from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from typing import List
from pydantic import BaseModel

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


# In-memory store for scanned locations
locations = []
scan_history = []

class Location(BaseModel):
    latitude: float
    longitude: float
    prediction: str
    probability: float

@app.post("/predict")
async def predict(
    image: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...)
):
    # Simulate prediction (normally use model)
    result = {
        "disease": "Avian Pox",
        "probability": 0.87,
        "latitude": latitude,
        "longitude": longitude,
        "timestamp": datetime.utcnow().isoformat()
    }

    # Optional: Save to history, map tracking, etc.
    scan_data.append(result)

    return JSONResponse(content=result)

@app.get("/locations", response_model=List[Location])
async def get_locations():
    return locations

@app.get("/history")
async def get_history():
    return scan_history