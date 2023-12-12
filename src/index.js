const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

const customer = [];

function verfyAccount(request, response, next) {
    const { cpf } = request.headers;

    const customer = customer.find((customer) => customer.cpf === cpf);

    if(!customer) {
        return response.status(400).json({ error: "Perfil não encontrado"});
    }

    request.customer = customer;

    return next();
};

function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if(operation.type === "credit") {
            return acc + operation.amount;
        } else {
            return acc - operation.amount;
        }
    }, 0);

    return balance;
}

app.post("/account", (request, response) => {
    const { cpf, name } = req.body;

    const customerExists = customer.some( (customer) => customer.cpf === cpf)

    if(customerExists) {
        return response.status(400).json({ error: 'perfil já cadastrado'});
    }

    customer.push({
        cpf,
        name,
        id: uuidv4(),
        statement: []
    });

    return res.status(201).send();
});

app.get("/statement", verfyAccount, (request, response) => {
    const { customer } = request;

    return response.json(customer.statement);
});

app.post("/deposit", verfyAccount, (request, response) => {
    const { descripition, amount } = request.body;

    const { customer } = request;

    const statementOperation = {
        descripition,
        amount,
        created_at: new Date(),
        type: "credit"
    }

    customer.statement.push(statementOperation);

    return response.status(201).send()
})

app.post("/withdraw", verfyAccount, (request, response) => {
    const { amount } = request.body;
    const { customer } = request;

    const balance = get.balance(customer.statement);

    if (balance < amount) {
        return response.status(400).json({ error: "Saldo insuficiente" });
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: "debit"
    };

    customer.statement.push(statementOperation);

    return response.status(201).send();
});

app.get("/statement/date", verfyAccount, (request, response) => {
    const { customer } = request;
    const { date } = request.query;

    const dateFormat = new Date(date + "00:00");

    const statement = customer.statement.filter(
        (statement) =>
        statement.created_at.toDateString() ===
        new Date(dateFormat).toDateString()
    );

    return response.json(statement);
});

app.put("/account", verfyAccount, (request, response) => {
    const { name } = request.body;
    const { customer } = request;

    customer.name = name;

    return response.status(201).send();
});

app.get("/account", verfyAccount, (request, response) => {
    const { customer } = request;

    return response.json(customer);
});

app.delete("/account", verfyAccount, (request, response) => {
    const { customer } = request;

    customer.splice(customer, 1);

    return response.status(200).json(customer);
});

app.get("/balance", verfyAccount, (request, response) => {
    const { customer } = request;

    const balance = getBalance(customer.statement);

    return response.json(balance);
})

app.listen(3333);