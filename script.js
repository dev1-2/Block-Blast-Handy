// DOM Elements
const gridElement = document.getElementById('grid');
const shapeSelectionElement = document.getElementById('shape-selection');
const resetButton = document.getElementById('reset');
const helpButton = document.getElementById('help');
const endScreen = document.getElementById('end-screen');
const endMessage = document.getElementById('end-message');
const restartButton = document.getElementById('restart');
const shareButton = document.getElementById('share');
const helpModal = document.getElementById('help-modal');
const closeHelpButton = document.getElementById('close-help');
const levelUpElement = document.getElementById('level-up');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const dragGhost = document.getElementById('drag-ghost');

// Game configuration
const GRID_SIZE = 8;
const SHAPES_PER_ROUND = 3; // Reduced for mobile
const LEVEL_THRESHOLD = 1000;

// Game state
let grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
let score = 0;
let highScore = localStorage.getItem('blockBlastHighScore') || 0;
let level = 1;
let gameActive = true;
let availableShapes = [];
let isDragging = false;
let currentDragShape = null;
let currentDragColor = '';
let touchOffsetX = 0;
let touchOffsetY = 0;
let lastTouchTime = 0; // To detect double taps
let isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// All possible shapes with their variations
const allShapes = [
    // 2x2 Square
    { shape: [[1, 1], [1, 1]], name: 'Square 2x2', id: 'Square-0', color: '#00BCD4' },

    // 3x3 Square
    { shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], name: 'Square 3x3', id: 'Square-1', color: '#FFEB3B' },

    // 4-block Line (horizontal)
    { shape: [[1, 1, 1, 1]], name: 'Line 4', id: 'Line-0', color: '#8BC34A' },

    // 5-block Line (horizontal)
    { shape: [[1, 1, 1, 1, 1]], name: 'Line 5', id: 'Line-1', color: '#9C27B0' },

    // 4-block Line (vertical)
    { shape: [[1], [1], [1], [1]], name: 'Line 4 (Vertical)', id: 'Line-2', color: '#FF4081' },

    // 5-block Line (vertical)
    { shape: [[1], [1], [1], [1], [1]], name: 'Line 5 (Vertical)', id: 'Line-3', color: '#E040FB' },

    // L-shape (rotated variations)
    { shape: [[1, 1, 0], [1, 1, 1]], name: 'L-shape', id: 'L-0', color: '#FF5252' },
    { shape: [[1, 0], [1, 0], [1, 1]], name: 'L-shape rotated 90', id: 'L-1', color: '#4CAF50' },
    { shape: [[1, 1], [0, 1], [0, 1]], name: 'L-shape rotated 180', id: 'L-2', color: '#FF9800' },
    { shape: [[0, 1], [0, 1], [1, 1]], name: 'L-shape rotated 270', id: 'L-3', color: '#2196F3' },

    // T-shape (rotated variations)
    { shape: [[1, 1, 1], [0, 1, 0]], name: 'T-shape', id: 'T-0', color: '#9C27B0' },
    { shape: [[0, 1], [1, 1], [0, 1]], name: 'T-shape rotated 90', id: 'T-1', color: '#00BCD4' },
    { shape: [[0, 1, 0], [1, 1, 1]], name: 'T-shape rotated 180', id: 'T-2', color: '#E91E63' },
    { shape: [[1, 0], [1, 1], [1, 0]], name: 'T-shape rotated 270', id: 'T-3', color: '#FF4081' },

    // Z-shape (rotated variations)
    { shape: [[1, 1, 0], [0, 1, 1]], name: 'Z-shape', id: 'Z-0', color: '#4CAF50' },
    { shape: [[0, 1], [1, 1], [1, 0]], name: 'Z-shape rotated 90', id: 'Z-1', color: '#F44336' },

    // S-shape (rotated variations)
    { shape: [[0, 1, 1], [1, 1, 0]], name: 'S-shape', id: 'S-0', color: '#2E7D32' },
    { shape: [[1, 0], [1, 1], [0, 1]], name: 'S-shape rotated 90', id: 'S-1', color: '#03A9F4' },

    // Custom shapes
    { shape: [[1, 0, 1], [1, 1, 1]], name: 'U-shape', id: 'U-0', color: '#FFC107' },
    { shape: [[1, 1, 1], [1, 0, 1]], name: 'U-shape rotated', id: 'U-1', color: '#3F51B5' },
    { shape: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], name: 'Diamond', id: 'Diamond-0', color: '#E91E63' },
    { shape: [[1, 0, 0], [1, 1, 0], [1, 1, 1]], name: 'Stair', id: 'Stair-0', color: '#FF9800' }
];

