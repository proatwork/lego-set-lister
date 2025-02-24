declare module "../data/final_selection_lego_pieces" {
    export interface LegoPiece {
        pieceTitle: string;
        qty: number;
    }

    export const finalSelectionLegoPieces: LegoPiece[];
}
