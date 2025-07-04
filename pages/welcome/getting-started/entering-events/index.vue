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
        <h1 class="pl-2 text-3xl sm:text-4xl font-bold">予定の入力</h1>
        <h3 class="pl-4 text-sm text-gray-500">
          このページでは、カレンダーアプリ「Tokiwa
          Calendar」の予定の入力方法を紹介します。
        </h3>
      </div>
      <div class="flex w-full h-0.5 bg-gray-200 my-10" />
      <div class="flex flex-col gap-y-8 px-4">
        <p class="text-base text-gray-700 leading-relaxed">
          Tokiwaでは、あなたの予定や空き時間を簡単かつ正確に入力し、共有することができます。
        </p>

        <div class="flex flex-col gap-y-3">
          <h2 class="text-2xl font-bold border-b-2 border-blue-500 pb-2">
            スケジュール設定はシンプルに
          </h2>
          <p class="text-base text-gray-700 leading-relaxed pt-2">
            カレンダー上で希望の日付を選択し、次に時間を設定します。複数の日付にわたる時間も、まとめて選択・設定が可能です。すべての設定が完了したら、画面上部の同期ボタンをタップしてください。これにより、あなたの入力したスケジュールが、安全なオンライン環境に瞬時に反映されます。
          </p>
        </div>

        <div class="flex flex-col gap-y-3">
          <h2 class="text-2xl font-bold border-b-2 border-blue-500 pb-2">
            詳細設定で、より柔軟な運用を
          </h2>
          <p class="text-base text-gray-700 leading-relaxed pt-2">
            さらに、Tokiwaの詳細設定を活用すれば、カレンダーの運用をより柔軟にカスタマイズできます。
          </p>
          <ul class="list-disc list-inside space-y-4 pt-2 pl-2 text-gray-700">
            <li>
              <span class="font-bold">入力可能期間の制限:</span>
              <p class="inline leading-relaxed">
                特定のイベントやプロジェクトのために、メンバーにスケジュールを入力してほしい期間を限定できます。これにより、該当期間内のミーティング調整などがスムーズに進みます。
              </p>
            </li>
            <li>
              <span class="font-bold">他ユーザーへの編集権限付与:</span>
              <p class="inline leading-relaxed">
                チームメンバーや共同作業者に対して、あなたのカレンダーの編集権限を付与することができます。これにより、複数人でのカレンダー管理や、代理でのスケジュール入力が可能になり、チーム全体の連携が強化されます。
              </p>
            </li>
          </ul>
        </div>

        <p class="text-base text-gray-700 leading-relaxed pt-4">
          Tokiwaは、あなたのスケジュール管理をより効率的で、よりパーソナルなものにするための機能を提供します。
        </p>
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
