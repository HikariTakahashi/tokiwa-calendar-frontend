<template>
  <div
    id="top"
    class="flex flex-col gap-y-4 justify-center items-center h-screen relative"
    style="scroll-snap-align: start; scroll-snap-stop: always"
    ref="topSection"
  >
    <div v-show="showNightSky" class="night-sky-container">
      <NightSky :seed="789" />
    </div>
    <TokiwaIcon :isLoaded="isLoaded" />

    <!-- タイプライター効果用のh1 -->
    <h1
      v-show="isLoaded && !typewriterFinished"
      class="typewriter text-4xl font-bold font-mono text-white relative z-10"
      style="-webkit-text-stroke: 2px black"
      @animationend="onTypewriterEnd"
      @animationstart="onTypewriterStart"
    >
      Welcome to ToKiWa Calendar
    </h1>

    <!-- タイプライター効果終了後に表示される個別のテキスト -->
    <div
      v-show="isLoaded && typewriterFinished"
      class="flex flex-col sm:flex-row items-center gap-x-4 gap-y-10 relative z-10"
    >
      <p
        class="text-4xl font-bold font-mono text-white"
        style="-webkit-text-stroke: 2px black"
      >
        Welcome to
      </p>
      <div class="flex flex-row">
        <p
          class="text-4xl font-bold font-mono text-white"
          style="
            -webkit-text-stroke: 2px rgba(59, 130, 246, var(--tw-text-opacity));
          "
        >
          ToKi
        </p>
        <p
          class="text-4xl font-bold font-mono text-white"
          style="
            -webkit-text-stroke: 2px rgba(16, 185, 129, var(--tw-text-opacity));
          "
        >
          Wa
        </p>
      </div>
      <p
        class="text-4xl font-bold font-mono text-white"
        style="-webkit-text-stroke: 2px black"
      >
        Calendar
      </p>
    </div>

    <p
      class="sm:text-xl font-bold font-mono text-white relative z-10"
      :class="showNightSky ? 'opacity-100' : 'opacity-0'"
    >
      「部屋を丸ごとリマインダーにする」
    </p>
    <p
      class="sm:text-xl font-bold font-mono text-white relative z-10"
      :class="showNightSky ? 'opacity-100' : 'opacity-0'"
    >
      タスク管理に特化したカレンダーアプリ
    </p>
    <!--SEO対策-->
    <h2 class="text-[0px]">
      「部屋を丸ごとリマインダーにする」タスク管理に特化したカレンダーアプリ
    </h2>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import NightSky from "~/components/background/NightSky.vue";
import TokiwaIcon from "~/components/background/TokiwaIcon.vue";

const isLoaded = ref(false);
const typewriterFinished = ref(false);
const showNightSky = ref(false);
const topSection = ref<HTMLElement | null>(null);

const onTypewriterStart = () => {
  console.log("Typewriter animation started");
};

const onTypewriterEnd = () => {
  console.log("Typewriter animation ended");
  typewriterFinished.value = true;
  // タイプライター終了後に夜空を表示
  setTimeout(() => {
    showNightSky.value = true;
  }, 500);
};

onMounted(() => {
  // ページロード完了後にフェードイン開始
  setTimeout(() => {
    isLoaded.value = true;
  }, 100);

  // フォールバック: アニメーション終了を確実に検知
  setTimeout(() => {
    if (!typewriterFinished.value) {
      console.log("Fallback: Setting typewriter finished");
      typewriterFinished.value = true;
      setTimeout(() => {
        showNightSky.value = true;
      }, 500);
    }
  }, 3500); // 1秒遅延 + 2秒アニメーション + 0.5秒余裕
});

// topSectionの参照を親コンポーネントに公開
defineExpose({
  topSection,
});
</script>

<style scoped>
.typewriter {
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid white;
  animation: typewriter 2s steps(25, end) 1s forwards;
  display: inline-block;
  text-align: center;
  width: 100%;
  position: relative;
  opacity: 0;
}

.typewriter::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  animation: reveal 2s steps(25, end) 1s forwards;
}

@keyframes reveal {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

@keyframes typewriter {
  0% {
    width: 0;
    opacity: 0;
  }
  1% {
    opacity: 1;
  }
  100% {
    width: 100%;
    opacity: 1;
  }
}

.night-sky-container {
  opacity: 0;
  animation: fadeInNight 2s ease-in-out forwards;
}

@keyframes fadeInNight {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
