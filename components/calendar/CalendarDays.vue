<template>
  <div class="relative">
    <!-- 日付の表示方式を変更できるよう将来的に変更 -->
    <button
      class="flex items-center justify-center w-full h-full hover:bg-gray-100 pl-3 pr-1 py-1 rounded-xl"
      @click="handleCalendarTabs"
    >
      <h2 class="text-xl sm:text-2xl font-bold">
        {{ currentYear }}年 {{ currentMonth }}月
      </h2>
      <UIcon name="ic:baseline-keyboard-arrow-down" class="size-5" />
    </button>

    <div
      v-if="showDropdown"
      class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-64"
    >
      <MoveDataForm
        @go-to-today="handleGoToToday"
        @go-to-specific-date="handleGoToSpecificDate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import MoveDataForm from "@/components/forms/MoveDataForm.vue";

const props = defineProps({
  currentYear: Number,
  currentMonth: Number,
  currentDay: Number,
  currentWeek: Number,
});

const emit = defineEmits<{
  goToToday: [];
  goToSpecificDate: [date: string];
}>();

const showDropdown = ref(false);

const handleCalendarTabs = () => {
  showDropdown.value = !showDropdown.value;
};

const handleGoToToday = () => {
  emit("goToToday");
  showDropdown.value = false;
};

const handleGoToSpecificDate = (date: string) => {
  emit("goToSpecificDate", date);
  showDropdown.value = false;
};

// ドロップダウン外をクリックしたときに閉じる
const closeDropdown = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".relative")) {
    showDropdown.value = false;
  }
};

// コンポーネントマウント時にイベントリスナーを追加
onMounted(() => {
  document.addEventListener("click", closeDropdown);
});

// コンポーネントアンマウント時にイベントリスナーを削除
onBeforeUnmount(() => {
  document.removeEventListener("click", closeDropdown);
});
</script>
