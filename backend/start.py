import uvicorn
import logging
from app.db.init_db import init_db

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    try:
        # Initialize database
        logger.info("Initializing database...")
        init_db()
        
        # Start the server
        logger.info("Starting FastAPI server...")
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except Exception as e:
        logger.error(f"Error starting the server: {str(e)}")
        raise 