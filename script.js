// PWA Registration and Setup
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available, show update prompt
              showUpdatePrompt();
            }
          });
        });
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// PWA Install Prompt
let deferredPrompt;
const installButton = document.getElementById('pwaInstallBtn');
const installBanner = document.getElementById('pwaInstallBanner');
const installDismiss = document.getElementById('pwaInstallDismiss');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Show install banner
  if (installBanner) {
    installBanner.classList.remove('hidden');
  }
});

// Install button click handler
if (installButton) {
  installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        hideInstallBanner();
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
    }
  });
}

// Dismiss button click handler
if (installDismiss) {
  installDismiss.addEventListener('click', () => {
    hideInstallBanner();
  });
}

function hideInstallBanner() {
  if (installBanner) {
    installBanner.classList.add('hidden');
  }
}

function showUpdatePrompt() {
  if (confirm('A new version of the app is available. Would you like to update now?')) {
    window.location.reload();
  }
}

// Network status monitoring
const offlineBanner = document.getElementById('offlineBanner');

function updateOnlineStatus() {
  if (navigator.onLine) {
    if (offlineBanner) {
      offlineBanner.classList.add('hidden');
    }
    // Trigger background sync if available
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register('background-sync');
      });
    }
  } else {
    if (offlineBanner) {
      offlineBanner.classList.remove('hidden');
    }
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Initialize online status
updateOnlineStatus();

// Application state
let appState = {
  settings: { appName: '', isSetup: false },
  sales: [],
  customers: [],
  purchases: [],
  activeTab: 'dashboard'
};

// Storage keys
const STORAGE_KEYS = {
  SALES: 'sales-tracker-sales',
  CUSTOMERS: 'sales-tracker-customers',
  PURCHASES: 'sales-tracker-purchases',
  SETTINGS: 'sales-tracker-settings'
};

// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

// Global icon refresh function
const refreshIcons = () => {
  setTimeout(() => {
    lucide.createIcons();
  }, 50);
};

const showAlert = (message, type = 'success', duration = 5000) => {
  const alertId = type + 'Alert';
  const messageId = type + 'Message';

  const alertElement = document.getElementById(alertId);
  const messageElement = document.getElementById(messageId);

  if (!alertElement || !messageElement) {
    console.error(`Alert element not found: ${alertId}`);
    return;
  }

  // Clear any existing timeout
  if (alertElement.timeout) {
    clearTimeout(alertElement.timeout);
  }

  // Set the message
  messageElement.textContent = message;

  // Show the alert with animation
  alertElement.classList.remove('hidden', 'fade-out');
  alertElement.style.display = 'block';

  // Add close button functionality
  const closeButton = alertElement.querySelector(`#close${type.charAt(0).toUpperCase() + type.slice(1)}Alert`);
  if (closeButton) {
    closeButton.onclick = () => hideAlert(alertId);
  }

  // Auto-hide after duration
  alertElement.timeout = setTimeout(() => {
    hideAlert(alertId);
  }, duration);

  // Reinitialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
};

const hideAlert = (alertId) => {
  const alertElement = document.getElementById(alertId);
  if (alertElement) {
    alertElement.classList.add('fade-out');
    setTimeout(() => {
      alertElement.classList.add('hidden');
      alertElement.style.display = 'none';
    }, 300);
  }
};

// Enhanced alert functions for different types
const showSuccess = (message, duration = 5000) => showAlert(message, 'success', duration);
const showError = (message, duration = 7000) => showAlert(message, 'error', duration);
const showInfo = (message, duration = 4000) => showAlert(message, 'info', duration);
const showWarning = (message, duration = 6000) => showAlert(message, 'warning', duration);

const validateField = (name, value) => {
  switch (name) {
    case 'customerName':
      if (!value.trim()) return 'Customer name is required';
      if (value.trim().length < 2) return 'Customer name must be at least 2 characters';
      return '';
    case 'phoneNumber':
      if (!value.trim()) return 'Phone number is required';
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(value.replace(/\D/g, ''))) return 'Please enter a valid 10-digit phone number';
      return '';
    case 'category':
      if (!value.trim()) return 'Category is required';
      if (value.trim().length < 2) return 'Category must be at least 2 characters';
      return '';
    case 'costPrice':
      if (!value) return 'Cost price is required';
      const cost = parseFloat(value);
      if (isNaN(cost) || cost < 0) return 'Cost price must be a valid positive number';
      return '';
    case 'sellingPrice':
      if (!value) return 'Selling price is required';
      const selling = parseFloat(value);
      if (isNaN(selling) || selling < 0) return 'Selling price must be a valid positive number';
      return '';
    default:
      return '';
  }
};

const showFieldError = (fieldName, error) => {
  const field = document.getElementById(fieldName);
  const errorElement = document.getElementById(fieldName + 'Error');

  if (error) {
    field.classList.add('error');
    errorElement.innerHTML = `<i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i> ${error}`;
    lucide.createIcons();
  } else {
    field.classList.remove('error');
    field.classList.add('success');
    errorElement.innerHTML = '';
  }
};

const clearFieldErrors = () => {
  const fields = ['customerName', 'phoneNumber', 'category', 'costPrice', 'sellingPrice'];
  fields.forEach(field => {
    const element = document.getElementById(field);
    const errorElement = document.getElementById(field + 'Error');
    element.classList.remove('error', 'success');
    errorElement.innerHTML = '';
  });
};

// Storage functions
const storage = {
  getSales: () => {
    const data = localStorage.getItem(STORAGE_KEYS.SALES);
    return data ? JSON.parse(data) : [];
  },
  saveSales: (sales) => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  },
  getCustomers: () => {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : [];
  },
  saveCustomers: (customers) => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },
  getPurchases: () => {
    const data = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    return data ? JSON.parse(data) : [];
  },
  savePurchases: (purchases) => {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  },
  getSettings: () => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : { appName: '', isSetup: false };
  },
  saveSettings: (settings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }
};

