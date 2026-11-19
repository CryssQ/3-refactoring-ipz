class PaymentProcessor {
    pay(accountIdentifier, amount) {
        throw new Error(
            "Метод pay() має бути реалізований!"
        );
    }
}

class InternalBankProcessor extends PaymentProcessor {
    pay(accountIdentifier, amount) {
        console.log(
            `[InternalBank] Списання ${amount.toFixed(2)} грн з рахунку ${accountIdentifier}`
        );

        console.log(
            "[InternalBank] Транзакцію успішно проведено через локальний кліринг."
        );

        return true;
    }
}

class GlobalPaySDK {
    chargeCustomer(userEmail, centsAmount, currency) {
        console.log(
            `[GlobalPay SDK] Авторизація платежу для email: ${userEmail}`
        );

        console.log(
            `[GlobalPay SDK] Списано: ${centsAmount} копійок (${currency})`
        );

        return {
            status: "SUCCESS",
            txId: "GP-9841249"
        };
    }
}

class GlobalPayAdapter extends PaymentProcessor {
    constructor(sdk) {
        super();
        this.sdk = sdk;
    }

    pay(accountIdentifier, amount) {
        const cents = Math.round(amount * 100);
        const result = this.sdk.chargeCustomer(
            accountIdentifier,
            cents,
            "UAH"
        );

        return result.status === "SUCCESS";
    }
}

class CryptoPayService {
    sendCryptoInvoice(walletAddress, uahSum) {
        console.log(
            `[CryptoPay] Створено крипто-інвойс на гаманець ${walletAddress} на суму ${uahSum.toFixed(2)} грн`
        );

        return "SUCCESS";
    }
}

class CryptoPayAdapter extends PaymentProcessor {
    constructor(cryptoService) {
        super();
        this.cryptoService = cryptoService;
    }

    pay(accountIdentifier, amount) {
        const status = this.cryptoService.sendCryptoInvoice(
            accountIdentifier,
            amount
        );

        return status === "SUCCESS";
    }
}

class CheckoutService {
    constructor(paymentProcessor) {
        this.paymentProcessor = paymentProcessor;
    }

    checkout(customerInfo, totalPrice) {
        console.log(
            `\n>>> [CHECKOUT] Початок оформлення замовлення на суму: ${totalPrice.toFixed(2)} грн`
        );

        const isPaid = this.paymentProcessor.pay(
            customerInfo,
            totalPrice
        );

        if (isPaid) {
            console.log(
                ">>> [CHECKOUT] Оплата пройшла! Формуємо накладну для відправки."
            );
        } else {
            console.log(
                ">>> [CHECKOUT] Помилка оплати!"
            );
        }
    }
}

console.log("\n--- 1. ОПЛАТА ЧЕРЕЗ ВНУТРІШНІЙ БАНК ---");

const localProcessor = new InternalBankProcessor();
const cart1 = new CheckoutService(localProcessor);

cart1.checkout(
    "UA413007200000026001234567890",
    3500.00
);

console.log("\n--- 2. ОПЛАТА ЧЕРЕЗ GLOBALPAY ---");

const externalSdk = new GlobalPaySDK();
const adaptedPayment = new GlobalPayAdapter(externalSdk);
const cart2 = new CheckoutService(adaptedPayment);

cart2.checkout(
    "customer@gmail.com",
    3500.00
);

console.log("\n--- 3. ОПЛАТА ЧЕРЕЗ CRYPTOPAY ---");

const cryptoService = new CryptoPayService();
const cryptoPayment = new CryptoPayAdapter(cryptoService);
const cart3 = new CheckoutService(cryptoPayment);

cart3.checkout(
    "0x1234567890ABCDEF",
    3500.00
);
