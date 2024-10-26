// app.js
document.addEventListener("DOMContentLoaded", function () {
    const authBtn = document.getElementById("auth-btn");
    const registerBtn = document.getElementById("register-btn");
    const addExpenseBtn = document.getElementById("add-expense-btn");
    const expenseContainer = document.getElementById("expense-container");
    const authContainer = document.getElementById("auth-container");
    const expenseItems = document.getElementById("expense-items");
    const expenseChart = document.getElementById("expense-chart").getContext("2d");
    let userId = null;

    // User Authentication
    authBtn.addEventListener("click", function () {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                userId = userCredential.user.uid;
                authContainer.style.display = "none";
                expenseContainer.style.display = "block";
                loadExpenses();
            })
            .catch((error) => {
                alert(error.message);
            });
    });

    registerBtn.addEventListener("click", function () {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                userId = userCredential.user.uid;
                authContainer.style.display = "none";
                expenseContainer.style.display = "block";
            })
            .catch((error) => {
                alert(error.message);
            });
    });

    // Add Expense
    addExpenseBtn.addEventListener("click", function () {
        const expenseName = document.getElementById("expense-name").value;
        const expenseAmount = document.getElementById("expense-amount").value;
        const expenseCategory = document.getElementById("expense-category").value;

        db.collection("expenses").add({
            uid: userId,
            name: expenseName,
            amount: parseFloat(expenseAmount),
            category: expenseCategory,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            loadExpenses();
        });
    });

    // Load Expenses
    function loadExpenses() {
        expenseItems.innerHTML = "";
        db.collection("expenses").where("uid", "==", userId).get()
            .then((snapshot) => {
                let totalExpenses = 0;
                const categories = {};
                snapshot.forEach((doc) => {
                    const expense = doc.data();
                    totalExpenses += expense.amount;

                    const li = document.createElement("li");
                    li.innerText = `${expense.name}: ₹${expense.amount} - ${expense.category}`;
                    expenseItems.appendChild(li);

                    // Categorize Expenses
                    if (categories[expense.category]) {
                        categories[expense.category] += expense.amount;
                    } else {
                        categories[expense.category] = expense.amount;
                    }
                });
                drawChart(categories);
            });
    }

    // Draw Pie Chart
    function drawChart(data) {
        const labels = Object.keys(data);
        const values = Object.values(data);
        const chart = new Chart(expenseChart, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
});