// Excel functions
const exportToExcel = (data, filename, type = 'sales') => {
  let worksheetData;

  if (type === 'sales') {
    worksheetData = data.map(sale => ({
      'Customer Name': sale.customerName,
      'Phone Number': sale.phoneNumber,
      'Category': sale.category,
      'Cost Price (₹)': sale.costPrice,
      'Selling Price (₹)': sale.sellingPrice,
      'Profit (₹)': sale.profit,
      'Date': new Date(sale.date).toLocaleDateString('en-IN'),
      'Created At': new Date(sale.createdAt).toLocaleString('en-IN')
    }));
  } else if (type === 'purchases') {
    worksheetData = data.map(purchase => ({
      'Supplier Name': purchase.supplierName,
      'Supplier Phone': purchase.supplierPhone,
      'Category': purchase.category,
      'Cost (₹)': purchase.cost,
      'Description': purchase.description,
      'Date': new Date(purchase.date).toLocaleDateString('en-IN'),
      'Alert Date': purchase.alertDate ? new Date(purchase.alertDate).toLocaleDateString('en-IN') : '',
      'Created At': new Date(purchase.createdAt).toLocaleString('en-IN')
    }));
  }

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, type === 'sales' ? 'Sales Data' : 'Purchase Data');

  // Auto-size columns
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  const colWidths = [];
  for (let C = range.s.c; C <= range.e.c; ++C) {
    let maxWidth = 10;
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = worksheet[cellAddress];
      if (cell && cell.v) {
        const cellLength = cell.v.toString().length;
        if (cellLength > maxWidth) {
          maxWidth = cellLength;
        }
      }
    }
    colWidths.push({ wch: Math.min(maxWidth + 2, 50) });
  }
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, filename);
};

const importFromExcel = (file, type = 'sales') => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (type === 'sales') {
          const sales = jsonData.map((row, index) => ({
            id: `imported-${Date.now()}-${index}`,
            customerName: row['Customer Name'] || '',
            phoneNumber: row['Phone Number'] || '',
            category: row['Category'] || '',
            costPrice: parseFloat(row['Cost Price (₹)']) || 0,
            sellingPrice: parseFloat(row['Selling Price (₹)']) || 0,
            profit: parseFloat(row['Profit (₹)']) || 0,
            date: row['Date'] ? new Date(row['Date']).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
          }));
          resolve(sales);
        } else if (type === 'purchases') {
          const purchases = jsonData.map((row, index) => ({
            id: `imported-${Date.now()}-${index}`,
            supplierName: row['Supplier Name'] || '',
            supplierPhone: row['Supplier Phone'] || '',
            category: row['Category'] || '',
            cost: parseFloat(row['Cost (₹)']) || 0,
            description: row['Description'] || '',
            date: row['Date'] ? new Date(row['Date']).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            alertDate: row['Alert Date'] ? new Date(row['Alert Date']).toISOString().split('T')[0] : undefined,
            createdAt: new Date().toISOString()
          }));
          resolve(purchases);
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
};

const downloadSampleExcel = () => {
  const sampleData = [
    {
      'Customer Name': 'John Doe',
      'Phone Number': '9876543210',
      'Category': 'Electronics',
      'Cost Price (₹)': 1000,
      'Selling Price (₹)': 1200,
      'Profit (₹)': 200,
      'Date': new Date().toLocaleDateString('en-IN'),
      'Created At': new Date().toLocaleString('en-IN')
    },
    {
      'Customer Name': 'Jane Smith',
      'Phone Number': '9876543211',
      'Category': 'Clothing',
      'Cost Price (₹)': 500,
      'Selling Price (₹)': 750,
      'Profit (₹)': 250,
      'Date': new Date().toLocaleDateString('en-IN'),
      'Created At': new Date().toLocaleString('en-IN')
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample Sales Data');
  XLSX.writeFile(workbook, 'sample-sales-data.xlsx');
};

// Tab management
const switchTab = (tabName) => {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  // Remove active class from all nav tabs
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
  });

  // Show selected tab content
  document.getElementById(tabName).classList.add('active');

  // Add active class to selected nav tab
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  appState.activeTab = tabName;

  // Refresh content based on tab
  switch (tabName) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'recent-sales':
      renderRecentSales();
      break;
    case 'analytics':
      renderAnalytics();
      break;
    case 'purchase-history':
      renderPurchaseHistory();
      break;
    case 'customers':
      renderCustomers();
      break;
  }
};

