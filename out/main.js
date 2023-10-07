import * as util from "./util.js";
import * as szs from "./szs.js";
let WINDOW_RATIO = 2 / 3;
let BOARD_WIDTH = 8;
let BOARD_HEIGHT = 11;
function urlEncodeGame(game) {
    return encodeURIComponent(JSON.stringify(game));
}
function urlDecodeGame(gameStr) {
    return JSON.parse(decodeURIComponent(gameStr));
}
function goToGame(game) {
    const gameStr = urlEncodeGame(game);
    const url = new URL(window.location.href);
    url.searchParams.set('game', gameStr);
    history.pushState(null, '', url.toString());
    window.dispatchEvent(new Event('load'));
}
function gameFromUrl() {
    const url = new URL(window.location.href);
    const gameStr = url.searchParams.get('game');
    if (gameStr === null) {
        throw new Error('No game in URL');
    }
    return urlDecodeGame(gameStr);
}
function calcWidthHeight(ratio, maxWidth, maxHeight) {
    let width = maxWidth;
    let height = Math.round(maxWidth / ratio);
    if (height > maxHeight) {
        height = maxHeight;
        width = Math.round(maxHeight * ratio);
    }
    return {
        width: width,
        height: height,
    };
}
function fillStyle(cellKind) {
    switch (cellKind) {
        case "exit":
            return 'rgb(255, 117, 225)';
        case "null":
            return 'rgb(189, 189, 189)';
        case "flower":
            return 'rgb(255, 129, 26)';
        case "run":
            return 'rgb(144,238,144)';
        case "board":
            return 'rgb(109, 197, 255)';
        default:
            return 'rgb(200,200,200)';
    }
}
function drawCellBackground(ctx, cell, x, y, cardWidth, cardHeight) {
    let canvas2 = document.createElement('canvas');
    canvas2.width = cardWidth;
    canvas2.height = cardHeight;
    let ctx2 = canvas2.getContext('2d');
    // Draw the background of the cell
    ctx2.fillStyle = fillStyle(cell.kind);
    let cellBuf = 3;
    ctx2.fillRect(cellBuf, cellBuf, canvas2.width - 2 * cellBuf, canvas2.height - 2 * cellBuf);
    ctx.drawImage(canvas2, x, y);
}
function drawAvailableCell(ctx, cell, x, y, cardWidth, cardHeight) {
    let canvas2 = document.createElement('canvas');
    canvas2.width = cardWidth;
    canvas2.height = cardHeight;
    let ctx2 = canvas2.getContext('2d');
    ctx2.strokeStyle = 'rgb(0, 128, 0)';
    ctx2.strokeStyle = 'black';
    ctx2.setLineDash([6, 2]);
    let cellBuf = 3;
    ctx2.strokeRect(cellBuf, cellBuf, cardWidth - 2 * cellBuf, cardHeight - 2 * cellBuf);
    ctx.drawImage(canvas2, x, y);
}
function isCard(tile) {
    return tile.suit !== undefined &&
        tile.rank !== undefined &&
        !Array.isArray(tile);
}
function isNextRank(rank, maybeNextRank) {
    let rankNum = parseInt(rank, 10);
    let nextRankNum = parseInt(maybeNextRank, 10);
    if (isNaN(rankNum) || isNaN(nextRankNum)) {
        return false;
    }
    return rankNum + 1 == nextRankNum;
}
function canPlaceCard(board, idx, card) {
    let cell = board[idx];
    if (cell.tile == "empty") {
        if (cell.kind == "flower" && card.rank == "*") {
            return true;
        }
        switch (cell.kind) {
            case "run":
            case "exit":
                return true;
            case "flower":
            case "null":
                return false;
            case "board":
                let prev = idx - BOARD_WIDTH;
                if (prev < BOARD_WIDTH) {
                    return true;
                }
                else {
                    let prevCell = board[prev];
                    return isCard(prevCell.tile) &&
                        prevCell.tile.suit != card.suit &&
                        isNextRank(prevCell.tile.rank, card.rank);
                }
        }
    }
    else { // cell not empty
        if (cell.kind == "run" &&
            isCard(cell.tile) &&
            cell.tile.suit == card.suit &&
            isNextRank(cell.tile.rank, card.rank)) {
            return true;
        }
    }
    return false;
}
function drawCardSuit(cardCtx, suit) {
    let w = cardCtx.canvas.width;
    let h = cardCtx.canvas.height;
    let m = (w + h) * 0.08;
    cardCtx.beginPath();
    switch (suit) {
        case "black":
            cardCtx.fillStyle = 'rgb(0,0,0,.2)';
            cardCtx.strokeStyle = 'rgb(0,0,0,.3)';
            cardCtx.moveTo(w / 2, m);
            cardCtx.lineTo(w - m, h / 2);
            cardCtx.lineTo(w / 2, h - m);
            cardCtx.lineTo(m, h / 2);
            cardCtx.lineTo(w / 2, m);
            break;
        case "blue":
            cardCtx.fillStyle = 'rgb(49,99,206,.2)';
            cardCtx.strokeStyle = 'rgb(49,99,206,.3)';
            // Draw circle
            cardCtx.arc(w / 2, h / 2, Math.min(w, h) / 2 - m, 0, 2 * Math.PI);
            break;
        case "green":
            cardCtx.fillStyle = 'rgb(14,214,41,.2)';
            cardCtx.strokeStyle = 'rgb(14,214,41,.3)';
            cardCtx.rect(m * 1.5, m * 1.5, w - (3 * m), h - (3 * m));
            break;
    }
    cardCtx.closePath();
    cardCtx.fill();
    cardCtx.stroke();
}
function drawCellCard(ctx, cell, x, y, cardWidth, cardHeight) {
    if (cell.tile == "empty")
        return;
    let card = undefined;
    if (Array.isArray(cell.tile)) {
        card = cell.tile[0];
    }
    else {
        card = cell.tile;
    }
    let suitC = card.suit;
    let rankV = card.rank;
    let canvas2 = document.createElement('canvas');
    canvas2.width = cardWidth;
    canvas2.height = cardHeight;
    let ctx2 = canvas2.getContext('2d');
    ctx2.fillStyle = 'white';
    let cellBuf = 3;
    ctx2.fillRect(cellBuf, cellBuf, canvas2.width - 2 * cellBuf, canvas2.height - 2 * cellBuf);
    ctx2.lineWidth = 2;
    ctx2.strokeStyle = suitC;
    if (cell.tileState == "selected") {
        ctx2.setLineDash([6, 2]);
    }
    ctx2.strokeRect(cellBuf, cellBuf, canvas2.width - 2 * cellBuf, canvas2.height - 2 * cellBuf);
    ctx2.font = ctx.font;
    ctx2.fillStyle = suitC;
    let cardX = rankV.length == 2 ? cardWidth * .09 : cardWidth * .31;
    ctx2.fillText(rankV, cardX, cardHeight * .7);
    drawCardSuit(ctx2, suitC);
    ctx.drawImage(canvas2, x, y);
}
function renderGame(canvas, game) {
    let ctx = canvas.getContext("2d");
    let fontSize = (canvas.width / (BOARD_HEIGHT + 1)) * .9;
    ctx.font = fontSize.toString() + 'px monospace';
    ctx.fillStyle = 'black';
    let cardWidth = canvas.width / BOARD_WIDTH;
    let cardHeight = canvas.height / BOARD_HEIGHT;
    // draw the background
    for (let i = 0; i < game.board.length; i++) {
        let c = game.board[i];
        let x = (i % BOARD_WIDTH) * cardWidth;
        let y = (Math.floor(i / BOARD_WIDTH) * cardHeight);
        drawCellBackground(ctx, c, x, y, cardWidth, cardHeight);
        let currentCell = game.board[game.currentCell];
        if (isCard(currentCell.tile) && canPlaceCard(game.board, i, currentCell.tile)) {
            drawAvailableCell(ctx, c, x, y, cardWidth, cardHeight);
        }
        drawCellCard(ctx, c, x, y, cardWidth, cardHeight);
    }
    return { width: cardWidth, height: cardHeight };
}
function boardIdxFromCoord(cellWH, x, y) {
    let cardWidth = cellWH.width;
    let cardHeight = cellWH.height;
    let column = Math.floor(x / cardWidth);
    let row = Math.floor(y / cardHeight);
    let index = row * BOARD_WIDTH + column;
    return index;
}
window.onload = function () {
    console.log("mad dude: " + util.getMessage());
    let canvasDims = calcWidthHeight(WINDOW_RATIO, window.innerWidth, window.innerHeight);
    // Some rigermerole to create a new or replace the canvas
    let container = document.getElementById("MainCanvasContainer");
    let newCanvas = document.createElement('canvas');
    let canvas = document.getElementById("MainCanvas");
    if (!canvas) {
        container.appendChild(newCanvas);
    }
    else {
        canvas.parentNode.replaceChild(newCanvas, canvas);
    }
    canvas = newCanvas;
    canvas.id = 'MainCanvas';
    canvas.width = canvasDims.width;
    canvas.height = canvasDims.height;
    let game;
    try {
        game = gameFromUrl();
    }
    catch (error) {
        console.log("Could not parse game from url, creating a new one");
        game = szs.newGame(BOARD_WIDTH, BOARD_HEIGHT);
    }
    let cellWH = renderGame(canvas, game);
    canvas.addEventListener('click', function (event) {
        let rect = canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        let cellNum = boardIdxFromCoord(cellWH, x, y);
        let cell = game.board[cellNum];
        if (cell.tile == "empty"
            && game.currentCell
            && game.board[game.currentCell]
            && game.board[game.currentCell].tile != "empty") {
            game.board[cellNum].tile = game.board[game.currentCell].tile;
            game.board[cellNum].tileState = "selected";
            game.board[game.currentCell].tile = "empty";
            game.board[game.currentCell].tileState = "none";
        }
        else {
            if (game.board[game.currentCell]) {
                game.board[game.currentCell].tileState = "none";
            }
            game.board[cellNum].tileState = "selected";
        }
        game.currentCell = cellNum;
        goToGame(game);
    });
};
//# sourceMappingURL=main.js.map