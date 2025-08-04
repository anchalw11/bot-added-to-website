/**
 * Test Examples for Trading Signal Bot
 * Run these examples to test the bot functionality
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

// Test configuration
const TEST_CONFIG = {
  apiKey: 'demo', // Replace with your actual FMP API key
  symbols: ['EURUSD', 'GBPUSD', 'BTCUSD', 'AAPL'],
  timeframes: ['5m', '15m', '1h']
};

/**
 * Test 1: Health Check
 */
async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check Response:', response.data);
  } catch (error) {
    console.error('❌ Health Check Failed:', error.message);
  }
}

/**
 * Test 2: Update API Key
 */
async function testUpdateApiKey() {
  console.log('\n🔑 Testing API Key Update...');
  try {
    const response = await axios.post(`${BASE_URL}/api/set-key`, {
      newApiKey: TEST_CONFIG.apiKey
    });
    console.log('✅ API Key Update Response:', response.data);
  } catch (error) {
    console.error('❌ API Key Update Failed:', error.response?.data || error.message);
  }
}

/**
 * Test 3: Check API Key Status
 */
async function testApiKeyStatus() {
  console.log('\n📊 Testing API Key Status...');
  try {
    const response = await axios.get(`${BASE_URL}/api/key-status`);
    console.log('✅ API Key Status:', response.data);
  } catch (error) {
    console.error('❌ API Key Status Failed:', error.message);
  }
}

/**
 * Test 4: Analyze Single Symbol
 */
async function testSingleAnalysis(symbol = 'EURUSD', timeframe = '15m') {
  console.log(`\n📈 Testing Analysis for ${symbol} on ${timeframe}...`);
  try {
    const response = await axios.post(`${BASE_URL}/api/analyze-symbol`, {
      symbol,
      timeframe
    });
    
    console.log('✅ Analysis Result:');
    console.log(`   Symbol: ${response.data.symbol}`);
    console.log(`   Direction: ${response.data.direction}`);
    console.log(`   Confidence: ${response.data.confidence}%`);
    
    if (response.data.direction !== 'NEUTRAL') {
      console.log(`   Entry: ${response.data.entry}`);
      console.log(`   Stop Loss: ${response.data.stopLoss}`);
      console.log(`   Targets: ${response.data.targets.target1}, ${response.data.targets.target2}, ${response.data.targets.target3}`);
    }
    
    console.log(`   Analysis: ${response.data.analysis}`);
    
  } catch (error) {
    console.error('❌ Analysis Failed:', error.response?.data || error.message);
  }
}

/**
 * Test 5: Batch Analysis (Multiple Symbols)
 */
async function testBatchAnalysis() {
  console.log('\n📊 Testing Batch Analysis...');
  
  for (const symbol of TEST_CONFIG.symbols) {
    for (const timeframe of TEST_CONFIG.timeframes) {
      try {
        console.log(`\n🔍 Analyzing ${symbol} on ${timeframe}...`);
        
        const response = await axios.post(`${BASE_URL}/api/analyze-symbol`, {
          symbol,
          timeframe
        });
        
        console.log(`   Result: ${response.data.direction} (${response.data.confidence}%)`);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`   ❌ Failed: ${error.response?.data?.details || error.message}`);
      }
    }
  }
}

/**
 * Test 6: Error Handling
 */
async function testErrorHandling() {
  console.log('\n🚨 Testing Error Handling...');
  
  // Test invalid symbol
  try {
    await axios.post(`${BASE_URL}/api/analyze-symbol`, {
      symbol: 'INVALID',
      timeframe: '15m'
    });
  } catch (error) {
    console.log('✅ Invalid Symbol Error Handled:', error.response?.data?.error);
  }
  
  // Test invalid timeframe
  try {
    await axios.post(`${BASE_URL}/api/analyze-symbol`, {
      symbol: 'EURUSD',
      timeframe: 'invalid'
    });
  } catch (error) {
    console.log('✅ Invalid Timeframe Error Handled:', error.response?.data?.error);
  }
  
  // Test missing parameters
  try {
    await axios.post(`${BASE_URL}/api/analyze-symbol`, {});
  } catch (error) {
    console.log('✅ Missing Parameters Error Handled:', error.response?.data?.error);
  }
}

/**
 * Test 7: Performance Test
 */
async function testPerformance() {
  console.log('\n⚡ Testing Performance...');
  
  const startTime = Date.now();
  const symbol = 'EURUSD';
  const timeframe = '15m';
  
  try {
    const response = await axios.post(`${BASE_URL}/api/analyze-symbol`, {
      symbol,
      timeframe
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Analysis completed in ${duration}ms`);
    console.log(`   Signal: ${response.data.direction} (${response.data.confidence}%)`);
    
  } catch (error) {
    console.error('❌ Performance Test Failed:', error.message);
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🧪 Starting Trading Signal Bot Tests...');
  console.log('=' .repeat(50));
  
  await testHealthCheck();
  await testUpdateApiKey();
  await testApiKeyStatus();
  await testSingleAnalysis();
  await testSingleAnalysis('GBPUSD', '1h');
  await testSingleAnalysis('BTCUSD', '5m');
  await testErrorHandling();
  await testPerformance();
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 All tests completed!');
  console.log('\n💡 Tips:');
  console.log('   - Replace "demo" with your actual FMP API key for better results');
  console.log('   - Monitor console logs for detailed analysis information');
  console.log('   - Use different timeframes for varying signal frequencies');
}

/**
 * Interactive test runner
 */
async function interactiveTest() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n🎮 Interactive Trading Signal Bot Tester');
  console.log('Enter commands or type "help" for options\n');

  const askQuestion = () => {
    rl.question('> ', async (input) => {
      const [command, ...args] = input.trim().split(' ');
      
      switch (command.toLowerCase()) {
        case 'help':
          console.log('\nAvailable commands:');
          console.log('  analyze <symbol> <timeframe> - Analyze a symbol');
          console.log('  setkey <apikey> - Update API key');
          console.log('  status - Check API key status');
          console.log('  health - Health check');
          console.log('  test - Run all tests');
          console.log('  exit - Exit the tester\n');
          break;
          
        case 'analyze':
          if (args.length >= 2) {
            await testSingleAnalysis(args[0], args[1]);
          } else {
            console.log('Usage: analyze <symbol> <timeframe>');
            console.log('Example: analyze EURUSD 15m');
          }
          break;
          
        case 'setkey':
          if (args.length >= 1) {
            try {
              const response = await axios.post(`${BASE_URL}/api/set-key`, {
                newApiKey: args[0]
              });
              console.log('✅ API Key Updated:', response.data);
            } catch (error) {
              console.error('❌ Failed:', error.response?.data || error.message);
            }
          } else {
            console.log('Usage: setkey <your_api_key>');
          }
          break;
          
        case 'status':
          await testApiKeyStatus();
          break;
          
        case 'health':
          await testHealthCheck();
          break;
          
        case 'test':
          await runAllTests();
          break;
          
        case 'exit':
          console.log('👋 Goodbye!');
          rl.close();
          return;
          
        default:
          console.log('Unknown command. Type "help" for available commands.');
      }
      
      askQuestion();
    });
  };

  askQuestion();
}

// Check if running directly or being imported
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--interactive') || args.includes('-i')) {
    interactiveTest();
  } else {
    runAllTests();
  }
}

module.exports = {
  testHealthCheck,
  testUpdateApiKey,
  testApiKeyStatus,
  testSingleAnalysis,
  testBatchAnalysis,
  testErrorHandling,
  testPerformance,
  runAllTests,
  interactiveTest
};