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
    categories: {
        income: ["Salary", "Freelance", "Investment", "Rental", "Business"],
        expense: ["Housing", "Food", "Transportation", "Utilities", "Entertainment", "Healthcare", "Education"],
        asset: ["Cash", "Bank Account", "Investment", "Property", "Vehicle", "Other"],
        liability: ["Credit Card", "Loan", "Mortgage", "Other"],
    },
};

// Track current entry being viewed/edited
let currentEntry = null;
let currentEntryType = null;

// Initialize the app
function initApp() {
    loadData();
    loadThemePreference();
    setupEventListeners();
    renderAllCategories();
    updateSummaryCards();
    renderCardViews();
}

// Migrate old data structure to new one
function migrateDataStructure() {
    if (Array.isArray(appData.categories)) {
        const oldCategories = appData.categories;
        appData.categories = {
            income: oldCategories.filter((cat) =>
                ["Salary", "Freelance", "Investment", "Rental", "Business"].includes(cat)
            ),
            expense: oldCategories.filter((cat) =>
                ["Housing", "Food", "Transportation", "Utilities", "Entertainment", "Healthcare", "Education"].includes(
                    cat
                )
            ),
            asset: ["Cash", "Bank Account", "Investment", "Property", "Vehicle", "Other"],
            liability: ["Credit Card", "Loan", "Mortgage", "Other"],
        };
        saveData();
    }
}

// Load data from localStorage
function loadData() {
    const savedData = localStorage.getItem("budgetFlowData");
    if (savedData) {
        appData = JSON.parse(savedData);
        migrateDataStructure();
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

    // Empty state buttons
    document.getElementById("addIncomeEmptyBtn").addEventListener("click", () => openModal("incomeModal"));
    document.getElementById("addExpenseEmptyBtn").addEventListener("click", () => openModal("expenseModal"));
    document.getElementById("addAssetEmptyBtn").addEventListener("click", () => openModal("assetModal"));
    document.getElementById("addLiabilityEmptyBtn").addEventListener("click", () => openModal("liabilityModal"));

    // Category buttons
    document.querySelectorAll(".add-category-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
            const type = e.target.closest(".add-category-btn").getAttribute("data-type");
            openCategoryModal(type);
        });
    });

    // Form submissions
    document.getElementById("incomeForm").addEventListener("submit", addIncome);
    document.getElementById("expenseForm").addEventListener("submit", addExpense);
    document.getElementById("assetForm").addEventListener("submit", addAsset);
    document.getElementById("liabilityForm").addEventListener("submit", addLiability);
    document.getElementById("categoryForm").addEventListener("submit", addNewCategory);

    // Entry details modal buttons
    document.getElementById("editEntryBtn").addEventListener("click", editCurrentEntry);
    document.getElementById("deleteEntryBtn").addEventListener("click", deleteCurrentEntry);

    // Data management buttons
    document.getElementById("exportDataBtn").addEventListener("click", exportData);
    document.getElementById("importDataBtn").addEventListener("click", importData);
    document.getElementById("clearDataBtn").addEventListener("click", clearData);

    // Close modals
    closeModalButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const modal = this.closest(".modal");
            if (modal && modal.id === "entryDetailsModal") {
                closeDetailsModal();
            } else {
                closeModals();
            }
        });
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
    const isDarkMode = document.body.classList.toggle("dark-mode");
    const icon = themeToggle.querySelector("i");

    if (isDarkMode) {
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
    } else {
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");
    }

    localStorage.setItem("budgetFlowTheme", isDarkMode ? "dark" : "light");
}

