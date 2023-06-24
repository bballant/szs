import * as util from "./util.js";
import * as szs from "./szs.js";

let WINDOW_RATIO = 2 / 3;
let BOARD_WIDTH = 8;
let BOARD_HEIGHT = 11

type WidthHeight = {
    width: number,
    height: number,
};


function urlEncodeGame(game: szs.Game): string {
    return encodeURIComponent(JSON.stringify(game));
}

function urlDecodeGame(gameStr: string): szs.Game {
    return JSON.parse(decodeURIComponent(gameStr));
}

function goToGame(game: szs.Game) {
    const gameStr = urlEncodeGame(game);
    const url = new URL(window.location.href);
    url.searchParams.set('game', gameStr);
    history.pushState(null, '', url.toString());
    window.dispatchEvent(new Event('load'));
}

function gameFromUrl(): szs.Game {
    const url = new URL(window.location.href);
    const gameStr = url.searchParams.get('game');
    if (gameStr === null) {
        throw new Error('No game in URL');
    }
    return urlDecodeGame(gameStr);
}

function calcWidthHeight(ratio: number, maxWidth: number, maxHeight: number): WidthHeight {
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

function drawCell(
    ctx: CanvasRenderingContext2D,
    cell: szs.Cell,
    cellState: szs.CellState,
    x: number,
    y: number,
    cardWidth: number,
    cardHeight: number) {
    //
    let cellBuf = 3;
    let suitC = "orange"
    let rankV = "";
    if (cell != "empty") {
        if (Array.isArray(cell)) {
            suitC = cell[0].suit;
            rankV = cell[0].rank;
        } else {
            suitC = cell.suit;
            rankV = cell.rank;
        }
    }

    let canvas2: HTMLCanvasElement = document.createElement('canvas');
    canvas2.width = cardWidth;
    canvas2.height = cardHeight;
    let ctx2: CanvasRenderingContext2D = canvas2.getContext('2d') as CanvasRenderingContext2D;

    // Draw the background of the cell
    ctx2.fillStyle = cell == "empty" ? 'rgb(144, 238, 144)' : 'white';
    ctx2.fillRect(cellBuf, cellBuf, canvas2.width - 2 * cellBuf, canvas2.height - 2 * cellBuf);

    // Now draw the stroke and text
    ctx2.lineWidth = 2;
    ctx2.strokeStyle = suitC;
    if (cellState == "selected") {
        ctx2.strokeStyle = 'rgb(0, 128, 0)';
        ctx2.setLineDash([6, 2]);
    }
    ctx2.strokeRect(cellBuf, cellBuf, canvas2.width - 2 * cellBuf, canvas2.height - 2 * cellBuf);
    ctx2.setLineDash([]);
    ctx2.font = ctx.font;
    ctx2.fillStyle = suitC;
    let cardX = rankV.length == 2 ? cardWidth / 20 : cardWidth * 5 / 16;
    ctx2.fillText(rankV, cardX, cardHeight * 3 / 4);
    ctx.drawImage(canvas2, x, y);
}

function renderGame(canvas: HTMLCanvasElement, game: szs.Game): WidthHeight {
    let ctx = canvas.getContext("2d");
    let fontSize = canvas.width / (BOARD_HEIGHT + 1);
    ctx.font = fontSize.toString() + 'px monospace';
    ctx.fillStyle = 'black';
    let cardWidth = canvas.width / BOARD_WIDTH;
    let cardHeight = canvas.height / BOARD_HEIGHT;

    for (let i = 0; i < game.board.length; i++) {
        let t = game.board[i];
        let x = (i % BOARD_WIDTH) * cardWidth;
        let y = (Math.floor(i / BOARD_WIDTH) * cardHeight);
        let cellState: szs.CellState = game.currentTile == i ? "selected" : "none"
        drawCell(ctx, t.cell, cellState, x, y, cardWidth, cardHeight);
    }
    return { width: cardWidth, height: cardHeight };
}

function boardIdxFromCoord(cellWH: WidthHeight, x: number, y: number): number {
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
    let canvas = document.getElementById("MainCanvas") as HTMLCanvasElement;
    if (!canvas) {
        container.appendChild(newCanvas);
    } else {
        canvas.parentNode.replaceChild(newCanvas, canvas);
    }
    canvas = newCanvas;
    canvas.id = 'MainCanvas';
    canvas.width = canvasDims.width;
    canvas.height = canvasDims.height;

    let game: szs.Game;
    try {
        game = gameFromUrl();
    } catch (error) {
        console.log("Could not parse game from url, creating a new one");
        game = szs.newGame(BOARD_WIDTH, BOARD_HEIGHT);
    }

    let tileWH = renderGame(canvas, game);

    canvas.addEventListener('click', function (event) {
        let rect = canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        let tileNum = boardIdxFromCoord(tileWH, x, y);
        let tile = game.board[tileNum];
        if (tile.cell == "empty"
            && game.currentTile
            && game.board[game.currentTile]
            && game.board[game.currentTile].cell != "empty") {

            game.board[tileNum].cell = game.board[game.currentTile].cell;
            game.board[game.currentTile].cell = "empty";
        }
        game.currentTile = tileNum;
        goToGame(game);
    });
}
