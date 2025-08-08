<template>
  <input
    type="date"
    class="form-control"
    :value="formattedDate"
    @input="updateValue"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { displayStringToDate, TDateString } from '../src/models/dateFunc';

// Definir las propiedades del componente
const props = defineProps<{
  modelValue: TDateString | undefined;
}>();

// Definir los eventos que el componente emite
const emit = defineEmits(['update:modelValue']);

// Propiedad computada para manejar la conversión del formato
const formattedDate = computed<string | undefined>(() => {
  if (props.modelValue) {
    // Convierte 'dd-mm-yyyy' a un objeto Date, luego a 'yyyy-mm-dd'
    const date = displayStringToDate(props.modelValue);
    return date.toISOString().substring(0, 10);
  }
  return undefined;
});

// Método para manejar la entrada del usuario y emitir el valor convertido
const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const newValue = target.value;

  if (!newValue) {
    // Si el campo está vacío, emitir undefined
    emit('update:modelValue', undefined);
  } else {
    // Si hay un valor, convertir 'yyyy-mm-dd' a 'dd-mm-yyyy' y emitir
    const parts = newValue.split('-');
    const newTDateString = `${parts[2]}-${parts[1]}-${parts[0]}` as TDateString;
    emit('update:modelValue', newTDateString);
  }
};
</script>