// Render functions
const renderDashboard = () => {
  const sales = appState.sales;
  const today = new Date();
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  const totalSales = sales.reduce((sum, sale) => sum + sale.sellingPrice, 0);
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
  const totalTransactions = sales.length;

  const thisMonthSales = sales.filter(sale => new Date(sale.date) >= thisMonth);
  const lastMonthSales = sales.filter(sale =>
    new Date(sale.date) >= lastMonth && new Date(sale.date) < thisMonth
  );

  const thisMonthRevenue = thisMonthSales.reduce((sum, sale) => sum + sale.sellingPrice, 0);
  const lastMonthRevenue = lastMonthSales.reduce((sum, sale) => sum + sale.sellingPrice, 0);
  const revenueGrowth = lastMonthRevenue > 0 ?
    ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

  const stats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(totalSales),
      icon: 'indian-rupee',
      class: 'blue',
      change: `${revenueGrowth.toFixed(1)}%`,
      isPositive: revenueGrowth >= 0
    },
    {
      title: 'Total Profit',
      value: formatCurrency(totalProfit),
      icon: 'trending-up',
      class: 'green'
    },
    {
      title: 'Total Transactions',
      value: totalTransactions.toString(),
      icon: 'shopping-bag',
      class: 'purple'
    },
    {
      title: 'This Month',
      value: formatCurrency(thisMonthRevenue),
      icon: 'calendar',
      class: 'orange'
    }
  ];

  const statsHTML = stats.map(stat => `
        <div class="stat-card ${stat.class}">
            <div class="flex items-center justify-between mb-4">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 shadow-md">
                    <i data-lucide="${stat.icon}" class="w-6 h-6 text-white"></i>
                </div>
                ${stat.change ? `
                    <div class="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
    stat.isPositive ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
  }">
                        <i data-lucide="${stat.isPositive ? 'arrow-up-right' : 'arrow-down-right'}" class="w-3 h-3"></i>
                        <span>${stat.change}</span>
                    </div>
                ` : ''}
            </div>
            <div class="text-2xl font-bold text-gray-800 mb-1">${stat.value}</div>
            <div class="text-sm text-gray-600">${stat.title}</div>
        </div>
    `).join('');

  document.getElementById('dashboardStats').innerHTML = statsHTML;

  // Top categories
  const categoryData = sales.reduce((acc, sale) => {
    acc[sale.category] = (acc[sale.category] || 0) + sale.sellingPrice;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const categoriesHTML = topCategories.map(([category, revenue], index) => `
        <div class="performance-card">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                    <div class="rank-badge ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'other'}">
                        ${index + 1}
                    </div>
                    <span class="font-medium text-gray-700">${category}</span>
                </div>
                <span class="font-semibold text-gray-800">${formatCurrency(revenue)}</span>
            </div>
        </div>
    `).join('');

  document.getElementById('topCategories').innerHTML = categoriesHTML || '<p class="text-gray-500">No categories yet</p>';

  // Recent sales
  const recentSales = sales.slice(0, 5);
  const recentSalesHTML = recentSales.map(sale => `
        <div class="flex items-center justify-between py-3 px-3 border-b border-gray-100 last:border-b-0 rounded-lg hover:bg-gray-50 transition-all duration-200">
            <div class="flex-1">
                <div class="font-medium text-gray-800">${sale.customerName}</div>
                <div class="text-sm text-gray-500">${sale.category}</div>
            </div>
            <div class="text-right">
                <div class="font-semibold text-gray-800">${formatCurrency(sale.sellingPrice)}</div>
                <div class="text-sm font-medium ${sale.profit >= 0 ? 'text-green-600' : 'text-red-600'}">
                    ${sale.profit >= 0 ? '+' : ''}${formatCurrency(sale.profit)}
                </div>
            </div>
            <div class="flex items-center gap-1 ml-2">
                <button
                    onclick="editSale('${sale.id}')"
                    class="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-all duration-200"
                    title="Edit Sale"
                >
                    <i data-lucide="edit-2" class="w-3 h-3"></i>
                </button>
                <button
                    onclick="deleteSale('${sale.id}')"
                    class="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-all duration-200"
                    title="Delete Sale"
                >
                    <i data-lucide="trash-2" class="w-3 h-3"></i>
                </button>
            </div>
        </div>
    `).join('');

  document.getElementById('recentSales').innerHTML = recentSalesHTML || '<p class="text-gray-500">No recent sales</p>';

  refreshIcons();
};

const renderRecentSales = () => {
  const sales = appState.sales;
  const searchTerm = document.getElementById('searchSales').value.toLowerCase();

  const filteredSales = sales.filter(sale =>
    sale.customerName.toLowerCase().includes(searchTerm) ||
    sale.phoneNumber.includes(searchTerm) ||
    sale.category.toLowerCase().includes(searchTerm)
  );

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.sellingPrice, 0);
  const totalProfit = filteredSales.reduce((sum, sale) => sum + sale.profit, 0);

  document.getElementById('salesCount').textContent = `${filteredSales.length} sales records`;
  document.getElementById('totalSalesAmount').textContent = formatCurrency(totalSales);
  document.getElementById('totalProfitAmount').textContent = formatCurrency(totalProfit);

  const tableBody = document.getElementById('salesTableBody');
  const noSalesMessage = document.getElementById('noSalesMessage');

  if (filteredSales.length === 0) {
    tableBody.innerHTML = '';
    noSalesMessage.classList.remove('hidden');
  } else {
    noSalesMessage.classList.add('hidden');
    tableBody.innerHTML = filteredSales.map(sale => `
            <tr class="hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                        <div class="text-sm font-medium text-gray-900">${sale.customerName}</div>
                        <div class="text-sm text-gray-500">${sale.phoneNumber}</div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-3 py-1 text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-full">
                        ${sale.category}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${new Date(sale.date).toLocaleDateString('en-IN')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ${formatCurrency(sale.costPrice)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ${formatCurrency(sale.sellingPrice)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="font-bold px-2 py-1 rounded-full text-xs ${
      sale.profit >= 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
    }">
                        ${sale.profit >= 0 ? '+' : ''}${formatCurrency(sale.profit)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <div class="flex items-center gap-2 action-buttons">
                        <button
                            onclick="editSale('${sale.id}')"
                            class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="Edit Sale"
                        >
                            <i data-lucide="edit-2" class="w-4 h-4"></i>
                        </button>
                        <button
                            onclick="deleteSale('${sale.id}')"
                            class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete Sale"
                        >
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
  }

  // Ensure icons are created after rendering
  refreshIcons();
};

const renderAnalytics = () => {
  const sales = appState.sales;
  const today = new Date();
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  const thisMonthSales = sales.filter(sale => new Date(sale.date) >= thisMonth);
  const lastMonthSales = sales.filter(sale =>
    new Date(sale.date) >= lastMonth && new Date(sale.date) < thisMonth
  );

  const thisMonthRevenue = thisMonthSales.reduce((sum, sale) => sum + sale.sellingPrice, 0);
  const lastMonthRevenue = lastMonthSales.reduce((sum, sale) => sum + sale.sellingPrice, 0);
  const revenueGrowth = lastMonthRevenue > 0 ?
    ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.sellingPrice, 0);
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
  const overallProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const categoryAnalysis = sales.reduce((acc, sale) => {
    if (!acc[sale.category]) {
      acc[sale.category] = { revenue: 0, profit: 0, count: 0 };
    }
    acc[sale.category].revenue += sale.sellingPrice;
    acc[sale.category].profit += sale.profit;
    acc[sale.category].count += 1;
    return acc;
  }, {});

  const stats = [
    {
      title: 'Monthly Growth',
      value: `${revenueGrowth.toFixed(1)}%`,
      icon: 'bar-chart',
      class: 'blue'
    },
    {
      title: 'Profit Margin',
      value: `${overallProfitMargin.toFixed(1)}%`,
      icon: 'target',
      class: 'green'
    },
    {
      title: 'Categories',
      value: Object.keys(categoryAnalysis).length.toString(),
      icon: 'pie-chart',
      class: 'orange'
    },
    {
      title: 'Avg Sale Value',
      value: formatCurrency(totalRevenue / sales.length || 0),
      icon: 'trending-up',
      class: 'purple'
    }
  ];

  const statsHTML = stats.map(stat => `
        <div class="stat-card ${stat.class}">
            <div class="flex items-center justify-between mb-4">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 shadow-md">
                    <i data-lucide="${stat.icon}" class="w-6 h-6 text-white"></i>
                </div>
            </div>
            <div class="text-2xl font-bold text-gray-800 mb-1">${stat.value}</div>
            <div class="text-sm text-gray-600">${stat.title}</div>
        </div>
    `).join('');

  document.getElementById('analyticsStats').innerHTML = statsHTML;

  // Category performance
  const categoryStats = Object.entries(categoryAnalysis)
    .map(([category, stats]) => ({
      category,
      ...stats,
      avgSale: stats.revenue / stats.count,
      profitMargin: (stats.profit / stats.revenue) * 100
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const categoryHTML = categoryStats.map((category, index) => `
        <div class="performance-card">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                    <div class="rank-badge ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'other'}">
                        ${index + 1}
                    </div>
                    <span class="font-medium text-gray-700">${category.category}</span>
                </div>
                <span class="font-semibold text-gray-800">${formatCurrency(category.revenue)}</span>
            </div>
            <div class="grid grid-cols-3 gap-4 text-sm">
                <div>
                    <div class="text-gray-500">Sales</div>
                    <div class="font-medium">${category.count}</div>
                </div>
                <div>
                    <div class="text-gray-500">Avg Sale</div>
                    <div class="font-medium">${formatCurrency(category.avgSale)}</div>
                </div>
                <div>
                    <div class="text-gray-500">Profit %</div>
                    <div class="font-medium ${category.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}">
                        ${category.profitMargin.toFixed(1)}%
                    </div>
                </div>
            </div>
        </div>
    `).join('');

  document.getElementById('categoryPerformance').innerHTML = categoryHTML || '<p class="text-gray-500">No category data yet</p>';

  // Top customers
  const customerAnalysis = sales.reduce((acc, sale) => {
    if (!acc[sale.customerName]) {
      acc[sale.customerName] = { revenue: 0, count: 0, phone: sale.phoneNumber };
    }
    acc[sale.customerName].revenue += sale.sellingPrice;
    acc[sale.customerName].count += 1;
    return acc;
  }, {});

  const topCustomers = Object.entries(customerAnalysis)
    .map(([name, stats]) => ({
      name,
      ...stats,
      avgPurchase: stats.revenue / stats.count
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const customersHTML = topCustomers.map((customer, index) => `
        <div class="performance-card">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                    <div class="rank-badge ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'other'}">
                        ${index + 1}
                    </div>
                    <div>
                        <div class="font-medium text-gray-700">${customer.name}</div>
                        <div class="text-sm text-gray-500">${customer.phone}</div>
                    </div>
                </div>
                <span class="font-semibold text-gray-800">${formatCurrency(customer.revenue)}</span>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <div class="text-gray-500">Purchases</div>
                    <div class="font-medium">${customer.count}</div>
                </div>
                <div>
                    <div class="text-gray-500">Avg Purchase</div>
                    <div class="font-medium">${formatCurrency(customer.avgPurchase)}</div>
                </div>
            </div>
        </div>
    `).join('');

  document.getElementById('topCustomers').innerHTML = customersHTML || '<p class="text-gray-500">No customer data yet</p>';

  // Render charts
  renderDashboardCharts();

  lucide.createIcons();
};

// Chart instances
let categoryChart, salesTrendChart;

// Destroy existing charts
const destroyCharts = () => {
  if (categoryChart) {
    categoryChart.destroy();
    categoryChart = null;
  }
  if (salesTrendChart) {
    salesTrendChart.destroy();
    salesTrendChart = null;
  }
};

// Render dashboard charts
const renderDashboardCharts = () => {
  const sales = appState.sales;

  if (sales.length === 0) {
    return;
  }

  // Destroy existing charts
  destroyCharts();

  // Category Sales Pie Chart
  const categoryData = sales.reduce((acc, sale) => {
    const categories = Array.isArray(sale.categories) ? sale.categories : [sale.category];
    categories.forEach(category => {
      if (category) {
        acc[category] = (acc[category] || 0) + sale.sellingPrice;
      }
    });
    return acc;
  }, {});

  const categoryLabels = Object.keys(categoryData);
  const categoryValues = Object.values(categoryData);
  const categoryColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
  ];

  const categoryCtx = document.getElementById('categoryChart').getContext('2d');
  categoryChart = new Chart(categoryCtx, {
    type: 'doughnut',
    data: {
      labels: categoryLabels,
      datasets: [{
        data: categoryValues,
        backgroundColor: categoryColors.slice(0, categoryLabels.length),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = formatCurrency(context.parsed);
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });

  // Monthly Sales Trend Line Chart
  const monthlyData = sales.reduce((acc, sale) => {
    const month = new Date(sale.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    acc[month] = (acc[month] || 0) + sale.sellingPrice;
    return acc;
  }, {});

  const sortedMonths = Object.keys(monthlyData).sort((a, b) => new Date(a) - new Date(b));
  const monthlyValues = sortedMonths.map(month => monthlyData[month]);

  const salesTrendCtx = document.getElementById('salesTrendChart').getContext('2d');
  salesTrendChart = new Chart(salesTrendCtx, {
    type: 'line',
    data: {
      labels: sortedMonths,
      datasets: [{
        label: 'Sales Revenue',
        data: monthlyValues,
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#36A2EB',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Revenue: ${formatCurrency(context.parsed.y)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            }
          }
        }
      }
    }
  });


};

const renderPurchaseHistory = () => {
  const purchases = appState.purchases;
  const totalCost = purchases.reduce((sum, purchase) => sum + purchase.cost, 0);

  document.getElementById('purchaseCount').textContent = `${purchases.length} purchase records`;
  document.getElementById('totalPurchaseCost').textContent = formatCurrency(totalCost);

  // Check for upcoming alerts
  const today = new Date();
  const upcomingAlerts = purchases.filter(purchase => {
    if (!purchase.alertDate) return false;
    const alertDate = new Date(purchase.alertDate);
    const diffTime = alertDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  const alertsContainer = document.getElementById('upcomingAlerts');
  const alertsList = document.getElementById('alertsList');

  if (upcomingAlerts.length > 0) {
    alertsContainer.classList.remove('hidden');
    alertsList.innerHTML = upcomingAlerts.map(purchase => `
            <div class="text-sm text-yellow-700">
                <span class="font-medium">${purchase.supplierName}</span> - ${purchase.category}
                <span class="ml-2 text-yellow-600">
                    (Alert: ${new Date(purchase.alertDate).toLocaleDateString('en-IN')})
                </span>
            </div>
        `).join('');
  } else {
    alertsContainer.classList.add('hidden');
  }

  const tableBody = document.getElementById('purchaseTableBody');
  const noPurchasesMessage = document.getElementById('noPurchasesMessage');

  if (purchases.length === 0) {
    tableBody.innerHTML = '';
    noPurchasesMessage.classList.remove('hidden');
  } else {
    noPurchasesMessage.classList.add('hidden');
    tableBody.innerHTML = purchases.map(purchase => `
            <tr class="hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50 transition-all duration-200">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                        <div class="text-sm font-medium text-gray-900">${purchase.supplierName}</div>
                        ${purchase.supplierPhone ? `<div class="text-sm text-gray-500">${purchase.supplierPhone}</div>` : ''}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-3 py-1 text-xs font-medium bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 rounded-full">
                        ${purchase.category}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${new Date(purchase.date).toLocaleDateString('en-IN')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${formatCurrency(purchase.cost)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${purchase.description || '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${purchase.alertDate ? `
                        <div class="flex items-center gap-1">
                            <i data-lucide="bell" class="w-4 h-4 text-yellow-500"></i>
                            <span class="text-yellow-700">
                                ${new Date(purchase.alertDate).toLocaleDateString('en-IN')}
                            </span>
                        </div>
                    ` : '-'}
                </td>
            </tr>
        `).join('');
  }

  lucide.createIcons();
};

const renderCustomers = () => {
  const customers = appState.customers;
  const sales = appState.sales;
  const searchTerm = document.getElementById('searchCustomers').value.toLowerCase();

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm) ||
    customer.phoneNumber.includes(searchTerm)
  );

  document.getElementById('customerCount').textContent = `${filteredCustomers.length} customers`;

  const getCustomerStats = (customerId) => {
    const customerSales = sales.filter(sale =>
      sale.customerName === customers.find(c => c.id === customerId)?.name
    );
    const totalSpent = customerSales.reduce((sum, sale) => sum + sale.sellingPrice, 0);
    return { totalSpent, totalPurchases: customerSales.length };
  };

  const customersGrid = document.getElementById('customersGrid');
  const noCustomersMessage = document.getElementById('noCustomersMessage');

  if (filteredCustomers.length === 0) {
    customersGrid.innerHTML = '';
    noCustomersMessage.classList.remove('hidden');
  } else {
    noCustomersMessage.classList.add('hidden');
    customersGrid.innerHTML = filteredCustomers.map(customer => {
      const stats = getCustomerStats(customer.id);
      return `
                <div class="customer-card relative group">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="bg-blue-100 rounded-full p-3">
                            <i data-lucide="users" class="w-5 h-5 text-blue-600"></i>
                        </div>
                        <div class="flex-1">
                            <h3 class="font-semibold text-gray-800">${customer.name}</h3>
                            <div class="flex items-center gap-1 text-sm text-gray-600">
                                <i data-lucide="phone" class="w-3 h-3"></i>
                                ${customer.phoneNumber}
                            </div>
                        </div>
                        <button
                            onclick="deleteCustomer('${customer.id}')"
                            class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                            title="Delete Customer"
                        >
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>

                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2 text-sm text-gray-600">
                                <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                                Total Purchases
                            </div>
                            <span class="font-medium text-gray-800">${stats.totalPurchases}</span>
                        </div>

                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2 text-sm text-gray-600">
                                <i data-lucide="calendar" class="w-4 h-4"></i>
                                Total Spent
                            </div>
                            <span class="font-medium text-gray-800">${formatCurrency(stats.totalSpent)}</span>
                        </div>

                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2 text-sm text-gray-600">
                                <i data-lucide="calendar" class="w-4 h-4"></i>
                                Last Purchase
                            </div>
                            <span class="font-medium text-gray-800">
                                ${new Date(customer.lastPurchaseDate).toLocaleDateString('en-IN')}
                            </span>
                        </div>

                        ${stats.totalPurchases > 0 ? `
                            <div class="flex items-center justify-between pt-2 border-t border-gray-200">
                                <span class="text-sm text-gray-600">Avg Purchase</span>
                                <span class="font-medium text-gray-800">
                                    ${formatCurrency(stats.totalSpent / stats.totalPurchases)}
                                </span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
    }).join('');
  }

  // Ensure icons are created after rendering
  refreshIcons();
};

// Customer dropdown functionality
const updateCustomerDropdown = () => {
  const input = document.getElementById('customerName');
  const dropdown = document.getElementById('customerDropdown');
  const searchTerm = input.value.toLowerCase();

  if (searchTerm.length === 0) {
    dropdown.classList.add('hidden');
    return;
  }

  const filteredCustomers = appState.customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm) ||
    customer.phoneNumber.includes(searchTerm)
  );

  if (filteredCustomers.length === 0) {
    dropdown.classList.add('hidden');
    return;
  }

  dropdown.innerHTML = filteredCustomers.map(customer => `
        <div class="customer-option" data-customer-id="${customer.id}">
            <div class="font-medium">${customer.name}</div>
            <div class="text-sm text-gray-500">${customer.phoneNumber}</div>
        </div>
    `).join('');

  dropdown.classList.remove('hidden');
};

