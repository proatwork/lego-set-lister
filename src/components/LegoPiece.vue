<script setup lang="ts">
import { ref, watch } from 'vue';
import type { LegoPieceType } from '../types';

const props = defineProps<{
    pieceReference: LegoPieceType
    selectedPiece: LegoPieceType | undefined
}>()

const referencePieceQty = props.pieceReference!.qty
const emit = defineEmits<{
    (e: 'selectPiece', piece: LegoPieceType): void
    (e: 'deselectPiece', piece: LegoPieceType): void
    (e: 'updateQty', qty: number): void
}>()

const pieceQty = ref(props.selectedPiece?.qty || 0)

watch(pieceQty, (newQty) => {
    emit('updateQty', newQty)
})

const toggleSelectPiece = (piece: LegoPieceType) => {
    if (props.selectedPiece) {
        deselectPiece(piece)
    } else {
        selectPiece(piece)
    }
}

const selectPiece = (piece: LegoPieceType) => {
    if (props.selectedPiece) {
        //is deselecting
        pieceQty.value = 0
    } else {
        pieceQty.value = referencePieceQty
    }
    emit('selectPiece', piece)
}
const deselectPiece = (piece: LegoPieceType) => {
    pieceQty.value = 0
    emit('deselectPiece', piece)
}
const decrementQty = () => {
    if (pieceQty.value > 0) {
        pieceQty.value--
    }
}
const incrementQty = () => {
    const maxValuePossible = referencePieceQty
    if (pieceQty.value < maxValuePossible) {
        pieceQty.value++
    }
}
const updateQty = () => {
    const maxValuePossible = referencePieceQty
    if (pieceQty.value > maxValuePossible) {
        pieceQty.value = maxValuePossible
    } else if (pieceQty.value <= 0) {
        pieceQty.value = 0
    }
}
</script>

<template>
    <v-card cols="1" class="bg-white text-center" width="calc(100% / 12)">
        <v-img @click="toggleSelectPiece(pieceReference)" :src="pieceReference.img" class="pa-2 align-start"
            gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)" :height="150">
        </v-img>
        <v-card-subtitle @click="toggleSelectPiece(pieceReference)" class="mt-2 pieceTitle">{{ pieceReference.pieceTitle
        }}</v-card-subtitle>

        <v-chip variant="elevated">{{ referencePieceQty }}</v-chip>
        <v-card-actions>
            <v-text-field density="compact" variant="solo" v-model="pieceQty" class="text-center" @change="updateQty">
                <template v-slot:prepend-inner>
                    <v-btn @click="decrementQty" rounded icon="mdi-minus" size="x-small"></v-btn>
                </template>
                <template v-slot:append-inner>
                    <v-btn @click="incrementQty" rounded icon="mdi-plus" size="x-small"></v-btn>
                </template>
            </v-text-field>
        </v-card-actions>
    </v-card>
</template>
<style scoped>
.pieceTitle {
    font-size: 12px;
    display: flex;
    height: 80px;
    line-height: 1;
    white-space: unset;
}
</style>