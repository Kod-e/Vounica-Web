# UI レイヤー 

UI レイヤーはとても簡単で、**state を表示するだけ** です。  
自分でデータを持たず、すべて Pinia の state をリアクティブに表示します。  
操作も state の関数を呼ぶだけで、UI 自体はロジックを持ちません。  
私はこの分離が一番わかりやすくて、安心できると思いました。

---

## 構成

UI は大きく三つのレイヤーに分けています：

- **Route の外にある部分**：全ての画面で共通して出る  
  例：`NotifyOver`（通知表示）、`AppBar`  
- **特別な部分**：`Question`  
  → Controller の `is_open` を見て表示するかどうかを決める  
- `Route`部分
この作りは `App.vue` を見ればすぐ分かります。最初からここに骨組みを書いているので、全体も分かりやすいです。

--- 

## Route の外にある部分

```vue
  <AppBar>
    <div v-if="controller.is_open">
      <QuestionView />
    </div>
    <div v-else>
      <RouterView />
    </div>
  </AppBar>
  <NotifyOver />
```


この作りを見ると、QuestionView は Question が始まる時に Route を置き換えて主画面になります。  
でも他の部分には影響しません。つまり、どこからでも簡単に Question を開けます。  
今は Question Agent だけですが、あとで新しい機能を足す時も同じ考え方でできます。  

また、Notify は Vue の Slot を使って外側に置いているので、どこにいても通知を見ることができます。

---

## Question Agent の画面

考え方は単純です。`questionAgent` の `events` は反応的なので、UI は自動で更新されます。  
上から下への `v-for` だけで時系列に表示できます。受信トークンをそのまま積むことで、進捗のような見え方になります。  
種類ごとに絵文字（またはアイコン）を付けて区別します。`ToolDescription` は複雑な tool call を読みやすい文字列に変換します（未対応のものは一時的に生 JSON を出します）。

```vue
<div v-for="(event, i) in questionAgent.events" :key="i">
  <div class="relative pb-8">
    <span
      v-if="i !== questionAgent.events.length - 1"
      class="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
      aria-hidden="true"
    />
    <div class="relative flex space-x-3">
      <div>
        <span
          :class="[
            getBackground(event.type),
            'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white',
          ]"
        >
          <component
            :is="getIcon(event.type)"
            class="h-5 w-5 text-white"
            aria-hidden="true"
          />
        </span>
      </div>
      <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
        <div v-if="event.type === 'message'">
          <p class="text-sm text-gray-500">
            {{ event.data?.message }}
          </p>
        </div>
        <div v-else-if="event.type === 'thinking'">
          <p class="text-md font-bold text-gray-800">{{ t('thinking') }}</p>
        </div>
        <div v-else-if="event.type === 'tool_call'">
          <ToolDescripton
            :tool_name="event.data?.tool_name ?? ''"
            :tool_data="event.data?.tool_data"
          />
        </div>
        <div v-else-if="event.type === 'result'">
          {{ t('success') }}
        </div>
      </div>
    </div>
  </div>
</div>
```

`controller.isStreaming` は「今ストリーム受信中」を表します。  
この間は `streamText` にトークンを順次つなげ、最下部にだけ表示します。  
終了時に Controller が自動で **1つの message event** を作って `events` に追加し、`streamText` を消します。  
見た目は「流れ終わって次の行へ進む」だけで、同じ画面の中で自然に切り替わります。  
UI の動きはずっと一定で、別部品を使っているようには見えません。

## Record Agent の画面

Record Agent の表示は Question Agent とほとんど同じ仕組みです。  
Controller が持つ `events` を反応的に並べるだけで、UI は自動で更新されます。  

そのためここで二度説明する必要はありません。  
私はこの「同じ型で作れる」という構成がとても分かりやすいと思いました。