const selectCustomer = (customerId) => {
  const customer = appState.customers.find(c => c.id === customerId);
  if (customer) {
    document.getElementById('customerName').value = customer.name;
    document.getElementById('phoneNumber').value = customer.phoneNumber;
    document.getElementById('customerDropdown').classList.add('hidden');

    // Clear any existing errors
    showFieldError('customerName', '');
    showFieldError('phoneNumber', '');
  }
};

// Profit calculation
const updateProfitDisplay = () => {
  const costPrice = parseFloat(document.getElementById('costPrice').value) || 0;
  const sellingPrice = parseFloat(document.getElementById('sellingPrice').value) || 0;
  const profit = sellingPrice - costPrice;

  const profitDisplay = document.getElementById('profitDisplay');
  const profitAmount = document.getElementById('profitAmount');

  if (costPrice > 0 || sellingPrice > 0) {
    profitDisplay.classList.remove('hidden');
    profitAmount.textContent = formatCurrency(profit);
    profitAmount.className = `text-lg font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`;

    if (profit < 0) {
      profitDisplay.classList.add('negative');
    } else {
      profitDisplay.classList.remove('negative');
    }
  } else {
    profitDisplay.classList.add('hidden');
  }
};

// Form submission handlers
const handleAddSale = async (e) => {
  e.preventDefault();

  const submitButton = document.getElementById('addSaleBtn');
  const originalButtonText = submitButton.innerHTML;

  // Show loading state
  submitButton.classList.add('btn-loading');
  submitButton.disabled = true;
  submitButton.innerHTML = '<div class="spinner mr-2"></div> Adding Sale...';

  try {
    const formData = {
      customerName: document.getElementById('customerName').value.trim(),
      phoneNumber: document.getElementById('phoneNumber').value.trim(),
      category: document.getElementById('category').value.trim(),
      costPrice: document.getElementById('costPrice').value,
      sellingPrice: document.getElementById('sellingPrice').value,
      date: document.getElementById('saleDate').value
    };

    // Validate all fields
    let hasErrors = false;
    const fields = ['customerName', 'phoneNumber', 'category', 'costPrice', 'sellingPrice'];

    fields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        hasErrors = true;
        showFieldError(field, error);
      } else {
        showFieldError(field, '');
      }
    });

    if (hasErrors) {
      showError('Please fill in all required fields correctly');
      return;
    }

    // Additional validation for negative profit warning
    const profit = parseFloat(formData.sellingPrice) - parseFloat(formData.costPrice);
    if (profit < 0) {
      showWarning(`This sale has a negative profit of ${formatCurrency(Math.abs(profit))}. Are you sure you want to continue?`);
      // For now, we'll continue, but you could add a confirmation dialog here
    }

    const newSale = {
      id: Date.now().toString(),
      customerName: formData.customerName,
      phoneNumber: formData.phoneNumber,
      category: formData.category,
      costPrice: parseFloat(formData.costPrice),
      sellingPrice: parseFloat(formData.sellingPrice),
      profit: profit,
      date: formData.date,
      createdAt: new Date().toISOString()
    };

    // Save sale
    appState.sales.unshift(newSale);
    storage.saveSales(appState.sales);

    // Update or add customer
    const existingCustomer = appState.customers.find(c =>
      c.phoneNumber === formData.phoneNumber || c.name === formData.customerName
    );

    if (existingCustomer) {
      existingCustomer.totalPurchases++;
      existingCustomer.lastPurchaseDate = formData.date;
      storage.saveCustomers(appState.customers);
    } else {
      const newCustomer = {
        id: Date.now().toString(),
        name: formData.customerName,
        phoneNumber: formData.phoneNumber,
        totalPurchases: 1,
        lastPurchaseDate: formData.date
      };
      appState.customers.push(newCustomer);
      storage.saveCustomers(appState.customers);
    }

    // Show success message
    showSuccess(`Sale added successfully! Customer: ${formData.customerName}, Amount: ${formatCurrency(parseFloat(formData.sellingPrice))}, Profit: ${formatCurrency(profit)}`);

    // Reset form
    document.getElementById('addSaleForm').reset();
    document.getElementById('saleDate').value = new Date().toISOString().split('T')[0];
    clearFieldErrors();
    document.getElementById('profitDisplay').classList.add('hidden');

    // Switch to recent sales tab
    switchTab('recent-sales');

  } catch (error) {
    console.error('Error adding sale:', error);
    showError('An error occurred while adding the sale. Please try again.');
  } finally {
    // Restore button state
    submitButton.classList.remove('btn-loading');
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonText;

    // Reinitialize Lucide icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }
};

