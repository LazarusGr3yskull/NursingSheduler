# Configuration Guide

This guide explains how to configure the Pflege-Kopilot nursing scheduler for your specific healthcare facility.

## Overview

The application is highly configurable to adapt to different healthcare facilities, shift patterns, and regulatory requirements. This guide covers all configuration options and their impact on scheduling behavior.

## Basic Configuration

### Timezone Settings

```javascript
const TZ = 'Europe/Berlin';
```

**Purpose**: Sets the timezone for all date and time calculations.

**Options**: Any valid timezone string (e.g., 'America/New_York', 'Asia/Tokyo')

**Impact**: Affects shift times, rest period calculations, and date formatting.

---

### Default Rules

```javascript
const DEFAULT_MIN_REST_HOURS = 12;
const DEFAULT_MAX_CONSEC_DAYS = 7;
```

**Purpose**: Sets default values for staff scheduling rules.

**Configuration**:
- `DEFAULT_MIN_REST_HOURS`: Minimum hours between shifts
- `DEFAULT_MAX_CONSEC_DAYS`: Maximum consecutive working days

**Impact**: These values are used when staff profiles don't specify custom limits.

---

## Shift Configuration

### Shift Times

```javascript
const SHIFT_TIMES = {
  'Früh':  { start: '06:00', end: '14:00' },
  'Spät':  { start: '14:00', end: '22:00' },
  'Nacht': { start: '22:00', end: '08:00+1' }
};
```

**Purpose**: Defines shift start and end times.

**Format**: 
- `start`: HH:MM format
- `end`: HH:MM format (use '+1' for next day)

**Customization Examples**:
```javascript
// 12-hour shifts
const SHIFT_TIMES = {
  'Day':   { start: '07:00', end: '19:00' },
  'Night': { start: '19:00', end: '07:00+1' }
};

// 6-hour shifts
const SHIFT_TIMES = {
  'Early':  { start: '06:00', end: '12:00' },
  'Late':   { start: '12:00', end: '18:00' },
  'Evening': { start: '18:00', end: '00:00+1' }
};
```

---

### Shift Lengths

```javascript
const SHIFT_LENGTHS = { 'Früh':8, 'Spät':8, 'Nacht':10 };
```

**Purpose**: Defines the duration of each shift type in hours.

**Usage**: Used for workload calculations and hour tracking.

**Note**: Should match the actual duration of shifts defined in `SHIFT_TIMES`.

---

### Shift Order

```javascript
const SHIFT_ORDER = ['Früh','Spät','Nacht'];
```

**Purpose**: Defines the order for processing shifts during assignment.

**Impact**: Affects assignment priority and conflict resolution.

---

## Staff Role Configuration

### Available Roles

The system supports the following roles by default:

- **PFK**: Pflegefachkraft (Registered Nurse)
- **PHK**: Pflegehelfer/in (Nursing Assistant)
- **PDL**: Pflegedienstleitung (Nursing Director)
- **stPDL**: Stellvertretende PDL (Deputy Nursing Director)
- **BrüK**: Bürokraft (Administrative Staff)
- **HW**: Hauswirtschaft (Housekeeping)

### Adding New Roles

1. **Update Role Validation**:
```javascript
// In generateForWeek_() function, update the role validation
if (['pfk','phk','pdl','stpdl','brük','hw','newrole'].includes(t)) {
  return String(p.role||'').toLowerCase() === t;
}
```

2. **Add Role-Specific Rules**:
```javascript
// Add custom rules for new roles
if (String(p.role||'').toLowerCase() === 'newrole') {
  // Custom validation logic
}
```

3. **Update Documentation**: Add the new role to relevant documentation.

---

## Sheet Configuration

### Sheet Names

```javascript
const SHEET_NURSES = 'NURSES';
const ROTA_INPUT_PREFIX   = 'SHIFT_DEMAND_KW_';
const ROTA_OUTPUT_PREFIX  = 'ROTA_KW_';
const ROTA_REPORT_PREFIX  = 'ROTA_REPORT_KW_';
```

**Purpose**: Defines naming conventions for generated sheets.

**Customization**: Change prefixes to match your organization's naming conventions.

---

### Staff Database Headers

```javascript
const NURSES_HEADERS = [
  'email','nurse_id','name','role','unit','qualifications',
  'desired_weekly_hours','max_weekly_hours',
  'min_rest_hours','max_night_shifts_week','max_consecutive_days',
  'preferred_shift_types','preferred_units',
  'office_from','saturday_off','only_fd','max_sd_per_month',
  'cert_BLS_until','cert_ACLS_until','active','timestamp'
];
```

**Purpose**: Defines the structure of the staff database.

**Customization**: Add or remove fields as needed for your organization.

---

## Template Configuration

### Standard Demand Template

The `createDemandTemplate_()` function generates standard shift patterns:

