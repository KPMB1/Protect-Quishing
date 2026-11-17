import io
import re
from urllib.parse import urlparse
from PIL import Image

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
ALLOWED_MIMETYPES = {"image/png", "image/jpeg", "image/webp"}

def allowed_file(filename: str) -> bool:
    if not filename or "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in ALLOWED_EXTENSIONS

def validate_image_stream(stream_bytes: bytes) -> tuple[bool, str]:
    """Validate that uploaded bytes correspond to a genuine, uncorrupted image."""
    if not stream_bytes or len(stream_bytes) == 0:
        return False, "Empty file provided."
    
    if len(stream_bytes) > 16 * 1024 * 1024:
        return False, "File exceeds maximum size of 16MB."

    try:
        with Image.open(io.BytesIO(stream_bytes)) as img:
            img.verify()
        
        # Re-open for format check (verify() closes or invalidates the image)
        with Image.open(io.BytesIO(stream_bytes)) as img:
            fmt = (img.format or "").upper()
            if fmt not in ["PNG", "JPEG", "JPG", "WEBP"]:
                return False, f"Unsupported image format: {fmt}. Allowed: PNG, JPG, JPEG, WEBP."
        return True, ""
    except Exception as e:
        return False, f"Corrupted or invalid image data: {str(e)}"

def is_valid_url(url: str) -> bool:
    """Check if decoded QR text has a recognizable web URL structure."""
    if not url or not isinstance(url, str):
        return False
    url = url.strip()
    
    # Common URL regex pattern
    url_pattern = re.compile(
        r'^(https?:\/\/)?'  # optional http:// or https://
        r'(([a-zA-Z0-9_\-\.]+\.[a-zA-Z]{2,})|(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}))'  # domain or ipv4
        r'(:\d{1,5})?'  # optional port
        r'(\/.*)?$',  # optional path
        re.IGNORECASE
    )
    return bool(url_pattern.match(url))