// Load theme preference from localStorage
function loadThemePreference() {
    let savedTheme = localStorage.getItem("budgetFlowTheme");

    if (!savedTheme) {
        savedTheme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    const isDarkMode = savedTheme === "dark";

    if (isDarkMode) {
        document.body.classList.add("dark-mode");
        const icon = themeToggle.querySelector("i");
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
    }
}

// Switch between tabs
function switchTab(tabId) {
    navTabs.forEach((tab) => {
        tab.classList.remove("active");
        if (tab.getAttribute("data-tab") === tabId) {
            tab.classList.add("active");
        }
    });

    tabContents.forEach((content) => {
        content.classList.remove("active");
        if (content.id === tabId) {
            content.classList.add("active");
        }
    });
}

// Open modal
// function openModal(modalId) {
//     document.getElementById(modalId).style.display = "flex";
//     // Only populate categories without pre-selection for new entries
//     if (!modalId.includes("Edit")) {
//         populateCategorySelects();
//     }
// }

// Open modal
function openModal(modalId) {
    document.getElementById(modalId).style.display = "flex";
    // Always populate categories - the pre-selection is handled in the edit functions
    populateCategorySelects();
}

// Close all modals
function closeModals() {
    modals.forEach((modal) => {
        modal.style.display = "none";
    });
    resetModalsToAddMode();
    // Don't reset currentEntry and currentEntryType here - we need them for editing
}

// Add a new function to specifically close details modal
function closeDetailsModal() {
    console.log("closeDetailsModal called");
    document.getElementById("entryDetailsModal").style.display = "none";
    // Don't reset currentEntry and currentEntryType here yet
    // We'll reset them after the edit modal opens
}

// Render categories in settings
function renderCategories() {
    renderAllCategories(); // Use the new function that handles all category types
}

// Render all categories in settings
function renderAllCategories() {
    renderCategoryList("income", "incomeCategoryList");
    renderCategoryList("expense", "expenseCategoryList");
    renderCategoryList("asset", "assetCategoryList");
    renderCategoryList("liability", "liabilityCategoryList");
}

// Render category list for a specific type
function renderCategoryList(type, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    const typeLabels = {
        income: "Income Category",
        expense: "Expense Category",
        asset: "Asset Type",
        liability: "Liability Type",
    };

    // Sort categories before rendering
    appData.categories[type]
        .slice()
        .sort((a, b) => a.localeCompare(b))
        .forEach((category) => {
            const categoryTag = document.createElement("div");
            categoryTag.className = "category-tag";
            categoryTag.innerHTML = `
                ${category}
                <i class="fas fa-times delete-category" data-type="${type}" data-category="${category}"></i>
            `;
            container.appendChild(categoryTag);
        });

    // Add event listeners to delete buttons
    container.querySelectorAll(".delete-category").forEach((button) => {
        button.addEventListener("click", (e) => {
            const type = e.target.getAttribute("data-type");
            const category = e.target.getAttribute("data-category");
            deleteCategory(type, category);
        });
    });
}

// Open category modal for specific type
function openCategoryModal(type) {
    const modal = document.getElementById("categoryModal");
    const modalTitle = modal.querySelector(".modal-title");
    const categoryTypeInput = document.getElementById("categoryType");
    const submitBtn = modal.querySelector('button[type="submit"]');

    const typeLabels = {
        income: "Income Category",
        expense: "Expense Category",
        asset: "Asset Type",
        liability: "Liability Type",
    };

    modalTitle.textContent = `Add ${typeLabels[type]}`;
    categoryTypeInput.value = type;
    submitBtn.textContent = `Add ${typeLabels[type]}`;

    openModal("categoryModal");
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
    renderCardViews();
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
    renderCardViews();
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
    renderCardViews();
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
    renderCardViews();
    closeModals();
    document.getElementById("liabilityForm").reset();
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

    document.getElementById("totalIncome").textContent = `£${formattedTotalIncome}`;
    document.getElementById("totalExpenses").textContent = `£${formattedTotalExpenses}`;
    document.getElementById("monthlyBalance").textContent = `£${formattedTotalMonthlyBalance}`;
    document.getElementById("netWealth").textContent = `£${formattedNetWealth}`;
}

// Delete income
function deleteIncome(id) {
    if (confirm("Are you sure you want to delete this income source?")) {
        appData.incomes = appData.incomes.filter((income) => income.id !== id);
        saveData();
        updateSummaryCards();
        renderCardViews();
    }
}

// Delete expense
function deleteExpense(id) {
    if (confirm("Are you sure you want to delete this expense?")) {
        appData.expenses = appData.expenses.filter((expense) => expense.id !== id);
        saveData();
        updateSummaryCards();
        renderCardViews();
    }
}

// Delete asset
function deleteAsset(id) {
    if (confirm("Are you sure you want to delete this asset?")) {
        appData.assets = appData.assets.filter((asset) => asset.id !== id);
        saveData();
        updateSummaryCards();
        renderCardViews();
    }
}

// Delete liability
function deleteLiability(id) {
    if (confirm("Are you sure you want to delete this liability?")) {
        appData.liabilities = appData.liabilities.filter((liability) => liability.id !== id);
        saveData();
        updateSummaryCards();
        renderCardViews();
    }
}

// Edit income
function editIncome(id) {
    const income = appData.incomes.find((inc) => inc.id === id);
    if (!income) return;

    // Change modal to edit mode FIRST
    const modal = document.getElementById("incomeModal");
    const modalTitle = modal.querySelector(".modal-title");
    const submitBtn = modal.querySelector('button[type="submit"]');

    modalTitle.textContent = "Edit Income Source";
    submitBtn.textContent = "Update Income";
    
    // Remove existing event listeners and add update handler
    const form = document.getElementById("incomeForm");
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    document.getElementById("incomeForm").addEventListener("submit", function(e) {
        e.preventDefault();
        updateIncome(id);
    });

    // OPEN the modal first
    openModal("incomeModal");
    
    // THEN set the values (this ensures the selects are populated first)
    document.getElementById("incomeSource").value = income.source;
    document.getElementById("incomeCategory").value = income.category;
    document.getElementById("incomeAmount").value = income.amount;
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
        renderCardViews();
        closeModals();
        resetIncomeForm();
    }
}

