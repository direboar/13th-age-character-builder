/**
 * step-class.js — Step 2: クラス選択
 */

const StepClass = (() => {
    let classesData = null;

    const loadData = async () => {
        if (classesData) return classesData;
        const response = await fetch('data/classes.json');
        classesData = await response.json();
        return classesData;
    };

    const getClassIcon = (classId) => {
        const icons = {
            'fighter': '⚔️',
            'cleric': '✝️',
            'druid': '🌿',
            'barbarian': '🪓',
            'bard': '🎵',
            'ranger': '🏹',
            'rogue': '🗡️',
            'wizard': '🔮',
            'sorcerer': '⚡',
            'paladin': '🛡️',
        };
        return icons[classId] || '⚔️';
    };

    const render = async () => {
        const classes = await loadData();
        const character = CharacterState.get();
        const selectedClass = character.class;

        const html = `
      <div class="step-content">
        <h2 class="section-title">クラスを選択</h2>
        <p class="section-description">
          キャラクターのクラスを選択してください。クラスによって能力値ボーナス（+2）、基本ステータス、タレント数が決まります。
          現在はFighter、Cleric、Druidが利用可能です。
        </p>

        <div class="selection-grid" id="classGrid">
          ${classes.map(cls => `
            <div class="selection-card ${selectedClass === cls.id ? 'selected' : ''}"
                 onclick="StepClass.selectClass('${cls.id}')"
                 id="classCard_${cls.id}">
              <div class="selection-indicator">${selectedClass === cls.id ? '✓' : ''}</div>
              <span class="card-icon">${getClassIcon(cls.id)}</span>
              <div class="card-name">${cls.name}</div>
              <div class="card-name-ja">${cls.nameJa}</div>
              <div class="card-description">${cls.descriptionJa}</div>
              <div class="card-bonus mt-2">能力値ボーナス: ${cls.abilityBonusNoteJa}</div>
              <div class="stat-grid mt-4" style="grid-template-columns: repeat(4, 1fr); gap: 6px;">
                <div class="stat-box" style="padding: 6px;">
                  <div class="stat-label" style="font-size:0.6rem">HP基本値</div>
                  <div class="stat-value" style="font-size:1rem">${cls.baseHP}</div>
                </div>
                <div class="stat-box" style="padding: 6px;">
                  <div class="stat-label" style="font-size:0.6rem">AC基本値</div>
                  <div class="stat-value" style="font-size:1rem">${cls.baseAC}</div>
                </div>
                <div class="stat-box" style="padding: 6px;">
                  <div class="stat-label" style="font-size:0.6rem">回復ダイス</div>
                  <div class="stat-value" style="font-size:1rem">${cls.recoveryDie}</div>
                </div>
                <div class="stat-box" style="padding: 6px;">
                  <div class="stat-label" style="font-size:0.6rem">タレント数</div>
                  <div class="stat-value" style="font-size:1rem">${cls.talentCount}</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        ${selectedClass ? renderClassDetail(classes.find(c => c.id === selectedClass), character) : ''}
      </div>
    `;

        return html;
    };

    const renderClassDetail = (cls, character) => {
        if (!cls) return '';

        const selectedBonus = character.classAbilityBonus;

        return `
      <div class="detail-panel" id="classDetail">
        <div class="detail-panel-title">
          ${getClassIcon(cls.id)} ${cls.name} <span class="text-secondary text-sm">（${cls.nameJa}）</span>
        </div>

        <!-- 能力値ボーナス選択 -->
        <div class="mb-4">
          <label>クラス能力値ボーナス（+2）を付与する能力値を選択</label>
          <p class="text-xs text-muted mb-2">※種族ボーナスと異なる能力値を選択してください</p>
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
            ${cls.abilityBonus.map(ability => {
            const isRacialBonus = character.racialAbilityBonus === ability;
            return `
                <button class="btn btn-sm ${selectedBonus === ability ? 'btn-primary' : 'btn-secondary'} ${isRacialBonus ? 'btn-ghost' : ''}"
                        onclick="StepClass.selectAbilityBonus('${ability}')"
                        ${isRacialBonus ? 'title="種族ボーナスと同じ能力値は選択できません"' : ''}>
                  ${getAbilityName(ability)}${isRacialBonus ? ' ⚠️' : ''}
                </button>
              `;
        }).join('')}
          </div>
        </div>

        <!-- クラス特徴 -->
        ${cls.classFeatures && cls.classFeatures.length > 0 ? `
          <div class="mb-4">
            <div class="text-sm text-secondary mb-2" style="font-weight:600">クラス特徴:</div>
            ${cls.classFeatures.map(feature => `
              <div class="rule-box mt-2">
                <div class="rule-box-title">${feature.nameJa}</div>
                <div class="rule-box-content">${feature.descriptionJa}</div>
                <div class="rule-box-content-en">${feature.name}: ${feature.description}</div>
                ${feature.feats ? `
                  <div class="feat-list mt-3">
                    ${feature.feats.map(feat => `
                      <div class="feat-item">
                        <span class="feat-tier feat-tier-${feat.tier}">${getTierName(feat.tier)}</span>
                        <span class="feat-text">${feat.descriptionJa}</span>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- 基本攻撃 -->
        <div class="rule-box">
          <div class="rule-box-title">基本攻撃</div>
          <div class="rule-box-content">
近接攻撃: ${cls.meleeAttack ? `${cls.meleeAttack.ability === 'STR_OR_DEX' ? '【筋力】または【敏捷力】' : getAbilityName(cls.meleeAttack.ability)}+レベル vs AC / 命中: ${cls.meleeAttack.damageFormula} / 外れ: ${cls.meleeAttack.miss}` : '—'}
遠距離攻撃: ${cls.rangedAttack ? `【敏捷力】+レベル vs AC / 命中: ${cls.rangedAttack.damageFormula} / 外れ: ${cls.rangedAttack.miss}` : '—'}
          </div>
        </div>

        <!-- 装備可能なアーマー -->
        <div class="mt-3 text-sm text-secondary">
          装備可能アーマー: ${(cls.armorAllowed || []).map(a => getArmorName(a)).join('、')}
        </div>
      </div>
    `;
    };

    const getAbilityName = (ability) => {
        const names = {
            STR: '筋力', CON: '耐久力', DEX: '敏捷力',
            INT: '知力', WIS: '判断力', CHA: '魅力'
        };
        return `${names[ability]}（${ability}）`;
    };

    const getTierName = (tier) => {
        const names = { adventurer: '冒険者', champion: '勇者', epic: '英雄' };
        return names[tier] || tier;
    };

    const getArmorName = (armor) => {
        const names = { light: '軽装鎧', heavy: '重装鎧', shield: '盾', none: 'なし' };
        return names[armor] || armor;
    };

    const selectClass = async (classId) => {
        const classes = await loadData();
        const cls = classes.find(c => c.id === classId);
        if (!cls) return;

        const current = CharacterState.get();
        const classAbilityBonus = cls.abilityBonus.length === 1
            ? cls.abilityBonus[0]
            : (current.class === classId ? current.classAbilityBonus : null);

        CharacterState.update({
            class: classId,
            classAbilityBonus,
            selectedTalents: [], // クラスが変わったらタレントをリセット
            selectedSpells: [],
        });

        document.getElementById('summaryClass').textContent = cls.nameJa;

        const container = document.getElementById('stepContainer');
        container.innerHTML = await render();
    };

    const selectAbilityBonus = (ability) => {
        const character = CharacterState.get();
        if (character.racialAbilityBonus === ability) {
            app.showToast('種族ボーナスと同じ能力値は選択できません', 'error');
            return;
        }
        CharacterState.update({ classAbilityBonus: ability });

        // ボタン状態更新
        const cls = classesData?.find(c => c.id === character.class);
        if (cls) {
            cls.abilityBonus.forEach(ab => {
                const btn = document.querySelector(`button[onclick="StepClass.selectAbilityBonus('${ab}')"]`);
                if (btn) {
                    btn.className = `btn btn-sm ${ab === ability ? 'btn-primary' : 'btn-secondary'}`;
                }
            });
        }
    };

    const validate = () => {
        const character = CharacterState.get();
        if (!character.class) {
            app.showToast('クラスを選択してください', 'error');
            return false;
        }
        if (!character.classAbilityBonus) {
            app.showToast('クラスの能力値ボーナスを選択してください', 'error');
            return false;
        }
        return true;
    };

    const getClassData = async (classId) => {
        const classes = await loadData();
        return classes.find(c => c.id === classId);
    };

    return { render, selectClass, selectAbilityBonus, validate, getClassData };
})();