const handleAddPurchase = (e) => {
  e.preventDefault();

  const formData = {
    supplierName: document.getElementById('supplierName').value.trim(),
    supplierPhone: document.getElementById('supplierPhone').value.trim(),
    date: document.getElementById('purchaseDate').value,
    cost: document.getElementById('purchaseCost').value,
    category: document.getElementById('purchaseCategory').value.trim(),
    description: document.getElementById('purchaseDescription').value.trim(),
    alertDate: document.getElementById('alertDate').value
  };

  if (!formData.supplierName || !formData.cost || !formData.category || !formData.date) {
    showAlert('Please fill in all required fields', 'error');
    return;
  }

  const newPurchase = {
    id: Date.now().toString(),
    supplierName: formData.supplierName,
    supplierPhone: formData.supplierPhone,
    date: formData.date,
    cost: parseFloat(formData.cost),
    category: formData.category,
    description: formData.description,
    alertDate: formData.alertDate || undefined,
    createdAt: new Date().toISOString()
  };

  appState.purchases.unshift(newPurchase);
  storage.savePurchases(appState.purchases);

  showAlert(`Purchase added successfully! Supplier: ${formData.supplierName}, Cost: ${formatCurrency(parseFloat(formData.cost))}`);

  // Reset form and close modal
  document.getElementById('addPurchaseForm').reset();
  document.getElementById('purchaseDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('addPurchaseModal').classList.add('hidden');

  renderPurchaseHistory();
};

// Initialize app
const initApp = () => {
  // Load data from storage
  appState.settings = storage.getSettings();
  appState.sales = storage.getSales();
  appState.customers = storage.getCustomers();
  appState.purchases = storage.getPurchases();

  // Set default date
  document.getElementById('saleDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('purchaseDate').value = new Date().toISOString().split('T')[0];

  // Set app title if available, otherwise use default
  if (appState.settings.appName) {
    document.getElementById('appTitle').textContent = appState.settings.appName;
  } else {
    document.getElementById('appTitle').textContent = 'My Business';
  }

  // Always render dashboard
  renderDashboard();

  // Initialize Lucide icons
  lucide.createIcons();
};

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  initApp();



  // Navigation tabs
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      switchTab(tabName);
    });
  });

  // Add sale form
  document.getElementById('addSaleForm').addEventListener('submit', handleAddSale);

  // Customer name input for dropdown
  document.getElementById('customerName').addEventListener('input', updateCustomerDropdown);

  // Hide dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#customerName') && !e.target.closest('#customerDropdown')) {
      document.getElementById('customerDropdown').classList.add('hidden');
    }
  });

  // Customer dropdown selection
  document.getElementById('customerDropdown').addEventListener('click', (e) => {
    const option = e.target.closest('.customer-option');
    if (option) {
      selectCustomer(option.getAttribute('data-customer-id'));
    }
  });

  // Profit calculation
  document.getElementById('costPrice').addEventListener('input', updateProfitDisplay);
  document.getElementById('sellingPrice').addEventListener('input', updateProfitDisplay);

  // Search functionality
  document.getElementById('searchSales').addEventListener('input', renderRecentSales);
  document.getElementById('searchCustomers').addEventListener('input', renderCustomers);

  // Export/Import buttons
  document.getElementById('dashboardExportExcel').addEventListener('click', () => {
    exportToExcel(appState.sales, `dashboard-sales-${new Date().toISOString().split('T')[0]}.xlsx`, 'sales');
    showSuccess('Sales data exported successfully!');
  });

  document.getElementById('recentSalesExportExcel').addEventListener('click', () => {
    exportToExcel(appState.sales, `recent-sales-${new Date().toISOString().split('T')[0]}.xlsx`, 'sales');
    showSuccess('Sales data exported successfully!');
  });

  document.getElementById('analyticsExportExcel').addEventListener('click', () => {
    exportToExcel(appState.sales, `analytics-sales-${new Date().toISOString().split('T')[0]}.xlsx`, 'sales');
    showSuccess('Sales data exported successfully!');
  });

  document.getElementById('purchaseExportExcel').addEventListener('click', () => {
    exportToExcel(appState.purchases, `purchases-${new Date().toISOString().split('T')[0]}.xlsx`, 'purchases');
    showSuccess('Purchase data exported successfully!');
  });

  document.getElementById('downloadSample').addEventListener('click', () => {
    downloadSampleExcel();
    showInfo('Sample Excel file downloaded!');
  });

  // Import functionality
  document.getElementById('dashboardImportExcel').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        showInfo('Importing Excel file...');
        const importedSales = await importFromExcel(file, 'sales');
        appState.sales = [...appState.sales, ...importedSales];
        storage.saveSales(appState.sales);
        showSuccess(`${importedSales.length} sales records imported successfully!`);
        renderDashboard();
      } catch (error) {
        showError('Error importing Excel file. Please check the file format and try again.');
      }
    }
    e.target.value = ''; // Reset file input
  });

  document.getElementById('recentSalesImportExcel').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        showInfo('Importing Excel file...');
        const importedSales = await importFromExcel(file, 'sales');
        appState.sales = [...appState.sales, ...importedSales];
        storage.saveSales(appState.sales);
        showSuccess(`${importedSales.length} sales records imported successfully!`);
        renderRecentSales();
      } catch (error) {
        showError('Error importing Excel file. Please check the file format and try again.');
      }
    }
    e.target.value = ''; // Reset file input
  });

  document.getElementById('analyticsImportExcel').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        showInfo('Importing Excel file...');
        const importedSales = await importFromExcel(file, 'sales');
        appState.sales = [...appState.sales, ...importedSales];
        storage.saveSales(appState.sales);
        showSuccess(`${importedSales.length} sales records imported successfully!`);
        renderAnalytics();
      } catch (error) {
        showError('Error importing Excel file. Please check the file format and try again.');
      }
    }
    e.target.value = ''; // Reset file input
  });

  document.getElementById('purchaseImportExcel').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const importedPurchases = await importFromExcel(file, 'purchases');
        appState.purchases = [...appState.purchases, ...importedPurchases];
        storage.savePurchases(appState.purchases);
        showAlert(`${importedPurchases.length} purchase records imported successfully!`);
        renderPurchaseHistory();
      } catch (error) {
        showAlert('Error importing Excel file. Please check the file format.', 'error');
      }
    }
  });

  // Purchase modal
  document.getElementById('addPurchaseBtn').addEventListener('click', () => {
    document.getElementById('addPurchaseModal').classList.remove('hidden');
  });

  document.getElementById('cancelPurchase').addEventListener('click', () => {
    document.getElementById('addPurchaseModal').classList.add('hidden');
  });

  document.getElementById('addPurchaseForm').addEventListener('submit', handleAddPurchase);

  // Edit app name
  document.getElementById('editAppName').addEventListener('click', () => {
    document.getElementById('editAppNameInput').value = appState.settings.appName;
    document.getElementById('editNameModal').classList.remove('hidden');
  });

  document.getElementById('cancelEditName').addEventListener('click', () => {
    document.getElementById('editNameModal').classList.add('hidden');
  });

  document.getElementById('saveAppName').addEventListener('click', () => {
    const newName = document.getElementById('editAppNameInput').value.trim();
    if (newName) {
      appState.settings.appName = newName;
      storage.saveSettings(appState.settings);
      document.getElementById('appTitle').textContent = newName;
      document.getElementById('editNameModal').classList.add('hidden');
      showAlert('App name updated successfully!');
    }
  });

  // Edit Sale Modal Event Listeners
  document.getElementById('cancelEditSale').addEventListener('click', () => {
    document.getElementById('editSaleModal').classList.add('hidden');
  });

  document.getElementById('editSaleForm').addEventListener('submit', (e) => {
    e.preventDefault();
    updateSale();
  });

  // Customer Management Event Listeners
  document.getElementById('exportCustomers').addEventListener('click', exportCustomers);
  document.getElementById('importCustomers').addEventListener('click', importCustomers);
  document.getElementById('deleteAllCustomers').addEventListener('click', deleteAllCustomers);
  document.getElementById('customerFileInput').addEventListener('change', handleCustomerImport);

  // Initialize icons after all content is loaded
  refreshIcons();
});

