from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
from uuid import uuid4
import os

app = FastAPI()

STORAGE_PATH = "capsules"
os.makedirs(STORAGE_PATH, exist_ok=True)

# Create a Capsule
@app.post("/v1/capsules")
async def create_capsule(file: UploadFile = File(...)):
    capsule_id = str(uuid4())
    file_path = f"{STORAGE_PATH}/{capsule_id}_{file.filename}"

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    return {"capsule_id": capsule_id, "saved_as": file.filename}

# Download / Retrieve Capsule
@app.get("/v1/capsules/{capsule_id}")
async def get_capsule(capsule_id: str):
    for f in os.listdir(STORAGE_PATH):
        if f.startswith(capsule_id):
            return FileResponse(f"{STORAGE_PATH}/{f}")
    return {"error": "Capsule not found"}
