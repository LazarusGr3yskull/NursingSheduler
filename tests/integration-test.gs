/**
 * Integration Tests for Pflege-Kopilot
 * 
 * These tests validate the complete workflow from setup to roster generation
 */

/**
 * Full integration test - simulates complete user workflow
 */
function runIntegrationTest() {
  console.log('🔄 Starting Integration Test...');
  console.log('===============================');
  
  const results = {
    steps: [],
    success: true,
    errors: []
  };
  
  try {
    // Step 1: Create NURSES sheet
    console.log('📋 Step 1: Creating NURSES sheet...');
    ui_createNursesSheet();
    results.steps.push({ step: 'Create NURSES sheet', status: 'PASSED' });
    
    // Step 2: Add test nurse data
    console.log('👥 Step 2: Adding test nurse data...');
    addTestNurseData();
    results.steps.push({ step: 'Add test nurse data', status: 'PASSED' });
    
    // Step 3: Create demand templates
    console.log('📅 Step 3: Creating demand templates...');
    ui_prepareNextMonthDemandOnly();
    results.steps.push({ step: 'Create demand templates', status: 'PASSED' });
    
    // Step 4: Generate random demand for testing
    console.log('🎲 Step 4: Generating random demand...');
    ui_generateRandomDemandNextMonth();
    results.steps.push({ step: 'Generate random demand', status: 'PASSED' });
    
    // Step 5: Generate roster
    console.log('📊 Step 5: Generating roster...');
    const rosterResult = ui_generateNextMonthRoster();
    results.steps.push({ step: 'Generate roster', status: 'PASSED' });
    
    // Step 6: Validate output
    console.log('✅ Step 6: Validating output...');
    const validationResult = validateRosterOutput();
    results.steps.push({ step: 'Validate output', status: validationResult.success ? 'PASSED' : 'FAILED' });
    
    if (!validationResult.success) {
      results.errors.push(...validationResult.errors);
    }
    
    console.log('\n🎉 Integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    results.success = false;
    results.errors.push(error.message);
    results.steps.push({ step: 'Error occurred', status: 'FAILED' });
  }
  
  // Create integration test report
  createIntegrationTestReport(results);
  
  return results;
}

/**
 * Add test nurse data to the NURSES sheet
 */
function addTestNurseData() {
  const ss = SpreadsheetApp.getActive();
  const nursesSheet = ss.getSheetByName('NURSES');
  
  if (!nursesSheet) {
    throw new Error('NURSES sheet not found');
  }
  
  const testNurses = [
    [
      'nurse1@example.com', 'N001', 'Anna Schmidt', 'PFK', 'Station A',
      'BLS,ACLS,ICU', 40, 48, 12, 3, 7, 'Früh,Spät', 'Station A',
      '08:00', false, false, 4, '2025-12-31', '2025-12-31', true, new Date()
    ],
    [
      'nurse2@example.com', 'N002', 'Maria Müller', 'PHK', 'Station A',
      'BLS', 35, 40, 12, 2, 6, 'Früh', 'Station A',
      '07:00', false, false, 2, '2025-06-30', '', true, new Date()
    ],
    [
      'nurse3@example.com', 'N003', 'Dr. Weber', 'PDL', 'Office',
      'BLS,ACLS,Management', 40, 45, 12, 1, 5, 'Früh', 'Office',
      '08:00', true, false, 1, '2025-12-31', '2025-12-31', true, new Date()
    ],
    [
      'nurse4@example.com', 'N004', 'Peter Klein', 'PHK', 'Station B',
      'BLS', 30, 35, 12, 2, 5, 'Spät,Nacht', 'Station B',
      '14:00', false, false, 3, '2025-03-31', '', true, new Date()
    ],
    [
      'nurse5@example.com', 'N005', 'Lisa Hoffmann', 'PFK', 'Station B',
      'BLS,ACLS', 38, 42, 12, 2, 6, 'Früh,Spät', 'Station B',
      '06:30', false, true, 2, '2025-09-30', '2025-09-30', true, new Date()
    ]
  ];
  
  // Clear existing data (keep headers)
  const lastRow = nursesSheet.getLastRow();
  if (lastRow > 1) {
    nursesSheet.getRange(2, 1, lastRow - 1, nursesSheet.getLastColumn()).clear();
  }
  
  // Add test data
  nursesSheet.getRange(2, 1, testNurses.length, testNurses[0].length).setValues(testNurses);
  
  console.log(`✅ Added ${testNurses.length} test nurses`);
}

/**
 * Validate the generated roster output
 */
function validateRosterOutput() {
  const ss = SpreadsheetApp.getActive();
  const results = { success: true, errors: [] };
  
  try {
    // Get current month's weeks
    const meta = _nextMonth_();
    const mondays = _mondaysCoveringMonth_(meta.year, meta.month);
    
    let totalAssigned = 0;
    let totalOpen = 0;
    let totalWeeks = 0;
    
    mondays.forEach(m => {
      const kw = isoWeek_(m.monday);
      const weekId = kw.year + pad2_(kw.week);
      
      // Check if output sheets exist
      const rotaSheet = ss.getSheetByName(`ROTA_KW_${weekId}`);
      const reportSheet = ss.getSheetByName(`ROTA_REPORT_KW_${weekId}`);
      
      if (rotaSheet) {
        const assignedCount = Math.max(0, rotaSheet.getLastRow() - 1);
        totalAssigned += assignedCount;
        totalWeeks++;
        
        // Validate rota sheet structure
        const headers = rotaSheet.getRange(1, 1, 1, rotaSheet.getLastColumn()).getValues()[0];
        const expectedHeaders = ['date','shift','slot','nurse_email','nurse_name','skills_ok','pref_match','hours','comment'];
        
        if (headers.length !== expectedHeaders.length) {
          results.errors.push(`Week ${weekId}: Rota sheet has incorrect number of columns`);
          results.success = false;
        }
      }
      
      if (reportSheet) {
        const openCount = Math.max(0, reportSheet.getLastRow() - 1);
        totalOpen += openCount;
      }
    });
    
    // Validate results
    if (totalWeeks === 0) {
      results.errors.push('No roster sheets were generated');
      results.success = false;
    }
    
    console.log(`📊 Validation Results:`);
    console.log(`   Weeks processed: ${totalWeeks}`);
    console.log(`   Total assignments: ${totalAssigned}`);
    console.log(`   Total open slots: ${totalOpen}`);
    console.log(`   Assignment rate: ${totalWeeks > 0 ? ((totalAssigned / (totalAssigned + totalOpen)) * 100).toFixed(1) : 0}%`);
    
    if (results.success) {
      console.log('✅ Roster validation passed');
    } else {
      console.log('❌ Roster validation failed');
    }
    
  } catch (error) {
    results.success = false;
    results.errors.push(`Validation error: ${error.message}`);
  }
  
  return results;
}

/**
 * Create integration test report
 */
function createIntegrationTestReport(results) {
  const ss = SpreadsheetApp.getActive();
  const reportSheet = ensureSheet_(ss, 'INTEGRATION_TEST_REPORT', [
    'Step', 'Status', 'Timestamp', 'Notes'
  ]);
  
  // Clear existing data
  reportSheet.getRange(2, 1, reportSheet.getLastRow() - 1, 4).clear();
  
  // Add test results
  const reportData = results.steps.map(step => [
    step.step,
    step.status,
    new Date(),
    step.status === 'PASSED' ? 'OK' : 'See errors below'
  ]);
  
  // Add summary
  reportData.unshift([
    '=== INTEGRATION TEST SUMMARY ===',
    results.success ? 'PASSED' : 'FAILED',
    new Date(),
    `Steps: ${results.steps.length}, Errors: ${results.errors.length}`
  ]);
  
  // Add errors if any
  if (results.errors.length > 0) {
    results.errors.forEach(error => {
      reportData.push(['ERROR', 'FAILED', new Date(), error]);
    });
  }
  
  reportSheet.getRange(2, 1, reportData.length, 4).setValues(reportData);
  
  // Format the report
  styleHeader_(reportSheet);
  
  console.log('\n📋 Integration test report created in INTEGRATION_TEST_REPORT sheet');
}

/**
 * Performance test - measures execution time
 */
function runPerformanceTest() {
  console.log('⚡ Starting Performance Test...');
  console.log('==============================');
  
  const startTime = new Date();
  
  try {
    // Run the integration test
    const results = runIntegrationTest();
    
    const endTime = new Date();
    const executionTime = (endTime - startTime) / 1000; // seconds
    
    console.log(`\n⏱️ Performance Results:`);
    console.log(`   Execution time: ${executionTime.toFixed(2)} seconds`);
    console.log(`   Success: ${results.success ? 'YES' : 'NO'}`);
    
    // Performance benchmarks
    if (executionTime < 30) {
      console.log('✅ Performance: EXCELLENT (< 30s)');
    } else if (executionTime < 60) {
      console.log('✅ Performance: GOOD (< 60s)');
    } else if (executionTime < 120) {
      console.log('⚠️ Performance: ACCEPTABLE (< 120s)');
    } else {
      console.log('❌ Performance: POOR (> 120s)');
    }
    
    return {
      executionTime,
      success: results.success,
      steps: results.steps.length
    };
    
  } catch (error) {
    console.error('❌ Performance test failed:', error);
    return {
      executionTime: (new Date() - startTime) / 1000,
      success: false,
      error: error.message
    };
  }
}

/**
 * Cleanup test data
 */
function cleanupTestData() {
  console.log('🧹 Cleaning up test data...');
  
  const ss = SpreadsheetApp.getActive();
  const sheetsToDelete = [
    'TEST_NURSES',
    'TEST_REPORT',
    'INTEGRATION_TEST_REPORT'
  ];
  
  // Add all test sheets with prefixes
  const meta = _nextMonth_();
  const mondays = _mondaysCoveringMonth_(meta.year, meta.month);
  mondays.forEach(m => {
    const kw = isoWeek_(m.monday);
    const weekId = kw.year + pad2_(kw.week);
    sheetsToDelete.push(`SHIFT_DEMAND_KW_${weekId}`);
    sheetsToDelete.push(`ROTA_KW_${weekId}`);
    sheetsToDelete.push(`ROTA_REPORT_KW_${weekId}`);
  });
  
  sheetsToDelete.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      ss.deleteSheet(sheet);
      console.log(`   Deleted: ${sheetName}`);
    }
  });
  
  console.log('✅ Cleanup completed');
}