// Edit Sale Function
let editingSaleId = null;

const editSale = (saleId) => {
  const sale = appState.sales.find(s => s.id === saleId);
  if (!sale) {
    showAlert('Sale not found!', 'error');
    return;
  }

  editingSaleId = saleId;

  // Populate form fields
  document.getElementById('editCustomerName').value = sale.customerName;
  document.getElementById('editPhoneNumber').value = sale.phoneNumber;
  document.getElementById('editCategory').value = sale.category;
  document.getElementById('editSaleDate').value = sale.date;
  document.getElementById('editCostPrice').value = sale.costPrice;
  document.getElementById('editSellingPrice').value = sale.sellingPrice;
  document.getElementById('editNotes').value = sale.notes || '';

  // Show modal
  document.getElementById('editSaleModal').classList.remove('hidden');

  // Initialize icons in modal
  refreshIcons();

  // Focus on first field
  document.getElementById('editCustomerName').focus();
};

const updateSale = () => {
  if (!editingSaleId) return;

  const customerName = document.getElementById('editCustomerName').value.trim();
  const phoneNumber = document.getElementById('editPhoneNumber').value.trim();
  const category = document.getElementById('editCategory').value;
  const saleDate = document.getElementById('editSaleDate').value;
  const costPrice = parseFloat(document.getElementById('editCostPrice').value);
  const sellingPrice = parseFloat(document.getElementById('editSellingPrice').value);
  const notes = document.getElementById('editNotes').value.trim();

  // Validation
  if (!customerName || !phoneNumber || !category || !costPrice || !sellingPrice) {
    showAlert('Please fill in all required fields!', 'error');
    return;
  }

  if (costPrice < 0 || sellingPrice < 0) {
    showAlert('Prices cannot be negative!', 'error');
    return;
  }

  if (phoneNumber.length < 10) {
    showAlert('Please enter a valid phone number!', 'error');
    return;
  }

  // Find and update the sale
  const saleIndex = appState.sales.findIndex(s => s.id === editingSaleId);
  if (saleIndex === -1) {
    showAlert('Sale not found!', 'error');
    return;
  }

  // Update sale data
  appState.sales[saleIndex] = {
    ...appState.sales[saleIndex],
    customerName,
    phoneNumber,
    category,
    date: saleDate || new Date().toISOString().split('T')[0],
    costPrice,
    sellingPrice,
    profit: sellingPrice - costPrice,
    notes
  };

  // Save to storage
  storage.saveSales(appState.sales);

  // Update customer if needed
  let customer = appState.customers.find(c => c.phoneNumber === phoneNumber);
  if (customer) {
    customer.name = customerName;
    customer.lastPurchase = new Date().toISOString();
    // Recalculate customer stats
    const customerSales = appState.sales.filter(s => s.phoneNumber === phoneNumber);
    customer.totalPurchases = customerSales.length;
    customer.totalSpent = customerSales.reduce((sum, s) => sum + s.sellingPrice, 0);
  } else {
    // Add new customer
    appState.customers.push({
      id: Date.now().toString(),
      name: customerName,
      phoneNumber,
      totalPurchases: 1,
      totalSpent: sellingPrice,
      lastPurchase: new Date().toISOString()
    });
  }

  storage.saveCustomers(appState.customers);

  // Hide modal and reset
  document.getElementById('editSaleModal').classList.add('hidden');
  editingSaleId = null;

  // Refresh displays
  renderDashboard();
  renderRecentSales();
  renderCustomers();

  showAlert('Sale updated successfully!');
};

