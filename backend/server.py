from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import pandas as pd
import io
import os
import uuid
from datetime import datetime
from pymongo import MongoClient

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/realestatedb')
client = MongoClient(MONGO_URL)
db = client.realestatedb

# Collections
properties_collection = db.properties
calls_collection = db.calls

# Pydantic models
class Property(BaseModel):
    id: str
    name: str
    number: str
    location: str
    pricing: str
    requirements: str
    remarks: str
    created_at: datetime

class CallRecord(BaseModel):
    id: str
    property_id: str
    contact_type: str  # 'call' or 'whatsapp'
    duration: Optional[str] = None
    remarks: Optional[str] = None
    requirement_status: str  # 'requirement', 'no_requirement', 'future_requirement'
    created_at: datetime

class CallUpdate(BaseModel):
    call_id: str
    remarks: str
    requirement_status: str

@app.get("/")
async def root():
    return {"message": "Real Estate Communication Platform API"}

@app.post("/api/upload-excel")
async def upload_excel(file: UploadFile = File(...)):
    """Upload and process Excel file with property data"""
    try:
        # Validate file type
        if not file.filename.endswith(('.xlsx', '.xls')):
            raise HTTPException(status_code=400, detail="File must be Excel format (.xlsx or .xls)")
        
        # Read file content
        content = await file.read()
        df = pd.read_excel(io.BytesIO(content))
        
        # Validate required columns
        required_columns = ['name', 'number', 'location', 'pricing', 'requirements', 'remarks']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )
        
        # Process and save properties
        properties = []
        for _, row in df.iterrows():
            property_data = {
                "id": str(uuid.uuid4()),
                "name": str(row['name']),
                "number": str(row['number']),
                "location": str(row['location']),
                "pricing": str(row['pricing']),
                "requirements": str(row['requirements']),
                "remarks": str(row['remarks']),
                "created_at": datetime.now()
            }
            properties.append(property_data)
        
        # Insert into database
        if properties:
            properties_collection.insert_many(properties)
        
        return {
            "message": f"Successfully uploaded {len(properties)} properties",
            "properties_count": len(properties)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/api/properties")
async def get_properties():
    """Get all properties"""
    try:
        properties = list(properties_collection.find({}, {"_id": 0}))
        return {"properties": properties}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching properties: {str(e)}")

@app.post("/api/initiate-contact")
async def initiate_contact(property_id: str, contact_type: str):
    """Record contact initiation"""
    try:
        # Verify property exists
        property_doc = properties_collection.find_one({"id": property_id}, {"_id": 0})
        if not property_doc:
            raise HTTPException(status_code=404, detail="Property not found")
        
        call_record = {
            "id": str(uuid.uuid4()),
            "property_id": property_id,
            "contact_type": contact_type,
            "duration": None,
            "remarks": None,
            "requirement_status": "pending",
            "created_at": datetime.now()
        }
        
        calls_collection.insert_one(call_record)
        
        return {
            "message": "Contact initiated successfully",
            "call_id": call_record["id"],
            "property": property_doc
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error initiating contact: {str(e)}")

@app.post("/api/update-call")
async def update_call(call_update: CallUpdate):
    """Update call with remarks and requirement status"""
    try:
        result = calls_collection.update_one(
            {"id": call_update.call_id},
            {
                "$set": {
                    "remarks": call_update.remarks,
                    "requirement_status": call_update.requirement_status,
                    "updated_at": datetime.now()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Call record not found")
        
        return {"message": "Call updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating call: {str(e)}")

@app.get("/api/calls")
async def get_calls():
    """Get all call records"""
    try:
        calls = list(calls_collection.find({}, {"_id": 0}))
        return {"calls": calls}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching calls: {str(e)}")

@app.get("/api/calls/{property_id}")
async def get_property_calls(property_id: str):
    """Get call records for a specific property"""
    try:
        calls = list(calls_collection.find({"property_id": property_id}, {"_id": 0}))
        return {"calls": calls}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching property calls: {str(e)}")

@app.delete("/api/properties")
async def clear_properties():
    """Clear all properties (for testing)"""
    try:
        result = properties_collection.delete_many({})
        return {"message": f"Cleared {result.deleted_count} properties"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing properties: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)