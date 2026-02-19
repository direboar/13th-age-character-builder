# 13th Age キャラクタービルダー — タスク管理

> 最終更新: 2026-02-18

## 🔴 優先度：高（コア機能）

### 1. SRDデータの正確性検証
- **状態**: 🔲 未着手
- **概要**: 実装済みの種族・クラスのデータをSRDのキャラクター作成ルールと照合し、誤りがないか確認する
- **対象**: `data/races.json`, `data/classes.json`, `data/talents/*.json`, `js/calculator.js`

#### 1-a. キャラクター作成ルールの検証
- [x] 能力値のポイントバイ設定（初期値28ポイント、コスト表）の正確性
- [x] 能力値の上限・下限ルール（最大20、最低8等）
- [x] 種族ボーナスの適用ルール（+2 を1つ、クラスボーナスと同一能力値不可等）
- [x] クラスボーナスの適用ルール
- [x] レベルアップ時の能力値上昇ルール
- [x] HP・AC・PD・MD・イニシアチブ・リカバリーの計算式（`calculator.js`）

#### 1-b. 種族データの検証（`data/races.json`）
- [ ] Human（人間）— 能力値ボーナス、Quick to Fight、Feat
- [ ] Dwarf（ドワーフ）— 能力値ボーナス、That's Your Best Shot?、Feat
- [ ] High Elf（ハイエルフ）— 能力値ボーナス、Highblood Teleport、Feat
- [ ] Wood Elf（ウッドエルフ）— 能力値ボーナス、Elven Grace、Feat
- [ ] Half-Orc（ハーフオーク）— 能力値ボーナス、Lethal、Feat

#### 1-c. クラスデータの検証（`data/classes.json` + `data/talents/`）
- [ ] Fighter（ファイター）— 基本ステータス、クラス特徴、タレント、Feat
- [ ] Cleric（クレリック）— 基本ステータス、クラス特徴、タレント、Feat
- [ ] Druid（ドルイド）— 基本ステータス、クラス特徴、タレント、Feat

### 2. GitHub Pages対応
- **状態**: ✅ 完了
- **概要**: GitHub Pagesで公開可能にする（静的サイトのためビルド不要）
- **公開URL**: `https://direboar.github.io/13th-age-character-builder/`
- **サブタスク**:
  - [x] 2-a. GitHub Pagesの有効化（Settings → Pages → ソース設定）
  - [x] 2-b. デプロイワークフロー作成（`.github/workflows/static.yml`）
  - [x] 2-c. 不要ファイルのデプロイ除外（`tests/`, `fonts/`, `TODO.md`）
  - [x] 2-d. OGP/メタタグ・favicon追加（公開URL用）
  - [x] 2-e. デプロイ確認・全機能テスト

### 3. 言語切り替え機能の完全実装
- **状態**: 🔲 未着手
- **概要**: ヘッダーの🇬🇧/🇯🇵トグルボタンは実装済みだが、各ステップモジュールのテキスト切り替え処理が未実装
- **対象ファイル**: `js/steps/step-race.js`, `step-class.js`, `step-abilities.js`, `step-talents.js`, `step-spells.js`, `step-backgrounds.js`, `step-icons.js`, `step-details.js`, `step-summary.js`
- **作業内容**:
  - [ ] 各ステップのUI文字列をLangモジュール経由で切り替え可能にする
  - [ ] 日本語/英語の翻訳テキストを定義
  - [ ] PDF出力時の言語対応

### 4. 追加クラスのデータ実装
- **状態**: 🔲 未着手
- **概要**: 現在Fighter/Cleric/Druidの3クラスのみ。SRDに記載のある残りクラスを追加
- **対象**: `data/classes/`, `data/talents/`
- **未実装クラス一覧**:
  - [ ] Barbarian（バーバリアン）
  - [ ] Bard（バード）
  - [ ] Chaos Mage（ケイオスメイジ）
  - [ ] Commander（コマンダー）
  - [ ] Monk（モンク）
  - [ ] Necromancer（ネクロマンサー）
  - [ ] Occultist（オカルティスト）
  - [ ] Paladin（パラディン）
  - [ ] Ranger（レンジャー）
  - [ ] Rogue（ローグ）
  - [ ] Sorcerer（ソーサラー）
  - [ ] Wizard（ウィザード）

