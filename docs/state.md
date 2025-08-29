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