// Initialize the game
function initGame() {
    // Reset game state
    grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    score = 0;
    level = 1;
    gameActive = true;
    
    // Update displays
    scoreDisplay.textContent = `Score: ${score}`;
    highScoreDisplay.textContent = `High Score: ${highScore}`;
    
    // Create the grid
    createGrid();
    
    // Get initial shapes
    availableShapes = getRandomShapes();
    renderShapes();
    
    // Hide end screen if visible
    endScreen.classList.remove('active');
}

// Create the grid
function createGrid() {
    gridElement.innerHTML = '';
    
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            cellElement.dataset.row = row;
            cellElement.dataset.col = col;
            
            if (grid[row][col] && grid[row][col].filled) {
                cellElement.style.backgroundColor = grid[row][col].color;
            }
            
            gridElement.appendChild(cellElement);
        }
    }
}

// Get random shapes
function getRandomShapes() {
    const shuffledShapes = [...allShapes].sort(() => 0.5 - Math.random());
    return shuffledShapes.slice(0, SHAPES_PER_ROUND);
}

// Render available shapes
function renderShapes() {
    shapeSelectionElement.innerHTML = '';
    
    availableShapes.forEach((shapeData) => {
        const shapeElement = document.createElement('div');
        shapeElement.className = 'shape';
        shapeElement.setAttribute('data-shape-id', shapeData.id);
        shapeElement.setAttribute('draggable', 'true');
        
        // Create a visual representation of the shape
        const preview = document.createElement('div');
        preview.className = 'shape-preview';
        
        const maxRows = 4;
        const maxCols = 4;
        
        for (let row = 0; row < maxRows; row++) {
            for (let col = 0; col < maxCols; col++) {
                const block = document.createElement('div');
                block.className = 'cell';
                
                if (shapeData.shape[row] && shapeData.shape[row][col]) {
                    block.style.backgroundColor = shapeData.color;
                }
                
                preview.appendChild(block);
            }
        }
        
        shapeElement.appendChild(preview);
        shapeSelectionElement.appendChild(shapeElement);
        
        // Setup drag events for desktop
        setupDragEvents(shapeElement, shapeData);
        
        // Setup touch events for mobile
        setupTouchEvents(shapeElement, shapeData);
    });
}

// Setup drag events for desktop
function setupDragEvents(element, shapeData) {
    element.addEventListener('dragstart', (e) => {
        if (!gameActive) return;
        
        currentDragShape = shapeData.shape;
        currentDragColor = shapeData.color;
        
        // Create a transparent drag image
        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(img, 0, 0);
        
        element.classList.add('dragging');
        createDragGhost(shapeData);
        
        // Set data for drop
        e.dataTransfer.setData('text/plain', shapeData.id);
        e.dataTransfer.effectAllowed = 'move';
        
        isDragging = true;
        document.body.classList.add('dragging');
    });
    
    element.addEventListener('dragend', () => {
        element.classList.remove('dragging');
        hideDragGhost();
        isDragging = false;
        document.body.classList.remove('dragging');
        clearHighlights();
    });
}