**Weekday Pattern**:
- 2 PFK Früh (1 on weekends)
- 3 PHK Früh (2-3 on weekends)
- 2 PHK Spät (0-2 on weekends)
- 2 HW Früh (weekdays only)
- Office staff (weekdays only)

**Customization**: Modify the template generation logic to match your facility's needs.

### Random Demand Template

The `createRandomDemandTemplate_()` function generates random patterns for testing:

**Configuration**: Adjust the random ranges to match realistic scenarios.

---

## Validation Rules

### Rest Period Rules

```javascript
// Minimum rest between shifts
const minRest = p.minRest || DEFAULT_MIN_REST_HOURS;
if (restH < minRest) return false;

// Avoid Früh after Nacht
if (last && last.shift==='Nacht' && req.shift==='Früh' && _isNextDay_(last.date, req.date)) {
  return false;
}
```

**Customization**: Modify rest period calculations for different shift patterns.

### Consecutive Day Rules

```javascript
const consIf = _consecutiveIfAdded_(wd, req.date);
if (consIf > (p.maxConsec||DEFAULT_MAX_CONSEC_DAYS)) return false;
```

**Customization**: Adjust consecutive day limits based on regulations.

### Night Shift Rules

```javascript
const nc = nightCount[email] || 0;
if (req.shift==='Nacht' && nc >= (p.maxNight||999)) return false;
```

**Customization**: Set appropriate night shift limits.

---

## Scoring Algorithm

### Assignment Scoring

```javascript
const scored = f3.map(email => {
  const p = nurseByEmail[email]||{};
  const curH = assignedHours[email]||0;
  let score = 0;
  
  // Prefer staff who haven't reached desired hours
  if (isFinite(p.desired) && curH < p.desired) score -= 2.0;
  
  // Prefer staff with shift type preferences
  if ((p.prefShiftTypes||[]).includes(req.shift)) score -= 1.0;
  
  // Prefer staff from same unit
  if (req.unit && p.unit && String(req.unit).toLowerCase()===String(p.unit).toLowerCase()) {
    score -= 0.3;
  }
  
  // Balance workload
  score += (curH/10);
  
  return { email, score, hours:defaultHours, prefMatch:(p.prefShiftTypes||[]).includes(req.shift) };
}).sort((a,b)=>a.score-b.score);
```

**Customization**: Adjust scoring weights to prioritize different factors.

---

## Facility-Specific Configuration

### Small Facility (20-50 staff)

```javascript
// Reduce template complexity
const pfkFD = isWE ? 1 : 1;  // Fewer PFK shifts
const phkFD = isWE ? 1 : 2;  // Fewer PHK shifts
```

### Large Facility (100+ staff)

```javascript
// Increase template complexity
const pfkFD = isWE ? 2 : 4;  // More PFK shifts
const phkFD = isWE ? 3 : 6;  // More PHK shifts
```

### Specialized Units

```javascript
// Add unit-specific rules
if (req.unit === 'ICU') {
  // Require specific certifications
  if (!p.skills.includes('ICU')) return false;
}
```

---

## Regulatory Compliance

### German Healthcare Regulations

The default configuration follows German healthcare regulations:

- **Minimum rest period**: 12 hours
- **Maximum consecutive days**: 7 days
- **Shift length limits**: As defined in labor laws

### Customizing for Other Jurisdictions

1. **Research local regulations**
2. **Update default values**
3. **Modify validation rules**
4. **Test with compliance scenarios**

---

## Performance Configuration

### Large Datasets

For facilities with many staff members:

```javascript
// Process in batches
const BATCH_SIZE = 50;
const batches = chunkArray(allEmails, BATCH_SIZE);
```

### Memory Management

```javascript
// Clear temporary data
assignedHours = {};
assignedByDay = {};
lastShiftByEmail = {};
```

---

## Testing Configuration

### Development Environment

```javascript
// Use test data
const TEST_MODE = true;
if (TEST_MODE) {
  // Use smaller datasets
  // Enable additional logging
}
```

### Stress Testing

```javascript
// Generate extreme scenarios
const EXTREME_TEST = true;
if (EXTREME_TEST) {
  // Create challenging demand patterns
  // Test edge cases
}
```

---

## Troubleshooting

### Common Configuration Issues

1. **Shift times not matching lengths**: Ensure `SHIFT_TIMES` and `SHIFT_LENGTHS` are consistent
2. **Invalid timezone**: Use valid timezone strings
3. **Missing roles**: Add new roles to validation logic
4. **Template not generating**: Check date calculation functions

### Debug Mode

```javascript
const DEBUG = true;
if (DEBUG) {
  console.log('Debug information:', data);
}
```

---

## Best Practices

1. **Start Simple**: Begin with basic configuration and add complexity gradually
2. **Test Thoroughly**: Test all changes with realistic data
3. **Document Changes**: Keep track of configuration modifications
4. **Backup Configuration**: Save working configurations
5. **Regular Review**: Periodically review and update settings

---

For more information, see the [API Documentation](API.md) and [Contributing Guidelines](../CONTRIBUTING.md).
