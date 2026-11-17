import cv2
import numpy as np
import io
import base64
from PIL import Image

try:
    from pyzbar.pyzbar import decode as pyzbar_decode
    PYZBAR_AVAILABLE = True
except Exception:
    PYZBAR_AVAILABLE = False


class QRDecoderService:
    @staticmethod
    def decode_image_bytes(image_bytes: bytes) -> dict:
        """
        Decodes a QR code from raw image bytes using Pyzbar and OpenCV fallback,
        with image enhancement techniques for challenging images.
        """
        result = {
            "success": False,
            "data": None,
            "error": None,
            "method": None,
            "thumbnail_base64": None
        }

        # Convert bytes to PIL Image for thumbnail and validation
        try:
            pil_img = Image.open(io.BytesIO(image_bytes))
            # Convert RGBA/Palette to RGB
            if pil_img.mode in ("RGBA", "P"):
                pil_img = pil_img.convert("RGB")
            
            # Prepare thumbnail (max 400x400)
            thumb = pil_img.copy()
            thumb.thumbnail((400, 400))
            thumb_io = io.BytesIO()
            thumb.save(thumb_io, format="JPEG", quality=85)
            result["thumbnail_base64"] = f"data:image/jpeg;base64,{base64.b64encode(thumb_io.getvalue()).decode('utf-8')}"
        except Exception as e:
            result["error"] = f"Could not process image data: {str(e)}"
            return result

        # Convert to numpy array for OpenCV
        nparr = np.frombuffer(image_bytes, np.uint8)
        cv_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if cv_img is None:
            result["error"] = "OpenCV failed to decode image buffer."
            return result

        # Attempt 1: Pyzbar on original image
        if PYZBAR_AVAILABLE:
            decoded_text = QRDecoderService._try_pyzbar(pil_img)
            if decoded_text:
                result["success"] = True
                result["data"] = decoded_text
                result["method"] = "pyzbar"
                return result

        # Attempt 2: OpenCV standard QRCodeDetector
        decoded_text = QRDecoderService._try_opencv(cv_img)
        if decoded_text:
            result["success"] = True
            result["data"] = decoded_text
            result["method"] = "opencv"
            return result

        # Attempt 3: Preprocessing filters (Grayscale, Contrast enhancement, Thresholding)
        processed_candidates = QRDecoderService._generate_preprocessed_images(cv_img)
        for idx, proc_img in enumerate(processed_candidates):
            # Try Pyzbar on preprocessed
            if PYZBAR_AVAILABLE:
                proc_pil = Image.fromarray(proc_img)
                decoded_text = QRDecoderService._try_pyzbar(proc_pil)
                if decoded_text:
                    result["success"] = True
                    result["data"] = decoded_text
                    result["method"] = f"pyzbar-enhanced-{idx+1}"
                    return result

            # Try OpenCV on preprocessed
            decoded_text = QRDecoderService._try_opencv(proc_img)
            if decoded_text:
                result["success"] = True
                result["data"] = decoded_text
                result["method"] = f"opencv-enhanced-{idx+1}"
                return result

        result["error"] = "No QR code could be detected in the provided image. Please ensure the QR code is clearly visible, well-lit, and not heavily distorted."
        return result

    @staticmethod
    def _try_pyzbar(pil_img) -> str | None:
        try:
            barcodes = pyzbar_decode(pil_img)
            for barcode in barcodes:
                data = barcode.data.decode("utf-8", errors="ignore").strip()
                if data:
                    return data
        except Exception:
            pass
        return None

    @staticmethod
    def _try_opencv(cv_img) -> str | None:
        try:
            detector = cv2.QRCodeDetector()
            data, bbox, _ = detector.detectAndDecode(cv_img)
            if data and data.strip():
                return data.strip()
        except Exception:
            pass
        return None

    @staticmethod
    def _generate_preprocessed_images(cv_img) -> list:
        """Generates different image variations to assist detection of faint/noisy QR codes."""
        candidates = []
        try:
            # 1. Grayscale
            gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY) if len(cv_img.shape) == 3 else cv_img
            candidates.append(gray)

            # 2. Histogram Equalization / CLAHE
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            clahe_img = clahe.apply(gray)
            candidates.append(clahe_img)

            # 3. Otsu Binarization
            _, otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            candidates.append(otsu)

            # 4. Adaptive Thresholding
            adaptive = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
            candidates.append(adaptive)

            # 5. Sharpened
            kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
            sharpened = cv2.filter2D(gray, -1, kernel)
            candidates.append(sharpened)
        except Exception:
            pass
        return candidates
