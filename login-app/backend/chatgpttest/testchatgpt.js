
const fs = require('fs');
const csv = require('csv-parser');
const cliProgress = require('cli-progress');
const colors = require('ansi-colors');
const axios = require('axios');
const crypto = require('crypto');
const { generateVisualizations } = require('./visualize');

// OpenAI API configuration
const OPENAI_API_KEY = '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';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const errorLog = [];

const PROMPT_TEMPLATE = `Analyze this email strictly as either quotation request (yes) or not (no). 
Rules:
1. Respond ONLY 'yes' or 'no'
2. 'yes' = explicit OR implicit price/quote request
3. Examples of "yes":
   - "Please provide your best price for 100 units"
   - "Kindly send quotation for office chairs"
   - "Need formal quote for construction materials"
   - "What's the cost of..."
   - "Looking for pricing details"
   - "Can you tell me the price?"
   - "Interested in purchasing, what's the rate?"
   - "Please send me a quote"
   - "Can you provide a quote?"
   - "Your quoted prices from Q1 are outdated – need 2024 figures."
   - "Can you requote the project with faster shipping?"
4. Examples of "no":
   - "Your quoted price from last week..."
   - "Invoice #123 attached for payment"
   - "Discuss pricing in tomorrow's meeting"
5. When in doubt, respond 'yes'
6. Only classify as 'no' if ABSOLUTELY CERTAIN it's not a quote request
7. Remember: false negatives are MORE COSTLY than false positives

Email: "{email_content}"
Answer ONLY 'yes' or 'no':`;
// Rate limiting configuration
const RATE_LIMIT = {
  requestsPerMinute: 60,
  minDelayMs: 1000,
  lastRequestTime: Date.now()
};

// Cache for identical emails
const emailCache = new Map();

// Metrics tracking
const metrics = {
  total: 0,
  correct: 0,
  falsePositives: 0,
  falseNegatives: 0,
  confusionMatrix: { tp: 0, tn: 0, fp: 0, fn: 0 },
  responseTimes: [],
  cacheHits: 0,
  retries: 0
};

// Create progress bar
const progressBar = new cliProgress.SingleBar({
  format: colors.cyan('Processing: ') + 
    '|' + colors.cyan('{bar}') + '| ' + 
    colors.yellow('{percentage}%') + ' || ' + 
    colors.green('{value}/{total}') + ' Emails || ' + 
    'ETA: ' + colors.magenta('{eta}s') + ' || ' + 
    'Speed: ' + colors.blue('{speed} emails/s'),
  barCompleteChar: '█',
  barIncompleteChar: '░',
  hideCursor: true
});

// Generate email body hash
function hashEmailBody(body) {
  return crypto.createHash('sha256').update(body).digest('hex');
}

// Rate limiting function
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function rateLimitRequest() {
  const now = Date.now();
  const timeSinceLastRequest = now - RATE_LIMIT.lastRequestTime;
  const requiredDelay = Math.max(RATE_LIMIT.minDelayMs - timeSinceLastRequest, 0);
  
  if (requiredDelay > 0) {
    await delay(requiredDelay);
  }
  
  RATE_LIMIT.lastRequestTime = now;
}

// Deterministic classification function
async function classifyEmail(body) {
    const start = Date.now();
    try {
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a strict binary classifier that only responds with "yes" or "no".'
            },
            {
              role: 'user',
              content: PROMPT_TEMPLATE.replace('{email_content}', body)
            }
          ],
          temperature: 0,
          max_tokens: 1,
          presence_penalty: 0,
          frequency_penalty: 0,
          top_p: 1,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );
  
      let result = response.data.choices[0].message.content.toLowerCase().trim();
      
      // Clean the response
      result = result.replace(/[^a-z]/g, ''); // Remove any non-letters
      
      // Strict validation
      if (result.startsWith('y')) result = 'yes';
      else if (result.startsWith('n')) result = 'no';
      else {
        console.log(`Invalid response received: "${result}"`);
        return 'error';
      }
  
      const elapsed = Date.now() - start;
      metrics.responseTimes.push(elapsed);
      return result;
  
    } catch (error) {
      if (error.response) {
        console.error('Error Response:', error.response.data);
        // Handle rate limiting
        if (error.response.status === 429) {
          console.log(colors.yellow('Rate limit hit, waiting before retry...'));
          await delay(2000);
          return classifyEmail(body); // Retry
        }
      }
      console.error(`Error: ${error.message}`);
      return 'error';
    }
  }