// Setup touch events for mobile
function setupTouchEvents(element, shapeData) {
    element.addEventListener('touchstart', (e) => {
        if (!gameActive) return;
        
        // Check for double tap (for mobile devices)
        const now = new Date().getTime();
        const timeSince = now - lastTouchTime;
        
        if (timeSince < 300 && timeSince > 0) {
            // Double tap detected - prevent zoom
            e.preventDefault();
            return;
        }
        
        lastTouchTime = now;
        
        // Prevent default to avoid scrolling
        e.preventDefault();
        
        currentDragShape = shapeData.shape;
        currentDragColor = shapeData.color;
        
        const touch = e.touches[0];
        const rect = element.getBoundingClientRect();
        
        // Calculate offset from the center of the element
        touchOffsetX = rect.left + rect.width / 2 - touch.clientX;
        touchOffsetY = rect.top + rect.height / 2 - touch.clientY;
        
        element.classList.add('dragging');
        createDragGhost(shapeData);
        
        // Position the ghost at the touch point
        updateDragGhostPosition(touch.clientX + touchOffsetX, touch.clientY + touchOffsetY);
        
        isDragging = true;
        document.body.classList.add('dragging');
    }, { passive: false });
    
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        // Prevent default to avoid scrolling
        e.preventDefault();
        
        const touch = e.touches[0];
        
        // Update ghost position
        updateDragGhostPosition(touch.clientX + touchOffsetX, touch.clientY + touchOffsetY);
        
        // Check if over grid and highlight cells
        const gridRect = gridElement.getBoundingClientRect();
        if (touch.clientX >= gridRect.left && touch.clientX <= gridRect.right &&
            touch.clientY >= gridRect.top && touch.clientY <= gridRect.bottom) {
            
            // Calculate grid position
            const relX = touch.clientX - gridRect.left;
            const relY = touch.clientY - gridRect.top;
            
            const cellWidth = gridRect.width / GRID_SIZE;
            const cellHeight = gridRect.height / GRID_SIZE;
            
            const col = Math.floor(relX / cellWidth);
            const row = Math.floor(relY / cellHeight);
            
            if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
                highlightPreview(row, col);
            }
        } else {
            clearHighlights();
        }
    }, { passive: false });
    
    document.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        
        const touch = e.changedTouches[0];
        
        // Check if over grid
        const gridRect = gridElement.getBoundingClientRect();
        if (touch.clientX >= gridRect.left && touch.clientX <= gridRect.right &&
            touch.clientY >= gridRect.top && touch.clientY <= gridRect.bottom) {
            
            // Calculate grid position
            const relX = touch.clientX - gridRect.left;
            const relY = touch.clientY - gridRect.top;
            
            const cellWidth = gridRect.width / GRID_SIZE;
            const cellHeight = gridRect.height / GRID_SIZE;
            
            const col = Math.floor(relX / cellWidth);
            const row = Math.floor(relY / cellHeight);
            
            if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
                const success = placeShape(row, col);
                addHapticFeedback(success);
            }
        }
        
        // Clean up
        document.querySelectorAll('.shape.dragging').forEach(el => {
            el.classList.remove('dragging');
        });
        
        hideDragGhost();
        isDragging = false;
        document.body.classList.remove('dragging');
        clearHighlights();
    });
}

// Create visual ghost for dragging
function createDragGhost(shapeData) {
    dragGhost.innerHTML = '';
    
    const preview = document.createElement('div');
    preview.className = 'shape-preview';
    
    const maxRows = 4;
    const maxCols = 4;
    
    for (let row = 0; row < maxRows; row++) {
        for (let col = 0; col < maxCols; col++) {
            const block = document.createElement('div');
            block.className = 'cell';
            
            if (shapeData.shape[row] && shapeData.shape[row][col]) {
                block.style.backgroundColor = shapeData.color;
            }
            
            preview.appendChild(block);
        }
    }
    
    dragGhost.appendChild(preview);
    dragGhost.style.display = 'block';
}

// Update drag ghost position
function updateDragGhostPosition(x, y) {
    dragGhost.style.left = `${x}px`;
    dragGhost.style.top = `${y}px`;
}

// Hide drag ghost
function hideDragGhost() {
    dragGhost.style.display = 'none';
}

// Clear all highlights from the grid
function clearHighlights() {
    document.querySelectorAll('.cell.highlight, .cell.temp-highlight').forEach(cell => {
        cell.classList.remove('highlight', 'temp-highlight');
    });
}

