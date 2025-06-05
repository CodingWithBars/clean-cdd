import os
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime

base_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(base_dir, "..", "..", ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def save_scan(user_id, image_url, prediction, confidence, latitude, longitude, municipality, barangay):
    supabase.table("scans").insert({
        "user_id": user_id,
        "image_url": image_url,
        "prediction": prediction,
        "confidence": confidence,
        "latitude": latitude,
        "longitude": longitude,
        "municipality": municipality,
        "barangay": barangay,
        "created_at": datetime.utcnow().isoformat()
    }).execute()

def upload_image(file_path: str, file_name: str) -> str:
    with open(file_path, "rb") as f:
        file_data = f.read()
    content_type = f"image/{file_name.split('.')[-1]}"
    response = supabase.storage.from_("scan-images").upload(file_name, file_data, {"content-type": content_type}, upsert=True)
    if response.status_code == 200:
        return supabase.storage.from_("scan-images").get_public_url(file_name)
    else:
        raise Exception(f"Upload failed: {response.json()}")
