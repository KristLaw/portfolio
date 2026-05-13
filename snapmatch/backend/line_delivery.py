import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def _get_api(token: Optional[str] = None):
    """Return a LINE MessagingApi instance, or None if not configured."""
    access_token = token or os.getenv("LINE_CHANNEL_TOKEN", "")
    if not access_token:
        logger.warning("LINE_CHANNEL_TOKEN not set — delivery disabled")
        return None
    try:
        from linebot.v3.messaging import Configuration, ApiClient, MessagingApi
        return MessagingApi(ApiClient(Configuration(access_token=access_token)))
    except Exception as exc:
        logger.error("LINE SDK init failed: %s", exc)
        return None


def send_photos_to_user(
    line_user_id: str,
    photo_urls: list[str],
    event_name: str = "",
    channel_token: Optional[str] = None,
) -> dict:
    """
    Push photo messages to a LINE user.
    Returns {"success": bool, "sent": int, "error": str | None}.
    """
    api = _get_api(channel_token)
    if not api:
        return {"success": False, "sent": 0, "error": "LINE not configured"}

    try:
        from linebot.v3.messaging.models import (
            PushMessageRequest,
            ImageMessage,
            TextMessage,
        )

        messages = []
        if event_name:
            messages.append(TextMessage(text=f"\U0001f4f8 Your photos from \"{event_name}\" are ready!"))

        # LINE allows up to 5 messages per push; send in batches
        for url in photo_urls[:9]:
            messages.append(ImageMessage(original_content_url=url, preview_image_url=url))

        api.push_message(PushMessageRequest(to=line_user_id, messages=messages[:10]))
        return {"success": True, "sent": len(photo_urls), "error": None}
    except Exception as exc:
        logger.error("LINE push failed for %s: %s", line_user_id, exc)
        return {"success": False, "sent": 0, "error": str(exc)}


def parse_webhook(body: bytes, signature: str) -> Optional[str]:
    """
    Parse a LINE webhook payload and return the sender's user ID,
    or None if the signature is invalid or event type is irrelevant.
    """
    channel_secret = os.getenv("LINE_CHANNEL_SECRET", "")
    if not channel_secret:
        return None
    try:
        from linebot.v3.webhook import WebhookParser
        from linebot.v3.webhooks import MessageEvent, FollowEvent

        parser = WebhookParser(channel_secret)
        events = parser.parse(body.decode("utf-8"), signature)
        for ev in events:
            if isinstance(ev, (MessageEvent, FollowEvent)):
                return ev.source.user_id
        return None
    except Exception as exc:
        logger.error("Webhook parse error: %s", exc)
        return None