// Reset income form to add mode
function resetIncomeForm() {
    const modal = document.getElementById("incomeModal");
    const modalTitle = modal.querySelector(".modal-title");
    const submitBtn = modal.querySelector('button[type="submit"]');
    const form = document.getElementById("incomeForm");

    modalTitle.textContent = "Add Income Source";
    submitBtn.textContent = "Add Income";

    // Reset form and event listener
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    document.getElementById("incomeForm").addEventListener("submit", addIncome);
    document.getElementById("incomeForm").reset();

    populateCategorySelects();
}


// Edit expense
function editExpense(id) {
    console.log(appData);
    const expense = appData.expenses.find((exp) => exp.id === id); 
    if (!expense) return;

    // Change modal to edit mode FIRST
    const modal = document.getElementById("expenseModal");
    const modalTitle = modal.querySelector(".modal-title");
    const submitBtn = modal.querySelector('button[type="submit"]');

    modalTitle.textContent = "Edit Expense";
    submitBtn.textContent = "Update Expense"; 
    
    // Remove existing event listeners and add update handler
    const form = document.getElementById("expenseForm");
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    document.getElementById("expenseForm").addEventListener("submit", function(e) {
        e.preventDefault();
        updateExpense(id);
    });

    // OPEN the modal first
    openModal("expenseModal");
    
    // THEN set the values (this ensures the selects are populated first)
    document.getElementById("expenseDescription").value = expense.description;
    document.getElementById("expenseCategory").value = expense.category;
    document.getElementById("expenseAmount").value = expense.amount;
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
        renderCardViews();
        closeModals();
        resetExpenseForm();
    }
}

// Reset expense form to add mode
function resetExpenseForm() {
    const modal = document.getElementById("expenseModal");
    const modalTitle = modal.querySelector(".modal-title");
    const submitBtn = modal.querySelector('button[type="submit"]');
    const form = document.getElementById("expenseForm");

    modalTitle.textContent = "Add Expense";
    submitBtn.textContent = "Add Expense";

    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    document.getElementById("expenseForm").addEventListener("submit", addExpense);
    document.getElementById("expenseForm").reset();

    populateCategorySelects();
}

