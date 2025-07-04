<template>
  <div class="h-screen overflow-y-scroll" :style="scrollSnapStyle">
    <div
      v-show="!isTopSectionVisible"
      class="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-90 backdrop-blur-sm"
    >
      <WelcomeHeader />
    </div>

    <HeroSection ref="heroSection" />

    <AboutSection />

    <FeatureSection ref="featureSection" />
  </div>

  <div
    v-show="isFooterVisible"
    class="fixed bottom-0 left-0 right-0 z-40 opacity-90 sm:opacity-60"
  >
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import HeroSection from "~/components/welcome/sections/HeroSection.vue";
import AboutSection from "~/components/welcome/sections/AboutSection.vue";
import WelcomeHeader from "~/components/header/WelcomeHeader.vue";
import FeatureSection from "~/components/welcome/sections/FeatureSection.vue";
import Footer from "~/components/footer/Footer.vue";

const isTopSectionVisible = ref(true);
const isFooterVisible = ref(false);
const heroSection = ref<InstanceType<typeof HeroSection> | null>(null);
const featureSection = ref<InstanceType<typeof FeatureSection> | null>(null);

// Footerが表示されている間はスクロールスナップを無効にする
const scrollSnapStyle = computed(() => ({
  scrollSnapType: isFooterVisible.value ? "none" : "y mandatory",
}));

const checkTopSectionVisibility = () => {
  if (
    !heroSection.value?.topSection ||
    !heroSection.value.topSection.getBoundingClientRect
  )
    return;

  try {
    const rect = heroSection.value.topSection.getBoundingClientRect();
    const isVisible = rect.top <= 0 && rect.bottom > 0;
    isTopSectionVisible.value = isVisible;
  } catch (error) {
    console.warn("Failed to check top section visibility:", error);
    isTopSectionVisible.value = true; // フォールバック値
  }
};

const checkFooterVisibility = () => {
  const scrollContainer = document.querySelector(".h-screen.overflow-y-scroll");
  if (!scrollContainer) return;

  const scrollTop = scrollContainer.scrollTop;
  const scrollHeight = scrollContainer.scrollHeight;
  const clientHeight = scrollContainer.clientHeight;

  // ページの一番下に近づいたらFooterを表示
  const threshold = 100; // 100px手前で表示開始
  const isAtBottom = scrollTop + clientHeight >= scrollHeight - threshold;
  isFooterVisible.value = isAtBottom;
};

// スクロールイベントハンドラーを一つの関数にまとめる
const handleScroll = () => {
  checkTopSectionVisibility();
  checkFooterVisibility();
};

onMounted(() => {
  // スクロールイベントリスナーを追加
  const scrollContainer = document.querySelector(".h-screen.overflow-y-scroll");
  if (scrollContainer) {
    scrollContainer.addEventListener("scroll", handleScroll);
  }

  // windowのスクロールイベントも追加（フォールバック）
  window.addEventListener("scroll", handleScroll);

  // 初期状態でもチェック
  checkTopSectionVisibility();
  checkFooterVisibility();
});

onUnmounted(() => {
  // イベントリスナーをクリーンアップ
  const scrollContainer = document.querySelector(".h-screen.overflow-y-scroll");
  if (scrollContainer) {
    scrollContainer.removeEventListener("scroll", handleScroll);
  }
  window.removeEventListener("scroll", handleScroll);
});
</script>
