from fastapi import APIRouter, Depends, status, HTTPException, Response
from sqlalchemy.orm import Session
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from .. import schemas, models, utils, oauth2
from ..config import get_db
from fastapi import WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
import uuid, asyncio, json

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()

router = APIRouter(
    tags=["WebSocket"]
)

from .websocket_client import Client

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            process_audio(
                websocket, data
            )
            #await manager.send_personal_message(f"You wrote: {data}", websocket)
            # await manager.broadcast(f"Client #{client_id} says: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)

def process_audio(websocket, audio):
    asyncio.create_task(
                process_audio_async(websocket, audio)
            )

async def process_audio_async(websocket, audio):
    json_transcription = ""
    await websocket.send_text(json.dumps(json_transcription))