const fs = require('fs');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const colors = require('ansi-colors');

// Create ChartJS instance
const width = 800;
const height = 600;
const chartCallback = (ChartJS) => {
  ChartJS.defaults.responsive = true;
  ChartJS.defaults.maintainAspectRatio = false;
};
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, chartCallback });

async function generateVisualizations(metrics) {
  console.log('\nGenerating visualization graphs...');
  
  const accuracy = ((metrics.correct / metrics.total) * 100).toFixed(2);
  const precision = (metrics.confusionMatrix.tp / (metrics.confusionMatrix.tp + metrics.confusionMatrix.fp) || 0).toFixed(2);
  const recall = (metrics.confusionMatrix.tp / (metrics.confusionMatrix.tp + metrics.confusionMatrix.fn) || 0).toFixed(2);

  // Confusion Matrix Chart
  const confusionMatrixConfig = {
    type: 'doughnut',
    data: {
      labels: ['True Positives', 'True Negatives', 'False Positives', 'False Negatives'],
      datasets: [{
        data: [
          metrics.confusionMatrix.tp,
          metrics.confusionMatrix.tn,
          metrics.confusionMatrix.fp,
          metrics.confusionMatrix.fn
        ],
        backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#F44336']
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Confusion Matrix Distribution'
        }
      }
    }
  };

  // Metrics Chart
  const metricsChartConfig = {
    type: 'bar',
    data: {
      labels: ['Accuracy', 'Precision', 'Recall'],
      datasets: [{
        label: 'Performance Metrics (%)',
        data: [accuracy, precision, recall],
        backgroundColor: ['#3F51B5', '#3F51B5', '#3F51B5']
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Model Performance Metrics'
        }
      }
    }
  };

  // Response Times Chart
  const responseTimesConfig = {
    type: 'line',
    data: {
      labels: Array.from({ length: metrics.responseTimes.length }, (_, i) => i + 1),
      datasets: [{
        label: 'Response Time (ms)',
        data: metrics.responseTimes,
        borderColor: '#2196F3',
        tension: 0.1,
        fill: false
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'API Response Times'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Time (ms)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Request Number'
          }
        }
      }
    }
  };

  try {
    // Create output directory if it doesn't exist
    const outputDir = './output';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Generate and save each chart as an image
    const confusionMatrix = await chartJSNodeCanvas.renderToBuffer(confusionMatrixConfig);
    const metricsChart = await chartJSNodeCanvas.renderToBuffer(metricsChartConfig);
    const responseTimesChart = await chartJSNodeCanvas.renderToBuffer(responseTimesConfig);

    // Save charts
    fs.writeFileSync(`${outputDir}/confusion_matrix.png`, confusionMatrix);
    fs.writeFileSync(`${outputDir}/metrics_chart.png`, metricsChart);
    fs.writeFileSync(`${outputDir}/response_times.png`, responseTimesChart);

    // Calculate average response time
    const avgResponseTime = (metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length).toFixed(2);

    // Generate summary text file
    const summary = `
Classification Report Summary
---------------------------
Total Samples: ${metrics.total}
Accuracy: ${accuracy}%
Precision: ${precision}%
Recall: ${recall}%

Confusion Matrix:
- True Positives: ${metrics.confusionMatrix.tp}
- True Negatives: ${metrics.confusionMatrix.tn}
- False Positives: ${metrics.confusionMatrix.fp}
- False Negatives: ${metrics.confusionMatrix.fn}

Performance Metrics:
- Average Response Time: ${avgResponseTime}ms
- Fastest Response: ${Math.min(...metrics.responseTimes)}ms
- Slowest Response: ${Math.max(...metrics.responseTimes)}ms

Generated on: ${new Date().toLocaleString()}
    `;

    fs.writeFileSync(`${outputDir}/classification_report.txt`, summary);
    console.log(colors.green('Reports generated successfully!'));
    console.log(colors.yellow(`\nResults saved in ${outputDir}/`));

  } catch (error) {
    console.error(colors.red('Error generating charts:'), error);
    throw error;
  }
}

module.exports = { generateVisualizations };