// Highlight cells for shape placement preview
function highlightPreview(startRow, startCol) {
    // Clear previous highlights
    clearHighlights();
    
    if (!currentDragShape) return;
    
    let cellsToHighlight = [];
    let filledCellsToHighlight = [];
    let rowsToCheck = new Set();
    let colsToCheck = new Set();

    // Determine which cells to highlight based on the selected shape
    for (let row = 0; row < currentDragShape.length; row++) {
        for (let col = 0; col < currentDragShape[row].length; col++) {
            if (currentDragShape[row][col]) {
                const newRow = startRow + row;
                const newCol = startCol + col;

                // Ensure we're within bounds
                if (newRow < GRID_SIZE && newCol < GRID_SIZE) {
                    const cellElement = document.querySelector(`.cell[data-row="${newRow}"][data-col="${newCol}"]`);
                    if (cellElement) {
                        cellsToHighlight.push(cellElement);
                        rowsToCheck.add(newRow);
                        colsToCheck.add(newCol);

                        // Check if the cell is already filled
                        if (grid[newRow][newCol] && grid[newRow][newCol].filled) {
                            filledCellsToHighlight.push(cellElement);
                        }
                    }
                }
            }
        }
    }

    // Highlight the preview cells for the shape
    cellsToHighlight.forEach(cell => {
        cell.classList.add('highlight');
    });

    // Highlight filled cells in red (conflict)
    filledCellsToHighlight.forEach(cell => {
        cell.classList.add('temp-highlight');
    });

    // Check if any row is about to be completed
    rowsToCheck.forEach(row => {
        if (canCompleteRow(row, cellsToHighlight)) {
            for (let col = 0; col < GRID_SIZE; col++) {
                const cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
                if (cellElement) {
                    cellElement.classList.add('highlight');
                }
            }
        }
    });

    // Check if any column is about to be completed
    colsToCheck.forEach(col => {
        if (canCompleteCol(col, cellsToHighlight)) {
            for (let row = 0; row < GRID_SIZE; row++) {
                const cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
                if (cellElement) {
                    cellElement.classList.add('highlight');
                }
            }
        }
    });
}

// Check if a row can be completed with current highlighted cells
function canCompleteRow(row, highlightedCells) {
    for (let col = 0; col < GRID_SIZE; col++) {
        const cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (!((grid[row][col] && grid[row][col].filled) || highlightedCells.includes(cellElement))) {
            return false;
        }
    }
    return true;
}

// Check if a column can be completed with current highlighted cells
function canCompleteCol(col, highlightedCells) {
    for (let row = 0; row < GRID_SIZE; row++) {
        const cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (!((grid[row][col] && grid[row][col].filled) || highlightedCells.includes(cellElement))) {
            return false;
        }
    }
    return true;
}

// Check if shape can be placed
function canPlaceShape(shape, startRow, startCol) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const newRow = startRow + row;
                const newCol = startCol + col;
                
                // Check if out of bounds
                if (newRow >= GRID_SIZE || newCol >= GRID_SIZE) {
                    return false;
                }
                
                // Check if cell is already filled
                if (grid[newRow][newCol] && grid[newRow][newCol].filled) {
                    return false;
                }
            }
        }
    }
    return true;
}

// Place the shape in the grid
function placeShape(startRow, startCol) {
    if (!currentDragShape || !canPlaceShape(currentDragShape, startRow, startCol)) {
        return false;
    }
    
    // Place the shape on the grid
    for (let row = 0; row < currentDragShape.length; row++) {
        for (let col = 0; col < currentDragShape[row].length; col++) {
            if (currentDragShape[row][col]) {
                grid[startRow + row][startCol + col] = { 
                    filled: true, 
                    color: currentDragColor 
                };
                
                // Add animation class to placed cells
                const cellElement = document.querySelector(`.cell[data-row="${startRow + row}"][data-col="${startCol + col}"]`);
                if (cellElement) {
                    cellElement.style.backgroundColor = currentDragColor;
                    cellElement.classList.add('placed');
                    
                    // Remove animation class after it completes
                    setTimeout(() => {
                        cellElement.classList.remove('placed');
                    }, 300);
                }
            }
        }
    }
    
    // Calculate points for placing the shape
    const blockCount = currentDragShape.flat().filter(Boolean).length;
    const basePoints = blockCount * 10;
    updateScore(basePoints);
    
    // Remove the used shape from available shapes
    availableShapes = availableShapes.filter(shape => shape.color !== currentDragColor);
    
    // Check for completed rows and columns
    setTimeout(() => {
        checkForClears();
        
        // Check if we need new shapes
        if (availableShapes.length === 0) {
            availableShapes = getRandomShapes();
            renderShapes();
        } else {
            renderShapes(); // Re-render to remove the used shape
        }
        
        // Reset drag state
        currentDragShape = null;
        currentDragColor = '';
        
        // Check if game can continue
        checkGameState();
    }, 300); // Wait for placement animation to complete
    
    return true;
}

