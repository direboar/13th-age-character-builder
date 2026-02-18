/**
 * step-race.js — Step 1: 種族選択
 */

const StepRace = (() => {
    let racesData = null;

    /**
     * 種族データを読み込む
     */
    const loadData = async () => {
        if (racesData) return racesData;
        const response = await fetch('data/races.json');
        racesData = await response.json();
        return racesData;
    };

    /**
     * 種族アイコンを返す
     */
    const getRaceIcon = (raceId) => {
        const icons = {
            'human': '👤',
            'dwarf': '⛏️',
            'high-elf': '✨',
            'wood-elf': '🌿',
            'half-orc': '⚔️',
        };
        return icons[raceId] || '🎭';
    };

    /**
     * ステップを描画する
     */
    const render = async () => {
        const races = await loadData();
        const character = CharacterState.get();
        const selectedRace = character.race;

        const html = `
      <div class="step-content">
        <h2 class="section-title">種族を選択</h2>
        <p class="section-description">
          キャラクターの種族を選択してください。種族によって能力値ボーナス（+2）と種族特殊能力が決まります。
          13th Ageでは種族がクラス選択を制限することはありません。
        </p>

        <div class="selection-grid" id="raceGrid">
          ${races.map(race => `
            <div class="selection-card ${selectedRace === race.id ? 'selected' : ''}"
                 onclick="StepRace.selectRace('${race.id}')"
                 id="raceCard_${race.id}">
              <div class="selection-indicator">${selectedRace === race.id ? '✓' : ''}</div>
              <span class="card-icon">${getRaceIcon(race.id)}</span>
              <div class="card-name">${race.name}</div>
              <div class="card-name-ja">${race.nameJa}</div>
              <div class="card-bonus">能力値ボーナス: ${race.abilityBonusNoteJa}</div>
            </div>
          `).join('')}
        </div>

        ${selectedRace ? renderRaceDetail(races.find(r => r.id === selectedRace), character) : ''}
      </div>
    `;

        return html;
    };

    /**
     * 選択した種族の詳細を描画する
     */
    const renderRaceDetail = (race, character) => {
        if (!race) return '';

        const selectedBonus = character.racialAbilityBonus;

        return `
      <div class="detail-panel" id="raceDetail">
        <div class="detail-panel-title">
          ${getRaceIcon(race.id)} ${race.name} <span class="text-secondary text-sm">（${race.nameJa}）</span>
        </div>

        <!-- 能力値ボーナス選択 -->
        <div class="mb-4">
          <label>能力値ボーナス（+2）を付与する能力値を選択</label>
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
            ${race.abilityBonus.map(ability => `
              <button class="btn btn-sm ${selectedBonus === ability ? 'btn-primary' : 'btn-secondary'}"
                      onclick="StepRace.selectAbilityBonus('${ability}')">
                ${getAbilityName(ability)}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- 種族特殊能力 -->
        <div class="rule-box">
          <div class="rule-box-title">種族特殊能力: ${race.racialPower.nameJa}</div>
          <div class="rule-box-content">${race.racialPower.descriptionJa}</div>
          <div class="rule-box-content-en">${race.racialPower.name}: ${race.racialPower.description}</div>
        </div>

        <!-- Feat -->
        ${race.racialPower.feats && race.racialPower.feats.length > 0 ? `
          <div class="feat-list mt-4">
            <div class="text-sm text-secondary mb-2">Feat（将来のレベルアップで取得可能）:</div>
            ${race.racialPower.feats.map(feat => `
              <div class="feat-item">
                <span class="feat-tier feat-tier-${feat.tier}">${getTierName(feat.tier)}</span>
                <span class="feat-text">${feat.descriptionJa}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- 種族Feat -->
        ${race.racialFeats && race.racialFeats.length > 0 ? `
          <div class="mt-4">
            <div class="text-sm text-secondary mb-2">種族Feat:</div>
            ${race.racialFeats.map(feat => `
              <div class="rule-box mt-2">
                <div class="rule-box-title">${feat.nameJa} <span class="feat-tier feat-tier-${feat.tier}" style="margin-left:8px">${getTierName(feat.tier)}</span></div>
                <div class="rule-box-content">${feat.descriptionJa}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
    };

    /**
     * 能力値の日本語名を返す
     */
    const getAbilityName = (ability) => {
        const names = {
            STR: '筋力', CON: '耐久力', DEX: '敏捷力',
            INT: '知力', WIS: '判断力', CHA: '魅力'
        };
        return `${names[ability]}（${ability}）`;
    };

    /**
     * Tierの日本語名を返す
     */
    const getTierName = (tier) => {
        const names = {
            adventurer: '冒険者', champion: '勇者', epic: '英雄'
        };
        return names[tier] || tier;
    };

    /**
     * 種族を選択する
     */
    const selectRace = async (raceId) => {
        const races = await loadData();
        const race = races.find(r => r.id === raceId);
        if (!race) return;

        // 種族が変わった場合はボーナス選択をリセット
        const current = CharacterState.get();
        const racialAbilityBonus = race.abilityBonus.length === 1
            ? race.abilityBonus[0]
            : (current.race === raceId ? current.racialAbilityBonus : null);

        CharacterState.update({
            race: raceId,
            racialAbilityBonus,
        });

        // ヘッダーを更新
        document.getElementById('summaryRace').textContent = race.nameJa;

        // 再描画
        const container = document.getElementById('stepContainer');
        container.innerHTML = await render();
    };

    /**
     * 能力値ボーナスを選択する
     */
    const selectAbilityBonus = (ability) => {
        CharacterState.update({ racialAbilityBonus: ability });

        // ボタンの状態を更新
        const character = CharacterState.get();
        const race = racesData?.find(r => r.id === character.race);
        if (race) {
            race.abilityBonus.forEach(ab => {
                const btn = document.querySelector(`button[onclick="StepRace.selectAbilityBonus('${ab}')"]`);
                if (btn) {
                    btn.className = `btn btn-sm ${ab === ability ? 'btn-primary' : 'btn-secondary'}`;
                }
            });
        }
    };

    /**
     * バリデーション: 次のステップに進めるか確認
     */
    const validate = () => {
        const character = CharacterState.get();
        if (!character.race) {
            app.showToast('種族を選択してください', 'error');
            return false;
        }
        if (!character.racialAbilityBonus) {
            app.showToast('能力値ボーナスを付与する能力値を選択してください', 'error');
            return false;
        }
        return true;
    };

    return { render, selectRace, selectAbilityBonus, validate };
})();
