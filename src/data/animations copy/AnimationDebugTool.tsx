// AnimationDebugTool.tsx - Standalone animation tester
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const AnimationDebugTool = () => {
  const [currentTest, setCurrentTest] = useState<string>('basic');
  const [logs, setLogs] = useState<string[]>([]);
  const webViewRef = useRef<WebView>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };
// First, let's test with your EXACT chemistry-definition HTML
const testChemistryDefinitionHTML = () => {
  // This is your exact HTML from chemistryDefinition.ts
  const baseAnimationTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            transition: box-shadow 0.3s ease;
        }
        #canvas-container {
            width: 100vw;
            height: 100vh;
            position: relative;
        }
    </style>
</head>
<body>
    <div id="canvas-container"></div>
    <script>
        console.log('Base template script executed');
        // Your animation state setup
        let animationState = {
            temperature: 20,
            zoom: 1,
            speed: 1,
            showBefore: true,
            rotation3D: true,
            particleCount: 50,
            pressure: 1,
            concentration: 0.5,
            isPlaying: true,
            safetyStatus: { isSafe: true, warnings: [] }
        };

        console.log('Animation state initialized:', animationState);
    </script>
</body>
</html>
`;

  // Your chemistry definition specific content
  const chemistryDefinitionContent = `
    <style>
      #animation-container {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        position: relative;
        overflow: hidden;
        width: 100%;
        height: 100%;
      }

      .title-section {
        text-align: center;
        margin-bottom: 30px;
        opacity: 0;
        transform: translateY(-20px);
        animation: fadeInDown 1s forwards;
      }

      .main-title {
        font-size: 28px;
        font-weight: bold;
        color: white;
        margin-bottom: 10px;
      }

      .definition-text {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.5;
        max-width: 500px;
        margin: 0 auto;
      }

      @keyframes fadeInDown {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    </style>

    <div id="animation-container">
      <div class="title-section">
        <h1 class="main-title">What is Chemistry?</h1>
        <p class="definition-text">
          Chemistry is the branch of science that deals with the properties, composition, and structure of substances.
        </p>
      </div>
    </div>

    <script>
      console.log('Chemistry definition script started');

      window.addEventListener('load', () => {
        console.log('Window loaded - chemistry definition');

        const container = document.getElementById('animation-container');
        if (container) {
          console.log('Animation container found!');
          console.log('Container style:', window.getComputedStyle(container).background);
        } else {
          console.error('Animation container NOT found!');
        }

        // Test if content is visible
        const titleSection = document.querySelector('.title-section');
        if (titleSection) {
          console.log('Title section found');
          setTimeout(() => {
            console.log('Title section opacity after animation:', window.getComputedStyle(titleSection).opacity);
          }, 2000);
        } else {
          console.error('Title section NOT found!');
        }

        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage('Chemistry definition loaded successfully!');
        }
      });
    </script>
  `;

  // Combine them the way your system does
  return baseAnimationTemplate.replace(
    '<div id="canvas-container"></div>',
    '<div id="canvas-container"><div id="animation-container-placeholder"></div></div>'
  ) + chemistryDefinitionContent;
};

// Debug version - let's check each step
const debugChemistryStep1 = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background: red; color: white; padding: 20px;">
    <h1>STEP 1: Basic HTML Structure Test</h1>
    <p>If you see this red background, HTML is loading.</p>
    <div id="canvas-container" style="background: blue; height: 200px; margin: 10px 0;">
        <p style="color: white; padding: 10px;">Canvas container (blue)</p>
        <div id="animation-container" style="background: green; height: 100px; margin: 10px;">
            <p style="color: white; padding: 10px;">Animation container (green)</p>
        </div>
    </div>
    <script>
        console.log('Step 1 script executed');
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage('Step 1: HTML structure loaded');
        }
    </script>
</body>
</html>
`;

const debugChemistryStep2 = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        #canvas-container {
            width: 100vw;
            height: 100vh;
            position: relative;
            background: orange;
        }
        #animation-container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
    </style>
</head>
<body>
    <div id="canvas-container">
        <div id="animation-container">
            <h1>STEP 2: CSS Styling Test</h1>
        </div>
    </div>
    <script>
        console.log('Step 2 script executed');
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage('Step 2: CSS styling loaded');
        }
    </script>
