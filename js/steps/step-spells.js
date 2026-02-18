/**
 * step-spells.js — Step 5: 呪文/パワー選択
 */

const StepSpells = (() => {
    let talentsData = null;

    const loadData = async (classId) => {
        if (talentsData && talentsData.classId === classId) return talentsData;
        try {
            const response = await fetch(`data/talents/${classId}.json`);
            talentsData = await response.json();
            return talentsData;
        } catch (e) {
            return null;
        }
    };

    const getSpellTypeLabel = (type) => {
        const labels = {
            'at-will': '自由使用', 'daily': 'デイリー', 'recharge': 'リチャージ', 'once-per-battle': '1戦闘1回'
        };
        return labels[type] || type;
    };

    const getSpellTypeBadgeClass = (type) => {
        const classes = {
            'at-will': 'badge-good', 'daily': 'badge-evil', 'recharge': 'badge-ambiguous', 'once-per-battle': 'badge-gold'
        };
        return classes[type] || 'badge-gold';
    };

    const render = async () => {
        const character = CharacterState.get();
        const classId = character.class;

        if (!classId) {
            return `<div class="step-content"><p class="text-secondary">先にクラスを選択してください。</p></div>`;
        }

        const data = await loadData(classId);

        // クラスに呪文がない場合（Fighterなど）
        if (!data || !data.spells) {
            return `
        <div class="step-content">
          <h2 class="section-title">呪文/パワー選択</h2>
          <div class="rule-box">
            <div class="rule-box-title">このクラスには呪文がありません</div>
            <div class="rule-box-content">
              ${classId === 'fighter' ? 'ファイターは呪文の代わりにマニューバ（Flexible Attacks）を使用します。マニューバはタレント選択ステップで確認できます。' : 'このクラスには選択可能な呪文がありません。'}
            </div>
          </div>
          <p class="text-secondary mt-4">次のステップに進んでください。</p>
        </div>
      `;
        }

        // 選択したタレントに基づいて利用可能な呪文を決定
        const availableSpellGroups = getAvailableSpellGroups(data, character);

        const html = `
      <div class="step-content">
        <h2 class="section-title">呪文/パワーを選択</h2>
        <p class="section-description">
          選択したタレントに対応する呪文やパワーを選択してください。
          「自由使用（At-Will）」の呪文は毎ターン使用でき、「デイリー（Daily）」は1日1回使用できます。
        </p>

        ${availableSpellGroups.length === 0 ? `
          <div class="rule-box">
            <div class="rule-box-title">タレントを選択してください</div>
            <div class="rule-box-content">呪文を選択するには、先にタレントを選択する必要があります。</div>
          </div>
        ` : availableSpellGroups.map(group => renderSpellGroup(group, character)).join('')}
      </div>
    `;

        return html;
    };

    const getAvailableSpellGroups = (data, character) => {
        const groups = [];
        const selectedTalents = character.selectedTalents;

        // Clericの場合: 常に基本呪文を表示
        if (data.classId === 'cleric' && data.spells && data.spells.level1) {
            groups.push({
                title: 'クレリック呪文（1レベル）',
                spells: data.spells.level1,
                maxSelect: 3,
            });
        }

        // Druidの場合: 選択したタレント（サークル）に応じた呪文を表示
        if (data.classId === 'druid' && data.spells) {
            if (selectedTalents.includes('animal-companion') && data.spells.animalCompanion) {
                groups.push({
                    title: '動物の仲間 呪文（1レベル）',
                    spells: data.spells.animalCompanion.level1 || [],
                    maxSelect: null, // すべて利用可能
                });
            }
            if (selectedTalents.includes('wild-healer') && data.spells.wildHealer) {
                groups.push({
                    title: '野生の癒し手 呪文（1レベル）',
                    spells: data.spells.wildHealer.level1 || [],
                    maxSelect: null,
                });
            }
        }

        return groups;
    };

    const renderSpellGroup = (group, character) => {
        return `
      <div class="mb-6">
        <h3 style="font-family:var(--font-heading); color:var(--color-gold-primary); font-size:1rem; margin-bottom:12px;">
          ${group.title}
          ${group.maxSelect ? `<span class="text-muted text-sm">（最大${group.maxSelect}つ選択）</span>` : ''}
        </h3>
        <div class="talent-grid">
          ${group.spells.map(spell => renderSpellCard(spell, character)).join('')}
        </div>
      </div>
    `;
    };

    const renderSpellCard = (spell, character) => {
        const isSelected = character.selectedSpells.includes(spell.id);

        return `
      <div class="talent-card ${isSelected ? 'selected' : ''}"
           onclick="StepSpells.toggleSpell('${spell.id}')">
        <div class="talent-header">
          <div>
            <div class="talent-name">${spell.name}</div>
            <div class="talent-name-ja">${spell.nameJa}</div>
          </div>
          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
            <span class="badge ${getSpellTypeBadgeClass(spell.type)}">${getSpellTypeLabel(spell.type)}</span>
            <div class="talent-checkbox">${isSelected ? '✓' : ''}</div>
          </div>
        </div>

        ${spell.target ? `<div class="text-xs text-muted mb-2">対象: ${spell.targetJa || spell.target}</div>` : ''}
        ${spell.attack ? `<div class="text-xs text-muted mb-2">攻撃: ${spell.attackJa || spell.attack}</div>` : ''}

        ${spell.effect ? `
          <div class="talent-description">${spell.effectJa || spell.effect}</div>
        ` : ''}
        ${spell.hit ? `
          <div class="talent-description">命中: ${spell.hitJa || spell.hit}</div>
          <div class="talent-description">外れ: ${spell.missJa || spell.miss}</div>
        ` : ''}

        ${spell.feats ? `
          <div class="feat-list mt-3">
            ${spell.feats.map(feat => `
              <div class="feat-item">
                <span class="feat-tier feat-tier-${feat.tier}">${feat.tier === 'adventurer' ? '冒険者' : feat.tier}</span>
                <span class="feat-text">${feat.descriptionJa || feat.description}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
    };

    const toggleSpell = (spellId) => {
        CharacterState.toggleSpell(spellId);

        const character = CharacterState.get();
        const isSelected = character.selectedSpells.includes(spellId);
        const card = document.querySelector(`[onclick="StepSpells.toggleSpell('${spellId}')"]`);
        if (card) {
            card.classList.toggle('selected', isSelected);
            const checkbox = card.querySelector('.talent-checkbox');
            if (checkbox) checkbox.textContent = isSelected ? '✓' : '';
        }
    };

    const validate = () => true;

    return { render, toggleSpell, validate };
})();
