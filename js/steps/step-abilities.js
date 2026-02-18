/**
 * step-abilities.js — Step 3: 能力値決定
 */

const StepAbilities = (() => {
    const ABILITY_NAMES = {
        STR: { ja: '筋力', en: 'Strength' },
        CON: { ja: '耐久力', en: 'Constitution' },
        DEX: { ja: '敏捷力', en: 'Dexterity' },
        INT: { ja: '知力', en: 'Intelligence' },
        WIS: { ja: '判断力', en: 'Wisdom' },
        CHA: { ja: '魅力', en: 'Charisma' },
    };

    const POINT_BUY_COSTS = {
        8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7
    };
    const POINT_BUY_TOTAL = 28;

    const render = async () => {
        const character = CharacterState.get();
        const method = character.abilityMethod || 'pointbuy';

        const html = `
      <div class="step-content">
        <h2 class="section-title">能力値を決定</h2>
        <p class="section-description">
          能力値の決定方法を選択してください。種族ボーナス（+2）とクラスボーナス（+2）は自動的に適用されます。
        </p>

        <!-- 方式選択タブ -->
        <div class="ability-method-tabs">
          <button class="ability-method-tab ${method === 'pointbuy' ? 'active' : ''}"
                  onclick="StepAbilities.setMethod('pointbuy')">
            ポイントバイ（推奨）
          </button>
          <button class="ability-method-tab ${method === 'roll' ? 'active' : ''}"
                  onclick="StepAbilities.setMethod('roll')">
            ダイスロール
          </button>
          <button class="ability-method-tab ${method === 'base13' ? 'active' : ''}"
                  onclick="StepAbilities.setMethod('base13')">
            Base 13
          </button>
        </div>

        <!-- 方式説明 -->
        <div class="rule-box mb-4">
          ${renderMethodDescription(method)}
        </div>

        <!-- ダイスロールボタン（ロール/Base13の場合） -->
        ${method !== 'pointbuy' ? `
          <div style="text-align:center; margin-bottom: 24px;">
            <button class="btn btn-primary btn-lg dice-roll-btn" onclick="StepAbilities.rollAbilities()">
              <span class="dice-icon" id="diceIcon">🎲</span>
              ${method === 'roll' ? '4d6ドロップ最低値でロール' : 'Base 13でロール'}
            </button>
          </div>
        ` : ''}

        <!-- ポイントバイ残りポイント表示 -->
        ${method === 'pointbuy' ? `
          <div class="points-remaining mb-4">
            <div class="points-remaining-value" id="pointsRemaining">${getRemainingPoints(character)}</div>
            <div class="points-remaining-label">残りポイント / ${POINT_BUY_TOTAL}</div>
          </div>
        ` : ''}

        <!-- 能力値グリッド -->
        <div class="ability-scores-grid" id="abilityGrid">
          ${renderAbilityGrid(character, method)}
        </div>

        <!-- 計算済みステータスプレビュー -->
        ${renderStatsPreview(character)}
      </div>
    `;

        return html;
    };

    const renderMethodDescription = (method) => {
        const descriptions = {
            pointbuy: `
        <div class="rule-box-title">ポイントバイ</div>
        <div class="rule-box-content">28ポイントを使って能力値を購入します。能力値8〜14の範囲で設定できます。
コスト: 8=0pt / 9=1pt / 10=2pt / 11=3pt / 12=4pt / 13=5pt / 14=7pt</div>
      `,
            roll: `
        <div class="rule-box-title">4d6ドロップ最低値</div>
        <div class="rule-box-content">各能力値に4d6を振り、最低値を除いた3つの合計を使います。
ボタンを押すとすべての能力値が自動的にロールされます。値は手動で変更することもできます。</div>
      `,
            base13: `
        <div class="rule-box-title">Base 13ランダム生成</div>
        <div class="rule-box-content">6つのd6を振り、隣接するダイスのペアを使って能力値を計算します。
計算式: 13 + A - B, 13 + B - C, ... 合計は常に78になります（範囲: 8〜18）。</div>
      `,
        };
        return descriptions[method] || '';
    };

    const renderAbilityGrid = (character, method) => {
        const abilities = character.abilities;
        const racialBonus = character.racialAbilityBonus;
        const classBonus = character.classAbilityBonus;

        return Object.entries(ABILITY_NAMES).map(([key, names]) => {
            const baseValue = abilities[key] || 10;
            const hasRacialBonus = racialBonus === key;
            const hasClassBonus = classBonus === key;
            const totalBonus = (hasRacialBonus ? 2 : 0) + (hasClassBonus ? 2 : 0);
            const effectiveValue = baseValue + totalBonus;
            const modifier = Calculator.getModifier(effectiveValue);

            return `
        <div class="ability-score-item ${totalBonus > 0 ? 'has-bonus' : ''}">
          ${totalBonus > 0 ? `<div class="ability-bonus-badge">+${totalBonus}</div>` : ''}
          <div class="ability-name">${names.ja}<br><span style="font-size:0.65rem;color:var(--color-text-muted)">${key}</span></div>
          <div class="ability-input-wrapper">
            ${method === 'pointbuy' ? `
              <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-top:8px;">
                <button class="points-btn" onclick="StepAbilities.adjustScore('${key}', -1)">−</button>
                <div style="font-family:var(--font-heading); font-size:1.5rem; color:var(--color-text-primary); min-width:32px; text-align:center">${baseValue}</div>
                <button class="points-btn" onclick="StepAbilities.adjustScore('${key}', 1)">+</button>
              </div>
            ` : `
              <input type="number" class="ability-score-input" id="ability_${key}"
                     value="${baseValue}" min="3" max="20"
                     onchange="StepAbilities.setScore('${key}', this.value)">
            `}
          </div>
          <div class="ability-modifier-display">
            ${totalBonus > 0 ? `<span style="font-size:0.75rem;color:var(--color-text-muted)">${baseValue}+${totalBonus}=</span>` : ''}
            ${effectiveValue}
            <span style="font-size:0.9rem; color:var(--color-text-secondary)">（${Calculator.formatModifier(modifier)}）</span>
          </div>
        </div>
      `;
        }).join('');
    };

    const renderStatsPreview = (character) => {
        // クラスデータが必要なため、非同期で取得
        const classId = character.class;
        if (!classId) return '';

        return `
      <div id="statsPreview" style="margin-top: 24px;">
        <div class="text-sm text-secondary mb-3" style="font-weight:600">計算済みステータスプレビュー（クラス: ${classId}）</div>
        <div class="stat-grid" id="statsGrid">
          <div class="stat-box"><div class="stat-label">読み込み中...</div></div>
        </div>
        <div id="formulaPanel"></div>
      </div>
    `;
    };

    const updateStatsPreview = async () => {
        const character = CharacterState.get();
        const classData = await StepClass.getClassData(character.class);
        if (!classData) return;

        const stats = Calculator.calculateAll(character, classData);
        const grid = document.getElementById('statsGrid');
        if (!grid) return;

        grid.innerHTML = `
      <div class="stat-box">
        <div class="stat-label">HP</div>
        <div class="stat-value">${stats.hp}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">AC</div>
        <div class="stat-value">${stats.ac}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">PD</div>
        <div class="stat-value">${stats.pd}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">MD</div>
        <div class="stat-value">${stats.md}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">イニシアチブ</div>
        <div class="stat-value">${Calculator.formatModifier(stats.initiative)}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">リカバリー</div>
        <div class="stat-value">${stats.recoveries}</div>
        <div class="stat-modifier">${stats.recoveryDice}</div>
      </div>
    `;

        // 計算式パネルを更新
        updateFormulaPanel(character, classData, stats);
    };

    /**
     * 計算式パネルを描画する
     * @param {Object} character - キャラクターデータ
     * @param {Object} classData - クラスデータ
     * @param {Object} stats - 計算済みステータス
     */
    const updateFormulaPanel = (character, classData, stats) => {
        const panel = document.getElementById('formulaPanel');
        if (!panel) return;

        const abilities = character.abilities;
        const racialBonus = character.racialAbilityBonus;
        const classBonus = character.classAbilityBonus;

        // 有効な能力値（ボーナス込み）を計算
        const effectiveAbilities = {};
        ['STR', 'CON', 'DEX', 'INT', 'WIS', 'CHA'].forEach(key => {
            const bonus = (racialBonus === key ? 2 : 0) + (classBonus === key ? 2 : 0);
            effectiveAbilities[key] = (abilities[key] || 10) + bonus;
        });

        const modOf = (key) => Calculator.getModifier(effectiveAbilities[key]);
        const fmtMod = (v) => Calculator.formatModifier(v);
        const level = character.level || 1;

        // AC計算: クラスbaseAC + 中央値(CON/DEX/WIS) + レベル
        const acCandidates = ['CON', 'DEX', 'WIS'];
        const acMods = acCandidates.map(k => ({ key: k, mod: modOf(k) })).sort((a, b) => a.mod - b.mod);
        const acMiddle = acMods[1]; // 中央値

        // PD計算: クラスbasePD + 中央値(STR/CON/DEX) + レベル
        const pdCandidates = ['STR', 'CON', 'DEX'];
        const pdMods = pdCandidates.map(k => ({ key: k, mod: modOf(k) })).sort((a, b) => a.mod - b.mod);
        const pdMiddle = pdMods[1];

        // MD計算: クラスbaseMD + 中央値(INT/WIS/CHA) + レベル
        const mdCandidates = ['INT', 'WIS', 'CHA'];
        const mdMods = mdCandidates.map(k => ({ key: k, mod: modOf(k) })).sort((a, b) => a.mod - b.mod);
        const mdMiddle = mdMods[1];

        // HP計算: (クラスbaseHP + CON修正値) × レベル
        const conMod = modOf('CON');
        const hpPerLevel = classData.baseHP + conMod;

        // イニシアチブ: DEX修正値 + レベル
        const dexMod = modOf('DEX');

        const renderAbilityTags = (candidates, middleKey) => {
            return candidates.map(k => {
                const isMiddle = k === middleKey;
                return `<span class="formula-ability-tag ${isMiddle ? 'middle' : 'normal'}">${k} ${fmtMod(modOf(k))}</span>`;
            }).join('');
        };

        panel.innerHTML = `
      <div class="formula-panel">
        <div class="formula-panel-title">📐 計算式の詳細</div>
        <div class="formula-grid">

          <!-- HP -->
          <div class="formula-card">
            <div class="formula-stat-name">HP</div>
            <div class="formula-expression">(${classData.baseHP} + CON修正値) × レベル</div>
            <div class="formula-expression">(${classData.baseHP} + ${fmtMod(conMod)}) × ${level} = ${hpPerLevel} × ${level}</div>
            <div class="formula-result">${stats.hp}</div>
            <div class="formula-abilities-used">
              <span class="formula-ability-tag middle">CON ${fmtMod(conMod)}</span>
            </div>
            <div class="formula-note">CON修正値がHPに直接影響します</div>
          </div>

          <!-- AC -->
          <div class="formula-card">
            <div class="formula-stat-name">AC（アーマークラス）</div>
            <div class="formula-expression">${classData.baseAC} + 中央値(CON/DEX/WIS修正値) + レベル</div>
            <div class="formula-expression">${classData.baseAC} + ${fmtMod(acMiddle.mod)} + ${level} = ${stats.ac}</div>
            <div class="formula-result">${stats.ac}</div>
            <div class="formula-abilities-used">
              ${renderAbilityTags(acCandidates, acMiddle.key)}
            </div>
            <div class="formula-note">🟡 ゴールドが中央値として採用された能力値</div>
          </div>

          <!-- PD -->
          <div class="formula-card">
            <div class="formula-stat-name">PD（物理防御値）</div>
            <div class="formula-expression">${classData.basePD} + 中央値(STR/CON/DEX修正値) + レベル</div>
            <div class="formula-expression">${classData.basePD} + ${fmtMod(pdMiddle.mod)} + ${level} = ${stats.pd}</div>
            <div class="formula-result">${stats.pd}</div>
            <div class="formula-abilities-used">
              ${renderAbilityTags(pdCandidates, pdMiddle.key)}
            </div>
            <div class="formula-note">🟡 ゴールドが中央値として採用された能力値</div>
          </div>

          <!-- MD -->
          <div class="formula-card">
            <div class="formula-stat-name">MD（精神防御値）</div>
            <div class="formula-expression">${classData.baseMD} + 中央値(INT/WIS/CHA修正値) + レベル</div>
            <div class="formula-expression">${classData.baseMD} + ${fmtMod(mdMiddle.mod)} + ${level} = ${stats.md}</div>
            <div class="formula-result">${stats.md}</div>
            <div class="formula-abilities-used">
              ${renderAbilityTags(mdCandidates, mdMiddle.key)}
            </div>
            <div class="formula-note">🟡 ゴールドが中央値として採用された能力値</div>
          </div>

          <!-- イニシアチブ -->
          <div class="formula-card">
            <div class="formula-stat-name">イニシアチブ</div>
            <div class="formula-expression">DEX修正値 + レベル</div>
            <div class="formula-expression">${fmtMod(dexMod)} + ${level} = ${fmtMod(stats.initiative)}</div>
            <div class="formula-result">${fmtMod(stats.initiative)}</div>
            <div class="formula-abilities-used">
              <span class="formula-ability-tag middle">DEX ${fmtMod(dexMod)}</span>
            </div>
          </div>

          <!-- リカバリー -->
          <div class="formula-card">
            <div class="formula-stat-name">リカバリー</div>
            <div class="formula-expression">${classData.recoveries}回 / ${classData.recoveryDie} + CON修正値</div>
            <div class="formula-result">${stats.recoveries}回</div>
            <div class="formula-result" style="font-size:1rem">${stats.recoveryDice}</div>
            <div class="formula-abilities-used">
              <span class="formula-ability-tag middle">CON ${fmtMod(conMod)}</span>
            </div>
          </div>

        </div>
      </div>
    `;
    };

    const getRemainingPoints = (character) => {
        const used = Calculator.calculatePointBuyTotal(character.abilities);
        return POINT_BUY_TOTAL - used;
    };

    const setMethod = async (method) => {
        CharacterState.update({ abilityMethod: method });
        const container = document.getElementById('stepContainer');
        container.innerHTML = await render();
        await updateStatsPreview();
    };

    const setScore = (ability, value) => {
        const score = Math.max(3, Math.min(20, parseInt(value) || 10));
        CharacterState.setAbility(ability, score);
        updateStatsPreview();
    };

    const adjustScore = async (ability, delta) => {
        const character = CharacterState.get();
        const current = character.abilities[ability] || 10;
        const newScore = Math.max(8, Math.min(14, current + delta));

        // ポイントバイの場合、コストチェック
        const newAbilities = { ...character.abilities, [ability]: newScore };
        const totalCost = Calculator.calculatePointBuyTotal(newAbilities);

        if (totalCost > POINT_BUY_TOTAL) {
            app.showToast('ポイントが不足しています', 'error');
            return;
        }

        CharacterState.setAbility(ability, newScore);

        // 残りポイント更新
        const remaining = document.getElementById('pointsRemaining');
        if (remaining) {
            const newRemaining = POINT_BUY_TOTAL - totalCost;
            remaining.textContent = newRemaining;
            remaining.style.color = newRemaining < 0 ? 'var(--color-danger)' : 'var(--color-gold-primary)';
        }

        // 能力値グリッド更新
        const grid = document.getElementById('abilityGrid');
        if (grid) {
            grid.innerHTML = renderAbilityGrid(CharacterState.get(), 'pointbuy');
        }

        await updateStatsPreview();
    };

    const rollAbilities = async () => {
        const character = CharacterState.get();
        const method = character.abilityMethod;

        // ダイスアニメーション
        const diceIcon = document.getElementById('diceIcon');
        if (diceIcon) {
            diceIcon.classList.add('dice-rolling');
            setTimeout(() => diceIcon.classList.remove('dice-rolling'), 500);
        }

        let newAbilities;
        if (method === 'roll') {
            newAbilities = Calculator.rollAllAbilities();
        } else {
            newAbilities = Calculator.rollBase13();
        }

        CharacterState.update({ abilities: newAbilities });

        // グリッド更新
        const grid = document.getElementById('abilityGrid');
        if (grid) {
            grid.innerHTML = renderAbilityGrid(CharacterState.get(), method);
        }

        await updateStatsPreview();
        app.showToast('能力値をロールしました！', 'info');
    };

    const validate = () => {
        const character = CharacterState.get();
        if (character.abilityMethod === 'pointbuy') {
            const used = Calculator.calculatePointBuyTotal(character.abilities);
            if (used > POINT_BUY_TOTAL) {
                app.showToast(`ポイントが${used - POINT_BUY_TOTAL}pt超過しています`, 'error');
                return false;
            }
        }
        return true;
    };

    // ステップ表示後にプレビューを更新
    const onMount = async () => {
        await updateStatsPreview();
    };

    return { render, setMethod, setScore, adjustScore, rollAbilities, validate, onMount };
})();
