
# JS Email Template Compiler

A JavaScript library for compiling email templates with dynamic content, conditional rendering, and iteration using `jsdom`. The logic is handled via custom HTML attributes such as `js-value`, `js-if`, `js-if-not`, and `js-each`.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [JavaScript Example](#javascript-example)
  - [TypeScript Example](#typescript-example)
  - [Options](#options)
- [Attributes](#attributes)
  - [js-value](#js-value)
  - [js-if](#js-if)
  - [js-if-not](#js-if-not)
  - [js-each](#js-each)
- [Examples](#examples)

## Installation

Install the package using npm:

```bash
npm install js-email-template-compiler
```

## Usage

### JavaScript Example
```javascript
const { renderTemplate } = require('js-email-template-compiler');

// Example HTML template
const htmlTemplate = `
    <div>
        <p js-value="user.name"></p>
        <p js-if="user.isAdmin">Admin Section</p>
        <p js-if-not="user.isAdmin">User Section</p>
        <ul>
            <li js-each="item in user.items">
                <span js-value="item.name"></span>
            </li>
        </ul>
    </div>
`;

// Example data
const data = {
    user: {
        name: 'John Doe',
        isAdmin: true,
        items: [
            { name: 'Item 1' },
            { name: 'Item 2' }
        ]
    }
};

// Render template
const result = renderTemplate(htmlTemplate, data, true);
console.log(result);
```

## TypeScript Example
```typescript
import { renderTemplate } from 'js-email-template-compiler';

const htmlTemplate = `
    <div>
        <h1 js-value="user.name">Placeholder</h1>
        <h2 js-if="user.isAdmin">Admin Section</h2>
        <h3 js-if-not="user.isAdmin">User Section</h3>
        <ul>
            <li js-each="order in user.orders">
                <span js-value="order.name"></span> - <span js-value="order.date"></span>
            </li>
        </ul>
    </div>
`;

const data = {
    user: {
        name: "John Doe",
        isAdmin: true,
        orders: [
            { name: "Order 1", date: "2023-01-01" },
            { name: "Order 2", date: "2023-02-01" }
        ]
    }
};

const renderedHtml = renderTemplate(htmlTemplate, data, true);
console.log(renderedHtml);
```

### Options

The `renderTemplate` function accepts the following arguments:

1. `htmlString` (string): The HTML template string to process.
2. `data` (object): The data object for binding dynamic values.
3. `removeJsAttributes` (boolean): Whether to remove `js-*` attributes after rendering. If `true`, these attributes will be removed from the resulting HTML.

## Attributes

The library uses custom attributes to define dynamic logic inside the HTML template.

### js-value

Inserts dynamic content into the template from the provided data.

#### Example:
```html
<p js-value="user.name"></p>
```
This replaces the content of the `<p>` tag with the value of `user.name` from the `data` object.

### js-if

Conditionally renders an element if the expression evaluates to `true`.

#### Example:
```html
<p js-if="user.isAdmin">Admin Section</p>
```
This shows the element only if `user.isAdmin` is `true`.

### js-if-not

Conditionally renders an element if the expression evaluates to `false`.

#### Example:
```html
<p js-if-not="user.isAdmin">User Section</p>
```
This shows the element only if `user.isAdmin` is `false`.

### js-each

Iterates over an array and renders multiple elements based on the items in the array.

#### Example:
```html
<ul>
  <li js-each="item in user.items">
    <span js-value="item.name"></span>
  </li>
</ul>
```
This repeats the `<li>` element for each item in the `user.items` array.

## Examples

### Advanced Example with Nested Iteration

```javascript
const { renderTemplate } = require('js-email-template-compiler');

// Example HTML template
const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Template Renderer</title>
</head>
<body>
    <h1 js-value="user.name">example name</h1>
    <h1 js-value="user.email">example email</h1>
    <h2 js-if="user.isAdmin">Admin Section
        <h3 js-if="user.isSuperAdmin">Super Admin Section</h3>
    </h2>
    <table border="1">
        <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Orders</th>
            <th>Admin</th>
        </tr>
        <tr js-each="user in users">
            <td js-value="user.name"></td>
            <td style="text-align: center" js-value="user.email"></td>
            <td>
                <table border="1">
                    <tr js-each="order in user.orders">
                        <td js-value="order.name">example order name</td>
                        <td js-value="order.date">example order date</td>
                        <td js-value="global.user.name">example global name</td>
                        <td js-value="user.name">example user name</td>
                    </tr>
                </table>
            </td>
            <td style="text-align: center" js-if="user.isAdmin">Admin</td>
            <td style="text-align: center" js-if-not="user.isAdmin">Not Admin</td>
        </tr>
    </table>

</body>
</html>
`;

// Example data
const data = {
    user: { name: "John Doe", email: "john@example.com", isAdmin: true, isSuperAdmin: false },
    users: [
        {
            name: "Alice",
            email: "alice@example.com",
            isAdmin: true,
            orders: [
                { name: "Laptop", date: "2023-01-01" },
                { name: "Phone", date: "2023-02-01" }
            ]
        },
        {
            name: "Bob",
            email: "bob@example.com",
            isAdmin: false,
            orders: [{ name: "Tablet", date: "2003-03-01" }]
        }
    ]
};

// Render the template with the data
const renderedHtml = renderTemplate(htmlTemplate, data, true);
console.log(renderedHtml);
```

## License

This project is licensed under the ISC License.