// Edit asset
function editAsset(id) {
    const asset = appData.assets.find((ast) => ast.id === id); 
    if (!asset) return;

    // Change modal to edit mode FIRST
    const modal = document.getElementById("assetModal");
    const modalTitle = modal.querySelector(".modal-title");
    const submitBtn = modal.querySelector('button[type="submit"]');

    modalTitle.textContent = "Edit Asset"; // Fixed title
    submitBtn.textContent = "Update Asset"; // Fixed button text
    
    // Remove existing event listeners and add update handler
    const form = document.getElementById("assetForm");
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    document.getElementById("assetForm").addEventListener("submit", function(e) {
        e.preventDefault();
        updateAsset(id);
    });

    // OPEN the modal first
    openModal("assetModal");
    
    // THEN set the values (this ensures the selects are populated first)
    document.getElementById("assetName").value = asset.name; 
    document.getElementById("assetType").value = asset.type; 
    document.getElementById("assetValue").value = asset.value; 
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
        renderCardViews();
        closeModals();
        resetAssetForm();
    }
}

// Reset asset form to add mode
function resetAssetForm() {
    const modal = document.getElementById("assetModal");
    const modalTitle = modal.querySelector(".modal-title");
    const submitBtn = modal.querySelector('button[type="submit"]');
    const form = document.getElementById("assetForm");

    modalTitle.textContent = "Add Asset";
    submitBtn.textContent = "Add Asset";

    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    document.getElementById("assetForm").addEventListener("submit", addAsset);
    document.getElementById("assetForm").reset();

    populateCategorySelects();
}

// Edit liability
function editLiability(id) {
    const liability = appData.liabilities.find((lib) => lib.id === id); 
    if (!liability) return;

    // Change modal to edit mode FIRST
    const modal = document.getElementById("liabilityModal");
    const modalTitle = modal.querySelector(".modal-title");
    const submitBtn = modal.querySelector('button[type="submit"]');

    modalTitle.textContent = "Edit Liability";
    submitBtn.textContent = "Update Liability"; 
    
    // Remove existing event listeners and add update handler
    const form = document.getElementById("liabilityForm");
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    document.getElementById("liabilityForm").addEventListener("submit", function(e) {
        e.preventDefault();
        updateLiability(id);
    });

    // OPEN the modal first
    openModal("liabilityModal");
    
    // THEN set the values (this ensures the selects are populated first)
    document.getElementById("liabilityName").value = liability.name; 
    document.getElementById("liabilityType").value = liability.type;
    document.getElementById("liabilityAmount").value = liability.amount;
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
        renderCardViews();
        closeModals();
        resetLiabilityForm();
    }
}

// Reset liability form to add mode
function resetLiabilityForm() {
    const modal = document.getElementById("liabilityModal");
    const modalTitle = modal.querySelector(".modal-title");
    const submitBtn = modal.querySelector('button[type="submit"]');
    const form = document.getElementById("liabilityForm");

    modalTitle.textContent = "Add Liability";
    submitBtn.textContent = "Add Liability";

    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    document.getElementById("liabilityForm").addEventListener("submit", addLiability);
    document.getElementById("liabilityForm").reset();

    populateCategorySelects();
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
                renderCardViews();
                renderAllCategories();
                populateCategorySelects();
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
            categories: {
                income: ["Salary", "Freelance", "Investment", "Rental", "Business"],
                expense: ["Housing", "Food", "Transportation", "Utilities", "Entertainment", "Healthcare", "Education"],
                asset: ["Cash", "Bank Account", "Investment", "Property", "Vehicle", "Other"],
                liability: ["Credit Card", "Loan", "Mortgage", "Other"],
            },
        };
        saveData();
        updateSummaryCards();
        renderCardViews();
        renderAllCategories();
        populateCategorySelects();
    }
}

// Reset modals to add mode
function resetModalsToAddMode() {
    const modals = {
        incomeModal: {
            title: "Add Income Source",
            button: "Add Income",
            form: "incomeForm",
            resetFunction: resetIncomeForm,
        },
        expenseModal: {
            title: "Add Expense",
            button: "Add Expense",
            form: "expenseForm",
            resetFunction: resetExpenseForm,
        },
        assetModal: {
            title: "Add Asset",
            button: "Add Asset",
            form: "assetForm",
            resetFunction: resetAssetForm,
        },
        liabilityModal: {
            title: "Add Liability",
            button: "Add Liability",
            form: "liabilityForm",
            resetFunction: resetLiabilityForm,
        },
    };

    Object.keys(modals).forEach((modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            const modalTitle = modal.querySelector(".modal-title");
            const submitBtn = modal.querySelector('button[type="submit"]');

            modalTitle.textContent = modals[modalId].title;
            submitBtn.textContent = modals[modalId].button;

            // Call the reset function for each form
            modals[modalId].resetFunction();
        }
    });
}

