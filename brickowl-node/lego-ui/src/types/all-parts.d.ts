interface AllPartsPiece {
    img: string;
    pieceTitle: string;
    qty: number;
}

type AllPartsType = {
    [key: string]: AllPartsPiece[];
}

export type { AllPartsPiece, AllPartsType };
