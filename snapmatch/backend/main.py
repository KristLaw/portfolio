import json
import logging
import os
import shutil
import uuid
from datetime import datetime
from typing import Optional

from dotenv import load_dotenv
from fastapi import (
    BackgroundTasks,
    Depends,
    FastAPI,
    File,
    Form,
    HTTPException,
    Request,
    UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from database import Base, SessionLocal, engine, get_db
from face_pipeline import cluster_faces, detect_faces, get_face_crop
from line_delivery import parse_webhook, send_photos_to_user
import models

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(f"{UPLOAD_DIR}/faces", exist_ok=True)

ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".webp"}

app = FastAPI(title="SnapMatch API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# ── Events ─────────────────────────────────────────────────────────────────


@app.post("/events")
def create_event(
    name: str = Form(...),
    date: str = Form(...),
    line_channel_token: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    event = models.Event(name=name, date=date, line_channel_token=line_channel_token or None)
    db.add(event)
    db.commit()
    db.refresh(event)
    return {"id": event.id, "name": event.name, "date": event.date}


@app.get("/events/{event_id}")
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(404, "Event not found")
    return {"id": event.id, "name": event.name, "date": event.date}


@app.get("/events/{event_id}/stats")
def get_stats(event_id: int, db: Session = Depends(get_db)):
    if not db.query(models.Event).filter(models.Event.id == event_id).first():
        raise HTTPException(404, "Event not found")

    photos = db.query(models.Photo).filter(models.Photo.event_id == event_id).count()
    faces = (
        db.query(models.Face)
        .join(models.Photo)
        .filter(models.Photo.event_id == event_id)
        .count()
    )
    matched = db.query(models.Person).filter(
        models.Person.event_id == event_id,
        models.Person.line_user_id.isnot(None),
    ).count()
    delivered = (
        db.query(models.Delivery)
        .join(models.Person)
        .filter(models.Person.event_id == event_id, models.Delivery.status == "sent")
        .count()
    )
    return {"photos": photos, "faces": faces, "matched": matched, "delivered": delivered}


# ── Upload & background processing ────────────────────────────────────────


def _recompute_clusters(event_id: int):
    """Re-cluster all faces for an event and sync Person records."""
    db = SessionLocal()
    try:
        all_faces = (
            db.query(models.Face)
            .join(models.Photo)
            .filter(models.Photo.event_id == event_id)
            .all()
        )
        if not all_faces:
            return

        embeddings = [json.loads(f.embedding_json) for f in all_faces]
        labels = cluster_faces(embeddings)

        for face, label in zip(all_faces, labels):
            face.cluster_id = label
        db.commit()

        # Ensure a Person row exists for every cluster
        existing_clusters = {
            p.cluster_id
            for p in db.query(models.Person).filter(models.Person.event_id == event_id).all()
        }
        new_clusters = set(labels) - existing_clusters
        for cid in new_clusters:
            db.add(models.Person(event_id=event_id, cluster_id=cid))
        db.commit()
    except Exception as exc:
        logger.error("Cluster recompute failed: %s", exc)
    finally:
        db.close()


def _process_photo(photo_id: int, filepath: str, event_id: int):
    """Detect faces, save crops, then re-cluster the whole event."""
    db = SessionLocal()
    try:
        faces_data = detect_faces(filepath)
        for fd in faces_data:
            face = models.Face(
                photo_id=photo_id,
                bbox_json=json.dumps(fd["bbox"]),
                embedding_json=json.dumps(fd["embedding"]),
            )
            db.add(face)
        db.commit()

        # Save face crops
        for face in db.query(models.Face).filter(models.Face.photo_id == photo_id).all():
            crop = get_face_crop(filepath, json.loads(face.bbox_json))
            if crop:
                crop.save(f"{UPLOAD_DIR}/faces/face_{face.id}.jpg", "JPEG", quality=85)
    except Exception as exc:
        logger.error("Photo processing failed (id=%s): %s", photo_id, exc)
    finally:
        db.close()

    _recompute_clusters(event_id)


@app.post("/events/{event_id}/photos/upload")
async def upload_photos(
    event_id: int,
    background_tasks: BackgroundTasks,
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    if not db.query(models.Event).filter(models.Event.id == event_id).first():
        raise HTTPException(404, "Event not found")

    event_dir = f"{UPLOAD_DIR}/{event_id}"
    os.makedirs(event_dir, exist_ok=True)

    results = []
    for file in files:
        ext = os.path.splitext(file.filename or "")[1].lower()
        if ext not in ALLOWED_EXTS:
            continue

        unique_name = f"{uuid.uuid4().hex}{ext}"
        filepath = f"{event_dir}/{unique_name}"
        with open(filepath, "wb") as f:
            shutil.copyfileobj(file.file, f)

        photo = models.Photo(event_id=event_id, filename=file.filename or unique_name, filepath=filepath)
        db.add(photo)
        db.commit()
        db.refresh(photo)

        background_tasks.add_task(_process_photo, photo.id, filepath, event_id)

        results.append({
            "id": photo.id,
            "filename": file.filename,
            "url": f"{BASE_URL}/uploads/{event_id}/{unique_name}",
        })

    return {"uploaded": len(results), "photos": results}


# ── Clusters ───────────────────────────────────────────────────────────────


@app.get("/events/{event_id}/clusters")
def get_clusters(event_id: int, db: Session = Depends(get_db)):
    persons = db.query(models.Person).filter(models.Person.event_id == event_id).all()
    result = []
    for person in persons:
        sample_faces = (
            db.query(models.Face)
            .join(models.Photo)
            .filter(models.Photo.event_id == event_id, models.Face.cluster_id == person.cluster_id)
            .limit(4)
            .all()
        )
        photo_count = (
            db.query(models.Face.photo_id)
            .join(models.Photo)
            .filter(models.Photo.event_id == event_id, models.Face.cluster_id == person.cluster_id)
            .distinct()
            .count()
        )
        result.append({
            "cluster_id": person.cluster_id,
            "person_id": person.id,
            "display_name": person.display_name,
            "line_user_id": person.line_user_id,
            "photo_count": photo_count,
            "face_crops": [
                f"{BASE_URL}/uploads/faces/face_{f.id}.jpg"
                for f in sample_faces
                if os.path.exists(f"{UPLOAD_DIR}/faces/face_{f.id}.jpg")
            ],
        })
    return result


@app.post("/events/{event_id}/clusters/{cluster_id}/assign")
def assign_cluster(
    event_id: int,
    cluster_id: int,
    line_user_id: str = Form(...),
    display_name: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    person = (
        db.query(models.Person)
        .filter(models.Person.event_id == event_id, models.Person.cluster_id == cluster_id)
        .first()
    )
    if not person:
        raise HTTPException(404, "Cluster not found")
    person.line_user_id = line_user_id.strip()
    if display_name:
        person.display_name = display_name.strip()
    db.commit()
    return {"success": True, "person_id": person.id}


# ── Delivery ───────────────────────────────────────────────────────────────


@app.get("/events/{event_id}/delivery-status")
def delivery_status(event_id: int, db: Session = Depends(get_db)):
    persons = db.query(models.Person).filter(models.Person.event_id == event_id).all()
    result = []
    for person in persons:
        photo_count = (
            db.query(models.Face.photo_id)
            .join(models.Photo)
            .filter(models.Photo.event_id == event_id, models.Face.cluster_id == person.cluster_id)
            .distinct()
            .count()
        )
        sent = db.query(models.Delivery).filter(
            models.Delivery.person_id == person.id, models.Delivery.status == "sent"
        ).count()
        failed = db.query(models.Delivery).filter(
            models.Delivery.person_id == person.id, models.Delivery.status == "failed"
        ).count()

        status = "pending"
        if sent > 0:
            status = "sent"
        elif failed > 0:
            status = "failed"

        result.append({
            "person_id": person.id,
            "cluster_id": person.cluster_id,
            "display_name": person.display_name,
            "line_user_id": person.line_user_id,
            "photo_count": photo_count,
            "status": status,
        })
    return result


@app.post("/events/{event_id}/deliver")
def deliver_photos(
    event_id: int,
    person_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(404, "Event not found")

    query = db.query(models.Person).filter(
        models.Person.event_id == event_id,
        models.Person.line_user_id.isnot(None),
    )
    if person_id:
        query = query.filter(models.Person.id == person_id)
    persons = query.all()

    results = []
    for person in persons:
        photos = (
            db.query(models.Photo)
            .join(models.Face)
            .filter(models.Photo.event_id == event_id, models.Face.cluster_id == person.cluster_id)
            .distinct()
            .all()
        )
        photo_urls = [
            f"{BASE_URL}/uploads/{event_id}/{os.path.basename(p.filepath)}"
            for p in photos
        ]

        outcome = send_photos_to_user(
            person.line_user_id,
            photo_urls,
            event_name=event.name,
            channel_token=event.line_channel_token,
        )
        status = "sent" if outcome["success"] else "failed"
        now = datetime.utcnow() if outcome["success"] else None

        for photo in photos:
            existing = db.query(models.Delivery).filter(
                models.Delivery.person_id == person.id,
                models.Delivery.photo_id == photo.id,
            ).first()
            if existing:
                existing.status = status
                existing.sent_at = now
            else:
                db.add(models.Delivery(
                    person_id=person.id,
                    photo_id=photo.id,
                    status=status,
                    sent_at=now,
                ))
        db.commit()

        results.append({
            "person_id": person.id,
            "line_user_id": person.line_user_id,
            "photos_sent": outcome["sent"],
            "status": status,
            "error": outcome["error"],
        })

    return {"results": results}


# ── LINE Webhook ───────────────────────────────────────────────────────────


@app.post("/webhook/line")
async def line_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("X-Line-Signature", "")
    user_id = parse_webhook(body, signature)
    if user_id:
        logger.info("LINE user connected: %s", user_id)
    return JSONResponse({"status": "ok"})
