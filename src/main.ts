import * as util from "./util.js";

let WINDOW_RATIO = 3 / 2;
type Suit = "blue" | "black" | "orange";
type Rank = "1" | "2" | "3" | "4" | "5" | "6" | "7" |
    "8" | "9" | "10" | "?" | "#" | "%" | "*";

type Card = {
    suit: Suit
    rank: Rank
};

const suits: readonly Suit[] = [
    "blue",
    "black",
    "orange"
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

type WidthHeight = {
    width: number,
    height: number,
};

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

function suitRank(suit: Suit): number {
    for (let i = 0; i < suits.length; i++) {
        if (suits[i] == suit) {
            return suits.length - i;
        }
    }
    throw new Error("Wtf?")
}

function rankRank(rank: Rank): number {
    for (let i = 0; i < ranks.length; i++) {
        if (ranks[i] == rank) {
            return i + 1;
        }
    }
    throw new Error("Wtf?")
}

function unicodeCard(card: Card): string {
    let cardNum = suitRank(card.suit) * 16 + rankRank(card.rank)
    let cardUnicode = 0x1F090 + cardNum
    return String.fromCodePoint(cardUnicode)
}

window.onload = function () {
    console.log("mad dude: " + util.getMessage());
    let canvasDims = calcWidthHeight(WINDOW_RATIO, window.innerWidth, window.innerHeight);
    let canvas = document.getElementById("MainCanvas") as HTMLCanvasElement;
    let ctx = canvas.getContext("2d");
    canvas.width = canvasDims.width;
    canvas.height = canvasDims.height;

    let fontSize = canvas.height / 10
    ctx.font = fontSize.toString() + 'px serif';

    // Set the fill color
    ctx.fillStyle = 'black';

    // Draw the card character
    const cardCharacter = String.fromCodePoint(0x1F0D4);
    //ctx.fillText(cardCharacter, 0, (3 * canvas.height) / 4);

    let fontWidth = fontSize * 0.87

    function drawCard(card: Card, x: number, y: number) {
        console.log(card);
        ctx.fillText(unicodeCard(card), x, y);
    }

    //let deck = shuffleDeck(deckOCards());
    let deck = deckOCards();
    let width = canvas.width;
    let height = canvas.height;
    let cardWidth = width / 10;
    let cardHeight = height / 6;
    let offsetY = cardHeight * 2 / 3;
    let rows = 6;
    let cardsPerRow = 9;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cardsPerRow; j++) {
            let cardIndex = i * cardsPerRow + j;
            if (cardIndex >= deck.length) {
                break;
            }
            let card = deck[cardIndex];
            let x = j * cardWidth;
            let y = i * cardHeight + offsetY;
            drawCard(card, x, y);
        }
    }

    // ctx.fillText(unicodeCard({ suit: 'Spades', rank: 'Ace' }), 0, (3 * canvas.height) / 4);
    // ctx.fillText(unicodeCard({ suit: 'Clubs', rank: 'Ace' }), fontWidth, (3 * canvas.height) / 4);
    // ctx.fillText(unicodeCard({ suit: 'Diamonds', rank: 'Ace' }), 2 * fontWidth, (3 * canvas.height) / 4);
    // ctx.fillText(unicodeCard({ suit: 'Hearts', rank: 'Ace' }), 3 * fontWidth, (3 * canvas.height) / 4);
    // ctx.fillText(unicodeCard({ suit: 'Hearts', rank: 'Two' }), 4 * fontWidth, (3 * canvas.height) / 4);

}
