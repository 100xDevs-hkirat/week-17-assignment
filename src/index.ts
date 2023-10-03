import WebSocket from 'ws';
import assert from 'assert';

const ws = new WebSocket('ws://localhost:8080');

interface Message {
    action: string;
    id?: string;
    x?: number;
    y?: number;
    distance?: number;
}

// Utility function to send WebSocket message and wait for a response.
function sendAndWait(message: Message): Promise<string> {
    return new Promise((resolve, reject) => {
        ws.once('message', (data: WebSocket.Data) => resolve(data.toString()));
        ws.send(JSON.stringify(message));
    });
}

(async function() {
    await new Promise(resolve => ws.on('open', resolve));

    // 1. Spawn a new avatar with id i at x, y
    let avatarId = "avatar1";
    let initialX = 50;
    let initialY = 50;

    let response = await sendAndWait({ action: 'spawn', id: avatarId, x: initialX, y: initialY });
    assert.strictEqual(response, 'success', 'Failed to spawn avatar');

    // 2. Move avatar with id i up by X (can be negative)
    let moveUpBy = -30; // Move up by 30 units
    response = await sendAndWait({ action: 'moveUp', id: avatarId, distance: moveUpBy });
    assert.strictEqual(response, 'success', 'Failed to move avatar up');
    assert(initialX + moveUpBy >= 0 && initialX + moveUpBy <= 200, 'Avatar went out of bounds');

    // 3. Move avatar with id i right by Y (can be negative)
    let moveRightBy = 120; // Move right by 120 units
    response = await sendAndWait({ action: 'moveRight', id: avatarId, distance: moveRightBy });
    assert.strictEqual(response, 'success', 'Failed to move avatar right');
    assert(initialY + moveRightBy >= 0 && initialY + moveRightBy <= 200, 'Avatar went out of bounds');

    // 4. Ask for position of avatar with id i
    response = await sendAndWait({ action: 'position', id: avatarId });
    const position = JSON.parse(response);
    console.log(`Avatar ${avatarId} is at position (${position.x}, ${position.y})`);

    // 5. Spawn avatar at 0,0
    response = await sendAndWait({ action: 'spawn', id: 'avatar3', x: 0, y: 0 });
    assert.strictEqual(response, 'success', 'Failed to spawn avatar at 0,0');

    // 6. Move avatar to the top edge
    response = await sendAndWait({ action: 'moveUp', id: 'avatar3', distance: -50 });
    assert.strictEqual(response, 'success', 'Failed to move avatar to the top');

    // 7. Move avatar to the bottom edge
    response = await sendAndWait({ action: 'moveUp', id: 'avatar3', distance: 200 });
    assert.strictEqual(response, 'success', 'Failed to move avatar to the bottom');

    // 8. Move avatar to the left edge
    response = await sendAndWait({ action: 'moveRight', id: 'avatar3', distance: -200 });
    assert.strictEqual(response, 'success', 'Failed to move avatar to the left');

    // 9. Move avatar to the right edge
    response = await sendAndWait({ action: 'moveRight', id: 'avatar3', distance: 200 });
    assert.strictEqual(response, 'success', 'Failed to move avatar to the right');

    // 10. Querying position after moving
    response = await sendAndWait({ action: 'position', id: 'avatar3' });
    const newPos = JSON.parse(response);
    assert(newPos.x === 200 && newPos.y === 200, 'Avatar3 position is incorrect after moving');

    // 11. Move non-existent avatar
    response = await sendAndWait({ action: 'moveUp', id: 'nonExistentAvatar', distance: 10 });
    assert.strictEqual(response, 'error: Avatar not found', 'Allowed moving a non-existent avatar');

    // 13. Move avatar with large negative value
    response = await sendAndWait({ action: 'moveUp', id: 'avatar3', distance: -500 });
    assert.strictEqual(response, 'success', 'Failed to move avatar with large negative value');
    response = await sendAndWait({ action: 'position', id: 'avatar3' });
    assert(JSON.parse(response).x === 0, 'Avatar3 moved out of bounds with large negative value');

    // 14. Spawn avatar with negative coordinates
    response = await sendAndWait({ action: 'spawn', id: 'avatar4', x: -10, y: -10 });
    assert.strictEqual(response, 'error: Out of bounds', 'Allowed avatar spawn with negative coordinates');

    // 15. Move avatar twice in a row
    response = await sendAndWait({ action: 'moveRight', id: 'avatar1', distance: 20 });
    assert.strictEqual(response, 'success', 'Failed first move of avatar1');
    response = await sendAndWait({ action: 'moveRight', id: 'avatar1', distance: 20 });
    assert.strictEqual(response, 'success', 'Failed second move of avatar1');

    console.log("All tests passed!");

    ws.close();
})();




