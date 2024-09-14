"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderTemplate = renderTemplate;
const jsdom_1 = require("jsdom");
// Helper to get the value from the data object by a string path
function getValueByPath(path, obj, globalData) {
    if (path.startsWith('global.')) {
        path = path.replace('global.', '');
        obj = globalData;
    }
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}
// Evaluate an expression as a boolean value
function evaluateExpression(expression, data, globalData) {
    try {
        const evalExpression = expression.replace(/([a-zA-Z_][a-zA-Z0-9_.]*)/g, (match) => {
            const value = getValueByPath(match, data, globalData);
            return value === undefined ? 'false' : JSON.stringify(value);
        });
        return new Function('return ' + evalExpression)();
    }
    catch (e) {
        console.error('Error evaluating expression:', expression, e);
        return false;
    }
}
// Render the template by parsing the DOM and applying the attribute-based logic
async function renderTemplate(htmlString, data, removeJsAttributes = false) {
    const dom = new jsdom_1.JSDOM(htmlString);
    const document = dom.window.document;
    async function processDynamicValues(el, currentData, globalData = data) {
        // Handle `js-value`
        if (el.hasAttribute('js-value')) {
            const key = el.getAttribute('js-value');
            const value = getValueByPath(key, currentData, globalData);
            if (value !== undefined) {
                el.textContent = value;
            }
        }
        // Process children elements recursively
        for (const child of Array.from(el.children)) {
            await processDynamicValues(child, currentData, globalData);
        }
    }
    async function processConditionals(el, currentData, globalData = data) {
        // Handle `js-if`
        if (el.hasAttribute('js-if')) {
            const condition = el.getAttribute('js-if');
            const show = evaluateExpression(condition, currentData, globalData);
            if (show) {
                el.classList.remove('remove-it');
            }
            else {
                el.classList.add('remove-it');
            }
        }
        // Handle `js-if-not`
        if (el.hasAttribute('js-if-not')) {
            const condition = el.getAttribute('js-if-not');
            const show = !evaluateExpression(condition, currentData, globalData);
            if (show) {
                el.classList.remove('remove-it');
            }
            else {
                el.classList.add('remove-it');
            }
        }
        // Process children elements recursively
        for (const child of Array.from(el.children)) {
            await processConditionals(child, currentData, globalData);
        }
    }
    // Handle `js-each` elements separately to avoid infinite recursion
    async function processEachElements(el, currentData, globalData = data) {
        if (el.hasAttribute('js-each')) {
            const [itemName, arrayName] = el.getAttribute('js-each').split(' in ');
            const array = getValueByPath(arrayName, currentData, globalData);
            if (Array.isArray(array)) {
                const parent = el.parentElement;
                const originalTemplate = el.cloneNode(true);
                for (const item of array) {
                    const clone = originalTemplate.cloneNode(true);
                    const newContext = { ...currentData, [itemName]: item };
                    await processConditionals(clone, newContext, globalData);
                    await processDynamicValues(clone, newContext, globalData);
                    if (parent)
                        parent.insertBefore(clone, el);
                }
                // Process children elements recursively
                for (const child of Array.from(el.children)) {
                    await processEachElements(child, currentData, globalData);
                }
                // Remove the original template element
                el.remove();
            }
        }
        // Process children elements recursively
        for (const child of Array.from(el.children)) {
            await processEachElements(child, currentData, globalData);
        }
    }
    // Start processing the entire document
    await processConditionals(document.body, data);
    await processDynamicValues(document.body, data);
    await processEachElements(document.body, data);
    if (removeJsAttributes) {
        // Remove all js-value, js-if, js-if-not, js-each attributes
        const jsAttributes = document.querySelectorAll('[js-value], [js-if], [js-if-not], [js-each]');
        for (const el of jsAttributes) {
            if (el.classList.contains('remove-it')) {
                el.remove();
                continue;
            }
            el.removeAttribute('js-value');
            el.removeAttribute('js-if');
            el.removeAttribute('js-if-not');
            el.removeAttribute('js-each');
        }
    }
    else {
        // Remove display none elements
        const displayNoneElements = document.querySelectorAll('[js-if], [js-if-not]');
        for (const el of displayNoneElements) {
            if (el.classList.contains('remove-it')) {
                el.remove();
            }
        }
    }
    return dom.serialize();
}
//# sourceMappingURL=index.js.map