from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    date = Column(String, nullable=False)
    line_channel_token = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    photos = relationship("Photo", back_populates="event", cascade="all, delete-orphan")
    persons = relationship("Person", back_populates="event", cascade="all, delete-orphan")


class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    uploaded_at = Column(DateTime, server_default=func.now())

    event = relationship("Event", back_populates="photos")
    faces = relationship("Face", back_populates="photo", cascade="all, delete-orphan")


class Face(Base):
    __tablename__ = "faces"

    id = Column(Integer, primary_key=True, index=True)
    photo_id = Column(Integer, ForeignKey("photos.id"), nullable=False)
    bbox_json = Column(Text, nullable=False)       # [top, right, bottom, left]
    embedding_json = Column(Text, nullable=False)  # 128-element float list
    cluster_id = Column(Integer, nullable=True)

    photo = relationship("Photo", back_populates="faces")


class Person(Base):
    __tablename__ = "persons"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    line_user_id = Column(String, nullable=True)
    cluster_id = Column(Integer, nullable=False)
    display_name = Column(String, nullable=True)

    event = relationship("Event", back_populates="persons")
    deliveries = relationship("Delivery", back_populates="person", cascade="all, delete-orphan")


class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    person_id = Column(Integer, ForeignKey("persons.id"), nullable=False)
    photo_id = Column(Integer, ForeignKey("photos.id"), nullable=False)
    sent_at = Column(DateTime, nullable=True)
    status = Column(String, default="pending")  # pending | sent | failed

    person = relationship("Person", back_populates="deliveries")