// Delete Sale Function
const deleteSale = (saleId) => {
  const sale = appState.sales.find(s => s.id === saleId);
  if (!sale) {
    showAlert('Sale not found!', 'error');
    return;
  }

  // Show confirmation dialog
  if (confirm(`Are you sure you want to delete this sale?\n\nCustomer: ${sale.customerName}\nAmount: ${formatCurrency(sale.sellingPrice)}\nDate: ${new Date(sale.date).toLocaleDateString('en-IN')}`)) {
    // Remove sale from array
    appState.sales = appState.sales.filter(s => s.id !== saleId);

    // Save to storage
    storage.saveSales(appState.sales);

    // Update customer stats
    const customer = appState.customers.find(c => c.phoneNumber === sale.phoneNumber);
    if (customer) {
      const customerSales = appState.sales.filter(s => s.phoneNumber === sale.phoneNumber);
      customer.totalPurchases = customerSales.length;
      customer.totalSpent = customerSales.reduce((sum, s) => sum + s.sellingPrice, 0);

      // Remove customer if no sales left
      if (customerSales.length === 0) {
        appState.customers = appState.customers.filter(c => c.phoneNumber !== sale.phoneNumber);
      }
    }

    storage.saveCustomers(appState.customers);

    // Refresh displays
    renderDashboard();
    renderRecentSales();
    renderCustomers();

    showAlert('Sale deleted successfully!');
  }
};

