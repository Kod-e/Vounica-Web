# Vounica プロジェクト概要

> 名前の後半「unica」は Latin 語から来ました。前半の「vo」は voice（声）、vocabulary（単語）などの意味を考えられます。  
> 全体の意味は「一人一人に unique な language learning コースを作る」です。

Vounica は、AI を利用した **言語学習支援プラットフォーム** です。  
ユーザーが自分で書いた日記や興味のある内容をもとに、システムが自動で問題（Question）を作成し、  
解答や間違いを記録（Record）して、次の問題に反映します。

この **QuestionAgent → RecordAgent → QuestionAgent のループ** によって、  
使えば使うほどシステムがユーザーを理解し、個別最適な学習体験を提供します。

従来の固定カリキュラム型アプリと違い、Vounica は **ユーザー自身の生活・興味・文脈** を中心に学習内容を生成するため、  
「自分の言葉」で学べるのが特徴です。

## Demo

https://vounica.com

## InstallとAccess

### 1. リポジトリを clone

```bash
git clone https://github.com/Kod-e/Vounica-Web.git
cd Vounica-Web
```

### 3. Build

```bash
npm run install
npm run build
```

### 4. Access

- Dist Path ./dist
- Dev Acccess
```bash
npm run dev
```
## 使用している技術

### frontend：Vue 3 + Pinia + OpenAPI Fetch

- Vue3 + Pinia を使うと、UI は data を管理せず、ただ表示するだけです。imperative な code はほとんど不要です。
- backend の FastAPI が出す OpenAPI schema をそのまま使えるので、frontend で model を作り直す必要はありません。

## アーキテクチャ図 (Backend)

Vounicaのバックエンドは以下のような構成になっています。  
Core → Infra → Service → API の4層に分かれ、それぞれが明確に役割を持っています。

<p align="center">
  <img src="https://static.vounica.com/image/backend.webp" alt="Backend" width="600"/>
</p>

---

## プロジェクト構成

本プロジェクトの backend は **Core → Infra → Service → API** の4層構造で作られています。  
すべて async 対応の code で書かれており、保守しやすいように設計しました。  
詳しい内容は docs/ 以下のファイルをご覧ください。

- [docs/core/README.md](docs/core/README.md)  
  基本的な定義をまとめる層。  
  例：DB SessionMaker の取得方法、Qdrant client、JWT の作成、アプリ起動時に必要な初期化など。

- [docs/infra/README.md](docs/infra/README.md)  
  database model の定義、関連する schema、vector collection の定義を行います。  
  また repo (repository) を通して model を操作し、もし semantic search が必要な field があれば vector DB にも同時に保存します。  
  特に **Unit of Work (UoW)** が重要で、FastAPI の request ごとに Session と user 情報をまとめて提供します。ContextVar に保存され、request 中ならどこからでも参照できます。  
  さらに Qdrant には transaction がないため、UoW 内に仮想 transaction 機構を作り、一時的に Qdrant の操作を cache し、最後に ORM と同時に commit することで不整合を防ぎます。

- [docs/services/README.md](docs/services/README.md)  
  実際のビジネスロジックを実装する層。  
  Agent, Question, Record などを中心に機能がまとまっており、詳細は専用ページで説明します。

- [docs/api/README.md](docs/api/README.md)  
  Infra 層の schema を利用して Service の機能を呼び出す FastAPI endpoint を提供する層。  
  エンドポイント定義や依存解決が含まれます。

## ScreenShots

### Question Agent 冷スタート

最初にユーザーが「学びたい内容」を入力すると、Question Agent が冷スタートします。  
学習履歴や文法・語彙の記録がない状態から診断テストを作成し、段階的に問題を生成します。

<p align="center">
  <img src="https://static.vounica.com/image/qstagent/1.webp" alt="Cold Start Input" width="400"/>
  <img src="https://static.vounica.com/image/qstagent/2.webp" alt="Cold Start Output" width="400"/>
</p>

### Question Type Examples

Vounica では主に 3 種類の問題形式をサポートしています。  
下記は Choice, Match, Assembly の画面例です。

<p align="center">
  <img src="https://static.vounica.com/image/question/1.webp" alt="Choice Question" width="280"/>
  <img src="https://static.vounica.com/image/question/2.webp" alt="Match Question" width="280"/>
  <img src="https://static.vounica.com/image/question/3.webp" alt="Assembly Question" width="280"/>
</p>

### Database View (Frontend)

ユーザーの回答や習得状態はフロントエンドから DB として確認できます。  
以下は Memory と Vocab の例です。

<p align="center">
  <img src="https://static.vounica.com/image/database/1.webp" alt="Memory View" width="400"/>
  <img src="https://static.vounica.com/image/database/2.webp" alt="Vocab View" width="400"/>
</p>

### Memory in Agent

Vounica はユーザーの入力や回答を記憶し、次回以降の問題生成に反映します。  
ユーザーが明示的に「この単語を練習したい」と要求しなくても、過去の記録を参照して  
関連する語彙や文法を自動で出題することができます。

<p align="center">
  <img src="https://static.vounica.com/image/memory/1.webp" alt="Memory Function 1" width="280"/>
  <img src="https://static.vounica.com/image/memory/2.webp" alt="Memory Function 2" width="280"/>
  <img src="https://static.vounica.com/image/memory/3.webp" alt="Memory Function 3" width="280"/>
</p>

### Question → Record → Question のループ

Vounica の特徴は、Question（問題を出す）→ Record（答えや間違いを記録する）→ Question（次の問題を出す）というサイクルです。このサイクルは Agent によって管理されており、ユーザーの学習状態に合わせて最適な問題を自動で選びます。これにより、効率的で個別化された学習体験を提供します。

### Regex and Vector Search

AI がユーザーの情報（例えば「何を練習したか」「間違いがあるか」など）を知る必要がある時、普通の正規表現（regex）検索だけでは十分ではありません。vector（ベクトル）検索を使うと、「food」と検索した時に「orange」や「apple」なども見つけられます。そのため、SQLAlchemy の一部のフィールドは、テキストデータを vector 化して同期しています。この vector 化には Qdrant を使い、embedding model（埋め込みモデル）は変更可能です。デフォルトでは OpenAI の `text-embedding-3` を使って vector 化を行っています。
