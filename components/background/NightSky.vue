<template>
  <div class="night-sky">
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
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Star {
  id: number;
  left: number;
  top: number;
  size: number;
  delay: number;
}

interface Props {
  numStars?: number;
}

const props = withDefaults(defineProps<Props>(), {
  numStars: 100,
});

const createStars = (count: number): Star[] => {
  const stars = [];

  for (let i = 0; i < count; i++) {
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

const stars = computed(() => createStars(props.numStars));
</script>

<style scoped>
.night-sky {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, #0f0f23, #1a1a2e, #495470);
  z-index: -20;
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
