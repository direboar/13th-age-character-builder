/**
 * step-details.js — Step 8: キャラクター詳細情報
 */

const StepDetails = (() => {
    const render = async () => {
        const character = CharacterState.get();

        const html = `
      <div class="step-content">
        <h2 class="section-title">キャラクター詳細</h2>
        <p class="section-description">
          キャラクターの名前、One Unique Thing（唯一無二の特徴）、装備などを設定してください。
        </p>

        <!-- キャラクター名 -->
        <div class="mb-6">
          <label for="charName">キャラクター名</label>
          <input type="text" id="charName" placeholder="キャラクターの名前を入力..."
                 value="${character.name || ''}"
                 oninput="StepDetails.updateName(this.value)">
        </div>

        <!-- One Unique Thing -->
        <div class="mb-6">
          <label for="oneUniqueThing">One Unique Thing（唯一無二の特徴）</label>
          <p class="text-xs text-muted mb-2">
            このキャラクターだけが持つ、世界で唯一の特徴を記述してください。
            ゲームメカニクスには影響しませんが、キャラクターのロールプレイに深みを与えます。
          </p>
          <textarea id="oneUniqueThing" rows="3"
                    placeholder="例: 私は竜の血を引く唯一の人間で、夢の中でドラゴンと会話できる..."
                    oninput="StepDetails.updateOUT(this.value)">${character.oneUniqueThing || ''}</textarea>
        </div>

        <!-- 装備 -->
        <div class="mb-6">
          <h3 style="font-family:var(--font-heading); color:var(--color-gold-primary); font-size:1rem; margin-bottom:12px;">装備</h3>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
            <div>
              <label for="meleeWeapon">近接武器</label>
              <input type="text" id="meleeWeapon" placeholder="例: ロングソード"
                     value="${character.equipment?.meleeWeapon || ''}"
                     oninput="StepDetails.updateEquipment('meleeWeapon', this.value)">
            </div>
            <div>
              <label for="rangedWeapon">遠距離武器</label>
              <input type="text" id="rangedWeapon" placeholder="例: ショートボウ"
                     value="${character.equipment?.rangedWeapon || ''}"
                     oninput="StepDetails.updateEquipment('rangedWeapon', this.value)">
            </div>
          </div>
        </div>

        <!-- データ管理 -->
        <div class="rule-box">
          <div class="rule-box-title">データ管理</div>
          <div style="display:flex; gap:12px; margin-top:8px; flex-wrap:wrap;">
            <button class="btn btn-secondary btn-sm" onclick="CharacterState.exportJSON()">
              💾 JSONとして保存
            </button>
            <button class="btn btn-secondary btn-sm" onclick="StepDetails.importJSON()">
              📂 JSONから読み込み
            </button>
          </div>
          <input type="file" id="jsonImportInput" accept=".json" style="display:none"
                 onchange="StepDetails.handleImport(this)">
        </div>
      </div>
    `;

        return html;
    };

    const updateName = (name) => {
        CharacterState.update({ name });
        const summaryName = document.getElementById('summaryName');
        if (summaryName) summaryName.textContent = name || '—';
    };

    const updateOUT = (text) => {
        CharacterState.update({ oneUniqueThing: text });
    };

    const updateEquipment = (field, value) => {
        const character = CharacterState.get();
        const equipment = { ...character.equipment, [field]: value };
        CharacterState.update({ equipment });
    };

    const importJSON = () => {
        document.getElementById('jsonImportInput')?.click();
    };

    const handleImport = (input) => {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const success = CharacterState.importJSON(e.target.result);
            if (success) {
                app.showToast('キャラクターを読み込みました', 'info');
                const container = document.getElementById('stepContainer');
                container.innerHTML = await render();
            } else {
                app.showToast('ファイルの読み込みに失敗しました', 'error');
            }
        };
        reader.readAsText(file);
    };

    const validate = () => {
        const character = CharacterState.get();
        if (!character.name || character.name.trim() === '') {
            app.showToast('キャラクター名を入力してください', 'error');
            return false;
        }
        return true;
    };

    return { render, updateName, updateOUT, updateEquipment, importJSON, handleImport, validate };
})();
