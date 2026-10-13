# Editor.js 練習計畫

目標：搞懂 Editor.js「怎麼運作」，並親手寫出自己的 Block / Inline Tool / Tune。
每階段約 1～2 小時，**程式碼請自己寫**，這份文件只給題目、觀察點與完成標準。

```bash
npm run dev
```

---

## 先建立心智模型（讀完再動手）

| 傳統 WYSIWYG（TinyMCE、CKEditor 4） | Editor.js |
|---|---|
| 整份文件一個大 `contenteditable` | **每個 block 各自**是一個 contenteditable |
| 輸出一坨 HTML | 輸出**乾淨的 JSON**：`{ time, blocks: [{ id, type, data }], version }` |
| 外掛去改 HTML | 每個 block 由一個 **Tool（class）** 負責：`render()` 產 DOM、`save()` 把 DOM 收回成 `data` |

三種擴充點，後面各練一次：

- **Block Tool**：一種 block（段落、標題、圖片…）—— `render()` / `save()`
- **Inline Tool**：選取文字後的工具列按鈕（粗體、連結…）—— `surround(range)`
- **Block Tune**：block 右側「⋮⋮」選單裡的設定（對齊、刪除…）—— `wrap()` / `save()`

核心循環：**`data` → Tool.render() → 使用者編輯 DOM → Tool.save() → `data`**。
整個練習都是在親手體會這個循環。

文件：<https://editorjs.io/base-concepts/>、<https://editorjs.io/creating-a-block-tool/>

---

## 階段 0：跑起來、讀懂 JSON（已建好起點）

`src/main.js` 已有最小編輯器 + 左右對照的 JSON 面板。

- [ ] 輸入幾段文字、加標題、加清單，按 `save()`，逐欄看懂輸出
- [ ] 把段落文字加粗、加斜體，看 `data.text` 裡變成什麼（提示：inline 格式仍是 HTML 字串）
- [ ] 手改右側 JSON（改 level、刪一個 block、改 type 成不存在的值）再 `render()`，觀察結果
- [ ] DevTools 打開 Elements，看一個 block 的 DOM 結構：`.ce-block` > `.ce-block__content` > tool 的元素

**思考題**：`id` 是誰產生的？`render()` 後 id 會變嗎？不認得的 `type` 被怎麼處理？

---

## 階段 1：設定與官方工具

- [ ] 安裝並掛上 `@editorjs/quote`、`@editorjs/delimiter`、`@editorjs/code`、`@editorjs/table`
- [ ] 每個 tool 改用完整設定物件：`{ class, inlineToolbar, shortcut, config }`
  - 讓 header 只能選 H2/H3（`config.levels`）、預設 H2
  - 給 quote 指定 `shortcut: 'CMD+SHIFT+O'`
- [ ] 限制只有 paragraph 能用 inline toolbar，其他 block 不行
- [ ] 改 `defaultBlock`、試 `autofocus`、`minHeight`
- [ ] 用 `i18n` 把工具箱、選單翻成中文

**完成標準**：能說出「全域設定」和「單一 tool 設定」各放哪、誰優先。

---

## 階段 2：資料生命週期與 API

- [ ] **自動儲存**：`onChange` 裡 debounce 300ms 後 `save()` 寫入 `localStorage`；重整頁面能還原
- [ ] 印出 `onChange` 的 `event`，分別觸發新增 / 刪除 / 移動 / 修改，記下 `event.type` 與 `event.detail`
- [ ] 加一顆「唯讀切換」按鈕：`editor.readOnly.toggle()`
- [ ] 在 console 用 Blocks API：`insert()`、`delete()`、`move()`、`getBlockByIndex()`、`clear()`
- [ ] 試 `editor.destroy()` 後再 new 一個（之後接 React/Vue 時這是必考題）

**思考題**：`onChange` 時 DOM 已改了，但 JSON 還沒 —— 為什麼 Editor.js 不直接把 data 給你？
（提示：`save()` 是 async，要呼叫每個 tool 的 `save()`）

---

## 階段 3：自製 Block Tool ★ 重點

題目：**Callout（提示框）**——一個 emoji + 一段文字，有 info / warning 兩種樣式。

