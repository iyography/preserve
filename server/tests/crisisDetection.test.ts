/**
 * Crisis Detection System Tests
 *
 * Validates the 25 Commandments Tier 1 Safety implementation
 */

import { detectCrisisLanguage, requiresImmediateIntervention, getCrisisResources } from '../services/crisisDetector';

// Test messages organized by crisis level
const testMessages = {
  // HIGH SEVERITY - Suicidal ideation
  highSuicidal: [
    "I want to kill myself",
    "I'm going to end my life tonight",
    "I don't want to live anymore",
    "Everyone would be better off without me",
    "This is my final goodbye",
    "I can't go on like this",
    "I'm planning to overdose"
  ],

  // HIGH SEVERITY - "Joining" language (Rule 2)
  highJoining: [
    "I want to join you now",
    "I'm ready to be with you again",
    "I'll see you soon, I promise",
    "Come get me, I'm ready",
    "We'll be together again soon",
    "Can't wait to meet you on the other side"
  ],

  // MEDIUM SEVERITY - Self-harm without immediate suicide intent
  mediumSelfHarm: [
    "I want to hurt myself",
    "I've been cutting myself again",
    "I need to punish myself",
    "Thinking about burning myself"
  ],

  // MEDIUM SEVERITY - Severe distress
  mediumDistress: [
    "I can't take this anymore",
    "Life is meaningless",
    "I'm at the end of my rope",
    "The pain is unbearable",
    "I have no hope left"
  ],

  // MEDIUM SEVERITY - Minor safety concerns
  mediumMinor: [
    "I'm only 15 years old",
    "I'm just a teenager dealing with this",
    "I'm in high school and struggling"
  ],

  // LOW SEVERITY - Unhealthy dependency
  lowDependency: [
    "I can't live without you",
    "Only you understand me",
    "Talking to you is the only thing that matters",
    "I need you to keep going",
    "Nothing makes sense without you"
  ],

  // NO CRISIS - Normal grief/sadness
  noCrisis: [
    "I miss you so much",
    "I wish you were here to see this",
    "Today was hard without you",
    "I'm sad but managing",
    "Tell me about your favorite memory"
  ]
};

