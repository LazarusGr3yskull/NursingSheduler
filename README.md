# Pflege-Kopilot – Nursing Scheduler

A comprehensive Google Apps Script application for automated nursing staff scheduling and shift management in healthcare facilities.

## 🏥 Overview

The Pflege-Kopilot (Nursing Copilot) is a sophisticated scheduling system designed specifically for healthcare facilities to manage nursing staff shifts efficiently. It automates the complex process of creating monthly rosters while considering staff preferences, qualifications, availability, and regulatory requirements.

## ✨ Features

### Core Functionality
- **Automated Shift Planning**: Generate monthly nursing schedules with intelligent staff assignment
- **Multi-Shift Support**: Handles Früh (Early), Spät (Late), and Nacht (Night) shifts
- **Staff Management**: Comprehensive nurse profile system with qualifications and preferences
- **Availability Tracking**: Optional AVAIL system for staff availability management
- **Compliance Rules**: Built-in rules for rest periods, consecutive days, and certification requirements

### Key Capabilities
- **Smart Assignment Algorithm**: Considers staff skills, preferences, and workload balance
- **Template Generation**: Pre-configured shift demand templates for different scenarios
- **Random Demand Generator**: Stress-testing tool for various scheduling scenarios
- **Real-time Validation**: Ensures compliance with healthcare regulations
- **Flexible Configuration**: Customizable rules and parameters

## 🚀 Quick Start

### Prerequisites
- Google Workspace account
- Google Sheets access
- Basic understanding of Google Apps Script

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/LazarusGr3yskull/NursingSheduler.git
   cd NursingSheduler
   ```

2. **Set up Google Apps Script**
   - Open [Google Apps Script](https://script.google.com)
   - Create a new project
   - Copy the contents of `src/Code.gs` into your Apps Script editor
   - Copy the contents of `src/Sidebar.html` into a new HTML file named "Sidebar"

3. **Configure Your Spreadsheet**
   - Create a new Google Sheet
   - Open the Apps Script project
   - Run the `onOpen()` function to add the menu
   - Use the "NURSES-Sheet erstellen" option to set up the staff database

## 📋 Usage

### Initial Setup
1. **Create NURSES Sheet**: Use the menu option to generate the staff database template
2. **Add Staff Information**: Fill in nurse details including:
   - Contact information and ID
   - Role and qualifications
   - Work preferences and limits
   - Certification dates (BLS, ACLS)

### Monthly Planning Workflow

#### Option 1: With Availability Tracking
1. **Prepare Templates**: Generate AVAIL and SHIFT_DEMAND templates for the next month
2. **Fill Availability**: Staff members fill in their availability
3. **Generate Schedule**: Create the monthly roster with availability consideration

#### Option 2: Without Availability (Quick Mode)
1. **Prepare Demand Only**: Generate only SHIFT_DEMAND templates
2. **Optional Random Demand**: Use the stress-testing tool for scenario planning
3. **Generate Schedule**: Create roster based on demand and staff profiles

## 🏗️ Project Structure

```
NursingSheduler/
├── src/
│   ├── Code.gs              # Main application logic
│   ├── Sidebar.html         # User interface
│   └── Sidebar.js           # Frontend JavaScript (if needed)
├── docs/
│   ├── API.md              # API documentation
│   └── CONFIGURATION.md    # Configuration guide
├── .gitignore
├── LICENSE
├── README.md
└── CONTRIBUTING.md
```

## ⚙️ Configuration

### Shift Times
```javascript
const SHIFT_TIMES = {
  'Früh':  { start: '06:00', end: '14:00' },
  'Spät':  { start: '14:00', end: '22:00' },
  'Nacht': { start: '22:00', end: '08:00+1' }
};
```

### Default Rules
- **Minimum Rest Hours**: 12 hours between shifts
- **Maximum Consecutive Days**: 7 days
- **Shift Lengths**: Früh (8h), Spät (8h), Nacht (10h)

### Staff Roles
- **PFK**: Pflegefachkraft (Registered Nurse)
- **PHK**: Pflegehelfer/in (Nursing Assistant)
- **PDL**: Pflegedienstleitung (Nursing Director)
- **stPDL**: Stellvertretende PDL (Deputy Nursing Director)
- **BrüK**: Bürokraft (Administrative Staff)
- **HW**: Hauswirtschaft (Housekeeping)

## 🔧 Customization

### Adding New Roles
1. Update the role validation in the assignment algorithm
2. Add role-specific rules in the filtering logic
3. Update documentation

### Modifying Shift Rules
1. Adjust `DEFAULT_MIN_REST_HOURS` and `DEFAULT_MAX_CONSEC_DAYS`
2. Modify the filtering logic in `generateForWeek_()`
3. Update shift time configurations

### Custom Validation Rules
Add new validation functions in the helper section and integrate them into the assignment algorithm.

## 📊 Output Sheets

The system generates several output sheets:
- **ROTA_KW_XX**: Weekly roster assignments
- **ROTA_REPORT_KW_XX**: Unfilled positions and reasons
- **NURSES**: Staff database
- **SHIFT_DEMAND_KW_XX**: Shift requirements

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in the `docs/` folder
- Review the inline code comments

## 🔄 Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version history and updates.

## 🙏 Acknowledgments

- Healthcare scheduling best practices
- Google Apps Script community
- German healthcare regulations compliance

---

**Note**: This application is designed for German healthcare facilities and follows German nursing regulations. Adapt the rules and terminology for your specific region and requirements.
