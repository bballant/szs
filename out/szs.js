export const suits = [
    "blue",
    "black",
    "green"
];
// includes all but "*"
const ranks = [
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
];
const flower = { suit: "black", rank: "*" };
function deckOCards() {
    let x = [];
    suits.forEach(s => {
        ranks.forEach(r => {
            x.push({ suit: s, rank: r });
        });
    });
    x.push(flower);
    return x;
}
function shuffleDeck(deck) {
    for (var i = deck.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
    return deck;
}
function newEmpty(cellKind) {
    return {
        kind: cellKind,
        tile: "empty",
        tileState: "none",
    };
}
export function newGame(boardWidth, boardHeight) {
    let deck = shuffleDeck(deckOCards());
    let cells = [];
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
//# sourceMappingURL=szs.js.map