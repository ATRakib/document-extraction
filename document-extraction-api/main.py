import uvicorn
from app.main import app
from app.config import settings

if __name__ == "__main__":
    print(f"""
    ╔══════════════════════════════════════════════════════╗
    ║  {settings.APP_NAME} v{settings.APP_VERSION}
    ║  Starting server...
    ║  URL: http://{settings.HOST}:{settings.PORT}
    ║  Docs: http://{settings.HOST}:{settings.PORT}/api/docs
    ╚══════════════════════════════════════════════════════╝
    """)
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )