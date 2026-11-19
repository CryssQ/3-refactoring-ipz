class ShippingStrategy {
    calculate(weightKg, distanceKm) {
        throw new Error(
            "Метод calculate() повинен бути реалізований підкласом!"
        );
    }
}

class PickupStrategy extends ShippingStrategy {
    calculate(weightKg, distanceKm) {
        return 0.0;
    }
}

class CourierStrategy extends ShippingStrategy {
    calculate(weightKg, distanceKm) {
        const baseFee = 70.0;
        const distanceFee = distanceKm * 5.0;
        const weightFee = weightKg * 2.5;

        return Number(
            (baseFee + distanceFee + weightFee).toFixed(2)
        );
    }
}

class ExpressDeliveryStrategy extends ShippingStrategy {
    calculate(weightKg, distanceKm) {
        const baseFee = 150.0;
        let cost = baseFee + (distanceKm * 10.0);

        if (weightKg > 5.0) {
            cost *= 1.3;
        }

        return Number(cost.toFixed(2));
    }
}

class PostMachineStrategy extends ShippingStrategy {
    calculate(weightKg, distanceKm) {
        if (weightKg > 10.0) {
            throw new Error(
                "Посилка занадто важка для комірки поштомату (макс. 10 кг)!"
            );
        }

        return 50.00;
    }
}

class OrderShippingContext {
    constructor(strategy) {
        this.strategy = strategy;
    }

    setStrategy(strategy) {
        this.strategy = strategy;
    }

    calculateDeliveryCost(weightKg, distanceKm) {
        return this.strategy.calculate(weightKg, distanceKm);
    }
}

const weight = 6.0;
const distance = 15.0;

const context = new OrderShippingContext(
    new CourierStrategy()
);

try {
    const costCourier = context.calculateDeliveryCost(weight, distance);
    console.log(
        `1. Кур'єрська доставка: ${costCourier.toFixed(2)} грн`
    );

    context.setStrategy(new ExpressDeliveryStrategy());
    const costExpress = context.calculateDeliveryCost(weight, distance);
    console.log(
        `2. Експрес-доставка: ${costExpress.toFixed(2)} грн`
    );

    context.setStrategy(new PickupStrategy());
    const costPickup = context.calculateDeliveryCost(weight, distance);
    console.log(
        `3. Самовивіз: ${costPickup.toFixed(2)} грн`
    );

    context.setStrategy(new PostMachineStrategy());
    const costPostMachine = context.calculateDeliveryCost(weight, distance);
    console.log(
        `4. Доставка у поштомат: ${costPostMachine.toFixed(2)} грн`
    );

} catch (error) {
    console.log(`Помилка: ${error.message}`);
}
