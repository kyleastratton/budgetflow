// DOM Elements
const themeToggle = document.getElementById("themeToggle");
const navTabs = document.querySelectorAll(".nav-tab");
const tabContents = document.querySelectorAll(".tab-content");
const modals = document.querySelectorAll(".modal");
const closeModalButtons = document.querySelectorAll(".close-modal");

// Data storage
let appData = {
    incomes: [],
    expenses: [],
    assets: [],
    liabilities: [],
    categories: [
        "Salary",
        "Freelance",
        "Investment",
        "Rental",
        "Business",
        "Housing",
        "Food",
        "Transportation",
        "Utilities",
        "Entertainment",
        "Healthcare",
        "Education",
    ],
};

// Initialize the app
function initApp() {
    loadData();
    loadThemePreference();
    setupEventListeners();
    renderCategories();
    updateSummaryCards();
    renderTables();
}
// Load data from localStorage
function loadData() {
    const savedData = localStorage.getItem("budgetFlowData");
    if (savedData) {
        appData = JSON.parse(savedData);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem("budgetFlowData", JSON.stringify(appData));
}

// Setup event listeners
function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener("click", toggleTheme);

    // Navigation tabs
    navTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const tabId = tab.getAttribute("data-tab");
            switchTab(tabId);
        });
    });

    // Modal buttons
    document.getElementById("addIncomeBtn").addEventListener("click", () => openModal("incomeModal"));
    document.getElementById("addExpenseBtn").addEventListener("click", () => openModal("expenseModal"));
    document.getElementById("addAssetBtn").addEventListener("click", () => openModal("assetModal"));
    document.getElementById("addLiabilityBtn").addEventListener("click", () => openModal("liabilityModal"));
    document.getElementById("addCategoryBtn").addEventListener("click", () => openModal("categoryModal"));

    // Form submissions
    document.getElementById("incomeForm").addEventListener("submit", addIncome);
    document.getElementById("expenseForm").addEventListener("submit", addExpense);
    document.getElementById("assetForm").addEventListener("submit", addAsset);
    document.getElementById("liabilityForm").addEventListener("submit", addLiability);
    document.getElementById("categoryForm").addEventListener("submit", addCategory);

    // Data management buttons
    document.getElementById("exportDataBtn").addEventListener("click", exportData);
    document.getElementById("importDataBtn").addEventListener("click", importData);
    document.getElementById("clearDataBtn").addEventListener("click", clearData);

    // Close modals
    closeModalButtons.forEach((button) => {
        button.addEventListener("click", closeModals);
    });

    // Close modal when clicking outside
    modals.forEach((modal) => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                closeModals();
            }
        });
    });
}

// Toggle between light and dark mode
function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    const icon = themeToggle.querySelector('i');
    
    if (isDarkMode) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
    
    // Save theme preference to localStorage
    localStorage.setItem('budgetFlowTheme', isDarkMode ? 'dark' : 'light');
}

