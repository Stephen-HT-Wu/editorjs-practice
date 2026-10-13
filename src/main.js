import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';

// 階段 0 的起點：最小可跑的編輯器 + 左右對照的 JSON。
// 之後每個階段都在這個檔案（或拆出 src/tools/*）上往下加。

const output = document.getElementById('output');

const editor = new EditorJS({
  holder: 'editor',
  placeholder: '按 Tab 或點左邊的 + 叫出工具箱…',
  tools: {
    header: Header,
    list: List,
  },
  data: {
    blocks: [
      { type: 'header', data: { text: 'Hello Editor.js', level: 2 } },
      { type: 'paragraph', data: { text: '每一段都是一個 <b>block</b>，試著改我，然後按 save()。' } },
    ],
  },
  onChange: async (api, event) => {
    // 階段 2 會回來研究這裡：event 是什麼？能拿到哪個 block？
    console.log('onChange', event);
  },
});

await editor.isReady;
console.log('editor ready');

document.getElementById('save').addEventListener('click', async () => {
  const data = await editor.save();
  output.value = JSON.stringify(data, null, 2);
});

document.getElementById('render').addEventListener('click', async () => {
  await editor.render(JSON.parse(output.value));
});

// 方便在 DevTools console 直接玩 API：window.editor.blocks.getBlocksCount() 等
window.editor = editor;
