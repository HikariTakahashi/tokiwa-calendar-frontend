<template>
  <div class="flex flex-col">
    <div class="flex flex-row">
      <div class="flex flex-col items-center">
        <h6 class="text-xl">
          {{ formatNumber(hours) }}
        </h6>
      </div>
      <h6 class="flex items-center text-xl px-2">:</h6>
      <div class="flex flex-col items-center">
        <h6 class="text-xl">
          {{ formatNumber(minutes) }}
        </h6>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  minuteInterval: {
    type: Number,
    validator: (value) => value >= 1 && value <= 60,
  },
  initialHours: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 24,
  },
  initialMinutes: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 59,
  },
});

const emit = defineEmits(["update:time"]);

const hours = ref(props.initialHours);
const minutes = ref(props.initialMinutes);

const formatNumber = (num) => {
  return num.toString().padStart(2, "0");
};

const updateTime = () => {
  const timeString = `${formatNumber(hours.value)}:${formatNumber(
    minutes.value
  )}`;
  emit("update:time", timeString);
};

onMounted(() => {
  updateTime();
});

watch(
  () => props.initialHours,
  (newValue) => {
    hours.value = newValue;
    updateTime();
  }
);

watch(
  () => props.initialMinutes,
  (newValue) => {
    minutes.value = newValue;
    updateTime();
  }
);
</script>

<style scoped>
/* Tailwind CSSが使えないためここに記述 */
/* スピナーを非表示にする */
.no-spinner::-webkit-inner-spin-button,
.no-spinner::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.no-spinner {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
