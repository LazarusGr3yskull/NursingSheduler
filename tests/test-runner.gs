/**
 * Test Runner for Pflege-Kopilot Nursing Scheduler
 * 
 * This script provides comprehensive testing for all major functions
 * Run this in Google Apps Script to validate functionality
 */

// Test configuration
const TEST_CONFIG = {
  testSheetName: 'TEST_NURSES',
  testDemandPrefix: 'TEST_DEMAND_KW_',
  testOutputPrefix: 'TEST_ROTA_KW_',
  testReportPrefix: 'TEST_REPORT_KW_',
  verbose: true
};

/**
 * Main test runner function
 * Call this to run all tests
 */
function runAllTests() {
  console.log('🧪 Starting Pflege-Kopilot Test Suite...');
  console.log('=====================================');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0,
    errors: []
  };
  
  // Test categories
  const testCategories = [
    { name: 'Helper Functions', tests: testHelperFunctions },
    { name: 'Date/Time Functions', tests: testDateTimeFunctions },
    { name: 'Data Processing', tests: testDataProcessing },
    { name: 'Validation Functions', tests: testValidationFunctions },
    { name: 'Sheet Management', tests: testSheetManagement },
    { name: 'Template Generation', tests: testTemplateGeneration },
    { name: 'Core Scheduling Logic', tests: testSchedulingLogic }
  ];
  
  // Run all test categories
  testCategories.forEach(category => {
    console.log(`\n📋 Testing ${category.name}...`);
    console.log('─'.repeat(30));
    
    try {
      const categoryResults = category.tests();
      results.passed += categoryResults.passed;
      results.failed += categoryResults.failed;
      results.total += categoryResults.total;
      results.errors.push(...categoryResults.errors);
    } catch (error) {
      console.error(`❌ Category ${category.name} failed:`, error);
      results.failed++;
      results.total++;
      results.errors.push(`${category.name}: ${error.message}`);
    }
  });
  
  // Print summary
  console.log('\n📊 Test Results Summary');
  console.log('======================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Total:  ${results.total}`);
  console.log(`📊 Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  if (results.errors.length > 0) {
    console.log('\n🚨 Errors Found:');
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  // Create test report sheet
  createTestReport(results);
  
  return results;
}

/**
 * Test helper functions
 */
function testHelperFunctions() {
  const results = { passed: 0, failed: 0, total: 0, errors: [] };
  
  // Test _num function
  testFunction('_num', () => {
    assert(_num('123') === 123, '_num should convert string to number');
    assert(_num('123.45') === 123.45, '_num should handle decimals');
    assert(_num('invalid') === 0, '_num should return 0 for invalid input');
    assert(_num(456) === 456, '_num should handle numbers');
  }, results);
  
  // Test _toISO_ function
  testFunction('_toISO_', () => {
    const testDate = new Date('2024-10-04');
    assert(_toISO_(testDate) === '2024-10-04', '_toISO_ should format dates correctly');
    assert(_toISO_('04.10.2024') === '2024-10-04', '_toISO_ should handle German date format');
    assert(_toISO_('2024-10-04') === '2024-10-04', '_toISO_ should handle ISO format');
  }, results);
  
  // Test toBool_ function
  testFunction('toBool_', () => {
    assert(toBool_('true') === true, 'toBool_ should handle "true"');
    assert(toBool_('wahr') === true, 'toBool_ should handle German "wahr"');
    assert(toBool_('1') === true, 'toBool_ should handle "1"');
    assert(toBool_('false') === false, 'toBool_ should handle "false"');
    assert(toBool_('') === false, 'toBool_ should handle empty string');
  }, results);
  
  // Test _normalizeHeaderKey_ function
  testFunction('_normalizeHeaderKey_', () => {
    assert(_normalizeHeaderKey_('Email Address') === 'email_address', 'Should normalize header keys');
    assert(_normalizeHeaderKey_('Nurse ID') === 'nurse_id', 'Should handle spaces');
    assert(_normalizeHeaderKey_('BLS-Cert') === 'blscert', 'Should remove special characters');
  }, results);
  
  return results;
}

/**
 * Test date/time functions
 */
function testDateTimeFunctions() {
  const results = { passed: 0, failed: 0, total: 0, errors: [] };
  
  // Test isoWeek_ function
  testFunction('isoWeek_', () => {
    const testDate = new Date('2024-10-04'); // Friday
    const week = isoWeek_(testDate);
    assert(typeof week.week === 'number', 'isoWeek_ should return week number');
    assert(typeof week.year === 'number', 'isoWeek_ should return year');
    assert(week.year === 2024, 'isoWeek_ should return correct year');
  }, results);
  
  // Test _weekDates_ function
  testFunction('_weekDates_', () => {
    const monday = new Date('2024-09-30'); // Monday
    const weekDates = _weekDates_(monday);
    assert(weekDates.length === 7, '_weekDates_ should return 7 dates');
    assert(weekDates[0].getDay() === 1, 'First date should be Monday');
    assert(weekDates[6].getDay() === 0, 'Last date should be Sunday');
  }, results);
  
  // Test _nextMonth_ function
  testFunction('_nextMonth_', () => {
    const nextMonth = _nextMonth_();
    assert(typeof nextMonth.year === 'number', '_nextMonth_ should return year');
    assert(typeof nextMonth.month === 'number', '_nextMonth_ should return month');
    assert(nextMonth.month >= 0 && nextMonth.month <= 11, 'Month should be 0-11');
  }, results);
  
  // Test _parseDateTime_ function
  testFunction('_parseDateTime_', () => {
    const dateTime = _parseDateTime_('2024-10-04', '14:30');
    assert(dateTime instanceof Date, '_parseDateTime_ should return Date object');
    assert(dateTime.getHours() === 14, 'Should parse hours correctly');
    assert(dateTime.getMinutes() === 30, 'Should parse minutes correctly');
  }, results);
  
  return results;
}

/**
 * Test data processing functions
 */
function testDataProcessing() {
  const results = { passed: 0, failed: 0, total: 0, errors: [] };
  
  // Test _readTable_ function (requires a test sheet)
  testFunction('_readTable_', () => {
    // Create a test sheet
    const ss = SpreadsheetApp.getActive();
    const testSheet = ss.insertSheet('TEST_READ_TABLE');
    
    try {
      // Add test data
      testSheet.getRange(1, 1, 3, 3).setValues([
        ['Name', 'Age', 'Active'],
        ['John', 25, 'true'],
        ['Jane', 30, 'false']
      ]);
      
      const data = _readTable_(testSheet);
      assert(Array.isArray(data), '_readTable_ should return array');
      assert(data.length === 2, '_readTable_ should return correct number of rows');
      assert(data[0].name === 'John', '_readTable_ should normalize keys');
      assert(data[0].age === 25, '_readTable_ should preserve values');
      
    } finally {
      // Clean up
      ss.deleteSheet(testSheet);
    }
  }, results);
  
  return results;
}

/**
 * Test validation functions
 */
function testValidationFunctions() {
  const results = { passed: 0, failed: 0, total: 0, errors: [] };
  
  // Test _certValid_ function
  testFunction('_certValid_', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);
    
    const profile = {
      cert_BLS_until: futureDate,
      cert_ACLS_until: pastDate
    };
    
    assert(_certValid_(profile, 'BLS', '2024-10-04') === true, 'Should validate future BLS cert');
    assert(_certValid_(profile, 'ACLS', '2024-10-04') === false, 'Should invalidate past ACLS cert');
  }, results);
  
  // Test _consecutiveIfAdded_ function
  testFunction('_consecutiveIfAdded_', () => {
    const workDays = {
      '2024-10-01': true,
      '2024-10-02': true,
      '2024-10-04': true
    };
    
    const consecutive = _consecutiveIfAdded_(workDays, '2024-10-03');
    assert(consecutive === 3, 'Should calculate consecutive days correctly');
  }, results);
  
  // Test _isNextDay_ function
  testFunction('_isNextDay_', () => {
    assert(_isNextDay_('2024-10-04', '2024-10-05') === true, 'Should detect next day');
    assert(_isNextDay_('2024-10-04', '2024-10-06') === false, 'Should not detect non-consecutive days');
  }, results);
  
  return results;
}

/**
 * Test sheet management functions
 */
function testSheetManagement() {
  const results = { passed: 0, failed: 0, total: 0, errors: [] };
  
  // Test ensureSheet_ function
  testFunction('ensureSheet_', () => {
    const ss = SpreadsheetApp.getActive();
    const testSheetName = 'TEST_ENSURE_SHEET';
    const headers = ['col1', 'col2', 'col3'];
    
    try {
      const sheet = ensureSheet_(ss, testSheetName, headers);
      assert(sheet !== null, 'ensureSheet_ should return sheet object');
      assert(sheet.getName() === testSheetName, 'ensureSheet_ should create sheet with correct name');
      assert(sheet.getLastRow() >= 1, 'ensureSheet_ should add headers');
      
    } finally {
      // Clean up
      const existingSheet = ss.getSheetByName(testSheetName);
      if (existingSheet) {
        ss.deleteSheet(existingSheet);
      }
    }
  }, results);
  
  return results;
}

/**
 * Test template generation functions
 */
function testTemplateGeneration() {
  const results = { passed: 0, failed: 0, total: 0, errors: [] };
  
  // Test createDemandTemplate_ function
  testFunction('createDemandTemplate_', () => {
    const ss = SpreadsheetApp.getActive();
    const testSheetName = 'TEST_DEMAND_TEMPLATE';
    const mondayDate = new Date('2024-09-30'); // Monday
    
    try {
      createDemandTemplate_(testSheetName, mondayDate);
      const sheet = ss.getSheetByName(testSheetName);
      assert(sheet !== null, 'createDemandTemplate_ should create sheet');
      assert(sheet.getLastRow() > 1, 'createDemandTemplate_ should add data rows');
      
      // Check headers
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const expectedHeaders = ['date','shift','start_time','end_time','needed','required_skill','preferred_skills','unit_name','priority','break_minutes','notes'];
      assert(headers.length === expectedHeaders.length, 'createDemandTemplate_ should have correct headers');
      
    } finally {
      // Clean up
      const existingSheet = ss.getSheetByName(testSheetName);
      if (existingSheet) {
        ss.deleteSheet(existingSheet);
      }
    }
  }, results);
  
  return results;
}

/**
 * Test core scheduling logic
 */
function testSchedulingLogic() {
  const results = { passed: 0, failed: 0, total: 0, errors: [] };
  
  // Test with minimal data setup
  testFunction('generateForWeek_ (minimal)', () => {
    const ss = SpreadsheetApp.getActive();
    
    try {
      // Create test nurses sheet
      const nursesSheet = ensureSheet_(ss, TEST_CONFIG.testSheetName, NURSES_HEADERS);
      nursesSheet.getRange(2, 1, 1, NURSES_HEADERS.length).setValues([[
        'test@example.com', 'N001', 'Test Nurse', 'PFK', 'Unit1', 'BLS,ACLS',
        40, 48, 12, 3, 7, 'Früh,Spät', 'Unit1', '08:00', false, false, 4,
        '2025-12-31', '2025-12-31', true, new Date()
      ]]);
      
      // Create test demand sheet
      const weekId = '202440';
      const demandSheet = ensureSheet_(ss, TEST_CONFIG.testDemandPrefix + weekId, 
        ['date','shift','start_time','end_time','needed','required_skill','preferred_skills','unit_name','priority','break_minutes','notes']);
      demandSheet.getRange(2, 1, 1, 11).setValues([[
        '2024-10-01', 'Früh', '06:00', '14:00', 1, 'PFK', '', 'Unit1', 'normal', 30, ''
      ]]);
      
      // Test the function
      const result = generateForWeek_(2024, 40);
      assert(typeof result === 'object', 'generateForWeek_ should return object');
      assert(typeof result.assigned === 'number', 'generateForWeek_ should return assigned count');
      assert(typeof result.open === 'number', 'generateForWeek_ should return open count');
      
    } finally {
      // Clean up test sheets
      [TEST_CONFIG.testSheetName, TEST_CONFIG.testDemandPrefix + '202440', 
       TEST_CONFIG.testOutputPrefix + '202440', TEST_CONFIG.testReportPrefix + '202440']
        .forEach(sheetName => {
          const sheet = ss.getSheetByName(sheetName);
          if (sheet) ss.deleteSheet(sheet);
        });
    }
  }, results);
  
  return results;
}

/**
 * Helper function to run individual tests
 */
function testFunction(functionName, testFn, results) {
  try {
    testFn();
    results.passed++;
    results.total++;
    if (TEST_CONFIG.verbose) {
      console.log(`  ✅ ${functionName}`);
    }
  } catch (error) {
    results.failed++;
    results.total++;
    results.errors.push(`${functionName}: ${error.message}`);
    if (TEST_CONFIG.verbose) {
      console.log(`  ❌ ${functionName}: ${error.message}`);
    }
  }
}

/**
 * Assertion helper
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * Create test report sheet
 */
function createTestReport(results) {
  const ss = SpreadsheetApp.getActive();
  const reportSheet = ensureSheet_(ss, 'TEST_REPORT', [
    'Test Category', 'Status', 'Message', 'Timestamp'
  ]);
  
  // Clear existing data
  reportSheet.getRange(2, 1, reportSheet.getLastRow() - 1, 4).clear();
  
  // Add summary
  const summaryData = [
    ['Test Summary', 'Passed', results.passed, new Date()],
    ['Test Summary', 'Failed', results.failed, new Date()],
    ['Test Summary', 'Total', results.total, new Date()],
    ['Test Summary', 'Success Rate', `${((results.passed / results.total) * 100).toFixed(1)}%`, new Date()]
  ];
  
  if (results.errors.length > 0) {
    const errorData = results.errors.map(error => ['Error', 'Failed', error, new Date()]);
    summaryData.push(...errorData);
  }
  
  reportSheet.getRange(2, 1, summaryData.length, 4).setValues(summaryData);
  
  console.log('\n📋 Test report created in TEST_REPORT sheet');
}

/**
 * Quick test function for immediate validation
 */
function quickTest() {
  console.log('🚀 Running Quick Test...');
  
  try {
    // Test basic functions
    assert(_num('123') === 123, 'Basic number conversion');
    assert(toBool_('true') === true, 'Basic boolean conversion');
    assert(_toISO_(new Date('2024-10-04')) === '2024-10-04', 'Date formatting');
    
    // Test sheet creation
    const ss = SpreadsheetApp.getActive();
    const testSheet = ensureSheet_(ss, 'QUICK_TEST', ['test']);
    assert(testSheet !== null, 'Sheet creation');
    
    // Clean up
    ss.deleteSheet(testSheet);
    
    console.log('✅ Quick test passed! All basic functions working.');
    return true;
    
  } catch (error) {
    console.error('❌ Quick test failed:', error.message);
    return false;
  }
}