// Customer Management Functions
const deleteCustomer = (customerId) => {
  const customer = appState.customers.find(c => c.id === customerId);
  if (!customer) {
    showAlert('Customer not found!', 'error');
    return;
  }

  // Check if customer has any sales
  const customerSales = appState.sales.filter(sale => sale.phoneNumber === customer.phoneNumber);

  let confirmMessage = `Are you sure you want to delete this customer?\n\nCustomer: ${customer.name}\nPhone: ${customer.phoneNumber}`;

  if (customerSales.length > 0) {
    confirmMessage += `\n\nWarning: This customer has ${customerSales.length} sales records. The customer will be removed but sales records will remain.`;
  }

  if (confirm(confirmMessage)) {
    // Remove customer from array
    appState.customers = appState.customers.filter(c => c.id !== customerId);

    // Save to storage
    storage.saveCustomers(appState.customers);

    // Refresh display
    renderCustomers();
    renderDashboard();
    refreshIcons();

    showAlert('Customer deleted successfully!');
  }
};

const deleteAllCustomers = () => {
  if (appState.customers.length === 0) {
    showAlert('No customers to delete!', 'error');
    return;
  }

  const confirmMessage = `Are you sure you want to delete ALL customers?\n\nThis will remove ${appState.customers.length} customers from your database.\n\nWarning: This action cannot be undone. Sales records will remain but customer information will be lost.`;

  if (confirm(confirmMessage)) {
    // Clear all customers
    appState.customers = [];

    // Save to storage
    storage.saveCustomers(appState.customers);

    // Refresh display
    renderCustomers();
    renderDashboard();

    showAlert('All customers deleted successfully!');
  }
};

const exportCustomers = () => {
  if (appState.customers.length === 0) {
    showAlert('No customers to export!', 'error');
    return;
  }

  const customers = appState.customers.map(customer => {
    const customerSales = appState.sales.filter(sale => sale.phoneNumber === customer.phoneNumber);
    const totalSpent = customerSales.reduce((sum, sale) => sum + sale.sellingPrice, 0);

    return {
      'Customer Name': customer.name,
      'Phone Number': customer.phoneNumber,
      'Total Purchases': customerSales.length,
      'Total Spent (₹)': totalSpent,
      'Average Purchase (₹)': customerSales.length > 0 ? (totalSpent / customerSales.length).toFixed(2) : 0,
      'Last Purchase Date': customer.lastPurchase ? new Date(customer.lastPurchase).toLocaleDateString('en-IN') : 'Never',
      'Customer Since': customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-IN') : 'Unknown'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(customers);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

  const fileName = `customers_export_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);

  showAlert(`Customers exported successfully! (${customers.length} customers)`);
};

const importCustomers = () => {
  document.getElementById('customerFileInput').click();
};

const handleCustomerImport = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        showAlert('No data found in the Excel file!', 'error');
        return;
      }

      let imported = 0;
      let skipped = 0;

      jsonData.forEach((row, index) => {
        const customerName = row['Customer Name'] || row['Name'] || '';
        const phoneNumber = row['Phone Number'] || row['Phone'] || '';

        if (!customerName || !phoneNumber) {
          skipped++;
          return;
        }

        // Check if customer already exists
        const existingCustomer = appState.customers.find(c => c.phoneNumber === phoneNumber);

        if (!existingCustomer) {
          // Add new customer
          appState.customers.push({
            id: `imported-${Date.now()}-${index}`,
            name: customerName,
            phoneNumber: phoneNumber,
            totalPurchases: 0,
            totalSpent: 0,
            lastPurchase: null,
            createdAt: new Date().toISOString()
          });
          imported++;
        } else {
          // Update existing customer name if different
          if (existingCustomer.name !== customerName) {
            existingCustomer.name = customerName;
          }
          skipped++;
        }
      });

      // Save to storage
      storage.saveCustomers(appState.customers);

      // Refresh display
      renderCustomers();
      renderDashboard();

      showAlert(`Import completed! ${imported} customers imported, ${skipped} skipped (duplicates or invalid data)`);
    } catch (error) {
      console.error('Import error:', error);
      showAlert('Error importing customers. Please check the file format.', 'error');
    }
  };

  reader.readAsBinaryString(file);
  event.target.value = ''; // Reset file input
};
