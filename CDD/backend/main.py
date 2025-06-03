from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from typing import List
from pydantic import BaseModel

app = FastAPI()

# In-memory store for scanned locations
locations = []

class Location(BaseModel):
    latitude: float
    longitude: float
    prediction: str
    probability: float

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...)
):
    # Dummy prediction
    prediction = "Coccidiosis"
    probability = 0.87

    result = {
        "prediction": prediction,
        "probability": probability,
        "latitude": latitude,
        "longitude": longitude
    }

    # Store the location data
    locations.append(result)

    return JSONResponse(content=result)

@app.get("/locations", response_model=List[Location])
async def get_locations():
    return locations
