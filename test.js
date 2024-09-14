const { renderTemplate } = require('./index');
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

    <h1 data-value="user.name"></h1>
    <h1 data-value="user.email"></h1>
    <h2 data-if="user.isAdmin">Admin Section</h2>

    <table border="1">
        <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Orders</th>
            <th>Admin</th>
        </tr>
        <tr data-each="user in users">
            <td data-value="user.name"></td>
            <td data-value="user.email"></td>
            <td>
                <table border="1">
                    <tr data-each="order in user.orders">
                        <td data-value="order.name"></td>
                        <td data-value="order.date"></td>
                        <td data-value="global.user.name"></td>
                        <td data-value="user.name"></td>
                    </tr>
                </table>
            </td>
            <td data-if="user.isAdmin">Admin</td>
            <td data-if-not="user.isAdmin">Not Admin</td>
        </tr>
    </table>

</body>
</html>
`;

// Example data
const data = {
    user: { name: "John Doe", email: "john@example.com", isAdmin: true },
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
            orders: [{ name: "Tablet", date: "2023-03-01" }]
        }
    ]
};

// Render the template with the data
const renderedHtml = renderTemplate(htmlTemplate, data);

console.log(renderedHtml);

// Write the rendered HTML to a file
fs.writeFileSync('output.html', renderedHtml);
