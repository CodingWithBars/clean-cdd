import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load .env variables safely
base_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(base_dir, "..", "..", ".env")
load_dotenv(dotenv_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Validate configuration
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in the environment or .env file.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_image(file_path: str, file_name: str) -> str:
    """Uploads an image to Supabase Storage and returns the public URL."""
    try:
        with open(file_path, "rb") as f:
            file_data = f.read()
        
        content_type = f"image/{file_name.split('.')[-1]}"
        response = supabase.storage.from_("images").upload(file_name, file_data, {"content-type": content_type})

        if response.status_code == 200:
            return supabase.storage.from_("images").get_public_url(file_name)
        else:
            raise Exception(f"Upload failed: {response.json()}")

    except Exception as e:
        raise Exception(f"Supabase image upload error: {str(e)}")
