from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from datetime import datetime
from pymongo import MongoClient
import os
import uuid
from passlib.context import CryptContext
import jwt

# Initialize FastAPI app
app = FastAPI(title="Oil & Gas Finder API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
try:
    client = MongoClient(MONGO_URL)
    db = client.oil_gas_finder
except Exception as e:
    print(f"MongoDB connection failed: {e}")
    db = None

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('SECRET_KEY', 'oil-gas-finder-secret-key-2024')

# Basic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    company_name: str
    country: str
    trading_role: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Health check endpoint
@app.get("/api/status")
async def get_status():
    return {
        "status": "Oil & Gas Finder API is running",
        "timestamp": datetime.utcnow(),
        "database": "connected" if db else "disconnected"
    }

# Platform stats
@app.get("/api/stats")
async def get_platform_stats():
    try:
        if db:
            total_traders = db.users.count_documents({})
            active_listings = db.listings.count_documents({})
        else:
            total_traders = 0
            active_listings = 0
        
        return {
            "oil_gas_traders": total_traders,
            "active_oil_listings": active_listings,
            "successful_connections": 0,
            "premium_finders": 0,
            "featured_opportunities": 0
        }
    except Exception as e:
        return {
            "oil_gas_traders": 0,
            "active_oil_listings": 0,
            "successful_connections": 0,
            "premium_finders": 0,
            "featured_opportunities": 0
        }

# Market data endpoint
@app.get("/api/market-data")
async def get_market_data():
    return {
        "oil_prices": {
            "wti_crude": {"price": 78.45, "change": "+1.23", "updated": datetime.utcnow()},
            "brent_crude": {"price": 82.15, "change": "+0.98", "updated": datetime.utcnow()},
            "dubai_crude": {"price": 81.23, "change": "+1.05", "updated": datetime.utcnow()}
        },
        "gas_prices": {
            "natural_gas": {"price": 2.85, "change": "-0.12", "updated": datetime.utcnow()},
            "lng": {"price": 12.45, "change": "+0.23", "updated": datetime.utcnow()}
        },
        "trading_hubs": [
            "Houston, TX", "Dubai, UAE", "Singapore", 
            "London, UK", "Rotterdam, Netherlands", "Cushing, OK"
        ]
    }

# User registration
@app.post("/api/auth/register")
async def register_user(user_data: UserCreate):
    try:
        if not db:
            raise HTTPException(status_code=503, detail="Database not available")
        
        # Check if user exists
        existing_user = db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user
        user_id = str(uuid.uuid4())
        hashed_password = pwd_context.hash(user_data.password)
        
        user_doc = {
            "user_id": user_id,
            "email": user_data.email,
            "password_hash": hashed_password,
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "company_name": user_data.company_name,
            "country": user_data.country,
            "trading_role": user_data.trading_role,
            "role": "basic",
            "created_at": datetime.utcnow()
        }
        
        db.users.insert_one(user_doc)
        
        return {
            "message": "User registered successfully",
            "user_id": user_id,
            "email": user_data.email
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

# User login
@app.post("/api/auth/login")
async def login_user(user_data: UserLogin):
    try:
        if not db:
            raise HTTPException(status_code=503, detail="Database not available")
        
        user = db.users.find_one({"email": user_data.email})
        if not user or not pwd_context.verify(user_data.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        return {
            "message": "Login successful",
            "user": {
                "user_id": user["user_id"],
                "email": user["email"],
                "first_name": user["first_name"],
                "last_name": user["last_name"],
                "company_name": user["company_name"],
                "role": user["role"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

# Sitemap for SEO
@app.get("/sitemap.xml")
async def get_sitemap():
    sitemap_content = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://www.oilgasfinder.com/</loc>
        <lastmod>2024-06-26</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://www.oilgasfinder.com/api/status</loc>
        <lastmod>2024-06-26</lastmod>
        <changefreq>hourly</changefreq>
        <priority>0.8</priority>
    </url>
</urlset>'''
    
    from fastapi.responses import Response
    return Response(content=sitemap_content, media_type="application/xml")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