建議放 `src/tools/callout.js`。依序實作、每一步都存檔觀察：

1. [ ] `static get toolbox()` → 出現在 + 選單
2. [ ] `constructor({ data, api, config, readOnly })` + `render()` → 能新增出來
3. [ ] `save(blockContent)` → JSON 出現 `{ emoji, text, variant }`
4. [ ] 用 `data` 還原：手寫 JSON `render()` 回去能正確顯示
5. [ ] `validate(savedData)` → 空的 callout 不輸出
6. [ ] `static get sanitize()` → 只允許 `<b><i><a>`
7. [ ] `static get isReadOnlySupported()` → 階段 2 的唯讀切換也能正常
8. [ ] `renderSettings()` → 在 ⋮⋮ 選單切換 info / warning
9. [ ] `static get conversionConfig()` → 能和 paragraph 互轉
10. [ ] `static get pasteConfig()` + `onPaste()` → 貼上以 `💡` 開頭的文字自動變 callout（加分）

**完成標準**：不看文件說得出 render / save / validate / sanitize 各在什麼時機被呼叫。
（做法：每個方法第一行 `console.log`，操作一輪看順序。）

---

## 階段 4：自製 Inline Tool

題目：**螢光筆 `<mark>`**

- [ ] `static get isInline()`、`render()` 回傳按鈕
- [ ] `surround(range)`：沒包就包 `<mark>`、已包就拆掉
- [ ] `checkState()`：選到已標記文字時按鈕呈 active
- [ ] `static get sanitize()`：記得允許 `mark`，否則 save 後消失（先故意不加，觀察它被吃掉）
- [ ] `static get shortcut()`

**思考題**：為什麼 inline tool 要自己宣告 sanitize？是誰在清？

---

## 階段 5：自製 Block Tune

題目：**對齊（左 / 中 / 右）**，掛到 paragraph、header、callout。

- [ ] `static get isTune()`、`render()` 產生三個按鈕
- [ ] `wrap(blockContent)`：包一層並套用對齊
- [ ] `save()`：看 JSON 裡 tune 資料出現在哪（提示：`tunes` 欄位，不在 `data` 裡）
- [ ] 用 `tunes: ['alignment']` 全域掛 vs 在單一 tool 掛，比較差異

---

## 階段 6：輸出端——JSON 怎麼變成網頁

Editor.js 只管「編輯」，**前台顯示要自己寫**。這階段最貼近實務。

- [ ] 寫 `src/renderer.js`：`blocks → HTML` 字串，支援目前所有 type（含自製的 callout、alignment tune）
- [ ] 遇到未知 type 時的策略（略過？顯示警告？）
- [ ] 加第三欄「前台預覽」即時顯示
- [ ] （加分，接上工作棧）寫一個 Laravel endpoint：接收 JSON → 後端再 sanitize / 驗證 schema → 存 DB → Blade 渲染。
      思考：前端 sanitize 了，後端為什麼還要再做一次？

---

## 階段 7：進階挑戰（挑有興趣的）

- [ ] `@editorjs/image` + 自訂 `uploader.uploadByFile`（先用 `URL.createObjectURL` 假上傳，再接真 API）
- [ ] 包成 React 元件：處理 StrictMode 雙重 mount、`isReady` 前就 `destroy` 的問題
- [ ] 加 undo/redo（`editorjs-undo`）與拖曳排序（`editorjs-drag-drop`），觀察它們如何掛 `onReady`
- [ ] 讀原始碼：`src/components/modules/saver.ts` 看 `save()` 如何逐一呼叫 tool、`sanitizer` 何時介入
- [ ] 把 callout 改寫成 TypeScript，用 `@editorjs/editorjs` 提供的 `BlockTool` 型別

---

## 建議節奏

| 天 | 內容 |
|---|---|
| 1 | 心智模型 + 階段 0、1 |
| 2 | 階段 2 |
| 3–4 | 階段 3（最花時間也最有收穫） |
| 5 | 階段 4、5 |
| 6 | 階段 6 |
| 之後 | 階段 7 自選 |

每完成一階段 commit 一次，commit message 寫下「這階段最意外的一件事」——之後回看最有用。
