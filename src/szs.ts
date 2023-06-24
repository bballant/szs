export type Suit = "blue" | "black" | "green";

export type Rank = "1" | "2" | "3" | "4" | "5" | "6" | "7" |
    "8" | "9" | "10" | "?" | "#" | "%" | "*";

export type Card = {
    suit: Suit
    rank: Rank
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

export type Cell = Card | Card[] | "empty"

export type TileKind =
    "exit" | // first three files in top row
    "null" | // the fourth tile in top row, unusable
    "flower" | // the fifthe tile, only holds the flower (*)
    "run" | // last 4 tiles, top row, holds 1-10 of same suit
    "board"; // rest of the tiles

export type CellState = "selected" | "none"

export type Tile = {
    kind: TileKind,
    cell: Cell,
    cellState: CellState,
}

export type Game = {
    currentTile: number;
    board: Tile[];
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

function newEmpty(tileKind: TileKind): Tile {
    return {
        kind: tileKind,
        cell: "empty",
        cellState: "none",
    }
}

export function newGame(boardWidth: number, boardHeight: number): Game {
    let deck = shuffleDeck(deckOCards());
    let tiles: Tile[] = [];

    // Top Row
    tiles[0] = newEmpty("exit");
    tiles[1] = newEmpty("exit");
    tiles[2] = newEmpty("exit");
    tiles[3] = newEmpty("null");
    tiles[4] = newEmpty("flower");
    tiles[5] = newEmpty("run");
    tiles[6] = newEmpty("run");
    tiles[7] = newEmpty("run");

    for (let i = 8; i < boardWidth * boardHeight; i++) {
        let deckIdx = i - boardWidth;
        if (deckIdx < deck.length) {
            tiles.push({
                kind: "board",
                cell: deck[deckIdx],
                cellState: "none"
            });
            continue;
        }
        tiles.push(newEmpty("board"));
    }
    return { currentTile: -1, board: tiles };
}
