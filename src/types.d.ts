interface LegoPieceType {
    img: string;
    pieceTitle: string;
    qty: number;
    uuid: string;
}

interface LegoPartsByType {
    [key: string]: LegoPiece[];
}
export { LegoPartsByType, LegoPieceType };

