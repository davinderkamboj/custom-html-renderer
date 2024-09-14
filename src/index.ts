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
async function renderTemplate(htmlString: string, data: DataObject, removeJsAttributes = false): Promise<string> {
    const dom = new JSDOM(htmlString);
    const document = dom.window.document;

    async function processDynamicValues(el: HTMLElement, currentData: DataObject, globalData: DataObject = data) {
        // Handle `js-value`
        if (el.hasAttribute('js-value')) {
            const key = el.getAttribute('js-value') as string;
            const value = getValueByPath(key, currentData, globalData);
            if (value !== undefined) {
                el.textContent = value;
            }
        }

        // Process children elements recursively
        for (const child of Array.from(el.children)) {
            await processDynamicValues(child as HTMLElement, currentData, globalData);
        }
    }

    async function processConditionals(el: HTMLElement, currentData: DataObject, globalData: DataObject = data) {
        // Handle `js-if`
        if(el.hasAttribute('js-if')) {
            const condition = el.getAttribute('js-if') as string;
            const show = evaluateExpression(condition, currentData, globalData);
            if (show) {
                el.classList.remove('remove-it');
            } else {
                el.classList.add('remove-it');
            }
        }

        // Handle `js-if-not`
        if(el.hasAttribute('js-if-not')) {
            const condition = el.getAttribute('js-if-not') as string;
            const show = !evaluateExpression(condition, currentData, globalData);
            if (show) {
                el.classList.remove('remove-it');
            } else {
                el.classList.add('remove-it');
            }
        }

        // Process children elements recursively
        for (const child of Array.from(el.children)) {
            await processConditionals(child as HTMLElement, currentData, globalData);
        }
    }

    // Handle `js-each` elements separately to avoid infinite recursion
    async function processEachElements(el: HTMLElement, currentData: DataObject, globalData: DataObject = data) {
        if(el.hasAttribute('js-each')) {
            const [itemName, arrayName] = (el.getAttribute('js-each') as string).split(' in ');
            const array = getValueByPath(arrayName, currentData, globalData);
            if (Array.isArray(array)) {
                const parent = el.parentElement;
                const originalTemplate = el.cloneNode(true) as HTMLElement;
                for (const item of array) {
                    const clone = originalTemplate.cloneNode(true) as HTMLElement;
                    const newContext = { ...currentData, [itemName]: item };
                    await processConditionals(clone, newContext, globalData);
                    await processDynamicValues(clone, newContext, globalData);
                    if (parent) parent.insertBefore(clone, el);
                }

                // Process children elements recursively
                for (const child of Array.from(el.children)) {
                    await processEachElements(child as HTMLElement, currentData, globalData);
                }

                // Remove the original template element
                el.remove();
            }
        }

        // Process children elements recursively
        for (const child of Array.from(el.children)) {
            await processEachElements(child as HTMLElement, currentData, globalData);
        }
    }

    // Start processing the entire document
    await processConditionals(document.body as HTMLElement, data);
    await processDynamicValues(document.body as HTMLElement, data);
    await processEachElements(document.body as HTMLElement, data);

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
