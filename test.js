const { renderTemplate } = require('./dist/index');
const fs = require('fs');

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
                        <td js-value="order.name">exmaple order name</td>
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
        },
        {
            name: "Bob2",
            email: "bob3@example.com",
            isAdmin: false,
            orders: [{ name: "Tablet3", date: "2013-03-01" }]
        },
        {
            name: "Bob3",
            email: "bob3@example.com",
            isAdmin: false,
            orders: [{ name: "Tablet3", date: "2033-03-01" }]
        }
    ]
};

// Render the template with the data
const renderedHtml = renderTemplate(htmlTemplate, data, true);

console.log(renderedHtml);

// Write the rendered HTML to a file
fs.writeFileSync('output.html', renderedHtml);
