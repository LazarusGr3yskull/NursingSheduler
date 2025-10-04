# Testing Guide for Pflege-Kopilot

This directory contains comprehensive testing scripts for the Pflege-Kopilot nursing scheduler.

## Test Files

### `test-runner.gs`
Comprehensive unit tests for all major functions:
- Helper functions (`_num`, `_toISO_`, `toBool_`, etc.)
- Date/time functions (`isoWeek_`, `_weekDates_`, etc.)
- Data processing functions (`_readTable_`, `_normalizeHeaderKey_`)
- Validation functions (`_certValid_`, `_consecutiveIfAdded_`)
- Sheet management functions (`ensureSheet_`)
- Template generation functions (`createDemandTemplate_`)
- Core scheduling logic (`generateForWeek_`)

### `integration-test.gs`
End-to-end integration tests that simulate the complete user workflow:
- NURSES sheet creation
- Test data population
- Template generation
- Roster generation
- Output validation
- Performance testing

## How to Run Tests

### 1. Quick Test (Recommended First)
```javascript
// Run this in Google Apps Script console
quickTest();
```
This runs basic function validation to ensure the core system is working.

### 2. Full Unit Tests
```javascript
// Run this in Google Apps Script console
runAllTests();
```
This runs all unit tests and creates a detailed test report.

### 3. Integration Test
```javascript
// Run this in Google Apps Script console
runIntegrationTest();
```
This simulates the complete user workflow from setup to roster generation.

### 4. Performance Test
```javascript
// Run this in Google Apps Script console
runPerformanceTest();
```
This measures execution time and performance metrics.

### 5. Cleanup
```javascript
// Run this to clean up test data
cleanupTestData();
```
This removes all test sheets and data created during testing.

## Test Results

### Unit Test Results
- **Passed**: Number of successful tests
- **Failed**: Number of failed tests
- **Total**: Total number of tests
- **Success Rate**: Percentage of passed tests
- **Errors**: Detailed list of any failures

### Integration Test Results
- **Steps**: List of workflow steps and their status
- **Success**: Overall test success/failure
- **Errors**: Any errors encountered during the workflow

### Performance Test Results
- **Execution Time**: Total time to complete the workflow
- **Performance Rating**: 
  - EXCELLENT: < 30 seconds
  - GOOD: < 60 seconds
  - ACCEPTABLE: < 120 seconds
  - POOR: > 120 seconds

## Test Data

The integration tests use realistic test data:

### Test Nurses
- **Anna Schmidt** (PFK): Full qualifications, flexible shifts
- **Maria Müller** (PHK): Basic qualifications, early shifts only
- **Dr. Weber** (PDL): Management role, office hours
- **Peter Klein** (PHK): Late/night shifts, different unit
- **Lisa Hoffmann** (PFK): Early shifts only, weekend restrictions

### Test Scenarios
- Multiple shift types (Früh, Spät, Nacht)
- Different staff roles and qualifications
- Various work preferences and restrictions
- Realistic demand patterns

## Troubleshooting

### Common Issues

1. **"Function not found" errors**
   - Ensure all main functions are loaded in your Apps Script project
   - Check that the main `Code.gs` file is properly saved

2. **"Sheet not found" errors**
   - Run the tests in a spreadsheet with proper permissions
   - Ensure the spreadsheet is not in view-only mode

3. **Performance issues**
   - Large datasets may cause timeouts
   - Consider running tests with smaller datasets
   - Check Google Apps Script execution limits

4. **Permission errors**
   - Ensure the script has proper permissions
   - Authorize all required scopes when prompted

### Debug Mode

Enable verbose logging by setting:
```javascript
const TEST_CONFIG = {
  verbose: true
};
```

## Test Coverage

### Functions Tested
- ✅ `onOpen()` - Menu initialization
- ✅ `showSidebar()` - UI display
- ✅ `ui_createNursesSheet()` - Sheet creation
- ✅ `ui_prepareNextMonthDemandOnly()` - Template generation
- ✅ `ui_generateRandomDemandNextMonth()` - Random demand
- ✅ `ui_generateNextMonthRoster()` - Roster generation
- ✅ `generateForWeek_()` - Core scheduling algorithm
- ✅ `createDemandTemplate_()` - Template creation
- ✅ `createRandomDemandTemplate_()` - Random template
- ✅ All helper functions
- ✅ All validation functions
- ✅ All utility functions

### Scenarios Tested
- ✅ Basic functionality
- ✅ Data validation
- ✅ Error handling
- ✅ Edge cases
- ✅ Performance
- ✅ Integration workflow
- ✅ Output validation

## Best Practices

1. **Run tests regularly** during development
2. **Test with realistic data** to catch real-world issues
3. **Clean up test data** after testing
4. **Document any failures** for debugging
5. **Update tests** when adding new features

## Contributing

When adding new features:
1. Add corresponding unit tests
2. Update integration tests if needed
3. Ensure all tests pass
4. Update this documentation

---

For more information, see the main [README.md](../README.md) and [API Documentation](../docs/API.md).
