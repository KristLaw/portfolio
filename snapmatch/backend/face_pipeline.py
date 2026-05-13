import logging
from typing import Optional
from PIL import Image

logger = logging.getLogger(__name__)


def detect_faces(image_path: str) -> list[dict]:
    """
    Detect faces in an image.
    Returns [{"bbox": [top, right, bottom, left], "embedding": [...128 floats]}, ...]
    """
    try:
        import face_recognition
        image = face_recognition.load_image_file(image_path)
        locations = face_recognition.face_locations(image, model="hog")
        if not locations:
            return []
        encodings = face_recognition.face_encodings(image, locations)
        return [
            {"bbox": list(loc), "embedding": enc.tolist()}
            for loc, enc in zip(locations, encodings)
        ]
    except Exception as exc:
        logger.error("Face detection failed for %s: %s", image_path, exc)
        return []


def cluster_faces(embeddings: list[list[float]], threshold: float = 0.5) -> list[int]:
    """
    Cluster face embeddings with DBSCAN.
    Returns cluster label list (-1 = noise, treated as own cluster per face).
    """
    if not embeddings:
        return []
    if len(embeddings) == 1:
        return [0]

    import numpy as np
    from sklearn.cluster import DBSCAN

    arr = np.array(embeddings)
    labels = DBSCAN(eps=threshold, min_samples=1, metric="euclidean").fit_predict(arr)

    # Remap noise (-1) to unique cluster IDs to avoid collisions
    max_label = int(labels.max()) if labels.max() >= 0 else -1
    result = []
    for label in labels.tolist():
        if label == -1:
            max_label += 1
            result.append(max_label)
        else:
            result.append(label)
    return result


def find_matches(
    query_embedding: list[float],
    known: list[tuple[int, list[float]]],
    threshold: float = 0.5,
) -> list[int]:
    """Match query embedding against (cluster_id, embedding) pairs."""
    import numpy as np

    if not known:
        return []
    query = np.array(query_embedding)
    return list({
        cid
        for cid, emb in known
        if float(np.linalg.norm(query - np.array(emb))) < threshold
    })


def get_face_crop(image_path: str, bbox: list[int], padding: int = 20) -> Optional[Image.Image]:
    """Return a padded crop of the face region from an image."""
    try:
        img = Image.open(image_path)
        top, right, bottom, left = bbox
        w, h = img.size
        return img.crop((
            max(0, left - padding),
            max(0, top - padding),
            min(w, right + padding),
            min(h, bottom + padding),
        ))
    except Exception as exc:
        logger.error("Face crop failed: %s", exc)
        return None
