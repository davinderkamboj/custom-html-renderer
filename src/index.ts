import { JSDOM } from 'jsdom';

// Helper types
interface DataObject {
    [key: string]: any;
}

// Helper to get the value from the data object by a string path
function getValueByPath(path: string, obj: DataObject, globalData: DataObject): any {
    if (path.startsWith('global.')) {
        path = path.replace('global.', '');
        obj = globalData;
    }
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

// Evaluate an expression as a boolean value
function evaluateExpression(expression: string, data: DataObject, globalData: DataObject): boolean {
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
function renderTemplate(htmlString: string, data: DataObject, removeJsAttributes = false): string {
    const dom = new JSDOM(htmlString);
    const document = dom.window.document;

    function processElement(rootElement: HTMLElement, currentData: DataObject, globalData: DataObject = data) {
        // Handle `js-value`
        rootElement.querySelectorAll('[js-value]').forEach(el => {
            const key = el.getAttribute('js-value') as string;
            const value = getValueByPath(key, currentData, globalData);
            if (value !== undefined) el.textContent = value;
        });

        // Handle `js-if`
        rootElement.querySelectorAll('[js-if]').forEach(el => {
            const condition = el.getAttribute('js-if') as string;
            const show = evaluateExpression(condition, currentData, globalData);
            if (show) {
                el.classList.remove('remove-it');
            } else {
                el.classList.add('remove-it');
            }
        });

        // Handle `js-if-not`
        rootElement.querySelectorAll('[js-if-not]').forEach(el => {
            const condition = el.getAttribute('js-if-not') as string;
            const show = !evaluateExpression(condition, currentData, globalData);
            if (show) {
                el.classList.remove('remove-it');
            } else {
                el.classList.add('remove-it');
            }
        });

        // Handle `js-each`
        rootElement.querySelectorAll('[js-each]').forEach(el => {
            const [itemName, arrayName] = (el.getAttribute('js-each') as string).split(' in ');
            const array = getValueByPath(arrayName, currentData, globalData);
            if (Array.isArray(array)) {
                const parent = el.parentElement;
                const originalTemplate = el.cloneNode(true) as HTMLElement;
                array.forEach(item => {
                    const clone = originalTemplate.cloneNode(true) as HTMLElement;
                    const newContext = { ...currentData, [itemName]: item };
                    processElement(clone, newContext, globalData);
                    if (parent) parent.insertBefore(clone, el);
                });
                el.remove(); // Remove the original template element
            }
        });
    }

    // Start processing the entire document
    processElement(document.body as HTMLElement, data);

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
    } else {
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

export { renderTemplate };
