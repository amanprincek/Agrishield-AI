from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def root():
    return {"message": "Agrishield-AI Backend is running"}


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "project": "Agrishield-AI"
    }