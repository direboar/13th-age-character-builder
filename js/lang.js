/**
 * lang.js — 言語切り替えモジュール
 * 英語/日本語の表示を管理する
 */

const Lang = (() => {
    // 現在の言語設定（'ja' または 'en'）
    let currentLang = localStorage.getItem('13thage_lang') || 'ja';

    // 変更リスナー
    const listeners = [];

    /**
     * 現在の言語を取得する
     */
    const get = () => currentLang;

    /**
     * 言語を切り替える
     */
    const toggle = () => {
        currentLang = currentLang === 'ja' ? 'en' : 'ja';
        localStorage.setItem('13thage_lang', currentLang);
        listeners.forEach(fn => fn(currentLang));
        updateToggleButton();
    };

    /**
     * 言語を設定する
     * @param {string} lang - 'ja' または 'en'
     */
    const set = (lang) => {
        currentLang = lang;
        localStorage.setItem('13thage_lang', lang);
        listeners.forEach(fn => fn(lang));
        updateToggleButton();
    };

    /**
     * 変更リスナーを登録する
     */
    const subscribe = (fn) => {
        listeners.push(fn);
    };

    /**
     * ヘッダーのトグルボタン表示を更新する
     */
    const updateToggleButton = () => {
        const btn = document.getElementById('langToggleBtn');
        if (btn) {
            btn.textContent = currentLang === 'ja' ? '🇬🇧 EN' : '🇯🇵 JA';
            btn.title = currentLang === 'ja' ? 'Switch to English' : '日本語に切り替え';
        }
    };

    /**
     * テキストを現在の言語で返す
     * @param {string} ja - 日本語テキスト
     * @param {string} en - 英語テキスト
     * @returns {string} 現在の言語のテキスト
     */
    const t = (ja, en) => currentLang === 'ja' ? ja : en;

    /**
     * 英語説明ブロックのHTMLを返す（日本語モードでは折りたたみ可能）
     * @param {string} enText - 英語テキスト
     * @param {string} id - ユニークID（省略可）
     */
    const enBlock = (enText, id = '') => {
        if (currentLang === 'en') {
            return `<div class="rule-box-content">${enText}</div>`;
        }
        // 日本語モードでは英語を折りたたみ表示
        const uid = id || Math.random().toString(36).slice(2, 8);
        return `
      <details class="en-details" id="en_${uid}">
        <summary class="en-summary">🇬🇧 英語原文を表示</summary>
        <div class="rule-box-content-en">${enText}</div>
      </details>
    `;
    };

    return { get, toggle, set, subscribe, t, enBlock, updateToggleButton };
})();
