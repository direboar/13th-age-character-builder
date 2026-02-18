/**
 * pdf-generator.js — PDF生成モジュール
 * html2pdf.jsを使用してHTML→Canvas→PDFに変換する
 * ブラウザのネイティブフォント描画を利用するため日本語は完全対応
 */

const PDFGenerator = (() => {
    // 名前マッピング
    const raceNames = {
        'human': 'Human / 人間', 'dwarf': 'Dwarf / ドワーフ',
        'high-elf': 'High Elf / ハイエルフ', 'wood-elf': 'Wood Elf / ウッドエルフ',
        'half-orc': 'Half-Orc / ハーフオーク'
    };
    const classNames = {
        'fighter': 'Fighter / ファイター', 'cleric': 'Cleric / クレリック', 'druid': 'Druid / ドルイド'
    };
    const iconNamesMap = {
        'archmage': 'The Archmage / 大魔法使い', 'crusader': 'The Crusader / 十字軍',
        'diabolist': 'The Diabolist / 悪魔使い', 'dwarf-king': 'The Dwarf King / ドワーフ王',
        'elf-queen': 'The Elf Queen / エルフ女王', 'emperor': 'The Emperor / 皇帝',
        'great-gold-wyrm': 'The Great Gold Wyrm / 黄金竜', 'high-druid': 'The High Druid / 高位ドルイド',
        'lich-king': 'The Lich King / リッチ王', 'orc-lord': 'The Orc Lord / オーク卿',
        'priestess': 'The Priestess / 女祭司', 'prince-of-shadows': 'The Prince of Shadows / 影の王子',
        'three': 'The Three / 三竜'
    };
    const relTypeNames = { positive: '🟢 好意的', conflicted: '🟡 複雑', negative: '🔴 否定的' };
    const abilityLabels = {
        STR: '筋力', CON: '耐久力', DEX: '敏捷力',
        INT: '知力', WIS: '判断力', CHA: '魅力'
    };

    /**
     * PDF用の共通CSSスタイル
     */
    const getPdfStyles = () => `
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body, html {
                font-family: 'Noto Sans JP', sans-serif;
                font-size: 10pt;
                color: #1e1c2e;
                line-height: 1.5;
                background: #fff;
            }
            .pdf-page {
                width: 190mm;
                padding: 0;
            }
            .pdf-header {
                background: linear-gradient(135deg, #1a1830, #2a2549);
                color: #c9a84c;
                padding: 14px 20px;
                border-radius: 6px;
                margin-bottom: 16px;
            }
            .pdf-header h1 {
                font-family: 'Cinzel', serif;
                font-size: 18pt;
                margin: 0;
                letter-spacing: 0.05em;
            }
            .pdf-header .subtitle {
                color: #a09880;
                font-size: 9pt;
                margin-top: 2px;
            }
            .pdf-name-bar {
                background: linear-gradient(90deg, #c9a84c, #b8963e);
                color: #1a1830;
                padding: 8px 16px;
                border-radius: 4px;
                font-size: 14pt;
                font-weight: 700;
                margin-bottom: 8px;
            }
            .pdf-basic-info {
                display: flex;
                gap: 24px;
                font-size: 9pt;
                color: #555;
                margin-bottom: 12px;
                padding: 0 4px;
            }
            .pdf-section-title {
                font-size: 11pt;
                font-weight: 700;
                color: #8a6d20;
                border-bottom: 2px solid #c9a84c;
                padding-bottom: 4px;
                margin: 14px 0 8px 0;
            }
            .ability-grid {
                display: flex;
                gap: 5px;
                margin-bottom: 10px;
            }
            .ability-box {
                flex: 1;
                background: #f8f4eb;
                border: 1px solid #c9a84c;
                border-radius: 4px;
                text-align: center;
                padding: 6px 4px;
            }
            .ability-box .label {
                font-size: 7pt;
                color: #8a6d20;
                font-weight: 600;
            }
            .ability-box .abbr {
                font-size: 6pt;
                color: #999;
            }
            .ability-box .value {
                font-size: 16pt;
                font-weight: 700;
                color: #1e1c2e;
            }
            .ability-box .mod {
                font-size: 8pt;
                color: #666;
            }
            .stat-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                margin-bottom: 10px;
            }
            .stat-box {
                flex: 1;
                min-width: 80px;
                background: #f5f0e6;
                border: 1px solid #c9a84c;
                border-radius: 4px;
                padding: 6px 10px;
            }
            .stat-box .label {
                font-size: 7pt;
                color: #8a6d20;
                font-weight: 600;
            }
            .stat-box .value {
                font-size: 13pt;
                font-weight: 700;
                color: #1e1c2e;
            }
            .list-item {
                display: flex;
                justify-content: space-between;
                padding: 3px 8px;
                border-bottom: 1px solid #eee;
                font-size: 9pt;
            }
            .list-item:last-child { border-bottom: none; }
            .list-item .name { color: #333; }
            .list-item .points { font-weight: 600; color: #8a6d20; }
            .text-block {
                padding: 6px 8px;
                font-size: 9pt;
                color: #444;
                background: #faf8f4;
                border-radius: 4px;
                line-height: 1.6;
            }
            .pdf-footer {
                margin-top: 16px;
                padding-top: 8px;
                border-top: 1px solid #ddd;
                font-size: 7pt;
                color: #aaa;
                display: flex;
                justify-content: space-between;
            }

            /* リファレンスシート用 */
            .feature-block {
                margin-bottom: 12px;
                padding: 8px 10px;
                background: #faf8f4;
                border-left: 3px solid #c9a84c;
                border-radius: 0 4px 4px 0;
                page-break-inside: avoid;
            }
            .feature-block .title {
                font-size: 10pt;
                font-weight: 700;
                color: #333;
                margin-bottom: 4px;
            }
            .feature-block .desc-ja {
                font-size: 9pt;
                color: #444;
                margin-bottom: 4px;
                line-height: 1.6;
            }
            .feature-block .desc-en {
                font-size: 8pt;
                color: #888;
                line-height: 1.5;
                font-style: italic;
            }
            .feature-block .feat {
                font-size: 8pt;
                color: #999;
                margin-top: 3px;
                padding-left: 8px;
                font-style: italic;
            }
            .feat-label {
                font-size: 7pt;
                color: #aaa;
                margin-top: 6px;
                margin-bottom: 2px;
            }
        </style>
    `;

    /**
     * HTML文字列からPDFを生成してダウンロードする
     * メインドキュメント内に可視div要素を作成し、html2canvasでキャプチャしてPDF化する
     * @param {string} htmlContent - PDF化するHTML文字列（<style>タグ含む）
     * @param {string} filename - 保存ファイル名
     */
    const htmlToPdf = async (htmlContent, filename) => {
        // ラッパー要素を作成（可視状態 — html2canvasの仕様上必要）
        const wrapper = document.createElement('div');
        wrapper.id = 'pdf-render-area';
        wrapper.style.cssText = [
            'position: absolute',
            'top: 0',
            'left: 0',
            'width: 794px',      // A4幅（210mm ≈ 794px @ 96dpi）
            'background: #fff',
            'z-index: 99999',
            'padding: 0',
            'margin: 0'
        ].join(';');
        wrapper.innerHTML = htmlContent;
        document.body.appendChild(wrapper);

        // レンダリング完了を待つ
        await new Promise(r => setTimeout(r, 500));

        const contentHeight = wrapper.scrollHeight;
        console.log('[PDF Debug] scrollHeight:', contentHeight, 'offsetHeight:', wrapper.offsetHeight);

        try {
            const opt = {
                margin: [10, 10, 10, 10],
                filename: filename,
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    scrollY: 0,
                    height: contentHeight,
                    windowHeight: contentHeight
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['css'], avoid: '.feature-block' }
            };

            await html2pdf().set(opt).from(wrapper).save();
        } finally {
            document.body.removeChild(wrapper);
        }
    };

    /**
     * 標準キャラクターシートPDFを生成する
     */
    const generateCharacterSheet = async () => {
        app.showToast('キャラクターシートを生成中...', 'info');

        try {
            const character = CharacterState.get();
            const classData = await StepClass.getClassData(character.class);
            const stats = classData ? Calculator.calculateAll(character, classData) : null;

            const html = buildCharacterSheetHTML(character, classData, stats);
            const filename = `${character.name || 'character'}_sheet.pdf`;
            await htmlToPdf(html, filename);

            app.showToast('キャラクターシートを出力しました！', 'success');

        } catch (e) {
            console.error('PDF生成エラー:', e);
            app.showToast('PDF生成に失敗しました: ' + e.message, 'error');
        }
    };

    /**
     * キャラクターシートのHTMLを構築する
     */
    const buildCharacterSheetHTML = (character, classData, stats) => {
        return `
            ${getPdfStyles()}
            <div class="pdf-page">
                <!-- ヘッダー -->
                <div class="pdf-header">
                    <h1>13th Age Character Sheet</h1>
                    <div class="subtitle">13th Age キャラクタービルダー</div>
                </div>

                <!-- キャラクター名 -->
                <div class="pdf-name-bar">${character.name || '名前未設定'}</div>

                <!-- 基本情報 -->
                <div class="pdf-basic-info">
                    <span>種族: ${raceNames[character.race] || character.race || '未選択'}</span>
                    <span>クラス: ${classNames[character.class] || character.class || '未選択'}</span>
                    <span>レベル: ${character.level}</span>
                </div>

                <!-- 能力値 -->
                ${stats ? `
                    <div class="pdf-section-title">能力値 / Ability Scores</div>
                    <div class="ability-grid">
                        ${Object.entries(stats.abilities).map(([key, value]) => `
                            <div class="ability-box">
                                <div class="label">${abilityLabels[key]}</div>
                                <div class="abbr">${key}</div>
                                <div class="value">${value}</div>
                                <div class="mod">${Calculator.formatModifier(stats.modifiers[key])}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- 戦闘ステータス -->
                ${stats ? `
                    <div class="pdf-section-title">戦闘ステータス / Combat Stats</div>
                    <div class="stat-grid">
                        <div class="stat-box"><div class="label">HP</div><div class="value">${stats.hp}</div></div>
                        <div class="stat-box"><div class="label">AC（装甲値）</div><div class="value">${stats.ac}</div></div>
                        <div class="stat-box"><div class="label">PD（物理防御）</div><div class="value">${stats.pd}</div></div>
                        <div class="stat-box"><div class="label">MD（精神防御）</div><div class="value">${stats.md}</div></div>
                        <div class="stat-box"><div class="label">イニシアチブ</div><div class="value">${Calculator.formatModifier(stats.initiative)}</div></div>
                        <div class="stat-box"><div class="label">リカバリー</div><div class="value">${stats.recoveries}回 (${stats.recoveryDice})</div></div>
                    </div>
                ` : ''}

                <!-- タレント -->
                <div class="pdf-section-title">選択タレント / Talents</div>
                ${character.selectedTalents.length > 0
                ? character.selectedTalents.map(id => `<div class="list-item"><span class="name">• ${id}</span></div>`).join('')
                : '<div class="text-block" style="color:#999">（タレント未選択）</div>'
            }

                <!-- バックグラウンド -->
                <div class="pdf-section-title">バックグラウンド / Backgrounds</div>
                ${character.backgrounds.filter(bg => bg.name).length > 0
                ? character.backgrounds.filter(bg => bg.name).map(bg => `
                        <div class="list-item">
                            <span class="name">• ${bg.name}</span>
                            <span class="points">+${bg.points}</span>
                        </div>
                    `).join('')
                : '<div class="text-block" style="color:#999">（バックグラウンド未設定）</div>'
            }

                <!-- Icon Relationships -->
                <div class="pdf-section-title">Icon Relationships</div>
                ${character.iconRelationships.length > 0
                ? character.iconRelationships.map(rel => `
                        <div class="list-item">
                            <span class="name">${iconNamesMap[rel.iconId] || rel.iconId} — ${relTypeNames[rel.type]}</span>
                            <span class="points">${rel.points}pt</span>
                        </div>
                    `).join('')
                : '<div class="text-block" style="color:#999">（Icon未設定）</div>'
            }

                <!-- One Unique Thing -->
                <div class="pdf-section-title">One Unique Thing（唯一無二の特徴）</div>
                <div class="text-block">${character.oneUniqueThing || '（未設定）'}</div>

                <!-- フッター -->
                <div class="pdf-footer">
                    <span>Generated by 13th Age Character Builder</span>
                    <span>${new Date().toLocaleDateString('ja-JP')}</span>
                </div>
            </div>
        `;
    };

    /**
     * 詳細リファレンスシートPDFを生成する
     */
    const generateReferenceSheet = async () => {
        app.showToast('詳細リファレンスシートを生成中...', 'info');

        try {
            const character = CharacterState.get();
            const classData = await StepClass.getClassData(character.class);
            const stats = classData ? Calculator.calculateAll(character, classData) : null;

            // タレントデータを読み込む
            let talentData = null;
            if (character.class) {
                try {
                    const resp = await fetch(`data/talents/${character.class}.json`);
                    talentData = await resp.json();
                } catch (e) {
                    console.warn('タレントデータ読み込みエラー:', e);
                }
            }

            const html = buildReferenceSheetHTML(character, classData, stats, talentData);
            const filename = `${character.name || 'character'}_reference.pdf`;
            await htmlToPdf(html, filename);

            app.showToast('詳細リファレンスシートを出力しました！', 'success');

        } catch (e) {
            console.error('PDF生成エラー:', e);
            app.showToast('PDF生成に失敗しました: ' + e.message, 'error');
        }
    };

    /**
     * リファレンスシートのHTMLを構築する
     */
    const buildReferenceSheetHTML = (character, classData, stats, talentData) => {
        return `
            ${getPdfStyles()}
            <div class="pdf-page">
                <!-- ヘッダー -->
                <div class="pdf-header">
                    <h1>13th Age — 詳細リファレンスシート</h1>
                    <div class="subtitle">
                        ${character.name || '名前未設定'} |
                        ${raceNames[character.race] || '未選択'}
                        ${classNames[character.class] || '未選択'}
                        Lv.${character.level}
                    </div>
                </div>

                <!-- ステータス概要 -->
                ${stats ? `
                    <div class="pdf-section-title">ステータス概要</div>
                    <div class="ability-grid">
                        ${Object.entries(stats.abilities).map(([key, value]) => `
                            <div class="ability-box">
                                <div class="label">${abilityLabels[key]}(${key})</div>
                                <div class="value">${value}</div>
                                <div class="mod">${Calculator.formatModifier(stats.modifiers[key])}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="stat-grid">
                        <div class="stat-box"><div class="label">HP</div><div class="value">${stats.hp}</div></div>
                        <div class="stat-box"><div class="label">AC</div><div class="value">${stats.ac}</div></div>
                        <div class="stat-box"><div class="label">PD</div><div class="value">${stats.pd}</div></div>
                        <div class="stat-box"><div class="label">MD</div><div class="value">${stats.md}</div></div>
                        <div class="stat-box"><div class="label">イニシアチブ</div><div class="value">${Calculator.formatModifier(stats.initiative)}</div></div>
                        <div class="stat-box"><div class="label">リカバリー</div><div class="value">${stats.recoveries}回 (${stats.recoveryDice})</div></div>
                    </div>
                ` : ''}

                <!-- クラス特徴 -->
                ${classData && classData.classFeatures ? `
                    <div class="pdf-section-title">クラス特徴 / Class Features</div>
                    ${classData.classFeatures.map(feature => `
                        <div class="feature-block">
                            <div class="title">■ ${feature.name}（${feature.nameJa}）</div>
                            <div class="desc-ja">${feature.descriptionJa}</div>
                            <div class="desc-en">${feature.description}</div>
                            ${(feature.feats && feature.feats.length > 0) ? `
                                <div class="feat-label">▷ 取得可能なFeat（未取得）:</div>
                                ${feature.feats.map(feat => `
                                    <div class="feat">☐ ${feat.tier}: ${feat.descriptionJa || feat.description}</div>
                                `).join('')}
                            ` : ''}
                        </div>
                    `).join('')}
                ` : ''}

                <!-- 選択タレント -->
                ${character.selectedTalents.length > 0 && talentData ? `
                    <div class="pdf-section-title">選択タレント / Selected Talents</div>
                    ${character.selectedTalents.map(talentId => {
            const talent = talentData.talents?.find(t => t.id === talentId);
            if (!talent) return `<div class="feature-block"><div class="title">${talentId}</div></div>`;
            return `
                            <div class="feature-block">
                                <div class="title">■ ${talent.name}（${talent.nameJa}）</div>
                                <div class="desc-ja">${talent.descriptionJa}</div>
                                <div class="desc-en">${talent.description}</div>
                                ${(talent.feats && talent.feats.length > 0) ? `
                                    <div class="feat-label">▷ 取得可能なFeat（未取得）:</div>
                                    ${talent.feats.map(feat => `
                                        <div class="feat">☐ ${feat.tier}: ${feat.descriptionJa || feat.description}</div>
                                    `).join('')}
                                ` : ''}
                            </div>
                        `;
        }).join('')}
                ` : ''}

                <!-- バックグラウンド -->
                ${character.backgrounds.filter(bg => bg.name).length > 0 ? `
                    <div class="pdf-section-title">バックグラウンド / Backgrounds</div>
                    ${character.backgrounds.filter(bg => bg.name).map(bg => `
                        <div class="list-item">
                            <span class="name">${bg.name}</span>
                            <span class="points">+${bg.points}</span>
                        </div>
                    `).join('')}
                ` : ''}

                <!-- Icon Relationships -->
                ${character.iconRelationships.length > 0 ? `
                    <div class="pdf-section-title">Icon Relationships</div>
                    ${character.iconRelationships.map(rel => `
                        <div class="list-item">
                            <span class="name">${iconNamesMap[rel.iconId] || rel.iconId} — ${relTypeNames[rel.type]}</span>
                            <span class="points">${rel.points}pt</span>
                        </div>
                    `).join('')}
                ` : ''}

                <!-- One Unique Thing -->
                ${character.oneUniqueThing ? `
                    <div class="pdf-section-title">One Unique Thing</div>
                    <div class="text-block">${character.oneUniqueThing}</div>
                ` : ''}

                <!-- フッター -->
                <div class="pdf-footer">
                    <span>13th Age Character Builder — 詳細リファレンスシート</span>
                    <span>${new Date().toLocaleDateString('ja-JP')}</span>
                </div>
            </div>
        `;
    };

    return { generateCharacterSheet, generateReferenceSheet };
})();
