document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const dominoCountElement = document.getElementById('domino-count');
    const resetBtn = document.getElementById('reset-btn');
    const revealBtn = document.getElementById('reveal-btn');
    const proofPanel = document.getElementById('proof-panel');

    let selectedCell = null;
    let dominoes = [];
    const gridSize = 8;
    const mutilatedCells = [0, 63]; // (0,0) and (7,7)

    function initBoard() {
        boardElement.innerHTML = '';
        const rect = boardElement.getBoundingClientRect();
        
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const index = row * gridSize + col;
                const cell = document.createElement('div');
                cell.classList.add('cell');
                
                // Color pattern
                if ((row + col) % 2 === 0) {
                    cell.classList.add('white');
                } else {
                    cell.classList.add('black');
                }

                if (mutilatedCells.includes(index)) {
                    cell.classList.add('mutilated');
                } else {
                    cell.dataset.index = index;
                    cell.dataset.row = row;
                    cell.dataset.col = col;
                    cell.addEventListener('click', () => handleCellClick(cell));
                }

                boardElement.appendChild(cell);
            }
        }
    }

    function handleCellClick(cell) {
        const index = parseInt(cell.dataset.index);
        
        // Remove domino if clicking on a cell already covered
        const existingDominoIndex = dominoes.findIndex(d => d.cells.includes(index));
        if (existingDominoIndex !== -1) {
            removeDomino(existingDominoIndex);
            return;
        }

        if (selectedCell === null) {
            selectedCell = cell;
            cell.classList.add('selected');
        } else {
            const index1 = parseInt(selectedCell.dataset.index);
            const index2 = index;
            
            if (isAdjacent(index1, index2) && !isCovered(index2)) {
                addDomino(index1, index2);
            }
            
            selectedCell.classList.remove('selected');
            selectedCell = null;
        }
    }

    function isAdjacent(idx1, idx2) {
        const r1 = Math.floor(idx1 / gridSize);
        const c1 = idx1 % gridSize;
        const r2 = Math.floor(idx2 / gridSize);
        const c2 = idx2 % gridSize;
        
        return (Math.abs(r1 - r2) === 1 && c1 === c2) || 
               (Math.abs(c1 - c2) === 1 && r1 === r2);
    }

    function isCovered(index) {
        return dominoes.some(d => d.cells.includes(index));
    }

    function addDomino(idx1, idx2) {
        const cell1 = document.querySelector(`[data-index="${idx1}"]`);
        const cell2 = document.querySelector(`[data-index="${idx2}"]`);
        
        const rect1 = cell1.getBoundingClientRect();
        const rect2 = cell2.getBoundingClientRect();
        const boardRect = boardElement.getBoundingClientRect();

        const domino = document.createElement('div');
        domino.classList.add('domino');

        const x = Math.min(rect1.left, rect2.left) - boardRect.left;
        const y = Math.min(rect1.top, rect2.top) - boardRect.top;
        const width = Math.abs(rect1.left - rect2.left) + rect1.width;
        const height = Math.abs(rect1.top - rect2.top) + rect1.height;

        domino.style.left = `${x}px`;
        domino.style.top = `${y}px`;
        domino.style.width = `${width}px`;
        domino.style.height = `${height}px`;

        boardElement.appendChild(domino);
        dominoes.push({
            cells: [idx1, idx2],
            element: domino
        });

        updateStats();
    }

    function removeDomino(index) {
        const domino = dominoes[index];
        domino.element.remove();
        dominoes.splice(index, 1);
        updateStats();
    }

    function updateStats() {
        dominoCountElement.textContent = dominoes.length;
    }

    resetBtn.addEventListener('click', () => {
        dominoes.forEach(d => d.element.remove());
        dominoes = [];
        if (selectedCell) {
            selectedCell.classList.remove('selected');
            selectedCell = null;
        }
        updateStats();
        proofPanel.classList.add('hidden');
    });

    revealBtn.addEventListener('click', () => {
        proofPanel.classList.toggle('hidden');
        if (!proofPanel.classList.contains('hidden')) {
            proofPanel.scrollIntoView({ behavior: 'smooth' });
        }
    });

    initBoard();
});