// Load theme preference from localStorage
function loadThemePreference() {
    let savedTheme = localStorage.getItem('budgetFlowTheme');
    
    // If no theme is saved, use system preference
    if (!savedTheme) {
        savedTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    const isDarkMode = savedTheme === 'dark';
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        const icon = themeToggle.querySelector('i');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
}

// Switch between tabs
function switchTab(tabId) {
    // Update active tab
    navTabs.forEach((tab) => {
        tab.classList.remove("active");
        if (tab.getAttribute("data-tab") === tabId) {
            tab.classList.add("active");
        }
    });

    // Update active content
    tabContents.forEach((content) => {
        content.classList.remove("active");
        if (content.id === tabId) {
            content.classList.add("active");
        }
    });
}

// Open modal
function openModal(modalId) {
    document.getElementById(modalId).style.display = "flex";
    populateCategorySelects();
}

// Close all modals
function closeModals() {
    modals.forEach((modal) => {
        modal.style.display = "none";
    });
}

// Populate category selects in modals
function populateCategorySelects() {
    const incomeCategory = document.getElementById("incomeCategory");
    const expenseCategory = document.getElementById("expenseCategory");

    // Clear existing options except the first one
    while (incomeCategory.children.length > 1) {
        incomeCategory.removeChild(incomeCategory.lastChild);
    }
    while (expenseCategory.children.length > 1) {
        expenseCategory.removeChild(expenseCategory.lastChild);
    }

    // Add categories
    appData.categories.forEach((category) => {
        const incomeOption = document.createElement("option");
        incomeOption.value = category;
        incomeOption.textContent = category;
        incomeCategory.appendChild(incomeOption);

        const expenseOption = document.createElement("option");
        expenseOption.value = category;
        expenseOption.textContent = category;
        expenseCategory.appendChild(expenseOption);
    });
}

// Render categories in settings
function renderCategories() {
    const categoryList = document.getElementById("categoryList");
    categoryList.innerHTML = "";

    appData.categories.forEach((category) => {
        const categoryTag = document.createElement("div");
        categoryTag.className = "category-tag";
        categoryTag.innerHTML = `
            ${category}
            <i class="fas fa-times delete-category" data-category="${category}"></i>
        `;
        categoryList.appendChild(categoryTag);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll(".delete-category").forEach((button) => {
        button.addEventListener("click", (e) => {
            const category = e.target.getAttribute("data-category");
            deleteCategory(category);
        });
    });
}

// Format currency
function formatCurrency(number) {
    return number.toLocaleString("en-GB", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

// Add income
function addIncome(e) {
    e.preventDefault();
    const source = document.getElementById("incomeSource").value;
    const category = document.getElementById("incomeCategory").value;
    const amount = parseFloat(document.getElementById("incomeAmount").value);

    appData.incomes.push({
        id: Date.now(),
        source,
        category,
        amount,
    });

    saveData();
    updateSummaryCards();
    renderTables();
    closeModals();
    document.getElementById("incomeForm").reset();
}

// Add expense
function addExpense(e) {
    e.preventDefault();
    const description = document.getElementById("expenseDescription").value;
    const category = document.getElementById("expenseCategory").value;
    const amount = parseFloat(document.getElementById("expenseAmount").value);

    appData.expenses.push({
        id: Date.now(),
        description,
        category,
        amount,
    });

    saveData();
    updateSummaryCards();
    renderTables();
    closeModals();
    document.getElementById("expenseForm").reset();
}

// Add asset
function addAsset(e) {
    e.preventDefault();
    const name = document.getElementById("assetName").value;
    const type = document.getElementById("assetType").value;
    const value = parseFloat(document.getElementById("assetValue").value);

    appData.assets.push({
        id: Date.now(),
        name,
        type,
        value,
    });

    saveData();
    updateSummaryCards();
    renderTables();
    closeModals();
    document.getElementById("assetForm").reset();
}

// Add liability
function addLiability(e) {
    e.preventDefault();
    const name = document.getElementById("liabilityName").value;
    const type = document.getElementById("liabilityType").value;
    const amount = parseFloat(document.getElementById("liabilityAmount").value);

    appData.liabilities.push({
        id: Date.now(),
        name,
        type,
        amount,
    });

    saveData();
    updateSummaryCards();
    renderTables();
    closeModals();
    document.getElementById("liabilityForm").reset();
}

// Add category
function addCategory(e) {
    e.preventDefault();
    const name = document.getElementById("categoryName").value;

    if (!appData.categories.includes(name)) {
        appData.categories.push(name);
        saveData();
        renderCategories();
        closeModals();
        document.getElementById("categoryForm").reset();
    } else {
        alert("Category already exists!");
    }
}

// Delete category
function deleteCategory(category) {
    if (confirm(`Are you sure you want to delete the "${category}" category?`)) {
        appData.categories = appData.categories.filter((cat) => cat !== category);
        saveData();
        renderCategories();
    }
}

// Update summary cards
function updateSummaryCards() {
    const totalIncome = appData.incomes.reduce((sum, income) => sum + income.amount, 0);
    const formattedTotalIncome = formatCurrency(totalIncome);
    const totalExpenses = appData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const formattedTotalExpenses = formatCurrency(totalExpenses);
    const monthlyBalance = totalIncome - totalExpenses;
    const formattedTotalMonthlyBalance = formatCurrency(monthlyBalance);

    const totalAssets = appData.assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalLiabilities = appData.liabilities.reduce((sum, liability) => sum + liability.amount, 0);
    const netWealth = totalAssets - totalLiabilities;
    const formattedNetWealth = formatCurrency(netWealth);

    // document.getElementById('totalIncome').textContent = `£${totalIncome.toFixed(2)}`;
    document.getElementById("totalIncome").textContent = `£${formattedTotalIncome}`;
    document.getElementById("totalExpenses").textContent = `£${formattedTotalExpenses}`;
    document.getElementById("monthlyBalance").textContent = `£${formattedTotalMonthlyBalance}`;
    document.getElementById("netWealth").textContent = `£${formattedNetWealth}`;
}

// Render tables
function renderTables() {
    renderIncomeTable();
    renderExpenseTable();
    renderAssetTable();
    renderLiabilityTable();
}

// Update renderIncomeTable function
function renderIncomeTable() {
    const tableBody = document.getElementById("incomeTableBody");
    tableBody.innerHTML = "";

    appData.incomes.forEach((income) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${income.source}</td>
            <td>${income.category}</td>
            <td>$${formatCurrency(income.amount)}</td>
            <td>
                <button class="action-btn edit-income" data-id="${income.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-income delete" data-id="${income.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Add event listeners to edit buttons
    document.querySelectorAll(".edit-income").forEach((button) => {
        button.addEventListener("click", (e) => {
            const id = parseInt(e.target.closest("button").getAttribute("data-id"));
            editIncome(id);
        });
    });

    // Add event listeners to delete buttons
    document.querySelectorAll(".delete-income").forEach((button) => {
        button.addEventListener("click", (e) => {
            const id = parseInt(e.target.closest("button").getAttribute("data-id"));
            deleteIncome(id);
        });
    });
}

// Update renderExpenseTable function
function renderExpenseTable() {
    const tableBody = document.getElementById("expenseTableBody");
    tableBody.innerHTML = "";

    appData.expenses.forEach((expense) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${expense.description}</td>
            <td>${expense.category}</td>
            <td>$${formatCurrency(expense.amount)}</td>
            <td>
                <button class="action-btn edit-expense" data-id="${expense.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-expense delete" data-id="${expense.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Add event listeners to edit buttons
    document.querySelectorAll(".edit-expense").forEach((button) => {
        button.addEventListener("click", (e) => {
            const id = parseInt(e.target.closest("button").getAttribute("data-id"));
            editExpense(id);
        });
    });

    // Add event listeners to delete buttons
    document.querySelectorAll(".delete-expense").forEach((button) => {
        button.addEventListener("click", (e) => {
            const id = parseInt(e.target.closest("button").getAttribute("data-id"));
            deleteExpense(id);
        });
    });
}

// Update renderAssetTable function
function renderAssetTable() {
    const tableBody = document.getElementById("assetTableBody");
    tableBody.innerHTML = "";

    appData.assets.forEach((asset) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${asset.name}</td>
            <td>${asset.type}</td>
            <td>$${formatCurrency(asset.value)}</td>
            <td>
                <button class="action-btn edit-asset" data-id="${asset.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-asset delete" data-id="${asset.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Add event listeners to edit buttons
    document.querySelectorAll(".edit-asset").forEach((button) => {
        button.addEventListener("click", (e) => {
            const id = parseInt(e.target.closest("button").getAttribute("data-id"));
            editAsset(id);
        });
    });

    // Add event listeners to delete buttons
    document.querySelectorAll(".delete-asset").forEach((button) => {
        button.addEventListener("click", (e) => {
            const id = parseInt(e.target.closest("button").getAttribute("data-id"));
            deleteAsset(id);
        });
    });
}

// Update renderLiabilityTable function
function renderLiabilityTable() {
    const tableBody = document.getElementById("liabilityTableBody");
    tableBody.innerHTML = "";

    appData.liabilities.forEach((liability) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${liability.name}</td>
            <td>${liability.type}</td>
            <td>$${formatCurrency(liability.amount)}</td>
            <td>
                <button class="action-btn edit-liability" data-id="${liability.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-liability delete" data-id="${liability.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Add event listeners to edit buttons
    document.querySelectorAll(".edit-liability").forEach((button) => {
        button.addEventListener("click", (e) => {
            const id = parseInt(e.target.closest("button").getAttribute("data-id"));
            editLiability(id);
        });
    });

    // Add event listeners to delete buttons
    document.querySelectorAll(".delete-liability").forEach((button) => {
        button.addEventListener("click", (e) => {
            const id = parseInt(e.target.closest("button").getAttribute("data-id"));
            deleteLiability(id);
        });
    });
}

// Delete income
function deleteIncome(id) {
    if (confirm("Are you sure you want to delete this income source?")) {
        appData.incomes = appData.incomes.filter((income) => income.id !== id);
        saveData();
        updateSummaryCards();
        renderTables();
    }
}

// Delete expense
function deleteExpense(id) {
    if (confirm("Are you sure you want to delete this expense?")) {
        appData.expenses = appData.expenses.filter((expense) => expense.id !== id);
        saveData();
        updateSummaryCards();
        renderTables();
    }
}

// Delete asset
function deleteAsset(id) {
    if (confirm("Are you sure you want to delete this asset?")) {
        appData.assets = appData.assets.filter((asset) => asset.id !== id);
        saveData();
        updateSummaryCards();
        renderTables();
    }
}

// Delete liability
function deleteLiability(id) {
    if (confirm("Are you sure you want to delete this liability?")) {
        appData.liabilities = appData.liabilities.filter((liability) => liability.id !== id);
        saveData();
        updateSummaryCards();
        renderTables();
    }
}

// Edit income
function editIncome(id) {
    const income = appData.incomes.find((inc) => inc.id === id);
    if (!income) return;

    document.getElementById("incomeSource").value = income.source;
    document.getElementById("incomeCategory").value = income.category;
    document.getElementById("incomeAmount").value = income.amount;

    // Change modal to edit mode
    const modal = document.getElementById("incomeModal");
    const modalTitle = modal.querySelector(".modal-title");
    const submitBtn = modal.querySelector('button[type="submit"]');

    modalTitle.textContent = "Edit Income Source";
    submitBtn.textContent = "Update Income";
    submitBtn.onclick = (e) => {
        e.preventDefault();
        updateIncome(id);
    };

    openModal("incomeModal");
}

// Update income
function updateIncome(id) {
    const source = document.getElementById("incomeSource").value;
    const category = document.getElementById("incomeCategory").value;
    const amount = parseFloat(document.getElementById("incomeAmount").value);

    const incomeIndex = appData.incomes.findIndex((inc) => inc.id === id);
    if (incomeIndex !== -1) {
        appData.incomes[incomeIndex] = {
            id: id,
            source,
            category,
            amount,
        };

        saveData();
        updateSummaryCards();
        renderTables();
        closeModals();
        document.getElementById("incomeForm").reset();

        // Reset modal to add mode
        const modal = document.getElementById("incomeModal");
        const modalTitle = modal.querySelector(".modal-title");
        const submitBtn = modal.querySelector('button[type="submit"]');

        modalTitle.textContent = "Add Income Source";
        submitBtn.textContent = "Add Income";
        submitBtn.onclick = (e) => {
            e.preventDefault();
            addIncome(e);
        };
    }
}

// Edit expense
function editExpense(id) {
    const expense = appData.expenses.find((exp) => exp.id === id);
    if (!expense) return;

    document.getElementById("expenseDescription").value = expense.description;
    document.getElementById("expenseCategory").value = expense.category;
    document.getElementById("expenseAmount").value = expense.amount;

    // Change modal to edit mode
    const modal = document.getElementById("expenseModal");
    const modalTitle = modal.querySelector(".modal-title");
    const submitBtn = modal.querySelector('button[type="submit"]');

    modalTitle.textContent = "Edit Expense";
    submitBtn.textContent = "Update Expense";
    submitBtn.onclick = (e) => {
        e.preventDefault();
        updateExpense(id);
    };

    openModal("expenseModal");
}

// Update expense
function updateExpense(id) {
    const description = document.getElementById("expenseDescription").value;
    const category = document.getElementById("expenseCategory").value;
    const amount = parseFloat(document.getElementById("expenseAmount").value);

    const expenseIndex = appData.expenses.findIndex((exp) => exp.id === id);
    if (expenseIndex !== -1) {
        appData.expenses[expenseIndex] = {
            id: id,
            description,
            category,
            amount,
        };

        saveData();
        updateSummaryCards();
        renderTables();
        closeModals();
        document.getElementById("expenseForm").reset();

        // Reset modal to add mode
        const modal = document.getElementById("expenseModal");
        const modalTitle = modal.querySelector(".modal-title");
        const submitBtn = modal.querySelector('button[type="submit"]');

        modalTitle.textContent = "Add Expense";
        submitBtn.textContent = "Add Expense";
        submitBtn.onclick = (e) => {
            e.preventDefault();
            addExpense(e);
        };
    }
}

// Edit asset
function editAsset(id) {
    const asset = appData.assets.find((ast) => ast.id === id);
    if (!asset) return;

    document.getElementById("assetName").value = asset.name;
    document.getElementById("assetType").value = asset.type;
    document.getElementById("assetValue").value = asset.value;

    // Change modal to edit mode
    const modal = document.getElementById("assetModal");
    const modalTitle = modal.querySelector(".modal-title");
    const submitBtn = modal.querySelector('button[type="submit"]');

    modalTitle.textContent = "Edit Asset";
    submitBtn.textContent = "Update Asset";
    submitBtn.onclick = (e) => {
        e.preventDefault();
        updateAsset(id);
    };

    openModal("assetModal");
}

// Update asset
function updateAsset(id) {
    const name = document.getElementById("assetName").value;
    const type = document.getElementById("assetType").value;
    const value = parseFloat(document.getElementById("assetValue").value);

    const assetIndex = appData.assets.findIndex((ast) => ast.id === id);
    if (assetIndex !== -1) {
        appData.assets[assetIndex] = {
            id: id,
            name,
            type,
            value,
        };

        saveData();
        updateSummaryCards();
        renderTables();
        closeModals();
        document.getElementById("assetForm").reset();

        // Reset modal to add mode
        const modal = document.getElementById("assetModal");
        const modalTitle = modal.querySelector(".modal-title");
        const submitBtn = modal.querySelector('button[type="submit"]');

        modalTitle.textContent = "Add Asset";
        submitBtn.textContent = "Add Asset";
        submitBtn.onclick = (e) => {
            e.preventDefault();
            addAsset(e);
        };
    }
}

// Edit liability
function editLiability(id) {
    const liability = appData.liabilities.find((lib) => lib.id === id);
    if (!liability) return;

    document.getElementById("liabilityName").value = liability.name;
    document.getElementById("liabilityType").value = liability.type;
    document.getElementById("liabilityAmount").value = liability.amount;

    // Change modal to edit mode
    const modal = document.getElementById("liabilityModal");
    const modalTitle = modal.querySelector(".modal-title");
    const submitBtn = modal.querySelector('button[type="submit"]');

    modalTitle.textContent = "Edit Liability";
    submitBtn.textContent = "Update Liability";
    submitBtn.onclick = (e) => {
        e.preventDefault();
        updateLiability(id);
    };

    openModal("liabilityModal");
}

// Update liability
function updateLiability(id) {
    const name = document.getElementById("liabilityName").value;
    const type = document.getElementById("liabilityType").value;
    const amount = parseFloat(document.getElementById("liabilityAmount").value);

    const liabilityIndex = appData.liabilities.findIndex((lib) => lib.id === id);
    if (liabilityIndex !== -1) {
        appData.liabilities[liabilityIndex] = {
            id: id,
            name,
            type,
            amount,
        };

        saveData();
        updateSummaryCards();
        renderTables();
        closeModals();
        document.getElementById("liabilityForm").reset();

        // Reset modal to add mode
        const modal = document.getElementById("liabilityModal");
        const modalTitle = modal.querySelector(".modal-title");
        const submitBtn = modal.querySelector('button[type="submit"]');

        modalTitle.textContent = "Add Liability";
        submitBtn.textContent = "Add Liability";
        submitBtn.onclick = (e) => {
            e.preventDefault();
            addLiability(e);
        };
    }
}

// Export data
function exportData() {
    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "budgetflow_data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Reset modals to add mode
function resetModalsToAddMode() {
    const modals = {
        incomeModal: {
            title: "Add Income Source",
            button: "Add Income",
            form: "incomeForm",
        },
        expenseModal: {
            title: "Add Expense",
            button: "Add Expense",
            form: "expenseForm",
        },
        assetModal: {
            title: "Add Asset",
            button: "Add Asset",
            form: "assetForm",
        },
        liabilityModal: {
            title: "Add Liability",
            button: "Add Liability",
            form: "liabilityForm",
        },
    };

    Object.keys(modals).forEach((modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            const modalTitle = modal.querySelector(".modal-title");
            const submitBtn = modal.querySelector('button[type="submit"]');
            const form = document.getElementById(modals[modalId].form);

            modalTitle.textContent = modals[modalId].title;
            submitBtn.textContent = modals[modalId].button;

            // Reset form
            if (form) {
                form.reset();
            }
        }
    });
}

// Update closeModals function to reset forms
function closeModals() {
    modals.forEach((modal) => {
        modal.style.display = "none";
    });
    resetModalsToAddMode();
}

// Import data
function importData() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                appData = importedData;
                saveData();
                updateSummaryCards();
                renderTables();
                renderCategories();
                alert("Data imported successfully!");
            } catch (error) {
                alert("Error importing data. Please make sure you selected a valid JSON file.");
            }
        };

        reader.readAsText(file);
    };

    input.click();
}

// Clear all data
function clearData() {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
        appData = {
            incomes: [],
            expenses: [],
            assets: [],
            liabilities: [],
            categories: [
                "Salary",
                "Freelance",
                "Investment",
                "Rental",
                "Business",
                "Housing",
                "Food",
                "Transportation",
                "Utilities",
                "Entertainment",
                "Healthcare",
                "Education",
            ],
        };
        saveData();
        updateSummaryCards();
        renderTables();
        renderCategories();
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", initApp);
