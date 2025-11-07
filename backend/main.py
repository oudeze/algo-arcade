"""
Main FastAPI app for Algorithms Arcade
Just a basic setup to get things running
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.packing import router as packing_router
from api.route import router as route_router

app = FastAPI(title="Algorithms Arcade API", version="0.1.0")
app.include_router(packing_router)
app.include_router(route_router)

# CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Algorithms Arcade API", "status": "running"}

@app.get("/health")
def health():
    return {"status": "ok"}

