# Sales Tracker PWA 📊

A comprehensive Progressive Web App for jewelry business sales management. Track sales, manage customers, analyze performance, and grow your business with this powerful, offline-capable application.

![PWA](https://img.shields.io/badge/PWA-enabled-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)

## ✨ Features

### 🎯 Core Features
- **Sales Tracking** - Record and manage all sales transactions
- **Customer Management** - Keep track of customer details and purchase history
- **Analytics Dashboard** - Visual insights with charts and statistics
- **Category Management** - Organize products by categories (Sets, Necklaces, Earrings, etc.)
- **Import/Export** - Excel integration for data management
- **Responsive Design** - Works perfectly on all devices

### 🚀 PWA Features
- **Offline Support** - Works without internet connection
- **Installable** - Add to home screen like a native app
- **Push Notifications** - Stay updated with important information
- **Background Sync** - Sync data when connection is restored
- **Fast Loading** - Cached resources for instant access
- **App-like Experience** - Full-screen, native-like interface

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager
- Modern web browser

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sales-tracker-pwa.git
   cd sales-tracker-pwa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   - Navigate to `http://localhost:8080`
   - For PWA features, use HTTPS or localhost

### Production Build

```bash
# Build for production
npm run build

# Serve production build
npm run serve
```

## 📱 PWA Installation

### For Users
1. Visit the app URL in your browser
2. Click the "Install" button when prompted
3. Or use browser menu: "Add to Home Screen" / "Install App"

### For Developers
The app includes:
- Web App Manifest (`manifest.json`)
- Service Worker (`sw.js`)
- Offline caching strategy
- Install prompts and banners

## 🎨 Screenshots

### Desktop View
![Desktop Dashboard](screenshots/desktop-dashboard.png)

### Mobile View
![Mobile Dashboard](screenshots/mobile-dashboard.png)

## 🔧 Development

### Project Structure
```
sales-tracker-pwa/
├── index.html          # Main HTML file
├── manifest.json       # Web App Manifest
├── sw.js              # Service Worker
├── styles.css         # Main styles
├── script.js          # Main JavaScript
├── icons/             # App icons
├── screenshots/       # App screenshots
├── webpack.config.js  # Webpack configuration
└── package.json       # Dependencies and scripts
```

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run serve` - Serve production build
- `npm run pwa-test` - Test PWA with Lighthouse
- `npm run deploy` - Deploy to GitHub Pages

### PWA Testing

Test your PWA compliance:
```bash
npm run pwa-test
```

This runs Google Lighthouse to check:
- Performance
- Accessibility
- Best Practices
- SEO
- PWA compliance

## 📊 Features Overview

### Dashboard
- **Sales Overview** - Total sales, revenue, and growth metrics
- **Visual Charts** - Category distribution and monthly trends
- **Quick Stats** - Key performance indicators
- **Recent Activity** - Latest sales and customer interactions

### Sales Management
- **Add New Sales** - Quick and easy sale recording
- **Customer Autocomplete** - Smart customer suggestions
- **Category Organization** - Jewelry-specific categories
- **Date Tracking** - Precise sale timing

### Analytics
- **Performance Metrics** - Revenue, profit, and growth analysis
- **Category Insights** - Best-selling categories and trends
- **Customer Analytics** - Customer behavior and preferences
- **Time-based Analysis** - Daily, weekly, and monthly reports

### Data Management
- **Excel Import/Export** - Seamless data transfer
- **Backup & Restore** - Secure data management
- **Offline Storage** - Local data persistence
- **Cloud Sync** - Multi-device synchronization

## 🌐 Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ Full |
| Edge | ✅ Full |
| Opera | ✅ Full |

## 📂 Deployment

### GitHub Pages
```bash
npm run deploy
```

### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`

### Vercel
1. Import project from GitHub
2. Vercel will auto-detect settings
3. Deploy with one click

## 🔐 Security

- All data is stored locally using IndexedDB
- No sensitive data transmitted without encryption
- Service Worker follows security best practices
- HTTPS required for full PWA functionality

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@salestracker.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/sales-tracker-pwa/issues)
- 📚 Documentation: [Wiki](https://github.com/yourusername/sales-tracker-pwa/wiki)

## 🎉 Acknowledgments

- [Lucide](https://lucide.dev/) for beautiful icons
- [Chart.js](https://www.chartjs.org/) for data visualization
- [SheetJS](https://sheetjs.com/) for Excel integration
- PWA community for best practices

## 🚀 Roadmap

- [ ] Multi-language support
- [ ] Advanced reporting features
- [ ] Integration with accounting software
- [ ] Barcode scanning support
- [ ] Invoice generation
- [ ] Inventory management
- [ ] Multi-store support
- [ ] Advanced analytics with ML

---

**Made with ❤️ for jewelry business owners**

[![PWA](https://img.shields.io/badge/PWA-Ready-brightgreen)](https://web.dev/progressive-web-apps/)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-100%25-brightgreen)](https://developers.google.com/web/tools/lighthouse)