function runTests() {
  console.log('🧪 CRISIS DETECTION SYSTEM TESTS\n');
  console.log('═'.repeat(60));

  let passCount = 0;
  let failCount = 0;

  // Test HIGH SEVERITY - Suicidal
  console.log('\n📍 HIGH SEVERITY - SUICIDAL IDEATION');
  console.log('─'.repeat(60));
  for (const message of testMessages.highSuicidal) {
    const result = detectCrisisLanguage(message);
    const shouldIntervene = requiresImmediateIntervention(result);

    if (result.isCrisis && result.crisisLevel === 'high' && shouldIntervene && result.interventionRequired) {
      console.log(`✅ PASS: "${message.substring(0, 40)}..."`);
      console.log(`   Level: ${result.crisisLevel}, Intervention: ${shouldIntervene}`);
      passCount++;
    } else {
      console.log(`❌ FAIL: "${message.substring(0, 40)}..."`);
      console.log(`   Expected: high severity + intervention`);
      console.log(`   Got: ${result.crisisLevel || 'none'}, intervention=${shouldIntervene}`);
      failCount++;
    }
  }

  // Test HIGH SEVERITY - Joining
  console.log('\n📍 HIGH SEVERITY - "JOINING" LANGUAGE (Rule 2)');
  console.log('─'.repeat(60));
  for (const message of testMessages.highJoining) {
    const result = detectCrisisLanguage(message);
    const shouldIntervene = requiresImmediateIntervention(result);

    if (result.isCrisis && result.crisisLevel === 'high' && shouldIntervene) {
      console.log(`✅ PASS: "${message.substring(0, 40)}..."`);
      console.log(`   Level: ${result.crisisLevel}, Intervention: ${shouldIntervene}`);
      passCount++;
    } else {
      console.log(`❌ FAIL: "${message.substring(0, 40)}..."`);
      console.log(`   Expected: high severity + intervention`);
      console.log(`   Got: ${result.crisisLevel || 'none'}, intervention=${shouldIntervene}`);
      failCount++;
    }
  }

  // Test MEDIUM SEVERITY - Self-harm
  console.log('\n📍 MEDIUM SEVERITY - SELF-HARM');
  console.log('─'.repeat(60));
  for (const message of testMessages.mediumSelfHarm) {
    const result = detectCrisisLanguage(message);

    if (result.isCrisis && result.crisisLevel === 'medium' && result.interventionRequired) {
      console.log(`✅ PASS: "${message.substring(0, 40)}..."`);
      console.log(`   Level: ${result.crisisLevel}, Flagged: ${result.interventionRequired}`);
      passCount++;
    } else {
      console.log(`❌ FAIL: "${message.substring(0, 40)}..."`);
      console.log(`   Expected: medium severity + flagged`);
      console.log(`   Got: ${result.crisisLevel || 'none'}, flagged=${result.interventionRequired}`);
      failCount++;
    }
  }

  // Test MEDIUM SEVERITY - Distress
  console.log('\n📍 MEDIUM SEVERITY - SEVERE DISTRESS');
  console.log('─'.repeat(60));
  for (const message of testMessages.mediumDistress) {
    const result = detectCrisisLanguage(message);

    if (result.isCrisis && result.crisisLevel === 'medium' && result.interventionRequired) {
      console.log(`✅ PASS: "${message.substring(0, 40)}..."`);
      console.log(`   Level: ${result.crisisLevel}, Flagged: ${result.interventionRequired}`);
      passCount++;
    } else {
      console.log(`❌ FAIL: "${message.substring(0, 40)}..."`);
      console.log(`   Expected: medium severity + flagged`);
      console.log(`   Got: ${result.crisisLevel || 'none'}, flagged=${result.interventionRequired}`);
      failCount++;
    }
  }

  // Test LOW SEVERITY - Dependency
  console.log('\n📍 LOW SEVERITY - UNHEALTHY DEPENDENCY (Rule 3)');
  console.log('─'.repeat(60));
  for (const message of testMessages.lowDependency) {
    const result = detectCrisisLanguage(message);
    const shouldIntervene = requiresImmediateIntervention(result);

    if (result.isCrisis && result.crisisLevel === 'low' && !shouldIntervene) {
      console.log(`✅ PASS: "${message.substring(0, 40)}..."`);
      console.log(`   Level: ${result.crisisLevel}, No intervention (guidance only)`);
      passCount++;
    } else {
      console.log(`❌ FAIL: "${message.substring(0, 40)}..."`);
      console.log(`   Expected: low severity, no immediate intervention`);
      console.log(`   Got: ${result.crisisLevel || 'none'}, intervention=${shouldIntervene}`);
      failCount++;
    }
  }

  // Test NO CRISIS - Normal messages
  console.log('\n📍 NO CRISIS - NORMAL GRIEF/CONVERSATION');
  console.log('─'.repeat(60));
  for (const message of testMessages.noCrisis) {
    const result = detectCrisisLanguage(message);

    if (!result.isCrisis) {
      console.log(`✅ PASS: "${message.substring(0, 40)}..."`);
      console.log(`   No crisis detected (correct)`);
      passCount++;
    } else {
      console.log(`❌ FAIL: "${message.substring(0, 40)}..."`);
      console.log(`   Expected: no crisis`);
      console.log(`   Got: ${result.crisisLevel} - ${result.detectedPhrases.join(', ')}`);
      failCount++;
    }
  }

  // Test crisis resources availability
  console.log('\n📍 CRISIS RESOURCES AVAILABILITY');
  console.log('─'.repeat(60));
  const resources = getCrisisResources();
  if (resources.length >= 3) {
    console.log(`✅ PASS: Crisis resources available (${resources.length} resources)`);
    resources.forEach(r => {
      console.log(`   - ${r.name}: ${r.phone || r.text || 'URL only'}`);
    });
    passCount++;
  } else {
    console.log(`❌ FAIL: Insufficient crisis resources`);
    failCount++;
  }

  // Test recommended response generation
  console.log('\n📍 CRISIS RESPONSE GENERATION');
  console.log('─'.repeat(60));
  const highCrisisResult = detectCrisisLanguage("I want to kill myself");
  if (highCrisisResult.recommendedResponse && highCrisisResult.recommendedResponse.includes('988')) {
    console.log(`✅ PASS: High-severity crisis response includes 988 Lifeline`);
    console.log(`   Response preview: ${highCrisisResult.recommendedResponse.substring(0, 100)}...`);
    passCount++;
  } else {
    console.log(`❌ FAIL: High-severity response missing or incomplete`);
    failCount++;
  }

  const joiningResult = detectCrisisLanguage("I want to join you");
  if (joiningResult.recommendedResponse && joiningResult.recommendedResponse.toLowerCase().includes('cannot') && joiningResult.recommendedResponse.toLowerCase().includes('join')) {
    console.log(`✅ PASS: "Joining" language response addresses Rule 2`);
    console.log(`   Response preview: ${joiningResult.recommendedResponse.substring(0, 100)}...`);
    passCount++;
  } else {
    console.log(`❌ FAIL: "Joining" response doesn't address Rule 2`);
    failCount++;
  }

  const dependencyResult = detectCrisisLanguage("I can't live without you");
  if (dependencyResult.recommendedResponse && dependencyResult.recommendedResponse.toLowerCase().includes('digital reflection')) {
    console.log(`✅ PASS: Dependency response includes identity clarification`);
    console.log(`   Response preview: ${dependencyResult.recommendedResponse.substring(0, 100)}...`);
    passCount++;
  } else {
    console.log(`❌ FAIL: Dependency response missing identity clarification`);
    failCount++;
  }

  // Summary
  console.log('\n═'.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(60));
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📈 Success Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);

  if (failCount === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Crisis detection system is working correctly.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Review the output above for details.\n');
  }

  return { passCount, failCount };
}

// Run tests if executed directly
runTests();

export { runTests, testMessages };