### 5. 追加種族のデータ実装
- **状態**: 🔲 未着手
- **概要**: 現在Human/Dwarf/High Elf/Wood Elf/Half-Orcの5種族のみ
- **対象**: `data/races.json`
- **未実装種族一覧**:
  - [ ] Dark Elf（ダークエルフ）
  - [ ] Gnome（ノーム）
  - [ ] Half-Elf（ハーフエルフ）
  - [ ] Halfling（ハーフリング）
  - [ ] Dragonic / Dragonspawn（ドラゴニック）
  - [ ] Holy One / Aasimar（ホーリーワン）
  - [ ] Tiefling / Demontouched（ティーフリング）
  - [ ] Forgeborn / Dwarf-forged（フォージボーン）

---

## 🟡 優先度：中（品質向上）

### 5. 種族・クラス選択時の能力値カードへの自動スクロール
- **状態**: 🔲 未着手
- **概要**: 種族またはクラスを選択した際、能力値選択のカードへ自動的にスクロールして選択結果を確認しやすくする
- **対象**: `js/steps/step-race.js`, `js/steps/step-class.js`
- **作業内容**:
  - [ ] 選択イベント後にスムーズスクロールを実行
  - [ ] スクロール先の能力値カードをハイライト表示

### 6. JSONロードのツールバー対応
- **状態**: 🔲 未着手
- **概要**: キャラクターデータのJSONロード機能をヘッダーのツールバー上から実行可能にする
- **対象**: `index.html`, `js/app.js`
- **作業内容**:
  - [ ] ヘッダーにインポートボタンを追加
  - [ ] ファイル選択ダイアログ経由でJSONを読み込み
  - [ ] 読み込み後に各ステップの状態を反映

### 7. Feat選択機能
- **状態**: 🔲 未着手
- **概要**: クラス特徴・タレントのFeatを選択するUIとステート管理。現在PDFでは「☐ 未取得」と表示
- **作業内容**:
  - [ ] CharacterStateにselectedFeatsプロパティを追加
  - [ ] タレント選択画面にFeat選択UIを追加
  - [ ] PDFで取得済み★/未取得☐を切り替え表示

### 8. 呪文/パワー選択の充実
- **状態**: 🔲 未着手
- **概要**: Step 5（呪文/パワー）のデータと選択UIの拡充
- **作業内容**:
  - [ ] クラス毎の呪文/パワーデータをJSON化
  - [ ] 選択UIの実装
  - [ ] PDFへの出力対応

### 9. PDF品質改善
- **状態**: 🔲 未着手
- **概要**: 画像ベースPDF（テキスト選択不可）のレイアウト改善
- **作業内容**:
  - [ ] ページ番号の追加
  - [ ] レイアウトの微調整・余白最適化
  - [ ] PDF生成中の白い画面表示を非表示化

### 10. レスポンシブ対応
- **状態**: 🔲 未着手
- **概要**: モバイル/タブレットでの表示最適化
- **作業内容**:
  - [ ] サイドナビゲーションの折りたたみ対応
  - [ ] ステップコンテンツのモバイルレイアウト
  - [ ] タッチ操作の改善

---

## 🟢 優先度：低（整備・改善）

### 11. CSSリントエラー修正
- **状態**: 🔲 未着手
- **対象**: `css/style.css` L335 — `-webkit-appearance` に標準プロパティ `appearance` も併記

### 12. テストファイルのクリーンアップ
- **状態**: 🔲 未着手
- **概要**: `failure/` フォルダのテスト用PDF削除、`.gitignore`への追加

### 13. キャラクターデータのバリデーション強化
- **状態**: 🔲 未着手
- **概要**: 各ステップの入力チェック改善（バックグラウンドポイント上限、Icon Relationship合計値チェック等）

---

## ✅ 完了済み

- [x] Phase 1 MVP（種族・クラス・能力値・タレント・呪文/パワー・BG・Icon・詳細・完成の9ステップウィザード）
- [x] PDF生成（キャラクターシート + 詳細リファレンス）— html2pdf.jsベース
- [x] 日本語PDF文字化け修正（jsPDF → html2pdf.js切り替え）
- [x] PDF途切れ問題修正（scrollHeight明示指定 + 可視div方式）
- [x] 未取得Feat表示問題修正（☐マーク + 「未取得」ラベル）
- [x] 計算式パネル（Step 3に📐計算式詳細を追加）
- [x] 言語切り替えボタン（ヘッダーに🇬🇧/🇯🇵トグル配置）