// Add category
function addNewCategory(e) {
    e.preventDefault();
    const name = document.getElementById("categoryName").value.trim();
    const type = document.getElementById("categoryType").value;

    if (!name) return;

    if (!appData.categories[type].includes(name)) {
        appData.categories[type].push(name);
        // Sort the category array after adding
        appData.categories[type].sort((a, b) => a.localeCompare(b));
        saveData();
        renderAllCategories();
        populateCategorySelects();
        closeModals();
        document.getElementById("categoryForm").reset();
    } else {
        alert(`${name} already exists in ${type} categories!`);
    }
}

// Delete category
function deleteCategory(type, category) {
    if (confirm(`Are you sure you want to delete the "${category}" ${type}?`)) {
        if (isCategoryInUse(type, category)) {
            alert(
                `Cannot delete "${category}" because it is currently in use. Please update the relevant records first.`
            );
            return;
        }

        appData.categories[type] = appData.categories[type].filter((cat) => cat !== category);
        saveData();
        renderAllCategories();
        populateCategorySelects();
    }
}

// Check if a category is currently in use
function isCategoryInUse(type, category) {
    switch (type) {
        case "income":
            return appData.incomes.some((income) => income.category === category);
        case "expense":
            return appData.expenses.some((expense) => expense.category === category);
        case "asset":
            return appData.assets.some((asset) => asset.type === category);
        case "liability":
            return appData.liabilities.some((liability) => liability.type === category);
        default:
            return false;
    }
}

// Populate category selects in modals with optional pre-selected values
function populateCategorySelects(preSelectedValues = {}) {
    const incomeCategory = document.getElementById("incomeCategory");
    const expenseCategory = document.getElementById("expenseCategory");
    const assetType = document.getElementById("assetType");
    const liabilityType = document.getElementById("liabilityType");

    // Clear existing options except the first one
    [incomeCategory, expenseCategory, assetType, liabilityType].forEach((select) => {
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
    });

    // Add income categories (SORTED)
    appData.categories.income
        .slice() // Create a copy to avoid mutating original array
        .sort((a, b) => a.localeCompare(b)) // Sort alphabetically
        .forEach((category) => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            incomeCategory.appendChild(option);
        });

    // Add expense categories (SORTED)
    appData.categories.expense
        .slice()
        .sort((a, b) => a.localeCompare(b))
        .forEach((category) => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            expenseCategory.appendChild(option);
        });

    // Add asset types (SORTED)
    appData.categories.asset
        .slice()
        .sort((a, b) => a.localeCompare(b))
        .forEach((type) => {
            const option = document.createElement("option");
            option.value = type;
            option.textContent = type;
            assetType.appendChild(option);
        });

    // Add liability types (SORTED)
    appData.categories.liability
        .slice()
        .sort((a, b) => a.localeCompare(b))
        .forEach((type) => {
            const option = document.createElement("option");
            option.value = type;
            option.textContent = type;
            liabilityType.appendChild(option);
        });

    // Set pre-selected values if provided
    if (preSelectedValues.income) {
        incomeCategory.value = preSelectedValues.income;
    }
    if (preSelectedValues.expense) {
        expenseCategory.value = preSelectedValues.expense;
    }
    if (preSelectedValues.asset) {
        assetType.value = preSelectedValues.asset;
    }
    if (preSelectedValues.liability) {
        liabilityType.value = preSelectedValues.liability;
    }
    
    console.log("Category selects populated", preSelectedValues);
}

