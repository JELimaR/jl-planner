<template>
  <path
    :d="arrowPath"
    :stroke="color"
    :stroke-width="isCritical ? '3.0' : '0.7'"
    stroke-opacity="1.0"
    :stroke-dasharray="isCritical ? '0' : '5 5 5'"
    fill="none"
    class="gantt-arrow"
  />
  <circle
    :cx="source.x"
    :cy="source.y"
    :r="isCritical ? '3' : '2.5'"
    fill="#555"
  />
  <circle
    :cx="target.x"
    :cy="target.y"
    :r="isCritical ? '3' : '2.5'"
    fill="#555"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CRITICAL_COLOR } from '../../src/views/colors';

const props = defineProps<{
  source: { x: number; y: number };
  target: { x: number; y: number };
  rowHeight: number;
  isCritical: boolean;
}>();

const offset = 12; // Margen horizontal en los extremos
const downStep = props.rowHeight * 0.55;

// El "path" de la flecha, calculado de forma reactiva
const arrowPath = computed(() => {
  const sx = props.source.x;
  const sy = props.source.y;
  const tx = props.target.x - offset; // El objetivo tiene un margen para que la flecha termine antes
  const ty = props.target.y;

  let d = `M ${sx},${sy} `;
  const h1 = sx + offset;
  d += `L ${h1},${sy} `; // Primer paso horizontal

  if (h1 > tx) {
    const midY = sy + (ty > sy ? 1 : -1) * downStep;
    d += `L ${h1},${midY} `; // Baja o sube
    d += `L ${tx},${midY} `; // Cruza horizontalmente
  } else {
    d += `L ${h1},${ty} `; // Baja directamente a la altura del destino
  }

  d += `L ${tx},${ty} `; // Termina en la coordenada del destino
  d += `L ${tx + offset},${ty}`; // Extiende la línea para conectar con el círculo del destino
  
  return d;
});

const color = computed(() => props.isCritical ? CRITICAL_COLOR : '#555');
</script>