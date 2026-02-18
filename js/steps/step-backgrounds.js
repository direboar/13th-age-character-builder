/**
 * step-backgrounds.js — Step 6: バックグラウンド入力
 */

const StepBackgrounds = (() => {
    const MAX_POINTS = 8;
    const MAX_SINGLE = 5;

    const render = async () => {
        const character = CharacterState.get();
        const backgrounds = character.backgrounds;
        const totalUsed = Calculator.getTotalBackgroundPoints(backgrounds);
        const remaining = MAX_POINTS - totalUsed;

        const html = `
      <div class="step-content">
        <h2 class="section-title">バックグラウンド</h2>
        <p class="section-description">
          キャラクターの過去の経歴（バックグラウンド）を設定してください。
          合計8ポイントを自由に配分できます。1つのバックグラウンドに最大5ポイントまで割り当てられます。
          バックグラウンドは技能判定の際にボーナスとして使用されます。
        </p>

        <div class="points-remaining mb-4">
          <div class="points-remaining-value ${remaining < 0 ? 'over' : ''}" id="bgPointsRemaining">${remaining}</div>
          <div class="points-remaining-label">残りポイント / ${MAX_POINTS}</div>
        </div>

        <div class="background-list" id="backgroundList">
          ${backgrounds.map((bg, i) => renderBackgroundItem(bg, i, remaining)).join('')}
        </div>

        <button class="btn btn-secondary mt-4" onclick="StepBackgrounds.addBackground()">
          + バックグラウンドを追加
        </button>

        <div class="rule-box mt-6">
          <div class="rule-box-title">バックグラウンドの使い方</div>
          <div class="rule-box-content">
バックグラウンドは、そのキャラクターが過去に経験したことを表します。
例: 「傭兵騎士（3）」「農村出身の薬草師（2）」「海賊船の航海士（3）」

技能判定の際、GMが関連すると判断した場合にd20に加算できます。
1つのバックグラウンドに最大5ポイント、合計8ポイントまで配分できます。</div>
        </div>
      </div>
    `;

        return html;
    };

    const renderBackgroundItem = (bg, index, remaining) => {
        return `
      <div class="background-item" id="bgItem_${index}">
        <input type="text" class="background-input" placeholder="バックグラウンド名を入力..."
               value="${bg.name || ''}"
               onchange="StepBackgrounds.updateName(${index}, this.value)"
               oninput="StepBackgrounds.updateName(${index}, this.value)">
        <div class="background-points">
          <button class="points-btn" onclick="StepBackgrounds.adjustPoints(${index}, -1)">−</button>
          <div class="points-display" id="bgPoints_${index}">${bg.points || 0}</div>
          <button class="points-btn" onclick="StepBackgrounds.adjustPoints(${index}, 1)">+</button>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="StepBackgrounds.removeBackground(${index})"
                style="color:var(--color-text-muted);">✕</button>
      </div>
    `;
    };

    const updateName = (index, name) => {
        const character = CharacterState.get();
        const bg = character.backgrounds[index];
        CharacterState.updateBackground(index, name, bg ? bg.points : 0);
    };

    const adjustPoints = (index, delta) => {
        const character = CharacterState.get();
        const bg = character.backgrounds[index];
        const currentPoints = bg ? bg.points : 0;
        const newPoints = Math.max(0, Math.min(MAX_SINGLE, currentPoints + delta));

        const totalOther = Calculator.getTotalBackgroundPoints(character.backgrounds) - currentPoints;
        if (totalOther + newPoints > MAX_POINTS) {
            app.showToast(`合計${MAX_POINTS}ポイントを超えることはできません`, 'error');
            return;
        }

        CharacterState.updateBackground(index, bg ? bg.name : '', newPoints);

        // UI更新
        const pointsDisplay = document.getElementById(`bgPoints_${index}`);
        if (pointsDisplay) pointsDisplay.textContent = newPoints;

        const remaining = MAX_POINTS - Calculator.getTotalBackgroundPoints(CharacterState.get().backgrounds);
        const remainingDisplay = document.getElementById('bgPointsRemaining');
        if (remainingDisplay) {
            remainingDisplay.textContent = remaining;
            remainingDisplay.className = `points-remaining-value ${remaining < 0 ? 'over' : ''}`;
        }
    };

    const addBackground = async () => {
        CharacterState.addBackground();
        const container = document.getElementById('stepContainer');
        container.innerHTML = await render();
    };

    const removeBackground = async (index) => {
        CharacterState.removeBackground(index);
        const container = document.getElementById('stepContainer');
        container.innerHTML = await render();
    };

    const validate = () => {
        const character = CharacterState.get();
        const total = Calculator.getTotalBackgroundPoints(character.backgrounds);
        if (total > MAX_POINTS) {
            app.showToast(`バックグラウンドポイントが${total - MAX_POINTS}pt超過しています`, 'error');
            return false;
        }
        return true;
    };

    return { render, updateName, adjustPoints, addBackground, removeBackground, validate };
})();
