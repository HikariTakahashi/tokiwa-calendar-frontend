<template>
  <div class="bg-white bg-opacity-0 sm:bg-opacity-80">
    <WelcomeHeader />
  </div>
  <div class="flex flex-col h-screen mb-[-50px]">
    <NightSky class="z-[-10]" :seed="456" />
    <div class="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-sm max-h-[98vh] sm:max-h-[80vh] overflow-y-auto"
      >
        <div class="p-6">
          <div class="flex flex-row items-center justify-between mb-2">
            <h3 class="text-lg font-bold text-gray-800">パスワードリセット</h3>
          </div>
          <div class="flex flex-col gap-y-4">
            リセット機能は現在開発中です。
          </div>
          <div class="flex flex-col gap-y-4">
            担当者にお問い合わせください。
          </div>
          <div class="flex flex-col gap-y-4">
            Hikari | hikari-takahashi@tokiwa-calendar.com
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script setup lang="ts">
import WelcomeHeader from "@/components/header/WelcomeHeader.vue";
import NightSky from "@/components/background/NightSky.vue";
import Footer from "@/components/footer/Footer.vue";
</script>
