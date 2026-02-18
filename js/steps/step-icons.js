/**
 * step-icons.js — Step 7: Icon Relationships設定
 */

const StepIcons = (() => {
    let iconsData = null;
    const MAX_POINTS = 3;

    const loadData = async () => {
        if (iconsData) return iconsData;
        const response = await fetch('data/icons.json');
        iconsData = await response.json();
        return iconsData;
    };

    const render = async () => {
        const icons = await loadData();
        const character = CharacterState.get();
        const totalUsed = Calculator.getTotalIconPoints(character.iconRelationships);
        const remaining = MAX_POINTS - totalUsed;

        const html = `
      <div class="step-content">
        <h2 class="section-title">Icon Relationships</h2>
        <p class="section-description">
          キャラクターと13のIconとの関係を設定してください。
          合計3ポイントを自由に配分できます。各Iconとの関係は「好意的（Positive）」「複雑（Conflicted）」「否定的（Negative）」の3種類です。
        </p>

        <div class="points-remaining mb-4">
          <div class="points-remaining-value" id="iconPointsRemaining">${remaining}</div>
          <div class="points-remaining-label">残りポイント / ${MAX_POINTS}</div>
        </div>

        <div class="rule-box mb-4">
          <div class="rule-box-title">関係の種類</div>
          <div class="rule-box-content">
🟢 好意的（Positive）: Iconはあなたを支持しています。ロール成功時に有利な結果が得られます。
🟡 複雑（Conflicted）: Iconとの関係は複雑です。ロール成功時に有利な結果が得られますが、代償が伴うことがあります。
🔴 否定的（Negative）: Iconはあなたに敵対しています。ロール成功時に有利な結果が得られますが、Iconの介入が伴います。</div>
        </div>

        <div class="icon-grid" id="iconGrid">
          ${icons.map(icon => renderIconCard(icon, character)).join('')}
        </div>
      </div>
    `;

        return html;
    };

    const renderIconCard = (icon, character) => {
        const relationship = character.iconRelationships.find(r => r.iconId === icon.id);
        const relType = relationship ? relationship.type : null;
        const relPoints = relationship ? relationship.points : 0;

        const alignmentBadge = {
            good: 'badge-good',
            evil: 'badge-evil',
            ambiguous: 'badge-ambiguous',
        }[icon.alignment] || 'badge-gold';

        return `
      <div class="icon-card ${relationship ? 'has-relationship' : ''}" id="iconCard_${icon.id}">
        <div class="icon-header">
          <div>
            <div class="icon-name">${icon.name}</div>
            <div class="icon-name-ja">${icon.nameJa}</div>
          </div>
          <span class="badge ${alignmentBadge}">${icon.alignmentJa}</span>
        </div>

        <div class="icon-relationship-select">
          <button class="relationship-btn ${relType === 'positive' ? 'active-positive' : ''}"
                  onclick="StepIcons.setRelationship('${icon.id}', 'positive')">
            🟢 好意的
          </button>
          <button class="relationship-btn ${relType === 'conflicted' ? 'active-conflicted' : ''}"
                  onclick="StepIcons.setRelationship('${icon.id}', 'conflicted')">
            🟡 複雑
          </button>
          <button class="relationship-btn ${relType === 'negative' ? 'active-negative' : ''}"
                  onclick="StepIcons.setRelationship('${icon.id}', 'negative')">
            🔴 否定的
          </button>
        </div>

        ${relType ? `
          <div class="icon-points-selector">
            <button class="points-btn" onclick="StepIcons.adjustPoints('${icon.id}', -1)">−</button>
            <div class="points-display" id="iconPoints_${icon.id}">${relPoints}</div>
            <button class="points-btn" onclick="StepIcons.adjustPoints('${icon.id}', 1)">+</button>
            <span class="text-xs text-muted">ポイント</span>
          </div>
        ` : ''}
      </div>
    `;
    };

    const setRelationship = async (iconId, type) => {
        const character = CharacterState.get();
        const existing = character.iconRelationships.find(r => r.iconId === iconId);

        if (existing && existing.type === type) {
            // 同じタイプをクリックしたら解除
            CharacterState.setIconRelationship(iconId, null, 0);
        } else {
            const currentPoints = existing ? existing.points : 0;
            const pointsToUse = currentPoints > 0 ? currentPoints : 1;
            const totalOther = Calculator.getTotalIconPoints(character.iconRelationships) - (existing ? existing.points : 0);

            if (totalOther + pointsToUse > MAX_POINTS) {
                app.showToast(`合計${MAX_POINTS}ポイントを超えることはできません`, 'error');
                return;
            }

            CharacterState.setIconRelationship(iconId, type, pointsToUse);
        }

        // 再描画
        const container = document.getElementById('stepContainer');
        container.innerHTML = await render();
    };

    const adjustPoints = (iconId, delta) => {
        const character = CharacterState.get();
        const existing = character.iconRelationships.find(r => r.iconId === iconId);
        if (!existing) return;

        const newPoints = Math.max(1, Math.min(MAX_POINTS, existing.points + delta));
        const totalOther = Calculator.getTotalIconPoints(character.iconRelationships) - existing.points;

        if (totalOther + newPoints > MAX_POINTS) {
            app.showToast(`合計${MAX_POINTS}ポイントを超えることはできません`, 'error');
            return;
        }

        CharacterState.setIconRelationship(iconId, existing.type, newPoints);

        const pointsDisplay = document.getElementById(`iconPoints_${iconId}`);
        if (pointsDisplay) pointsDisplay.textContent = newPoints;

        const remaining = MAX_POINTS - Calculator.getTotalIconPoints(CharacterState.get().iconRelationships);
        const remainingDisplay = document.getElementById('iconPointsRemaining');
        if (remainingDisplay) remainingDisplay.textContent = remaining;
    };

    const validate = () => true;

    return { render, setRelationship, adjustPoints, validate };
})();
