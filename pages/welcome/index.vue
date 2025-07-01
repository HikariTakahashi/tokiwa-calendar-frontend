<template>
  <div class="h-screen overflow-y-scroll" style="scroll-snap-type: y mandatory">
    <div
      v-show="!isTopSectionVisible"
      class="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-90 backdrop-blur-sm"
    >
      <WelcomeHeader />
    </div>

    <HeroSection ref="heroSection" />

    <AboutSection />

    <FeatureSection />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import HeroSection from "~/components/welcome/HeroSection.vue";
import AboutSection from "~/components/welcome/AboutSection.vue";
import WelcomeHeader from "~/components/header/WelcomeHeader.vue";
import FeatureSection from "~/components/welcome/FeatureSection.vue";

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
  const scrollContainer = document.querySelector(".h-screen.overflow-y-scroll");
  if (scrollContainer) {
    scrollContainer.addEventListener("scroll", checkTopSectionVisibility);
  }

  // windowのスクロールイベントも追加（フォールバック）
  window.addEventListener("scroll", checkTopSectionVisibility);

  // 初期状態でもチェック
  checkTopSectionVisibility();
});

onUnmounted(() => {
  // イベントリスナーをクリーンアップ
  const scrollContainer = document.querySelector(".h-screen.overflow-y-scroll");
  if (scrollContainer) {
    scrollContainer.removeEventListener("scroll", checkTopSectionVisibility);
  }
  window.removeEventListener("scroll", checkTopSectionVisibility);
});
</script>
