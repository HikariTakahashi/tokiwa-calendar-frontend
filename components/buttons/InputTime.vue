<template>
  <div class="flex flex-col">
    <div class="flex flex-row">
      <div class="flex flex-col items-center">
        <button @click="incrementHours">
          <UIcon
            name="ic:baseline-keyboard-arrow-up"
            class="size-6 hover:bg-blue-500"
          />
        </button>
        <h6
          class="text-xl cursor-pointer select-none"
          @wheel="handleHoursWheel"
          @mouseenter="isHoursHovered = true"
          @mouseleave="isHoursHovered = false"
          @click="startEditingHours"
        >
          {{ isEditingHours ? "" : formatNumber(hours) }}
        </h6>
        <input
          v-if="isEditingHours"
          ref="hoursInputRef"
          v-model="hoursInputValue"
          type="number"
          min="0"
          max="23"
          class="text-xl w-8 text-center border-none focus:outline-none no-spinner"
          @blur="finishEditingHours"
          @keyup.enter="finishEditingHours"
          @keyup.esc="cancelEditingHours"
        />
        <div class="pt-[7px]">
          <button @click="decrementHours">
            <UIcon
              name="ic:baseline-keyboard-arrow-down"
              class="size-6 hover:bg-blue-500"
            />
          </button>
        </div>
      </div>
      <h6 class="flex items-center text-xl px-2">:</h6>
      <div class="flex flex-col items-center">
        <button @click="incrementMinutes">
          <UIcon
            name="ic:baseline-keyboard-arrow-up"
            class="size-6 hover:bg-blue-500"
          />
        </button>
        <h6
          class="text-xl cursor-pointer select-none"
          @wheel="handleMinutesWheel"
          @mouseenter="isMinutesHovered = true"
          @mouseleave="isMinutesHovered = false"
          @click="startEditingMinutes"
        >
          {{ isEditingMinutes ? "" : formatNumber(minutes) }}
        </h6>
        <input
          v-if="isEditingMinutes"
          ref="minutesInputRef"
          v-model="minutesInputValue"
          type="number"
          min="0"
          max="59"
          class="text-xl w-8 text-center border-none focus:outline-none no-spinner"
          @blur="finishEditingMinutes"
          @keyup.enter="finishEditingMinutes"
          @keyup.esc="cancelEditingMinutes"
        />
        <div class="pt-[7px]">
          <button @click="decrementMinutes">
            <UIcon
              name="ic:baseline-keyboard-arrow-down"
              class="size-6 hover:bg-blue-500"
            />
          </button>
        </div>
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
  // 将来的に増減値を変更する設定を追加
  initialHours: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 24,
  },
  // 将来的に増減値を変更する設定を追加
  initialMinutes: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 59,
  },
});

const emit = defineEmits(["update:time"]);

const hours = ref(props.initialHours);
const minutes = ref(props.initialMinutes);
const isHoursHovered = ref(false);
const isMinutesHovered = ref(false);
const isEditingHours = ref(false);
const isEditingMinutes = ref(false);
const hoursInputValue = ref("");
const minutesInputValue = ref("");
const hoursInputRef = ref(null);
const minutesInputRef = ref(null);

const formatNumber = (num) => {
  return num.toString().padStart(2, "0");
};

const updateTime = () => {
  const timeString = `${formatNumber(hours.value)}:${formatNumber(
    minutes.value
  )}`;
  emit("update:time", timeString);
};

const startEditingHours = () => {
  isEditingHours.value = true;
  hoursInputValue.value = hours.value.toString();
  nextTick(() => {
    if (hoursInputRef.value) {
      hoursInputRef.value.focus();
      hoursInputRef.value.select();
    }
  });
};

const startEditingMinutes = () => {
  isEditingMinutes.value = true;
  minutesInputValue.value = minutes.value.toString();
  nextTick(() => {
    if (minutesInputRef.value) {
      minutesInputRef.value.focus();
      minutesInputRef.value.select();
    }
  });
};

const finishEditingHours = () => {
  const value = parseInt(hoursInputValue.value);
  if (!isNaN(value) && value >= 0 && value <= 24) {
    hours.value = value;
    updateTime();
  }
  isEditingHours.value = false;
};

const finishEditingMinutes = () => {
  const value = parseInt(minutesInputValue.value);
  if (!isNaN(value) && value >= 0 && value <= 59) {
    minutes.value = value;
    updateTime();
  }
  isEditingMinutes.value = false;
};

const cancelEditingHours = () => {
  isEditingHours.value = false;
};

const cancelEditingMinutes = () => {
  isEditingMinutes.value = false;
};

const handleHoursWheel = (event) => {
  if (!isHoursHovered.value || isEditingHours.value) return;

  event.preventDefault();
  if (event.deltaY < 0) {
    incrementHours();
  } else {
    decrementHours();
  }
};

const handleMinutesWheel = (event) => {
  if (!isMinutesHovered.value || isEditingMinutes.value) return;

  event.preventDefault();
  if (event.deltaY < 0) {
    incrementMinutes();
  } else {
    decrementMinutes();
  }
};

const incrementHours = () => {
  hours.value = (hours.value + 1) % 25;
  updateTime();
};

const incrementMinutes = () => {
  minutes.value = (minutes.value + props.minuteInterval) % 60;
  updateTime();
};

const decrementHours = () => {
  hours.value = (hours.value - 1 + 25) % 25;
  updateTime();
};

const decrementMinutes = () => {
  minutes.value = (minutes.value - props.minuteInterval + 60) % 60;
  updateTime();
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
