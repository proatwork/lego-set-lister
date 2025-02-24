<script setup lang="ts">
import type { LegoPieceType } from '../types';

defineProps<{
    piece: LegoPieceType | undefined
}>()

</script>

<template>
    <v-card cols="1" class="bg-white text-center" width="calc(100% / 12)" v-if="piece">
        <v-img :src="piece.img" class="pa-2 align-start" gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
            :height="150">
        </v-img>
        <strong>{{ piece.qty }} x <br /><small>{{ piece.pieceTitle }}</small></strong>
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