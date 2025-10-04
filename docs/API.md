# API Documentation

This document provides detailed information about the Pflege-Kopilot API functions and their usage.

## Core Functions

### Menu and UI Functions

#### `onOpen()`
Initializes the application menu in Google Sheets.

**Description**: Creates the "Pflege-Kopilot" menu with all available functions.

**Usage**: Automatically called when the spreadsheet opens.

---

#### `showSidebar()`
Displays the application sidebar interface.

**Description**: Shows the main user interface for interacting with the application.

**Usage**: Called from the menu or programmatically.

---

### Staff Management Functions

#### `ui_createNursesSheet()`
Creates the NURSES sheet with proper headers and formatting.

**Description**: Sets up the staff database template with all required fields.

**Returns**: Success toast message

**Fields Created**:
- `email`: Staff email address
- `nurse_id`: Unique identifier
- `name`: Full name
- `role`: Job role (PFK, PHK, PDL, etc.)
- `unit`: Work unit
- `qualifications`: Skills and certifications
- `desired_weekly_hours`: Preferred weekly hours
- `max_weekly_hours`: Maximum weekly hours
- `min_rest_hours`: Minimum rest between shifts
- `max_night_shifts_week`: Maximum night shifts per week
- `max_consecutive_days`: Maximum consecutive working days
- `preferred_shift_types`: Preferred shift types
- `preferred_units`: Preferred work units
- `office_from`: Office hours start time
- `saturday_off`: Saturday availability flag
- `only_fd`: Early shift only flag
- `max_sd_per_month`: Maximum late shifts per month
- `cert_BLS_until`: BLS certification expiry
- `cert_ACLS_until`: ACLS certification expiry
- `active`: Active status
- `timestamp`: Last updated timestamp

---

### Template Generation Functions

#### `ui_prepareNextMonthDemandOnly()`
Creates SHIFT_DEMAND templates for the next month.

**Description**: Generates shift demand sheets for all weeks in the next month.

**Returns**: Success toast message

**Generated Sheets**: `SHIFT_DEMAND_KW_YYYYWW` format

---

#### `ui_generateRandomDemandNextMonth()`
Creates random shift demand for stress testing.

**Description**: Generates randomized shift requirements for testing various scenarios.

**Returns**: Success toast message

**Use Case**: Testing the scheduling algorithm with different demand patterns

---

### Scheduling Functions

#### `ui_generateNextMonthRoster()`
Generates the complete monthly roster.

**Description**: Creates staff assignments for all weeks in the next month.

**Returns**: Summary toast with assignment statistics

**Output Sheets**:
- `ROTA_KW_YYYYWW`: Weekly assignments
- `ROTA_REPORT_KW_YYYYWW`: Unfilled positions

---

#### `generateForWeek_(year, week)`
Core scheduling algorithm for a single week.

**Parameters**:
- `year` (number): ISO year
- `week` (number): ISO week number

**Returns**: Object with `assigned` and `open` counts

**Process**:
1. Loads staff data from NURSES sheet
2. Loads shift demand from SHIFT_DEMAND sheet
3. Applies filtering and validation rules
4. Assigns staff using scoring algorithm
5. Generates output sheets

---

### Template Creation Functions

#### `createDemandTemplate_(name, mondayDate)`
Creates a standard shift demand template.

**Parameters**:
- `name` (string): Sheet name
- `mondayDate` (Date): Monday of the target week

**Description**: Generates a template with standard shift patterns for German healthcare facilities.

**Shift Patterns**:
- **Weekdays**: 2 PFK Früh, 3 PHK Früh, 2 PHK Spät, 2 HW Früh, Office staff
- **Weekends**: 1 PFK Früh, 2-3 PHK Früh, 0-2 PHK Spät

---

#### `createRandomDemandTemplate_(name, mondayDate)`
Creates a randomized shift demand template.

**Parameters**:
- `name` (string): Sheet name
- `mondayDate` (Date): Monday of the target week

**Description**: Generates random shift requirements for testing purposes.

---

## Configuration Constants

### Shift Times
```javascript
const SHIFT_TIMES = {
  'Früh':  { start: '06:00', end: '14:00' },
  'Spät':  { start: '14:00', end: '22:00' },
  'Nacht': { start: '22:00', end: '08:00+1' }
};
```

### Shift Lengths
```javascript
const SHIFT_LENGTHS = { 'Früh':8, 'Spät':8, 'Nacht':10 };
```

### Default Rules
```javascript
const DEFAULT_MIN_REST_HOURS = 12;
const DEFAULT_MAX_CONSEC_DAYS = 7;
```

### Sheet Prefixes
```javascript
const ROTA_INPUT_PREFIX   = 'SHIFT_DEMAND_KW_';
const ROTA_OUTPUT_PREFIX  = 'ROTA_KW_';
const ROTA_REPORT_PREFIX  = 'ROTA_REPORT_KW_';
```

---

## Helper Functions

### Date and Time Utilities

#### `isoWeek_(date)`
Calculates ISO week number for a given date.

**Parameters**: `date` (Date)
**Returns**: `{week: number, year: number}`

#### `_weekDates_(monday)`
Generates array of dates for a week starting from Monday.

**Parameters**: `monday` (Date)
**Returns**: Array of 7 Date objects

#### `_nextMonth_()`
Gets the next month's year and month.

**Returns**: `{year: number, month: number}`

### Data Processing

#### `_readTable_(sheet)`
Reads data from a sheet and returns as array of objects.

**Parameters**: `sheet` (Sheet)
**Returns**: Array of objects with normalized keys

#### `_normalizeHeaderKey_(string)`
Normalizes header strings for consistent key usage.

**Parameters**: `string` (string)
**Returns**: Normalized string

### Validation Functions

#### `_certValid_(profile, skill, dateISO)`
Validates if a certification is still valid.

**Parameters**:
- `profile` (object): Staff profile
- `skill` (string): Certification type (BLS/ACLS)
- `dateISO` (string): Date in ISO format

**Returns**: Boolean

#### `_consecutiveIfAdded_(workDaysMap, dateISO)`
Calculates consecutive days if a date is added.

**Parameters**:
- `workDaysMap` (object): Map of working days
- `dateISO` (string): Date to check

**Returns**: Number of consecutive days

### Utility Functions

#### `_num(value)`
Converts value to number, handling various formats.

**Parameters**: `value` (any)
**Returns**: Number or 0

#### `_toISO_(value)`
Converts date to ISO format string.

**Parameters**: `value` (any)
**Returns**: ISO date string (YYYY-MM-DD)

#### `toBool_(value)`
Converts value to boolean.

**Parameters**: `value` (any)
**Returns**: Boolean

---

## Error Handling

The application includes comprehensive error handling:

- **Missing Sheets**: Throws descriptive errors for missing required sheets
- **Invalid Data**: Validates data formats and ranges
- **Assignment Failures**: Reports reasons for unassigned shifts
- **Configuration Errors**: Validates settings and parameters

## Performance Considerations

- **Batch Operations**: Uses batch operations for large data sets
- **Efficient Filtering**: Implements multi-stage filtering for performance
- **Memory Management**: Clears temporary data appropriately
- **Caching**: Caches frequently accessed data

## Extensibility

The API is designed for extensibility:

- **New Roles**: Add role validation in assignment algorithm
- **Custom Rules**: Implement new validation functions
- **Additional Shifts**: Extend shift time configurations
- **New Output Formats**: Add custom output generation

---

For more information, see the [Configuration Guide](CONFIGURATION.md) and [Contributing Guidelines](../CONTRIBUTING.md).
