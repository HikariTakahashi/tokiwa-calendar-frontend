<template>
  <div
    class="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-90 backdrop-blur-sm"
  >
    <welcome-header />
  </div>
  <div class="flex flex-row w-full pt-10">
    <NavigationSection />
    <div
      class="flex flex-col w-5/6 h-auto min-h-screen py-6 sm:px-10 border-l-2 border-gray-200"
    >
      <div class="flex flex-col gap-y-2">
        <h1 class="pl-2 text-3xl sm:text-4xl font-bold">Introduction</h1>
        <h3 class="pl-4 text-sm text-gray-500">
          このページでは、カレンダーアプリ「Tokiwa
          Calendar」の使い方を紹介します。
        </h3>
      </div>
      <div class="flex w-full h-0.5 bg-gray-200 my-10" />

      <div class="flex flex-col gap-y-12 px-4">
        <div class="flex flex-col gap-y-4">
          <h2 class="text-3xl font-bold">
            日程調整：Tokiwaが実現する、スマートなスケジュール管理
          </h2>
          <p class="text-base text-gray-700 leading-relaxed pt-2">
            あなたは、友人と遊びに行く時、チームでプロジェクトを進める時、あるいは重要なオンライン会議を設定する時、どのように日程調整をしていますか？
            <br />
            Tokiwaの日程調整モードは、そうした一手間を解消し、あなたのスケジュール管理をサポートします。
          </p>

          <div class="flex flex-col gap-y-3 pt-4">
            <h3 class="text-xl font-bold border-b-2 border-blue-500 pb-2">
              簡単入力で即座に共有
            </h3>
            <p class="text-base text-gray-700 leading-relaxed pt-2">
              直感的なカレンダースタイルのインターフェースで、希望の時間を簡単に入力できます。入力した日程は、同期ボタンひとつでオンラインカレンダーに即座に反映され、あなた専用のURLが発行されます。このURLを共有するだけで、世界中のどこからでも、あなたの空き状況を誰でも確認できるようになります。
            </p>
          </div>

          <div class="flex flex-col gap-y-3 pt-4">
            <h3 class="text-xl font-bold border-b-2 border-blue-500 pb-2">
              チームのスケジュールを一元管理
            </h3>
            <p class="text-base text-gray-700 leading-relaxed pt-2">
              さらに、新しいカレンダーを作成すれば、チーム専用のURLが生成されます。これにより、メンバー全体の動ける時間を一元的に管理することが可能になります。キックオフミーティングやプロジェクトのタスク管理など、あらゆるシーンでチーム全体の連携を強力にサポートし、プロジェクトの進行を加速させます。
            </p>
          </div>
        </div>

        <div id="task-management" class="flex flex-col gap-y-4 pt-8">
          <h2 class="text-3xl font-bold">タスク管理</h2>
          <div
            class="flex flex-col items-center justify-center bg-gray-100 p-10 rounded-lg"
          >
            <h3 class="text-4xl font-bold font-mono text-gray-500">
              Coming Soon...
            </h3>
            <p class="text-sm text-gray-600 mt-4">
              タスク管理モードは、2025.08.28にリリース予定です。
            </p>
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
