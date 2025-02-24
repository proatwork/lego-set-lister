<template>
    <v-app id="inspire" full-height>
        <v-app-bar class="text-left relative">
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            <v-app-bar-title class="d-flex align-center">
                <span>Lego Pieces ({{selectedPieces.reduce((acc, piece) => acc + piece.qty, 0)}} pcs /
                    {{allParts.reduce((zacc, zpiece) => zacc + zpiece.qty, 0)}})
                    - Rims: {{selectedPieces.filter(p => p.pieceTitle.toLowerCase().includes('rim')).reduce(
                        (acc, piece) => acc +
                            piece.qty, 0)}}
                    - Tyres: {{selectedPieces.filter(p => p.pieceTitle.toLowerCase().includes('tire')).reduce(
                        (acc, piece) => acc +
                            piece.qty, 0)}}
                    - Axles {{selectedPieces.filter(p => p.pieceTitle.toLowerCase().includes('axle')).reduce(
                        (acc, piece) => acc +
                            piece.qty, 0)}}
                </span>

            </v-app-bar-title>
            <v-btn @click="showOnlySelected = !showOnlySelected">Show only selected</v-btn>
        </v-app-bar>
        <v-main>
            <template v-if="!showOnlySelected" v-for="(partTypeGroup, type) in partTypeGroups" :key="partTypeGroup">
                <v-container fluid class="text-left">
                    <strong>{{ type }}</strong>
                    <div class="d-flex flex-wrap ga-3">
                        <template v-for="piece in partTypeGroup" :key="piece.pieceTitle">
                            <LegoPiece :class="{ 'bg-primary': getSelectedPiece(piece) }" @deselectPiece="deselectPiece"
                                @selectPiece="selectPiece" :pieceReference="piece"
                                :selectedPiece="getSelectedPiece(piece)" @updateQty="updateQty(piece, $event)" />
                        </template>
                    </div>
                </v-container>
            </template>
            <v-container fluid class="text-left">
                <div class="d-flex flex-wrap ga-3">
                    <LegoPieceSelected :piece="piece" v-if="showOnlySelected" v-for="piece in selectedPieces"
                        :key="piece.pieceTitle" />
                </div>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import LegoPiece from './components/LegoPiece.vue';
import LegoPieceSelected from './components/LegoPieceSelected.vue';
import { allParts } from './data/allPartsFinal';
import { allPartsByType } from './data/allPartsFinal-bytype';
import type { LegoPartsByType, LegoPieceType } from './types';
const partTypeGroups = allPartsByType as LegoPartsByType;
const drawer = ref(false)
const storedSelectedPiecesStr = localStorage.getItem('selectedPieces')
const storedSelectedPieces = storedSelectedPiecesStr ? JSON.parse(storedSelectedPiecesStr) : []
const selectedPieces = ref<LegoPieceType[]>(storedSelectedPieces.map((k: LegoPieceType) => {
    return {
        ...k,
        qty: parseInt(k.qty.toString()) || 0
    }
}))
const showOnlySelected = ref(false)
const getSelectedPiece = (piece: LegoPieceType) => {
    return selectedPieces.value.find(p => p.uuid === piece.uuid)
}
const selectPiece = (piece: LegoPieceType) => {
    selectedPieces.value.unshift({
        ...piece,
        qty: parseInt(piece.qty.toString()) || 0
    })
}
const deselectPiece = (piece: LegoPieceType) => {
    selectedPieces.value = selectedPieces.value.filter(p => p.uuid !== piece.uuid)
}
watch(selectedPieces, (newVal) => {
    localStorage.setItem('selectedPieces', JSON.stringify(newVal))
}, { deep: true })

const updateQty = (piece: LegoPieceType, _qty: number) => {
    const qty = parseInt(_qty.toString()) || 0
    const selectedPiece = getSelectedPiece(piece)
    if (qty <= 0) {
        deselectPiece(piece)
        return
    }
    if (selectedPiece) {
        selectedPiece.qty = qty
    } else {
        selectPiece(piece)
        piece.qty = qty
    }
}
</script>