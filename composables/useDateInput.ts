import { computed, Ref } from 'vue';
import { displayStringToDate, TDateString } from '../src/models/dateFunc';

export function useDateInput(modelValue: Ref<TDateString | undefined>) {
  // Propiedad computada para convertir 'dd-mm-yyyy' a 'yyyy-mm-dd' para el input
  const formattedDate = computed<string | undefined>(() => {
    if (modelValue.value) {
      const date = displayStringToDate(modelValue.value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().substring(0, 10);
      }
    }
    return undefined;
  });

  // Función para manejar la entrada del usuario y convertir 'yyyy-mm-dd' a 'dd-mm-yyyy'
  const updateValue = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;

    if (!newValue) {
      modelValue.value = undefined;
    } else {
      const parts = newValue.split('-');
      modelValue.value = `${parts[2]}-${parts[1]}-${parts[0]}` as TDateString;
    }
  };

  return {
    formattedDate,
    updateValue,
  };
}