// Check for cleared rows and columns
function checkForClears() {
    let clearedRows = new Set();
    let clearedCols = new Set();
    
    // Check for completed rows
    for (let row = 0; row < GRID_SIZE; row++) {
        if (grid[row].every(cell => cell && cell.filled)) {
            clearedRows.add(row);
        }
    }
    
    // Check for completed columns
    for (let col = 0; col < GRID_SIZE; col++) {
        let isComplete = true;
        for (let row = 0; row < GRID_SIZE; row++) {
            if (!(grid[row][col] && grid[row][col].filled)) {
                isComplete = false;
                break;
            }
        }
        if (isComplete) {
            clearedCols.add(col);
        }
    }
    
    // Clear rows and columns if any were completed
    if (clearedRows.size > 0 || clearedCols.size > 0) {
        // Highlight the rows and columns that will be cleared
        highlightClearedLines(clearedRows, clearedCols);
        
        // Add haptic feedback for line clear
        if (isMobileDevice) {
            vibrateDevice(100);
        }
        
        // Wait a moment to show the highlight before clearing
        setTimeout(() => {
            // Clear the rows
            clearedRows.forEach(row => {
                grid[row] = Array(GRID_SIZE).fill(0);
            });
            
            // Clear the columns
            clearedCols.forEach(col => {
                for (let row = 0; row < GRID_SIZE; row++) {
                    grid[row][col] = 0;
                }
            });
            
            // Calculate bonus points for cleared lines
            const linesCleared = clearedRows.size + clearedCols.size;
            const bonusPoints = linesCleared * 100;
            updateScore(bonusPoints);
            
            // Refresh the grid
            createGrid();
            
            // Check if level up
            checkLevelUp();
        }, 500);
    }
}

// Highlight rows and columns that will be cleared
function highlightClearedLines(rows, cols) {
    // Highlight rows
    rows.forEach(row => {
        for (let col = 0; col < GRID_SIZE; col++) {
            const cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            if (cellElement) {
                cellElement.classList.add('clearing');
            }
        }
    });
    
    // Highlight columns
    cols.forEach(col => {
        for (let row = 0; row < GRID_SIZE; row++) {
            const cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            if (cellElement) {
                cellElement.classList.add('clearing');
            }
        }
    });
}

// Update the score
function updateScore(points) {
    score += points;
    scoreDisplay.textContent = `Score: ${score}`;
    
    // Update high score if needed
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('blockBlastHighScore', highScore);
        highScoreDisplay.textContent = `High Score: ${highScore}`;
    }
}

// Check if player levels up
function checkLevelUp() {
    const newLevel = Math.floor(score / LEVEL_THRESHOLD) + 1;
    
    if (newLevel > level) {
        level = newLevel;
        showLevelUp();
    }
}

// Show level up animation
function showLevelUp() {
    levelUpElement.classList.add('active');
    
    // Add haptic feedback for level up
    if (isMobileDevice) {
        vibrateDevice([100, 50, 100]);
    }
    
    setTimeout(() => {
        levelUpElement.classList.remove('active');
    }, 2000);
}

// Check if the game can continue
function checkGameState() {
    // Check if any shape can be placed anywhere on the grid
    let canContinue = false;
    
    for (const shapeData of availableShapes) {
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (canPlaceShape(shapeData.shape, row, col)) {
                    canContinue = true;
                    break;
                }
            }
            if (canContinue) break;
        }
        if (canContinue) break;
    }
    
    if (!canContinue) {
        endGame();
    }
}

// End the game
function endGame() {
    gameActive = false;
    endMessage.textContent = `Your Score: ${score}`;
    endScreen.classList.add('active');
    
    // Add haptic feedback for game over
    if (isMobileDevice) {
        vibrateDevice([100, 50, 100, 50, 200]);
    }
}

// Setup grid for drag and drop
function setupGridDropEvents() {
    // For desktop drag and drop
    gridElement.addEventListener('dragover', (e) => {
        if (!isDragging || !gameActive) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const gridRect = gridElement.getBoundingClientRect();
        const relX = e.clientX - gridRect.left;
        const relY = e.clientY - gridRect.top;
        
        const cellWidth = gridRect.width / GRID_SIZE;
        const cellHeight = gridRect.height / GRID_SIZE;
        
        const col = Math.floor(relX / cellWidth);
        const row = Math.floor(relY / cellHeight);
        
        if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
            highlightPreview(row, col);
        }
    });
    
    gridElement.addEventListener('dragleave', () => {
        clearHighlights();
    });
    
    gridElement.addEventListener('drop', (e) => {
        if (!isDragging || !gameActive) return;
        e.preventDefault();
        
        const gridRect = gridElement.getBoundingClientRect();
        const relX = e.clientX - gridRect.left;
        const relY = e.clientY - gridRect.top;
        
        const cellWidth = gridRect.width / GRID_SIZE;
        const cellHeight = gridRect.height / GRID_SIZE;
        
        const col = Math.floor(relX / cellWidth);
        const row = Math.floor(relY / cellHeight);
        
        if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
            const success = placeShape(row, col);
            if (isMobileDevice) {
                addHapticFeedback(success);
            }
        }
    });
}

