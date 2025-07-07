<template>
  <div
    class="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-90 backdrop-blur-sm"
  >
    <welcome-header />
  </div>
  <div class="flex flex-row w-full pt-10">
    <NavigationSection />
    <div
      class="flex flex-col w-5/6 h-auto min-h-screen py-10 sm:px-10 border-l-2 border-gray-200"
    >
      <!-- ヘッダーセクション -->
      <div class="flex flex-col gap-y-2 px-4">
        <h1 class="text-3xl sm:text-4xl font-bold">カレンダーの共有方法</h1>
        <p class="text-gray-600">
          作成したカレンダーを他のユーザーに共有し、複数人で日程調整を行う方法を紹介します。
        </p>
      </div>

      <div class="w-full h-0.5 bg-gray-200 my-10" />

      <!-- ステップ・バイ・ステップガイド -->
      <div class="flex flex-col gap-y-16 px-4">
        <!-- ステップ1: 主催者がカレンダーを作成 -->
        <div class="flex flex-col md:flex-row items-center gap-8">
          <div class="md:w-1/2">
            <h2 class="text-2xl font-bold mb-3">
              ステップ1：主催者がカレンダーを作成
            </h2>
            <p class="text-gray-700 leading-relaxed">
              まず、日程調整の主催者が、自身の空き時間などをカレンダーに入力し、設定を確定・同期します。
            </p>
          </div>
          <div class="md:w-1/2">
            <img
              src="/images/共有_1.gif"
              alt="主催者がカレンダーを作成し、同期するまでの操作GIF"
              class="rounded-lg shadow-lg border"
            />
          </div>
        </div>

        <!-- ステップ2: 専用URLの発行 -->
        <div class="flex flex-col md:flex-row-reverse items-center gap-8">
          <div class="md:w-1/2">
            <h2 class="text-2xl font-bold mb-3">
              ステップ2：専用URLが発行される
            </h2>
            <p class="text-gray-700 leading-relaxed">
              同期が完了すると、そのカレンダー専用のURLがブラウザのアドレスバーに自動で生成されます。このURLが共有用のリンクになります。
            </p>
          </div>
          <div class="md:w-1/2">
            <img
              src="/images/共有_2.png"
              alt="ブラウザのアドレスバーに表示された専用URL"
              class="rounded-lg shadow-lg border"
            />
          </div>
        </div>

        <!-- ステップ3: 参加者にURLを共有 -->
        <div class="flex flex-col md:flex-row items-center gap-8">
          <div class="md:w-1/2">
            <h2 class="text-2xl font-bold mb-3">
              ステップ3：参加者にURLを共有する
            </h2>
            <p class="text-gray-700 leading-relaxed">
              主催者は、発行された専用URLをコピーし、LineやDiscordなどのチャットツールで参加者に共有します。
            </p>
          </div>
          <div class="md:w-1/2">
            <img
              src="/images/共有_3.png"
              alt="DiscordでカレンダーのURLを共有している様子"
              class="rounded-lg shadow-lg border"
            />
          </div>
        </div>

        <!-- ステップ4: 参加者が予定を入力 -->
        <div class="flex flex-col md:flex-row-reverse items-center gap-8">
          <div class="md:w-1/2">
            <h2 class="text-2xl font-bold mb-3">
              ステップ4：参加者が予定を入力する
            </h2>
            <p class="text-gray-700 leading-relaxed">
              共有されたURLにアクセスした参加者は、自身の空き時間をカレンダーに入力します。入力されたデータは、リアルタイムで全員に共有されます。
            </p>
          </div>
          <div class="md:w-1/2">
            <img
              src="/images/共有_4.gif"
              alt="参加者が共有されたカレンダーに予定を入力する操作GIF"
              class="rounded-lg shadow-lg border"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script setup lang="ts">
import WelcomeHeader from "~/components/header/WelcomeHeader.vue";
import Footer from "~/components/footer/Footer.vue";
import NavigationSection from "~/components/welcome/sections/NavigationSection.vue";
</script>
