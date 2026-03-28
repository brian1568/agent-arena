from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import torch

from agent import Agent
from snake_env import SnakeGameAI, Direction, Point, BLOCK_SIZE

app = FastAPI()

# Input format from JS
class PointModel(BaseModel):
    x: int
    y: int

class GameState(BaseModel):
    snake: list[PointModel]
    food: PointModel
    direction: PointModel

# Load Brain
agent_brain = Agent()

@app.post("/predict")
@torch.inference_mode()
def predict_move(game_state: GameState):
    # Map JS state to Python dummy game instance
    dummy_game = SnakeGameAI(w=400, h=400)
    
    # Scale JS block indices (0-19) to pixel coords dynamically
    js_scale = BLOCK_SIZE
    dummy_game.snake = [Point(p.x * js_scale, p.y * js_scale) for p in game_state.snake]
    dummy_game.head = dummy_game.snake[0]
    dummy_game.food = Point(game_state.food.x * js_scale, game_state.food.y * js_scale)
    
    if game_state.direction.x == 1: dummy_game.direction = Direction.RIGHT
    elif game_state.direction.x == -1: dummy_game.direction = Direction.LEFT
    elif game_state.direction.y == 1: dummy_game.direction = Direction.DOWN
    elif game_state.direction.y == -1: dummy_game.direction = Direction.UP
    
    # Extract 11 bit state using existing logic
    state_vector = agent_brain.get_state(dummy_game)
    
    # Predict action [straight, right turn, left turn]
    state_tensor = torch.tensor(state_vector, dtype=torch.float)
    prediction = agent_brain.model(state_tensor)
    move_idx = torch.argmax(prediction).item()
    
    return {"action": move_idx}

# Serve static files for frontend (including index.html at root)
app.mount("/", StaticFiles(directory="static", html=True), name="static")