// Cached classification with retries
async function consistentClassify(body, retries = 3) {
  const emailHash = hashEmailBody(body);
  
  // Check cache first
  if (emailCache.has(emailHash)) {
    metrics.cacheHits++;
    return emailCache.get(emailHash);
  }

  const start = Date.now();
  let result = 'error';

  for (let attempt = 1; attempt <= retries; attempt++) {
    result = await classifyEmail(body);
    if (result !== 'error') break;
    metrics.retries++;
    await delay(2000 * attempt); // Exponential backoff
  }

  const elapsed = Date.now() - start;
  metrics.responseTimes.push(elapsed);

  // Cache valid responses
  if (result !== 'error') {
    emailCache.set(emailHash, result);
  }

  return result;
}

// Quick test function
async function quickTest() {
  const tests = [
    { email: "Please quote 100 laptops. Delivery needed by Friday.", expected: 'yes' },
    { email: "We discussed pricing last week, need update", expected: 'no' }
  ];

  for (const test of tests) {
    const result = await consistentClassify(test.email);
    console.log(colors[result === test.expected ? 'green' : 'red'](
      `Test: ${test.email} => ${result} (Expected: ${test.expected})`
    ));
  }
}

// Main processing pipeline
async function processCSV() {
    try {
      await quickTest();
  
      let totalRows = 0;
      await new Promise((resolve) => {
        fs.createReadStream('sampledata.csv')
          .pipe(csv())
          .on('data', () => totalRows++)
          .on('end', resolve);
      });
  
      console.log(colors.cyan(`\nStarting processing of ${totalRows} emails...\n`));
  
      let lastTime = Date.now();
      let lastCount = 0;
      progressBar.start(totalRows, 0, { speed: "N/A" });
  
      const stream = fs.createReadStream('sampledata.csv')
        .pipe(csv());
  
      for await (const row of stream) {
        metrics.total++;
        const actual = await classifyEmail(row.email_body);
        const expected = row.expected_result.toLowerCase();
        
        // Track errors with details
        if (actual !== expected) {
          errorLog.push({
            email: row.email_body,
            expected: expected,
            actual: actual,
            type: expected === 'yes' ? 'False Negative' : 'False Positive'
          });
        }
  
        // Update metrics
        if (actual === expected) {
          metrics.correct++;
          if (actual === 'yes') metrics.confusionMatrix.tp++;
          else metrics.confusionMatrix.tn++;
        } else {
          if (expected === 'yes') metrics.confusionMatrix.fn++;
          else metrics.confusionMatrix.fp++;
        }
  
        // Update progress bar
        const now = Date.now();
        const timeDiff = now - lastTime;
        if (timeDiff >= 1000) {
          const countDiff = metrics.total - lastCount;
          const speed = countDiff / (timeDiff / 1000);
          progressBar.update(metrics.total, { speed: speed.toFixed(1) });
          lastTime = now;
          lastCount = metrics.total;
        } else {
          progressBar.update(metrics.total);
        }
      }
  
      progressBar.stop();
  
      // Generate error report
      if (errorLog.length > 0) {
        const errorReport = `
  Classification Errors Report
  --------------------------
  Total Errors: ${errorLog.length}
  False Negatives: ${metrics.confusionMatrix.fn}
  False Positives: ${metrics.confusionMatrix.fp}
  
  Detailed Error Log:
  ${errorLog.map((error, index) => `
  Error ${index + 1}:
  Type: ${error.type}
  Expected: ${error.expected}
  Actual: ${error.actual}
  Email: "${error.email}"
  -------------------`).join('\n')}
  
  Generated on: ${new Date().toLocaleString()}
  `;
  
        // Save error report
        const outputDir = './output';
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir);
        }
        fs.writeFileSync(`${outputDir}/error_report.txt`, errorReport);
        
        // Print summary to console
        console.log(colors.yellow('\nClassification Errors Summary:'));
        console.log(colors.red(`Total Errors: ${errorLog.length}`));
        console.log(colors.red(`False Negatives: ${metrics.confusionMatrix.fn}`));
        console.log(colors.red(`False Positives: ${metrics.confusionMatrix.fp}`));
        console.log(colors.yellow(`\nDetailed error report saved to ${outputDir}/error_report.txt`));
      }
  
      // Generate visualizations
      await generateVisualizations(metrics);
  
    } catch (error) {
      console.error(colors.red('\nError during processing:'), error);
      progressBar.stop();
      process.exit(1);
    }
  }

// Execution
console.log(colors.yellow('Starting classification system...'));
const startTime = Date.now();
processCSV().then(() => {
  console.log(colors.green(`\nCompleted in ${((Date.now() - startTime)/1000).toFixed(1)}s`));
});