// Track mouse movement for drag ghost on desktop
document.addEventListener('mousemove', (e) => {
    if (isDragging && dragGhost.style.display === 'block') {
        updateDragGhostPosition(e.clientX, e.clientY);
    }
});

// Add vibration feedback for mobile (if supported)
function vibrateDevice(duration) {
    if (navigator.vibrate) {
        navigator.vibrate(duration);
    }
}

// Add haptic feedback when placing shapes
function addHapticFeedback(success) {
    if (success) {
        vibrateDevice(50); // Short vibration for successful placement
    } else {
        vibrateDevice([30, 30, 30]); // Pattern for failed placement
    }
}

// Event listeners for buttons
resetButton.addEventListener('click', () => {
    initGame();
    if (isMobileDevice) vibrateDevice(20);
});

restartButton.addEventListener('click', () => {
    initGame();
    if (isMobileDevice) vibrateDevice(20);
});

helpButton.addEventListener('click', () => {
    helpModal.classList.add('active');
    if (isMobileDevice) vibrateDevice(20);
});

closeHelpButton.addEventListener('click', () => {
    helpModal.classList.remove('active');
    if (isMobileDevice) vibrateDevice(20);
});

shareButton.addEventListener('click', () => {
    if (isMobileDevice) vibrateDevice(20);
    
    if (navigator.share) {
        navigator.share({
            title: 'Block Blast',
            text: `I scored ${score} points in Block Blast! Can you beat my score?`,
            url: window.location.href
        }).catch(console.error);
    } else {
        // Fallback for browsers that don't support Web Share API
        const shareText = `I scored ${score} points in Block Blast!`;
        alert(shareText);
    }
});

// Prevent zooming on double tap for mobile
document.addEventListener('dblclick', (e) => {
    e.preventDefault();
}, { passive: false });

// Prevent pull-to-refresh on mobile
document.body.addEventListener('touchmove', (e) => {
    if (isDragging) {
        e.preventDefault();
    }
}, { passive: false });

// Handle orientation changes
window.addEventListener('orientationchange', () => {
    // Redraw the grid after orientation change
    setTimeout(() => {
        createGrid();
        renderShapes();
    }, 300);
});

// Adjust for screen size changes
window.addEventListener('resize', () => {
    // Redraw the grid after resize
    setTimeout(() => {
        createGrid();
    }, 300);
});

// Prevent context menu on long press for mobile
document.addEventListener('contextmenu', (e) => {
    if (isMobileDevice) {
        e.preventDefault();
        return false;
    }
});

// Initialize the game
function init() {
    // Load high score from local storage
    highScore = localStorage.getItem('blockBlastHighScore') || 0;
    highScoreDisplay.textContent = `High Score: ${highScore}`;
    
    // Setup grid drop events
    setupGridDropEvents();
    
    // Initialize the game
    initGame();
    
    // Show help modal on first visit
    if (!localStorage.getItem('blockBlastTutorialSeen')) {
        helpModal.classList.add('active');
        localStorage.setItem('blockBlastTutorialSeen', 'true');
    }
    
    // Add fullscreen button for mobile
    if (isMobileDevice && document.documentElement.requestFullscreen) {
        const fullscreenBtn = document.createElement('button');
        fullscreenBtn.className = 'btn secondary-btn fullscreen-btn';
        fullscreenBtn.textContent = 'Fullscreen';
        fullscreenBtn.style.position = 'absolute';
        fullscreenBtn.style.top = '10px';
        fullscreenBtn.style.right = '10px';
        fullscreenBtn.style.zIndex = '50';
        fullscreenBtn.style.padding = '5px 10px';
        fullscreenBtn.style.fontSize = '0.7rem';
        
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(console.error);
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
            vibrateDevice(20);
        });
        
        document.body.appendChild(fullscreenBtn);
    }
}

// Start the game when the page loads
window.addEventListener('load', init);

// Add service worker for PWA support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }).catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}
