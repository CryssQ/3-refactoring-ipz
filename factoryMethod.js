class Order {
    constructor(orderId, customer, discountPercent = 0) {
        this.orderId = orderId;
        this.customer = customer;
        this.discountPercent = discountPercent;
        this.items = [];
        this.createdAt = new Date()
            .toISOString()
            .replace('T', ' ')
            .substring(0, 19);
    }

    addItem(name, price, quantity = 1) {
        this.items.push({ name, price, qty: quantity });
    }

    getSubtotal() {
        return this.items.reduce(
            (sum, item) => sum + item.price * item.qty, 0
        );
    }

    getTotal() {
        const subtotal = this.getSubtotal();
        return Number(
            (subtotal * (1 - this.discountPercent / 100)).toFixed(2)
        );
    }
}

class InvoiceExporter {
    export(order) {
        throw new Error(
            "Метод export() повинен бути реалізований підкласом!"
        );
    }
}


//TXT
class TextInvoiceExporter extends InvoiceExporter {
    export(order) {
        const lines = [
            "========================================",
            `ФІСКАЛЬНИЙ ЧЕК #${order.orderId}`,
            `Клієнт: ${order.customer}`,
            `Час: ${order.createdAt}`,
            "----------------------------------------"
        ];

        for (const item of order.items) {
            const itemTotal = (item.price * item.qty).toFixed(2);
            lines.push(
                `${item.name} x${item.qty} = ${itemTotal} грн`
            );
        }

        lines.push("----------------------------------------");
        lines.push(`Сума: ${order.getSubtotal().toFixed(2)} грн`);

        if (order.discountPercent > 0) {
            lines.push(`Знижка: ${order.discountPercent}%`);
        }

        lines.push(`ДО ОПЛАТИ: ${order.getTotal().toFixed(2)} грн`);
        lines.push("========================================");

        return lines.join("\n");
    }
}


//JSON
class JsonInvoiceExporter extends InvoiceExporter {
    export(order) {
        const payload = {
            document: "INVOICE",
            invoice_number: order.orderId,
            client: order.customer,
            timestamp: order.createdAt,
            lines: order.items,
            pricing: {
                subtotal: order.getSubtotal(),
                discount_rate: order.discountPercent,
                final_amount: order.getTotal()
            }
        };

        return JSON.stringify(payload, null, 2);
    }
}


//HTML
class HtmlInvoiceExporter extends InvoiceExporter {
    export(order) {
        const rows = order.items
            .map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.qty}</td>
                    <td>${(item.price * item.qty).toFixed(2)} грн</td>
                </tr>
            `)
            .join("");

        return `
<div style="border:1px solid #333; padding:12px; width:340px;">
    <h3>Рахунок #${order.orderId}</h3>
    <p>Клієнт: ${order.customer}</p>
    <p>Дата: ${order.createdAt}</p>

    <table border="1" width="100%">
        <tr>
            <th>Товар</th>
            <th>К-сть</th>
            <th>Сума</th>
        </tr>
        ${rows}
    </table>

    <p>Сума: ${order.getSubtotal().toFixed(2)} грн</p>
    <p>Знижка: ${order.discountPercent}%</p>
    <p><b>Всього до сплати: ${order.getTotal().toFixed(2)} грн</b></p>
</div>`;
    }
}

class MarkdownInvoiceExporter extends InvoiceExporter {
    export(order) {
        const lines = [
            `# Чек #${order.orderId}`,
            `**Клієнт:** ${order.customer}`,
            `**Дата:** ${order.createdAt}\n`,
            "| Товар | К-сть | Ціна |",
            "| :--- | :--- | :--- |"
        ];

        for (const item of order.items) {
            const itemCost = (item.price * item.qty).toFixed(2);

            lines.push(
                `| ${item.name} | ${item.qty} | ${itemCost} грн |`
            );
        }

        lines.push(`\n**Сума:** ${order.getSubtotal().toFixed(2)} грн`);

        if (order.discountPercent > 0) {
            lines.push(`**Знижка:** ${order.discountPercent}%`);
        }

        lines.push(
            `\n**Разом до оплати:** ${order.getTotal().toFixed(2)} грн`
        );

        return lines.join("\n");
    }
}

class InvoiceProcessingService {
    createExporter() {
        throw new Error(
            "Метод createExporter() повинен бути реалізований підкласом!"
        );
    }

    processAndPrint(order) {
        console.log(`\n>>> Обробка замовлення #${order.orderId}...`);

        const exporter = this.createExporter();
        const result = exporter.export(order);

        console.log(result);

        return result;
    }
}

class FastPosTerminalService extends InvoiceProcessingService {
    createExporter() {
        return new TextInvoiceExporter();
    }
}

class ApiIntegrationService extends InvoiceProcessingService {
    createExporter() {
        return new JsonInvoiceExporter();
    }
}

class EmailNotificationService extends InvoiceProcessingService {
    createExporter() {
        return new HtmlInvoiceExporter();
    }
}

class MarkdownExportService extends InvoiceProcessingService {
    createExporter() {
        return new MarkdownInvoiceExporter();
    }
}

const order = new Order(505, "Олександр", 15);

order.addItem("Холодильник", 22000, 1);
order.addItem("Набір посуду", 450, 2);
order.addItem("Coca-Cola", 45, 5);


// TXT
const pos = new FastPosTerminalService();
console.log("\n========== TXT ==========");
pos.processAndPrint(order);


// JSON
const api = new ApiIntegrationService();
console.log("\n========== JSON ==========");
api.processAndPrint(order);


// HTML
const email = new EmailNotificationService();
console.log("\n========== HTML ==========");
email.processAndPrint(order);


// MARKDOWN
const markdown = new MarkdownExportService();
console.log("\n========== MARKDOWN ==========");
markdown.processAndPrint(order);
