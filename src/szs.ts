export type Suit = "blue" | "black" | "green";

export type Rank = "1" | "2" | "3" | "4" | "5" | "6" | "7" |
    "8" | "9" | "10" | "?" | "#" | "%" | "*";

export type Card = {
    suit: Suit,
    rank: Rank,
};

// Rectangle Object for a Card
export type CardRect = {
    x: number,
    y: number,
    width: number,
    height: number,
};

export const suits: readonly Suit[] = [
    "blue",
    "black",
    "green"
] as const;

// includes all but "*"
const ranks: readonly Rank[] = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "?",
    "#",
    "%"
] as const;

type Flower = { suit: "black", rank: "*" };

const flower: Flower = { suit: "black", rank: "*" };

export type Tile = Card | Card[] | "empty"

export type CellKind =
    "exit" | // first three files in top row
    "null" | // the fourth cell in top row, unusable
    "flower" | // the fifthe cell, only holds the flower (*)
    "run" | // last 4 cells, top row, holds 1-10 of same suit
    "board"; // rest of the cells

export type TileState = "selected" | "none"

export type Cell = {
    kind: CellKind,
    tile: Tile,
    tileState: TileState,
}

export type Game = {
    currentCell: number,
    board: Cell[],
}

function deckOCards(): Card[] {
    let x: Card[] = [];
    suits.forEach(s => {
        ranks.forEach(r => {
            x.push({ suit: s, rank: r });
        })
    });
    x.push(flower);
    return x;
}

function shuffleDeck(deck: Card[]): Card[] {
    for (var i = deck.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
    return deck;
}

function newEmpty(cellKind: CellKind): Cell {
    return {
        kind: cellKind,
        tile: "empty",
        tileState: "none",
    }
}

export function newGame(boardWidth: number, boardHeight: number): Game {
    let deck = shuffleDeck(deckOCards());
    let cells: Cell[] = [];

    // Top Row
    cells[0] = newEmpty("exit");
    cells[1] = newEmpty("exit");
    cells[2] = newEmpty("exit");
    cells[3] = newEmpty("null");
    cells[4] = newEmpty("flower");
    cells[5] = newEmpty("run");
    cells[6] = newEmpty("run");
    cells[7] = newEmpty("run");

    for (let i = 8; i < boardWidth * boardHeight; i++) {
        let deckIdx = i - boardWidth;
        if (deckIdx < deck.length) {
            cells.push({
                kind: "board",
                tile: deck[deckIdx],
                tileState: "none"
            });
            continue;
        }
        cells.push(newEmpty("board"));
    }
    return { currentCell: -1, board: cells };
}
