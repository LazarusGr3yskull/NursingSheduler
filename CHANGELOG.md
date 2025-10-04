# Changelog

All notable changes to the Pflege-Kopilot nursing scheduler will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with professional git repository structure
- Comprehensive README with installation and usage instructions
- MIT License
- Contributing guidelines
- Changelog for version tracking

### Changed
- Organized code into proper project structure (`src/` directory)
- Separated main application logic (`Code.gs`) and UI (`Sidebar.html`)

## [1.0.0] - 2024-10-04

### Added
- **Core Scheduling Engine**
  - Automated shift assignment algorithm
  - Multi-shift support (Früh, Spät, Nacht)
  - Staff profile management system
  - Comprehensive validation rules

- **Staff Management**
  - NURSES sheet creation and management
  - Role-based assignment (PFK, PHK, PDL, stPDL, BrüK, HW)
  - Qualification tracking (BLS, ACLS certifications)
  - Preference management (shift types, units, hours)

- **Scheduling Features**
  - Monthly roster generation
  - Template-based shift demand creation
  - Random demand generator for stress testing
  - Availability tracking (optional AVAIL system)

- **Compliance & Rules**
  - Minimum rest hours enforcement (12h default)
  - Maximum consecutive days limit (7 days default)
  - Night shift limitations
  - Office hours constraints for administrative staff
  - Weekend and holiday considerations

- **User Interface**
  - Modern sidebar interface with Bootstrap styling
  - Intuitive workflow buttons
  - Real-time status feedback
  - Progress indicators and loading states

- **Output & Reporting**
  - Weekly roster sheets (ROTA_KW_XX)
  - Unfilled position reports (ROTA_REPORT_KW_XX)
  - Assignment tracking with skill validation
  - Preference matching indicators

- **Configuration**
  - Customizable shift times
  - Flexible rule parameters
  - Timezone support (Europe/Berlin)
  - Extensible role system

### Technical Details
- **Language**: Google Apps Script (JavaScript)
- **UI Framework**: Bootstrap 5.3.0
- **Data Format**: Google Sheets integration
- **Timezone**: Europe/Berlin
- **Default Rules**:
  - Minimum rest hours: 12 hours
  - Maximum consecutive days: 7 days
  - Shift lengths: Früh (8h), Spät (8h), Nacht (10h)

### Features by Category

#### Core Functionality
- ✅ Automated shift planning
- ✅ Staff profile management
- ✅ Template generation
- ✅ Monthly roster creation
- ✅ Availability tracking (optional)

#### Validation & Rules
- ✅ Rest period enforcement
- ✅ Consecutive day limits
- ✅ Role-based assignments
- ✅ Certification validation
- ✅ Office hours constraints

#### User Experience
- ✅ Modern web interface
- ✅ Intuitive workflow
- ✅ Real-time feedback
- ✅ Error handling
- ✅ Progress indicators

#### Output & Reports
- ✅ Roster assignments
- ✅ Unfilled positions tracking
- ✅ Skill validation reports
- ✅ Preference matching

### Known Limitations
- Currently optimized for German healthcare facilities
- Requires Google Workspace environment
- Limited to single facility per spreadsheet
- No real-time collaboration features

### Future Enhancements
- Multi-facility support
- Advanced reporting and analytics
- Mobile-responsive interface
- Integration with external HR systems
- Multi-language support
- Advanced conflict resolution

---

## Version History Summary

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2024-10-04 | Initial release with core scheduling functionality |
| Unreleased | TBD | Project structure and documentation improvements |

## Migration Notes

### From Manual Scheduling
- Export existing staff data to NURSES sheet format
- Configure shift times and rules to match current practices
- Test with small datasets before full implementation
- Train staff on new interface and workflows

### Version Updates
- Always backup your data before updating
- Review configuration changes in new versions
- Test in a development environment first
- Update documentation and training materials

---

For detailed technical documentation, see the [API Documentation](docs/API.md) and [Configuration Guide](docs/CONFIGURATION.md).
