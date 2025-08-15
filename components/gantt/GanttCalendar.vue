<template>
  <div class="gantt-dates">
    <div class="gantt-dates-year-row">
      <div
        v-for="(year, index) in years"
        :key="index"
        class="year-block"
        :style="{ width: `${year.width}px` }"
      >
        {{ year.label }}
      </div>
    </div>
    
    <div class="gantt-dates-sub-row">
      <div
        v-for="(tick, index) in ticks"
        :key="index"
        class="date-tick"
        :style="{ width: `${tick.width}px` }"
      >
        {{ tick.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getTickDate, getDaysInMonth, formatTickLabel } from './ganttCalendar';
import { SCALE_OPTIONS, Scale, getCalendarLimitDates, getTimeUnitsBetween } from './ganttHelpers';

const props = defineProps<{
  projectStartDate: Date;
  projectEndDate: Date;
  scale: Scale;
}>();

// Datos del calendario
const calendarData = computed(() => getCalendarLimitDates(props.projectStartDate, props.projectEndDate, props.scale));
const totalUnits = computed(() => getTimeUnitsBetween(calendarData.value.calendarStartDate, calendarData.value.calendarEndDate, props.scale));

// Propiedad computada para generar los ticks (días/semanas/meses)
const ticks = computed(() => {
  const generatedTicks: {label: string, width: number}[] = [];
  for (let i = 0; i < totalUnits.value; i++) {
    const tickDate = getTickDate(calendarData.value.calendarStartDate, i, props.scale);
    let unitWidth = SCALE_OPTIONS[props.scale].pxPerDay;
    if (props.scale === 'week') unitWidth *= 7;
    if (props.scale === 'month') unitWidth *= getDaysInMonth(tickDate);
    
    generatedTicks.push({
      label: formatTickLabel(tickDate, props.scale),
      width: unitWidth,
    });
  }
  return generatedTicks;
});

// Propiedad computada para generar los años
const years = computed(() => {
  const generatedYears: {label: string, width: number}[] = [];
  let currentYear = '';
  let currentYearWidth = 0;
  
  for (const tick of ticks.value) {
    const tickDate = getTickDate(calendarData.value.calendarStartDate, ticks.value.indexOf(tick), props.scale);
    const year = tickDate.getFullYear().toString();
    
    if (ticks.value.indexOf(tick) === 0 || year !== currentYear) {
      if (ticks.value.indexOf(tick) > 0) {
        generatedYears.push({ label: currentYear, width: currentYearWidth });
      }
      currentYear = year;
      currentYearWidth = tick.width;
    } else {
      currentYearWidth += tick.width;
    }
  }
  
  if (currentYear) {
    generatedYears.push({ label: currentYear, width: currentYearWidth });
  }
  
  return generatedYears;
});

</script>

<style scoped>
.gantt-dates {
  display: flex;
  flex-direction: column;
  font-family: monospace;
}
.gantt-dates-year-row, .gantt-dates-sub-row {
  display: flex;
}
.year-block, .date-tick {
  text-align: center;
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.year-block {
  font-weight: bold;
  height: 22px;
}
.date-tick {
  height: 18px;
}
</style>