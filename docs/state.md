# State レイヤー README

State レイヤーは、フロントエンドの **状態管理と UI 表示** をまとめる場所です。  
Pinia を使って、データと UI をつなげています。Vue のリアクティブ更新を利用することで、  
従来の命令的なやり方と違って、Controller を初期化するだけで UI 側にすぐ反映されます。

---

## State の考え方

普通の UI プログラミングでは、よく「UI の表示とメモリ上のデータがずれる」「更新されない部分が残る」「毎回手で更新処理を書く」などの問題がありました。  
State レイヤーでは Pinia を中心にしているので、その問題を避けられます。UI はただ Store を見て表示するだけです。

多くの View（Mistake, Grammar, Vocab, Story, Memory など）はこの仕組みを利用しています。  
Controller にページングや取得処理をまとめ、Store に入れるだけで、UI 側は自動的に更新されます。  
例えばページ切り替えの場合でも、Controller の関数を呼んでデータを更新すれば、UI はそのまま切り替わります。DOM を手動でいじる必要はありません。

Question View も同じ仕組みです。アプリのどこからでも Question Controller の `is_open` を true にして、Question を追加すれば、そのまま練習を始めることができます。


## Mistake, Grammar, Vocab, Story, Memory の View
すみません、体調がちょっと悪いので、この部分は簡単にまとめます。  
Controller は `src/controller/XXXXController.ts` にあり、Store は `src/store/XXXX.ts` にあります。  
どれもだいたい同じ作り方で、特別むずかしいことはしていません。

ここでは例として Mistake View を書きます。Grammar と Vocab もほぼ同じです。  
私はこういう共通パターンが一番わかりやすくて、安心できます。

Controller には次の state があります：  
- **isLoading**：ロード中かどうか  
- **mistakes**：今の Mistake データ  
- **limit / offset**：ページング用（limit は 30）  

主な関数は：  
- **fetchMistakes**：最初に呼び出してデータを入れる  
- **nextPage**：次ページへ（データが limit 未満なら何もしない）  
- **prevPage**：前ページへ（offset が 0 未満にならないように）  

Story / Memory ではさらに：  
- **categories**  
- **selectedCategory**  

初期化でカテゴリを取って、UI でタブとして出します。タブをクリックするとそのカテゴリだけ fetch します。  

---

## Question Agent & Record Agent

こちらも体調のせいでkanntannに書きます。  
QuestionAgent / RecordAgent の Controller も `src/controller` の中にあり、Store は `src/store` にあります。  
Agent の実体もこのあたりに入っています。

この二つは WebSocket を通じてバックエンドとつながり、イベントを UI に出す仕組みです。  
正直ここは実装していて一番「動いてる感」があって楽しかったです。

Controller には **event** という state があり、受け取った AgentEvent を順番に UI に流します。  
- Tool Call の場合は ToolDescription でわかりやすく表示  
- Stream の場合は `isStreaming` と `streamText` を使って、文字が一つずつ出てくるように見せる  

最終的に：  
- **Question Agent** は受け取った内容を Question に変えて、Controller に追加 → 練習を始められる  
- **Record Agent** は提案を SuggestionView に出して、ユーザーにアドバイスを見せる  
UI 側では、isStreaming が true のとき streamText を Event の最下部にリアクティブに表示し、ChatGPT アプリのように AI が文字を一つずつ出力しているような効果を再現している。

結果として
Question Agent は受信した内容を Question に変換し、Question Controller に追加して練習を開始する。
Record Agent は受信した提案を Suggestion View に表示し、ユーザーにアドバイスを提示する。