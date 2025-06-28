<template>
  <div class="scroll-container">
    <div
      class="scroll-snap-section flex flex-col gap-y-4 justify-center items-center h-screen relative"
    >
      <div v-show="showNightSky" class="night-sky">
        <div
          v-for="star in stars"
          :key="star.id"
          class="star"
          :style="{
            left: star.left + '%',
            top: star.top + '%',
            width: star.size + 'px',
            height: star.size + 'px',
            animationDelay: star.delay + 's',
          }"
        ></div>
      </div>
      <div
        v-show="isLoaded"
        class="fade-in absolute left-[-80vh] sm:left-[-50vh] z-[-10] w-[120vh] h-[120vh] rounded-full border-4 sm:border-8"
        :class="showNightSky ? 'border-gray-800' : 'border-black'"
      />
      <div
        v-show="isLoaded"
        class="fade-in absolute left-[30vh] top-[20vh] sm:left-[57vh] sm:top-[15vh] z-[-9] w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-red-500"
        :class="showNightSky ? 'bg-opacity-60' : 'bg-opacity-100'"
      />
      <div
        v-show="isLoaded"
        class="fade-in absolute left-[-80vh] sm:left-[-50vh] z-[-10] w-[110vh] h-[110vh] rounded-full border-4 sm:border-8"
        :class="showNightSky ? 'border-gray-800' : 'border-black'"
      />
      <div
        v-show="isLoaded"
        class="fade-in absolute left-[26vh] sm:left-[47vh] sm:top-[75vh] z-[-9] w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-green-500"
        :class="showNightSky ? 'bg-opacity-60' : 'bg-opacity-100'"
      />
      <div
        v-show="isLoaded"
        class="fade-in absolute left-[-80vh] sm:left-[-50vh] z-[-10] w-[100vh] h-[100vh] rounded-full border-4 sm:border-8"
        :class="showNightSky ? 'border-gray-800' : 'border-black'"
      />
      <div
        v-show="isLoaded"
        class="fade-in absolute left-[11vh] top-[70vh] sm:left-[45vh] sm:top-[50vh] z-[-9] w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-blue-500"
        :class="showNightSky ? 'bg-opacity-60' : 'bg-opacity-100'"
      />

      <!-- タイプライター効果用のh1 -->
      <h1
        v-show="isLoaded && !typewriterFinished"
        class="typewriter text-4xl font-bold font-mono text-white"
        style="-webkit-text-stroke: 2px black"
        @animationend="onTypewriterEnd"
        @animationstart="onTypewriterStart"
      >
        Welcome to ToKiWa Calendar
      </h1>

      <!-- タイプライター効果終了後に表示される個別のテキスト -->
      <div
        v-show="isLoaded && typewriterFinished"
        class="flex flex-col sm:flex-row items-center gap-x-4 gap-y-10"
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
              -webkit-text-stroke: 2px
                rgba(59, 130, 246, var(--tw-text-opacity));
            "
          >
            ToKi
          </p>
          <p
            class="text-4xl font-bold font-mono text-white"
            style="
              -webkit-text-stroke: 2px
                rgba(16, 185, 129, var(--tw-text-opacity));
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
        class="sm:text-xl font-bold font-mono text-white"
        :class="showNightSky ? 'opacity-100' : 'opacity-0'"
      >
        「部屋を丸ごとリマインダーにする」
      </p>
      <p
        class="sm:text-xl font-bold font-mono text-white"
        :class="showNightSky ? 'opacity-100' : 'opacity-0'"
      >
        タスク管理に特化したカレンダーアプリ
      </p>
      <!--SEO対策-->
      <h2 class="text-[0px]">
        「部屋を丸ごとリマインダーにする」タスク管理に特化したカレンダーアプリ
      </h2>
    </div>
    <div class="scroll-snap-section flex flex-col h-screen bg-white gap-x-4">
      <div class="flex flex-col text-center px-3">
        <h2 class="text-3xl sm:text-4xl font-bold pt-10">
          Tokiwa Calendarとは？
        </h2>

        <h5 class="sm:text-xl pt-5">
          TokiWa
          Calendarは、「部屋を丸ごとリマインダーにする」ことをテーマとした、
          タスク管理特化のカレンダーアプリです。
        </h5>
        <h5 class="sm:text-xl">
          忘れてはならない数々の「タスク」を部屋全体があなたにリマインドします。
        </h5>
      </div>
      <h3 class="text-3xl font-bold pt-10 pl-10">TokiWaの魅力</h3>
      <div class="flex flex-row px-5 pb-10 flex-1">
        <Carousel :items="6">
          <template #default="{ index, activeIndex }">
            <Card
              v-if="index === 0"
              title="日程調整"
              description="チームの日程を、&#10;わかりやすく調整。"
              :is-active="index === activeIndex"
              page-transition="/"
            />
            <Card
              v-else-if="index === 1"
              title="コピー＆ペースト"
              description="あなたの時間を、&#10;素早く共有。"
              :is-active="index === activeIndex"
              page-transition="/"
            />
            <Card
              v-else-if="index === 2"
              title="コピーモード"
              description="入力したデータを、&#10;簡単にコピー。"
              :is-active="index === activeIndex"
              page-transition="/"
            />
            <Card
              v-else-if="index === 3"
              title="タスク管理"
              description="日々のタスクを、&#10;可視化して整理。"
              :is-active="index === activeIndex"
              page-transition="/"
            />
            <Card
              v-else-if="index === 4"
              title="リマインド"
              description="部屋全体が、&#10;あなたにリマインド。"
              :is-active="index === activeIndex"
              page-transition="/"
            />
            <Card
              v-else-if="index === 5"
              title="カスタマイズ"
              description="リマインド方法を、&#10;あなた好みに。"
              :is-active="index === activeIndex"
              page-transition="/"
            />
          </template>
        </Carousel>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Card from "~/components/welcome/Card.vue";
import Carousel from "~/components/welcome/Carousel.vue";

const isLoaded = ref(false);
const typewriterFinished = ref(false);
const showNightSky = ref(false);

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

const createStars = () => {
  const stars = [];
  const numStars = 100;

  for (let i = 0; i < numStars; i++) {
    const star = {
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 3,
    };
    stars.push(star);
  }

  return stars;
};

const stars = createStars();

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
</script>

<style scoped>
.scroll-container {
  scroll-snap-type: y mandatory;
  height: 100vh;
  overflow-y: scroll;
}

.scroll-snap-section {
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.fade-in {
  opacity: 0;
  animation: fadeIn 1s ease-in-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

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

.night-sky {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, #0f0f23, #1a1a2e, #495470);
  z-index: -20;
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

.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: twinkle 3s infinite;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.star:nth-child(3n) {
  animation-duration: 4s;
}

.star:nth-child(3n + 1) {
  animation-duration: 2.5s;
}

.star:nth-child(3n + 2) {
  animation-duration: 3.5s;
}
</style>
