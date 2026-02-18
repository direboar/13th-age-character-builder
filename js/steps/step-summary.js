/**
 * step-summary.js — Step 9: 完成・出力
 */

const StepSummary = (() => {
    const ABILITY_NAMES_JA = {
        STR: '筋力', CON: '耐久力', DEX: '敏捷力',
        INT: '知力', WIS: '判断力', CHA: '魅力'
    };

    const render = async () => {
        const character = CharacterState.get();
        const classData = await StepClass.getClassData(character.class);
        const stats = classData ? Calculator.calculateAll(character, classData) : null;

        const html = `
      <div class="step-content">
        <h2 class="section-title">キャラクター完成！</h2>
        <p class="section-description">
          キャラクターの作成が完了しました。内容を確認してPDFを出力してください。
        </p>

        <!-- キャラクター名・基本情報 -->
        <div style="text-align:center; margin-bottom:32px;">
          <div style="font-family:var(--font-decorative); font-size:2rem; color:var(--color-gold-primary); text-shadow:0 0 20px var(--color-gold-glow);">
            ${character.name || '名前未設定'}
          </div>
          <div style="color:var(--color-text-secondary); margin-top:8px;">
            ${character.race ? getRaceName(character.race) : '種族未選択'} / ${character.class ? getClassName(character.class) : 'クラス未選択'} / レベル ${character.level}
          </div>
        </div>

        <div class="summary-layout">
          <!-- 能力値 -->
          <div class="summary-section">
            <div class="summary-section-title">能力値</div>
            ${stats ? Object.entries(stats.abilities).map(([key, value]) => `
              <div class="summary-row">
                <span class="summary-row-label">${ABILITY_NAMES_JA[key]}（${key}）</span>
                <span class="summary-row-value">${value} <span style="color:var(--color-text-muted)">${Calculator.formatModifier(stats.modifiers[key])}</span></span>
              </div>
            `).join('') : '<p class="text-muted">データなし</p>'}
          </div>

          <!-- 戦闘ステータス -->
          <div class="summary-section">
            <div class="summary-section-title">戦闘ステータス</div>
            ${stats ? `
              <div class="summary-row">
                <span class="summary-row-label">HP</span>
                <span class="summary-row-value">${stats.hp}</span>
              </div>
              <div class="summary-row">
                <span class="summary-row-label">AC</span>
                <span class="summary-row-value">${stats.ac}</span>
              </div>
              <div class="summary-row">
                <span class="summary-row-label">PD</span>
                <span class="summary-row-value">${stats.pd}</span>
              </div>
              <div class="summary-row">
                <span class="summary-row-label">MD</span>
                <span class="summary-row-value">${stats.md}</span>
              </div>
              <div class="summary-row">
                <span class="summary-row-label">イニシアチブ</span>
                <span class="summary-row-value">${Calculator.formatModifier(stats.initiative)}</span>
              </div>
              <div class="summary-row">
                <span class="summary-row-label">リカバリー</span>
                <span class="summary-row-value">${stats.recoveries}回 / ${stats.recoveryDice}</span>
              </div>
            ` : '<p class="text-muted">クラスを選択してください</p>'}
          </div>

          <!-- タレント -->
          <div class="summary-section">
            <div class="summary-section-title">選択タレント</div>
            ${character.selectedTalents.length > 0
                ? character.selectedTalents.map(id => `<div class="summary-row"><span class="summary-row-value">${id}</span></div>`).join('')
                : '<p class="text-muted text-sm">タレント未選択</p>'}
          </div>

          <!-- バックグラウンド -->
          <div class="summary-section">
            <div class="summary-section-title">バックグラウンド</div>
            ${character.backgrounds.filter(bg => bg.name).map(bg => `
              <div class="summary-row">
                <span class="summary-row-label">${bg.name}</span>
                <span class="summary-row-value">+${bg.points}</span>
              </div>
            `).join('') || '<p class="text-muted text-sm">バックグラウンド未設定</p>'}
          </div>

          <!-- Icon Relationships -->
          <div class="summary-section">
            <div class="summary-section-title">Icon Relationships</div>
            ${character.iconRelationships.length > 0
                ? character.iconRelationships.map(rel => `
                <div class="summary-row">
                  <span class="summary-row-label">${getIconName(rel.iconId)}</span>
                  <span class="summary-row-value">${getRelTypeName(rel.type)} ${rel.points}pt</span>
                </div>
              `).join('')
                : '<p class="text-muted text-sm">Icon未設定</p>'}
          </div>

          <!-- One Unique Thing -->
          <div class="summary-section">
            <div class="summary-section-title">One Unique Thing</div>
            <p class="text-sm" style="color:var(--color-text-secondary); line-height:1.7;">
              ${character.oneUniqueThing || '<span class="text-muted">未設定</span>'}
            </p>
          </div>
        </div>

        <!-- PDF出力ボタン -->
        <div class="pdf-buttons">
          <button class="btn btn-primary btn-lg" onclick="PDFGenerator.generateCharacterSheet()">
            📄 キャラクターシートPDF出力
          </button>
          <button class="btn btn-secondary btn-lg" onclick="PDFGenerator.generateReferenceSheet()">
            📚 詳細リファレンスPDF出力
          </button>
          <button class="btn btn-secondary" onclick="CharacterState.exportJSON()">
            💾 JSONで保存
          </button>
        </div>
      </div>
    `;

        return html;
    };

    const getRaceName = (raceId) => {
        const names = {
            'human': 'ヒューマン', 'dwarf': 'ドワーフ', 'high-elf': 'ハイエルフ',
            'wood-elf': 'ウッドエルフ', 'half-orc': 'ハーフオーク'
        };
        return names[raceId] || raceId;
    };

    const getClassName = (classId) => {
        const names = { 'fighter': 'ファイター', 'cleric': 'クレリック', 'druid': 'ドルイド' };
        return names[classId] || classId;
    };

    const getIconName = (iconId) => {
        const names = {
            'archmage': '大魔法使い', 'crusader': '十字軍', 'diabolist': '悪魔使い',
            'dwarf-king': 'ドワーフ王', 'elf-queen': 'エルフ女王', 'emperor': '皇帝',
            'great-gold-wyrm': '黄金竜', 'high-druid': '高位ドルイド', 'lich-king': 'リッチ王',
            'orc-lord': 'オーク卿', 'priestess': '女祭司', 'prince-of-shadows': '影の王子',
            'three': '三竜'
        };
        return names[iconId] || iconId;
    };

    const getRelTypeName = (type) => {
        const names = { positive: '🟢 好意的', conflicted: '🟡 複雑', negative: '🔴 否定的' };
        return names[type] || type;
    };

    const validate = () => true;

    return { render, validate };
})();