</body>
</html>
`;

const debugChemistryStep3 = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        #canvas-container {
            width: 100vw;
            height: 100vh;
            position: relative;
        }
        #animation-container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            position: relative;
            overflow: hidden;
            width: 100%;
            height: 100%;
        }
        .title-section {
            text-align: center;
            margin-bottom: 30px;
            opacity: 0;
            transform: translateY(-20px);
            animation: fadeInDown 1s forwards;
        }
        .main-title {
            font-size: 28px;
            font-weight: bold;
            color: white;
            margin-bottom: 10px;
        }
        .definition-text {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.9);
            line-height: 1.5;
            max-width: 500px;
            margin: 0 auto;
        }
        @keyframes fadeInDown {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    </style>
</head>
<body>
    <div id="canvas-container">
        <div id="animation-container">
            <div class="title-section">
                <h1 class="main-title">What is Chemistry?</h1>
                <p class="definition-text">
                    Chemistry is the branch of science that deals with the properties, composition, and structure of substances.
                </p>
            </div>
        </div>
    </div>
    <script>
        console.log('Step 3 script executed');

        setTimeout(() => {
            const titleSection = document.querySelector('.title-section');
            if (titleSection) {
                console.log('Animation completed, opacity:', window.getComputedStyle(titleSection).opacity);
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage('Step 3: Animation completed successfully');
                }
            }
        }, 2000);
    </script>
</body>
</html>
`;
  // Test 1: Basic HTML
  const basicHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                margin: 0;
                padding: 20px;
                background: red;
                color: white;
                font-family: Arial, sans-serif;
                font-size: 18px;
            }
        </style>
    </head>
    <body>
        <h1>Basic Test - RED BACKGROUND</h1>
        <p>If you can see this, WebView is working!</p>
        <script>
            console.log('Basic HTML loaded');
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage('Basic test loaded successfully!');
            }
        </script>
    </body>
    </html>
  `;

  // Test 2: With CSS Animation
  const animatedHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                margin: 0;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                font-family: Arial, sans-serif;
                height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            .title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
                animation: fadeIn 2s ease-in-out;
            }
            .content {
                font-size: 16px;
                text-align: center;
                animation: slideUp 1s ease-out 0.5s both;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
        </style>
    </head>
    <body>
        <div class="title">Animated Test</div>
        <div class="content">
            This should fade in and slide up!<br>
            Background should be a gradient.
        </div>

        <script>
            console.log('Animated HTML loaded');
            let counter = 0;

            setInterval(() => {
                counter++;
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(\`Animation running: \${counter}\`);
                }
            }, 1000);
        </script>
    </body>
    </html>
  `;

  // Test 3: Your Base Template
  const baseTemplateHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
            body {
                margin: 0;
                padding: 0;
                overflow: hidden;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                background: orange;
            }
            #canvas-container {
                width: 100vw;
                height: 100vh;
                position: relative;
                background: blue;
            }
            #animation-container {
                width: 100%;
                height: 100%;
                background: green;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 20px;
            }
        </style>
    </head>
    <body>
        <div id="canvas-container">
            <div id="animation-container">
                BASE TEMPLATE TEST - GREEN BACKGROUND
            </div>
        </div>
        <script>
            console.log('Base template loaded');
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage('Base template test loaded!');
            }
        </script>
    </body>
    </html>
  `;

  // Test 4: Simplified Chemistry Definition
  const chemistryHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                margin: 0;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                min-height: 100vh;
            }
            .title {
                font-size: 28px;
                font-weight: bold;
                text-align: center;
                margin-bottom: 20px;
                animation: fadeIn 1s ease-in;
            }
            .card {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 20px;
                margin: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: center;
            }
            .card:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-2px);
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        </style>
    </head>
    <body>
        <div class="title">What is Chemistry?</div>

        <div class="card" onclick="showMessage('Properties')">
            <h3>🔬 Properties</h3>
            <p>What substances are like</p>
        </div>

        <div class="card" onclick="showMessage('Composition')">
            <h3>⚛️ Composition</h3>
            <p>What substances are made of</p>
        </div>

        <div class="card" onclick="showMessage('Structure')">
            <h3>🧬 Structure</h3>
            <p>How atoms are arranged</p>
        </div>

        <script>
            console.log('Chemistry animation loaded');

            function showMessage(topic) {
                console.log('Clicked:', topic);
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(\`Clicked: \${topic}\`);
                }
            }

            // Test if JavaScript is working
            setTimeout(() => {
                document.body.style.border = '3px solid yellow';
                console.log('JavaScript executed - yellow border added');
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage('JavaScript execution test complete');
                }
            }, 2000);
        </script>
    </body>
    </html>
  `;

  const tests = {
    basic: { name: 'Basic HTML', html: basicHTML },
    animated: { name: 'CSS Animations', html: animatedHTML },
    template: { name: 'Base Template', html: baseTemplateHTML },
    chemistry: { name: 'Simple Chemistry', html: chemistryHTML },
    step1: { name: 'Step 1: HTML Structure', html: debugChemistryStep1 },
  step2: { name: 'Step 2: CSS Styling', html: debugChemistryStep2 },
  step3: { name: 'Step 3: Full Animation', html: debugChemistryStep3 },
  actual: { name: 'Actual Chemistry Config', html: testChemistryDefinitionHTML() }
  };

  const handleMessage = (event: any) => {
    try {
      const message = event.nativeEvent.data;
      addLog(`WebView Message: ${message}`);
    } catch (e) {
      addLog(`Error parsing message: ${e}`);
    }
  };

  const renderWebView = () => {
    if (Platform.OS === 'web') {
      return (
        <div
          style={{
            width: '100%',
            height: 400,
            border: '2px solid #ddd',
            borderRadius: 8,
            overflow: 'hidden'
          }}
          dangerouslySetInnerHTML={{ __html: tests[currentTest].html }}
        />
      );
    }

    return (
      <WebView
        ref={webViewRef}
        source={{ html: tests[currentTest].html }}
        style={styles.webview}
        onMessage={handleMessage}
        onError={(error) => addLog(`WebView Error: ${JSON.stringify(error)}`)}
        onLoadEnd={() => addLog('WebView loaded successfully')}
        onLoadStart={() => addLog('WebView loading started')}
        onHttpError={(error) => addLog(`HTTP Error: ${JSON.stringify(error)}`)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={false}
        allowsInlineMediaPlayback={true}
        mixedContentMode="compatibility"
        originWhitelist={['*']}
      />
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Animation Debug Tool</Text>

      {/* Test Selection */}
      <View style={styles.testSelector}>
        {Object.entries(tests).map(([key, test]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.testButton,
              currentTest === key && styles.testButtonActive
            ]}
            onPress={() => {
              setCurrentTest(key);
              setLogs([]);
              addLog(`Switched to test: ${test.name}`);
            }}
          >
            <Text style={[
              styles.testButtonText,
              currentTest === key && styles.testButtonTextActive
            ]}>
              {test.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* WebView Container */}
      <View style={styles.webviewContainer}>
        <Text style={styles.sectionTitle}>
          Current Test: {tests[currentTest].name}
        </Text>
        {renderWebView()}
      </View>

      {/* Debug Info */}
      <View style={styles.debugSection}>
        <Text style={styles.sectionTitle}>Debug Information</Text>
        <Text style={styles.debugText}>Platform: {Platform.OS}</Text>
        <Text style={styles.debugText}>Current Test: {currentTest}</Text>
        <Text style={styles.debugText}>Expected: Different colored backgrounds and text</Text>
      </View>

      {/* Console Logs */}
      <View style={styles.logsSection}>
        <Text style={styles.sectionTitle}>Console Logs</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => setLogs([])}
        >
          <Text style={styles.clearButtonText}>Clear Logs</Text>
        </TouchableOpacity>

        <ScrollView style={styles.logsContainer} nestedScrollEnabled>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>
              {log}
            </Text>
          ))}
          {logs.length === 0 && (
            <Text style={styles.noLogsText}>No logs yet...</Text>
          )}
        </ScrollView>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsSection}>
        <Text style={styles.sectionTitle}>What to Look For</Text>
        <Text style={styles.instructionText}>
          • Basic HTML: Red background with white text{'\n'}
          • CSS Animations: Blue gradient with fade-in text{'\n'}
          • Base Template: Green background (testing your template){'\n'}
          • Simple Chemistry: Purple gradient with clickable cards{'\n'}
          {'\n'}
          If you see grey/empty area, check logs for errors.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 20,
    color: '#333',
  },
  testSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 5,
  },
  testButtonActive: {
    backgroundColor: '#007AFF',
  },
  testButtonText: {
    color: '#333',
    fontSize: 14,
  },
  testButtonTextActive: {
    color: 'white',
  },
  webviewContainer: {
    margin: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  webview: {
    height: 400,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  debugSection: {
    margin: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  debugText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  logsSection: {
    margin: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
  },
  clearButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#ff4444',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 10,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
  },
  logsContainer: {
    maxHeight: 200,
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
    padding: 10,
  },
  logText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 3,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  noLogsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  instructionsSection: {
    margin: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 50,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default AnimationDebugTool;
