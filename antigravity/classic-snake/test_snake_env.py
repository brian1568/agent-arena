from snake_env import BLOCK_SIZE, Direction, Point, SnakeGameAI


def test_initial_state():
    game = SnakeGameAI(w=400, h=400)
    assert game.score == 0
    assert len(game.snake) == 3
    assert game.direction == Direction.RIGHT
    # Head and 2 body segments
    assert game.head == Point(game.w // 2, game.h // 2)


def test_movement():
    game = SnakeGameAI(w=400, h=400)
    start_head = game.head

    # Move right (default)
    action = [1, 0, 0]  # Straight
    reward, done, score = game.play_step(action)

    assert game.head.x == start_head.x + BLOCK_SIZE
    assert not done


def test_collision_wall():
    game = SnakeGameAI(w=400, h=400)

    # Force the snake practically to the right wall
    game.head = Point(400 - BLOCK_SIZE, 200)
    game.snake[0] = game.head

    # Move straight into wall
    action = [1, 0, 0]
    reward, done, score = game.play_step(action)

    assert done is True
    assert reward == -10  # Death penalty


def test_food_consumption():
    game = SnakeGameAI(w=400, h=400)
    length_before = len(game.snake)

    # Place food directly in front of snake
    game.food = Point(game.head.x + BLOCK_SIZE, game.head.y)

    action = [1, 0, 0]  # Straight
    reward, done, score = game.play_step(action)

    assert score == 1
    assert reward == 10  # Eating reward
    assert len(game.snake) == length_before + 1
    assert not done


def test_collision_self():
    game = SnakeGameAI(w=400, h=400)
    # Loop back into itself
    game.snake = [
        Point(200, 200),
        Point(180, 200),
        Point(180, 220),
        Point(200, 220),
        Point(220, 220),
    ]
    game.head = Point(200, 200)
    game.direction = Direction.DOWN

    # Force a play step going Straight (which would move head to 200, 220) -> collision with index 3
    action = [1, 0, 0]
    reward, done, score = game.play_step(action)

    assert done is True
    assert reward == -10
