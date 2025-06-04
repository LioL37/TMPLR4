import logging
import sys
from pathlib import Path
from datetime import datetime

# Настройки логгера
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
LOG_FILE = LOG_DIR / f"fire_safety_{datetime.now().date()}.log"

def setup_logger():
    logger = logging.getLogger("fire_safety")
    logger.setLevel(logging.INFO)

    formatter = logging.Formatter(LOG_FORMAT)

    # Консольный вывод
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # Файловый вывод
    file_handler = logging.FileHandler(LOG_FILE)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    return logger

logger = setup_logger()