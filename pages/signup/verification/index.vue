<template>
  <div class="bg-white bg-opacity-0 sm:bg-opacity-80 z-10">
    <WelcomeHeader />
  </div>
  <div class="flex flex-col h-screen mb-[-50px]">
    <NightSky class="z-[-10]" :seed="123" />
    <div class="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-sm max-h-[98vh] sm:max-h-[80vh] overflow-y-auto"
      >
        <div class="p-6">
          <div class="flex flex-row items-center justify-between mb-2">
            <h3 class="text-lg font-bold text-gray-800">認証URL送信</h3>
          </div>
          <div class="flex justify-center items-center my-2">
            <UIcon
              name="pepicons-pop:letter-circle-filled"
              class="size-12 text-green-500"
            />
          </div>
          <div class="flex flex-col justify-center items-center">
            <p class="text-sm">認証用のURLを送信しました。</p>
            <p class="text-sm">メールをご確認ください。</p>
          </div>
          <div class="flex flex-col justify-center items-center">
            <button
              class="w-full text-sm text-blue-500 hover:underline"
              @click="navigateTo('/signup/verification')"
            >
              認証URLを再送信
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Footer />
</template>

<script setup lang="ts">
import NightSky from "~/components/background/NightSky.vue";
import WelcomeHeader from "~/components/header/WelcomeHeader.vue";
import Footer from "~/components/footer/Footer.vue";
</script>
