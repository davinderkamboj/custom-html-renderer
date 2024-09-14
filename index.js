const { JSDOM } = require('jsdom');

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
    } catch (e) {
        console.error('Error evaluating expression:', expression, e);
        return false;
    }
}

// Render the template by parsing the DOM and applying the attribute-based logic
function renderTemplate(htmlString, data) {
    const dom = new JSDOM(htmlString);
    const document = dom.window.document;

    function processElement(rootElement, currentData, globalData = data) {
        // Handle `data-value`
        rootElement.querySelectorAll('[data-value]').forEach(el => {
            const key = el.getAttribute('data-value');
            const value = getValueByPath(key, currentData, globalData);
            if (value !== undefined) el.textContent = value;
        });

        // Handle `data-if`
        rootElement.querySelectorAll('[data-if]').forEach(el => {
            const condition = el.getAttribute('data-if');
            const show = evaluateExpression(condition, currentData, globalData);
            el.style.display = show ? '' : 'none';
        });

        // Handle `data-if-not`
        rootElement.querySelectorAll('[data-if-not]').forEach(el => {
            const condition = el.getAttribute('data-if-not');
            const show = !evaluateExpression(condition, currentData, globalData);
            el.style.display = show ? '' : 'none';
        });

        // Handle `data-each`
        rootElement.querySelectorAll('[data-each]').forEach(el => {
            const [itemName, arrayName] = el.getAttribute('data-each').split(' in ');
            const array = getValueByPath(arrayName, currentData, globalData);
            if (Array.isArray(array)) {
                const parent = el.parentElement;
                const originalTemplate = el.cloneNode(true);
                array.forEach(item => {
                    const clone = originalTemplate.cloneNode(true);
                    const newContext = { ...currentData, [itemName]: item };
                    processElement(clone, newContext, globalData);
                    parent.insertBefore(clone, el);
                });
                el.remove(); // Remove the original template element
            }
        });
    }

    // Start processing the entire document
    processElement(document.body, data);

    return dom.serialize();
}

module.exports = { renderTemplate };
