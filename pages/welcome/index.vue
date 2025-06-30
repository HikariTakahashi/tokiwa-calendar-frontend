<template>
  <div class="h-screen overflow-y-scroll" style="scroll-snap-type: y mandatory">
    <div
      v-show="!isTopSectionVisible"
      class="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-90 backdrop-blur-sm"
    >
      <WelcomeHeader />
    </div>

    <!-- <HeroSection ref="heroSection" />

    <AboutSection /> -->

    <div
      id="schedule-adjust"
      class="flex flex-col sm:flex-row h-screen px-10"
      style="scroll-snap-align: start; scroll-snap-stop: always"
    >
      <div class="flex flex-col sm:w-1/2 justify-center items-center">
        <h2 class="text-3xl sm:text-4xl font-bold pt-16 sm:pt-10">日程調整</h2>
        <h5 class="sm:text-xl pt-5">
          TokiWa
          Calendarは、「部屋を丸ごとリマインダーにする」ことをテーマとした、
          タスク管理特化のカレンダーアプリです。
        </h5>
        <h5 class="sm:text-xl">
          忘れてはならない数々の「タスク」を部屋全体があなたにリマインドします。
        </h5>
      </div>
      <div class="flex sm:w-1/2 justify-center items-center">
        <div class="flex-1 border-8 border-gray-300 rounded-lg">
          <img src="/schedule-adjust.png" alt="日程調整" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import HeroSection from "~/components/welcome/HeroSection.vue";
import AboutSection from "~/components/welcome/AboutSection.vue";
import WelcomeHeader from "~/components/header/WelcomeHeader.vue";

const isTopSectionVisible = ref(true);
const heroSection = ref<InstanceType<typeof HeroSection> | null>(null);

const checkTopSectionVisibility = () => {
  if (!heroSection.value?.topSection) return;

  const rect = heroSection.value.topSection.getBoundingClientRect();
  const isVisible = rect.top <= 0 && rect.bottom > 0;
  isTopSectionVisible.value = isVisible;
};

onMounted(() => {
  // スクロールイベントリスナーを追加
  const scrollContainer = document.querySelector(".scroll-container");
  if (scrollContainer) {
    scrollContainer.addEventListener("scroll", checkTopSectionVisibility);
  }
});
</script>
