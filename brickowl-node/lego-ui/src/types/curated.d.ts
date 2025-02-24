interface Piece {
    pieceTitle: string;
    type: string;
    qty: number;
    img: string;
    reasoning: string;
}

interface Category {
    description: string;
    pieces: Piece[];
}

interface CuratedPieces {
    metadata: {
        targetAgeRange: string;
        totalPieces: number;
        lastUpdated: string;
    };
    categories: {
        [key: string]: Category;
    };
}

export type { Category, CuratedPieces, Piece };
