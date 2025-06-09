from datetime import datetime
from bson import ObjectId
from app.services.mongo_client import scans_collection

def save_scan(user_id, image_url, prediction, confidence, latitude, longitude, municipality, barangay):
    scan = {
        "user_id": user_id,
        "image_url": image_url,
        "prediction": prediction,
        "confidence": confidence,
        "latitude": latitude,
        "longitude": longitude,
        "municipality": municipality,
        "barangay": barangay,
        "created_at": datetime.utcnow()
    }
    scans_collection.insert_one(scan)

def get_all_scans():
    scans = list(scans_collection.find().sort("created_at", -1))
    for scan in scans:
        scan["_id"] = str(scan["_id"])
    return scans
