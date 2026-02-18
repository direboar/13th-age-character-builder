/**
 * test-runner.js — 軽量ブラウザベーステストランナー
 * 依存ライブラリなし。describe/it/expect APIを提供する。
 */
const TestRunner = (() => {
    // テスト結果
    const suites = [];
    let currentSuite = null;

    /**
     * テストスイートを定義する
     * @param {string} name - スイート名
     * @param {Function} fn - テスト定義関数
     */
    const describe = (name, fn) => {
        currentSuite = { name, tests: [], passed: 0, failed: 0 };
        suites.push(currentSuite);
        fn();
        currentSuite = null;
    };

    /**
     * テストケースを定義する
     * @param {string} name - テスト名
     * @param {Function} fn - テスト実行関数
     */
    const it = (name, fn) => {
        const test = { name, passed: false, error: null };
        try {
            fn();
            test.passed = true;
            if (currentSuite) currentSuite.passed++;
        } catch (e) {
            test.error = e.message;
            if (currentSuite) currentSuite.failed++;
        }
        if (currentSuite) currentSuite.tests.push(test);
    };

    /**
     * アサーション用のexpect関数
     * @param {*} actual - 実際の値
     * @returns {Object} アサーションチェーン
     */
    const expect = (actual) => ({
        toBe: (expected) => {
            if (actual !== expected) {
                throw new Error(`期待値: ${JSON.stringify(expected)}, 実際: ${JSON.stringify(actual)}`);
            }
        },
        toEqual: (expected) => {
            const a = JSON.stringify(actual);
            const e = JSON.stringify(expected);
            if (a !== e) {
                throw new Error(`期待値: ${e}, 実際: ${a}`);
            }
        },
        toBeGreaterThan: (expected) => {
            if (!(actual > expected)) {
                throw new Error(`${actual} > ${expected} が期待されたが、失敗`);
            }
        },
        toBeLessThan: (expected) => {
            if (!(actual < expected)) {
                throw new Error(`${actual} < ${expected} が期待されたが、失敗`);
            }
        },
        toBeGreaterThanOrEqual: (expected) => {
            if (!(actual >= expected)) {
                throw new Error(`${actual} >= ${expected} が期待されたが、失敗`);
            }
        },
    });

    /**
     * テスト結果をDOM上にレンダリングする
     */
    const renderResults = () => {
        const container = document.getElementById('test-results');
        if (!container) return;

        let totalPassed = 0;
        let totalFailed = 0;
        suites.forEach(s => { totalPassed += s.passed; totalFailed += s.failed; });

        const allPassed = totalFailed === 0;

        let html = `
            <div class="summary ${allPassed ? 'all-pass' : 'has-fail'}">
                <h1>${allPassed ? '✅ 全テスト合格' : '❌ テスト失敗あり'}</h1>
                <p>合格: ${totalPassed} / 失敗: ${totalFailed} / 合計: ${totalPassed + totalFailed}</p>
            </div>
        `;

        suites.forEach(suite => {
            const suiteStatus = suite.failed === 0 ? 'pass' : 'fail';
            html += `
                <div class="suite ${suiteStatus}">
                    <h2>${suiteStatus === 'pass' ? '✅' : '❌'} ${suite.name}
                        <span class="suite-count">(${suite.passed}/${suite.passed + suite.failed})</span>
                    </h2>
                    <div class="tests">
            `;
            suite.tests.forEach(test => {
                html += `
                    <div class="test ${test.passed ? 'pass' : 'fail'}">
                        <span class="test-icon">${test.passed ? '✓' : '✗'}</span>
                        <span class="test-name">${test.name}</span>
                        ${test.error ? `<div class="test-error">${test.error}</div>` : ''}
                    </div>
                `;
            });
            html += `</div></div>`;
        });

        container.innerHTML = html;
    };

    return { describe, it, expect, renderResults, suites };
})();
