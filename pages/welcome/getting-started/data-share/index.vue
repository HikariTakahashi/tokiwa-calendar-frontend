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
        <h1 class="pl-2 text-3xl sm:text-4xl font-bold">カレンダーの共有</h1>
        <h3 class="pl-4 text-sm text-gray-500">
          このページでは、カレンダーアプリ「Tokiwa
          Calendar」のカレンダーの共有方法を紹介します。
        </h3>
      </div>
      <div class="flex w-full h-0.5 bg-gray-200 my-10" />
      <div class="flex flex-col gap-y-8 px-4">
        <p class="text-base text-gray-700 leading-relaxed">
          Tokiwaで作成したカレンダーは、共有機能によってチーム間の連携をサポートします。
        </p>

        <div class="flex flex-col gap-y-3">
          <h2 class="text-2xl font-bold border-b-2 border-blue-500 pb-2">
            専用URLで簡単アクセス
          </h2>
          <p class="text-base text-gray-700 leading-relaxed pt-2">
            カレンダーの作成者がスケジュールを同期・確定すると、そのカレンダー専用のユニークなURLが自動的に生成されます。このURLを共有するだけで、招待された他のユーザーは即座にカレンダーにアクセスし、参加することが可能です。煩雑な招待手続きは一切不要で、すぐに全員が最新のスケジュールを確認できます。
          </p>
        </div>

        <div class="flex flex-col gap-y-3">
          <h2 class="text-2xl font-bold border-b-2 border-blue-500 pb-2">
            チーム間での連携を円滑に
          </h2>
          <p class="text-base text-gray-700 leading-relaxed pt-2">
            この共有機能は、特にチームでのプロジェクトやイベントの立ち上げに最適です。例えば、新しいプロジェクトのキックオフミーティングや、メンバー全員の空き状況を把握したいタスク管理など、迅速な日程調整が求められる場面で真価を発揮します。URL一つで全員が同じ情報を共有できるため、認識の齟齬を防ぎ、スムーズなコミュニケーションと意思決定を促進します。
          </p>
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
