/**
 * step-talents.js — Step 4: タレント選択
 */

const StepTalents = (() => {
    let talentsData = null;

    const loadData = async (classId) => {
        if (talentsData && talentsData.classId === classId) return talentsData;
        try {
            const response = await fetch(`data/talents/${classId}.json`);
            talentsData = await response.json();
            return talentsData;
        } catch (e) {
            console.error('タレントデータの読み込みエラー:', e);
            return null;
        }
    };

    const getTierName = (tier) => {
        const names = { adventurer: '冒険者', champion: '勇者', epic: '英雄' };
        return names[tier] || tier;
    };

    const render = async () => {
        const character = CharacterState.get();
        const classId = character.class;

        if (!classId) {
            return `<div class="step-content"><p class="text-secondary">先にクラスを選択してください。</p></div>`;
        }

        const data = await loadData(classId);
        const classData = await StepClass.getClassData(classId);
        const maxTalents = classData ? classData.talentCount : 3;
        const selectedCount = character.selectedTalents.length;

        const html = `
      <div class="step-content">
        <h2 class="section-title">タレントを選択</h2>
        <p class="section-description">
          クラスの特殊能力（タレント）を選択してください。各タレントはキャラクターの戦闘スタイルや能力を特化させます。
        </p>

        <div class="talent-selection-counter">
          <span class="counter-label">選択数</span>
          <span class="counter-value" id="talentCounter">${selectedCount} / ${maxTalents}</span>
        </div>

        ${data && data.talents ? `
          <div class="talent-grid">
            ${data.talents.map(talent => renderTalentCard(talent, character, maxTalents)).join('')}
          </div>
        ` : `<p class="text-secondary">このクラスのタレントデータはまだ準備中です。</p>`}

        <!-- Fighterの場合はマニューバも表示 -->
        ${classId === 'fighter' && data && data.maneuvers ? `
          <div class="mt-6">
            <h3 class="section-title" style="font-size: 1.25rem;">マニューバ（Flexible Attacks）</h3>
            <p class="section-description">
              ファイターのマニューバはダイスの出目に応じて自動的に発動します。
              1レベルのマニューバはすべて自動的に利用可能です。
            </p>
            <div class="talent-grid">
              ${data.maneuvers.level1.map(m => renderManeuverCard(m)).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

        return html;
    };

    const renderTalentCard = (talent, character, maxTalents) => {
        const isSelected = character.selectedTalents.includes(talent.id);
        const isDisabled = !isSelected && character.selectedTalents.length >= maxTalents;

        return `
      <div class="talent-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}"
           onclick="StepTalents.toggleTalent('${talent.id}', ${maxTalents})"
           style="${isDisabled ? 'opacity:0.5; cursor:not-allowed;' : ''}">
        <div class="talent-header">
          <div>
            <div class="talent-name">${talent.name}</div>
            <div class="talent-name-ja">${talent.nameJa}</div>
          </div>
          <div class="talent-checkbox">${isSelected ? '✓' : ''}</div>
        </div>
        <div class="talent-description">${talent.descriptionJa}</div>
        <div class="rule-box-content-en" style="margin-top:8px; font-size:0.75rem; color:var(--color-text-muted); border-top:1px solid var(--color-border); padding-top:8px;">${talent.description}</div>

        ${talent.feats && talent.feats.length > 0 ? `
          <div class="feat-list mt-3">
            ${talent.feats.map(feat => `
              <div class="feat-item">
                <span class="feat-tier feat-tier-${feat.tier}">${getTierName(feat.tier)}</span>
                <span class="feat-text">${feat.descriptionJa}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${talent.subOptions ? `
          <div class="mt-3">
            <div class="text-xs text-muted mb-2">サブオプション:</div>
            ${talent.subOptions.map(sub => `
              <div class="rule-box mt-2">
                <div class="rule-box-title">${sub.nameJa}</div>
                <div class="rule-box-content">${sub.descriptionJa}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
    };

    const renderManeuverCard = (maneuver) => {
        return `
      <div class="talent-card" style="cursor:default; border-color: var(--color-border-gold);">
        <div class="talent-header">
          <div>
            <div class="talent-name">${maneuver.name}</div>
            <div class="talent-name-ja">${maneuver.nameJa}</div>
          </div>
          <span class="badge badge-gold">${maneuver.triggerJa}</span>
        </div>
        <div class="talent-description">${maneuver.effectJa}</div>
        <div class="rule-box-content-en" style="margin-top:8px; font-size:0.75rem; color:var(--color-text-muted); border-top:1px solid var(--color-border); padding-top:8px;">Trigger: ${maneuver.trigger} — ${maneuver.effect}</div>
      </div>
    `;
    };

    const toggleTalent = (talentId, maxTalents) => {
        const success = CharacterState.toggleTalent(talentId, maxTalents);
        if (!success) {
            app.showToast(`タレントは最大${maxTalents}つまで選択できます`, 'error');
            return;
        }

        const character = CharacterState.get();
        const counter = document.getElementById('talentCounter');
        if (counter) {
            counter.textContent = `${character.selectedTalents.length} / ${maxTalents}`;
        }

        // カードの状態を更新
        const card = document.querySelector(`[onclick="StepTalents.toggleTalent('${talentId}', ${maxTalents})"]`);
        if (card) {
            const isSelected = character.selectedTalents.includes(talentId);
            card.classList.toggle('selected', isSelected);
            const checkbox = card.querySelector('.talent-checkbox');
            if (checkbox) checkbox.textContent = isSelected ? '✓' : '';
        }
    };

    const validate = () => {
        const character = CharacterState.get();
        const classId = character.class;
        if (!classId) return true;

        // タレント選択は任意（0でも進める）
        return true;
    };

    return { render, toggleTalent, validate };
})();