// Format currency
function formatCurrency(number) {
    return number.toLocaleString("en-GB", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

// Render card views instead of tables
function renderCardViews() {
    renderIncomeCards();
    renderExpenseCards();
    renderAssetCards();
    renderLiabilityCards();
}

// Render income cards
function renderIncomeCards() {
    const grid = document.getElementById("incomeCardGrid");
    const emptyState = document.getElementById("incomeEmptyState");

    grid.innerHTML = "";

    if (appData.incomes.length === 0) {
        grid.style.display = "none";
        emptyState.style.display = "block";
    } else {
        grid.style.display = "grid";
        emptyState.style.display = "none";

        appData.incomes.forEach((income) => {
            const card = createIncomeCard(income);
            grid.appendChild(card);
        });
    }
}

// Create income card
function createIncomeCard(income) {
    const card = document.createElement("div");
    card.className = "entry-card income";
    card.innerHTML = `
        <div class="entry-header">
            <div>
                <div class="entry-name">${income.source}</div>
                <div class="entry-category">${income.category}</div>
            </div>
            <div class="entry-amount income">£${formatCurrency(income.amount)}</div>
        </div>
    `;

    card.addEventListener("click", () => {
        showEntryDetails(income, "income");
    });

    return card;
}

// Render expense cards
function renderExpenseCards() {
    const grid = document.getElementById("expenseCardGrid");
    const emptyState = document.getElementById("expenseEmptyState");

    grid.innerHTML = "";

    if (appData.expenses.length === 0) {
        grid.style.display = "none";
        emptyState.style.display = "block";
    } else {
        grid.style.display = "grid";
        emptyState.style.display = "none";

        appData.expenses.forEach((expense) => {
            const card = createExpenseCard(expense);
            grid.appendChild(card);
        });
    }
}

// Create expense card
function createExpenseCard(expense) {
    const card = document.createElement("div");
    card.className = "entry-card expense";
    card.innerHTML = `
        <div class="entry-header">
            <div>
                <div class="entry-name">${expense.description}</div>
                <div class="entry-category">${expense.category}</div>
            </div>
            <div class="entry-amount expense">£${formatCurrency(expense.amount)}</div>
        </div>
    `;

    card.addEventListener("click", () => {
        showEntryDetails(expense, "expense");
    });

    return card;
}

// Render asset cards
function renderAssetCards() {
    const grid = document.getElementById("assetCardGrid");
    const emptyState = document.getElementById("assetEmptyState");

    grid.innerHTML = "";

    if (appData.assets.length === 0) {
        grid.style.display = "none";
        emptyState.style.display = "block";
    } else {
        grid.style.display = "grid";
        emptyState.style.display = "none";

        appData.assets.forEach((asset) => {
            const card = createAssetCard(asset);
            grid.appendChild(card);
        });
    }
}

// Create asset card
function createAssetCard(asset) {
    const card = document.createElement("div");
    card.className = "entry-card asset";
    card.innerHTML = `
        <div class="entry-header">
            <div>
                <div class="entry-name">${asset.name}</div>
                <div class="entry-category">${asset.type}</div>
            </div>
            <div class="entry-amount asset">£${formatCurrency(asset.value)}</div>
        </div>
    `;

    card.addEventListener("click", () => {
        showEntryDetails(asset, "asset");
    });

    return card;
}

// Render liability cards
function renderLiabilityCards() {
    const grid = document.getElementById("liabilityCardGrid");
    const emptyState = document.getElementById("liabilityEmptyState");

    grid.innerHTML = "";

    if (appData.liabilities.length === 0) {
        grid.style.display = "none";
        emptyState.style.display = "block";
    } else {
        grid.style.display = "grid";
        emptyState.style.display = "none";

        appData.liabilities.forEach((liability) => {
            const card = createLiabilityCard(liability);
            grid.appendChild(card);
        });
    }
}

// Create liability card
function createLiabilityCard(liability) {
    const card = document.createElement("div");
    card.className = "entry-card liability";
    card.innerHTML = `
        <div class="entry-header">
            <div>
                <div class="entry-name">${liability.name}</div>
                <div class="entry-category">${liability.type}</div>
            </div>
            <div class="entry-amount liability">£${formatCurrency(liability.amount)}</div>
        </div>
    `;

    card.addEventListener("click", () => {
        showEntryDetails(liability, "liability");
    });

    return card;
}

// Show entry details in modal
function showEntryDetails(entry, type) {
    currentEntry = entry;
    currentEntryType = type;

    const modal = document.getElementById("entryDetailsModal");
    const title = document.getElementById("entryDetailsTitle");
    const content = document.getElementById("entryDetailsContent");

    // Set title based on type
    const typeTitles = {
        income: "Income Details",
        expense: "Expense Details",
        asset: "Asset Details",
        liability: "Liability Details",
    };
    title.textContent = typeTitles[type] || "Entry Details";

    // Create content based on type
    let detailsHTML = "";

    if (type === "income") {
        detailsHTML = `
            <div class="entry-details-grid">
                <div class="entry-detail">
                    <span class="entry-detail-label">Source</span>
                    <span class="entry-detail-value">${entry.source}</span>
                </div>
                <div class="entry-detail">
                    <span class="entry-detail-label">Category</span>
                    <span class="entry-detail-value">${entry.category}</span>
                </div>
                <div class="entry-detail">
                    <span class="entry-detail-label">Amount</span>
                    <span class="entry-detail-value">£${formatCurrency(entry.amount)}</span>
                </div>
            </div>
        `;
    } else if (type === "expense") {
        detailsHTML = `
            <div class="entry-details-grid">
                <div class="entry-detail">
                    <span class="entry-detail-label">Description</span>
                    <span class="entry-detail-value">${entry.description}</span>
                </div>
                <div class="entry-detail">
                    <span class="entry-detail-label">Category</span>
                    <span class="entry-detail-value">${entry.category}</span>
                </div>
                <div class="entry-detail">
                    <span class="entry-detail-label">Amount</span>
                    <span class="entry-detail-value">£${formatCurrency(entry.amount)}</span>
                </div>
            </div>
        `;
    } else if (type === "asset") {
        detailsHTML = `
            <div class="entry-details-grid">
                <div class="entry-detail">
                    <span class="entry-detail-label">Asset Name</span>
                    <span class="entry-detail-value">${entry.name}</span>
                </div>
                <div class="entry-detail">
                    <span class="entry-detail-label">Type</span>
                    <span class="entry-detail-value">${entry.type}</span>
                </div>
                <div class="entry-detail">
                    <span class="entry-detail-label">Value</span>
                    <span class="entry-detail-value">£${formatCurrency(entry.value)}</span>
                </div>
            </div>
        `;
    } else if (type === "liability") {
        detailsHTML = `
            <div class="entry-details-grid">
                <div class="entry-detail">
                    <span class="entry-detail-label">Liability Name</span>
                    <span class="entry-detail-value">${entry.name}</span>
                </div>
                <div class="entry-detail">
                    <span class="entry-detail-label">Type</span>
                    <span class="entry-detail-value">${entry.type}</span>
                </div>
                <div class="entry-detail">
                    <span class="entry-detail-label">Amount</span>
                    <span class="entry-detail-value">£${formatCurrency(entry.amount)}</span>
                </div>
            </div>
        `;
    }

    content.innerHTML = detailsHTML;
    modal.style.display = "flex";
}

// Update the editCurrentEntry function
function editCurrentEntry() {
    if (!currentEntry || !currentEntryType) return;

    closeDetailsModal(); // Use the new function instead of closeModals()

    // Open appropriate edit modal based on type
    switch (currentEntryType) {
        case "income":
            editIncome(currentEntry.id);
            break;
        case "expense":
            editExpense(currentEntry.id);
            break;
        case "asset":
            editAsset(currentEntry.id);
            break;
        case "liability":
            editLiability(currentEntry.id);
            break;
        default:
            console.log("Unknown entry type:", currentEntryType);
    }
}

// Delete current entry
function deleteCurrentEntry() {
    if (!currentEntry || !currentEntryType) return;

    if (confirm("Are you sure you want to delete this entry?")) {
        switch (currentEntryType) {
            case "income":
                deleteIncome(currentEntry.id);
                break;
            case "expense":
                deleteExpense(currentEntry.id);
                break;
            case "asset":
                deleteAsset(currentEntry.id);
                break;
            case "liability":
                deleteLiability(currentEntry.id);
                break;
        }
        closeDetailsModal(); // Use the new function
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", initApp);
