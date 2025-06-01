// src/data/animations/ChemistryAnimation.tsx
import React, { useRef, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import Slider from '@react-native-community/slider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAnimation } from './animationRegistry';
import { AnimationType } from './types';
import { brandColors } from '@/lib/designSystem';
import { SafetyService } from './services/SafetyService';
import { SafetyStatus } from './types';
import { TemplateLoader } from './core/TemplateLoader';

interface ChemistryAnimationProps {
  type: AnimationType;
  height?: number;
  style?: any;
  onStateChange?: (state: any) => void;
}

const ChemistryAnimation: React.FC<ChemistryAnimationProps> = ({
  type,
  height,
  style,
  onStateChange
}) => {
  const config = getAnimation(type);
  const finalHeight = height || config.height;
  // Web fallback - render HTML directly
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { height: finalHeight }, style]}>
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '12px',
            overflow: 'hidden'
          }}
          dangerouslySetInnerHTML={{ __html: config.html }}
        />
      </View>
    );
  }

  const webViewRef = useRef<WebView>(null);
  const features = config.features || {};



  // Control states
  const [temperature, setTemperature] = useState(20);
  const [zoom, setZoom] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [showBefore, setShowBefore] = useState(true);
  const [rotation3D, setRotation3D] = useState(true);
  const [particleCount, setParticleCount] = useState(50);
  const [pressure, setPressure] = useState(1);
  const [concentration, setConcentration] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(config.autoPlay);

  // Send control updates to WebView
  const sendControlUpdate = (controlType: string, value: any) => {
    webViewRef.current?.postMessage(JSON.stringify({
      type: 'controlUpdate',
      control: controlType,
      value: value
    }));
  };

  // Safety checks
 const [safetyStatus, setSafetyStatus] = useState<SafetyStatus>({
  isSafe: true,
  warnings: [],
  requiredEquipment: []
});

// Add safety check function
const checkSafety = () => {
  const currentState = {
    temperature,
    pressure,
    concentration,
    reactionType: config.type
  };

  const status = SafetyService.checkSafety(config.safety, currentState);
  setSafetyStatus(status);

  // Post safety status to WebView
  sendControlUpdate('safetyStatus', status);
};

// Add useEffect to run safety checks
useEffect(() => {
  checkSafety();
}, [temperature, pressure, concentration, config.safety]);

  // Handle temperature change
  const handleTemperatureChange = (value: number) => {
    setTemperature(value);
    sendControlUpdate('temperature', value);
  };

  // Handle zoom change
  const handleZoomChange = (value: number) => {
    setZoom(value);
    sendControlUpdate('zoom', value);
  };

  // Handle speed change
  const handleSpeedChange = (value: number) => {
    setSpeed(value);
    sendControlUpdate('speed', value);
  };

  // Toggle before/after
  const toggleBeforeAfter = () => {
    setShowBefore(!showBefore);
    sendControlUpdate('beforeAfter', !showBefore);
  };

  // Toggle 3D rotation
  const toggle3DRotation = () => {
    setRotation3D(!rotation3D);
    sendControlUpdate('rotation3D', !rotation3D);
  };

  // Handle particle count
  const handleParticleCountChange = (value: number) => {
    setParticleCount(value);
    sendControlUpdate('particleCount', value);
  };

  // Handle WebView messages
  const handleMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);

    if (data.type === 'animationComplete' && config.loop) {
      webViewRef.current?.postMessage(JSON.stringify({ action: 'restart' }));
    }

    if (data.type === 'stateUpdate' && onStateChange) {
      onStateChange(data.state);
    }
  };
  // Play/Pause control
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    sendControlUpdate('playPause', !isPlaying);
  };


  // Generate control panel HTML
  const getControlPanelHTML = () => {
    return `
      <style>
        .control-panel {
          position: absolute;
          bottom: 10px;
          left: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .control-row {
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .control-label {
          font-size: 12px;
          color: #333;
          font-weight: 500;
          min-width: 80px;
        }
        .control-value {
          font-size: 12px;
          color: #666;
          min-width: 40px;
          text-align: right;
        }
      </style>
    `;
  };

  return (
    <View style={[styles.container, { height: finalHeight + (features.temperature || features.zoom || features.speed ? 120 : 0) }, style]}>
       {!safetyStatus.isSafe && (
      <View style={styles.safetyWarning}>
        <MaterialCommunityIcons name="alert-circle" size={20} color="white" />
        <Text style={styles.safetyWarningText}>
          {safetyStatus.warnings.join(' • ')}
        </Text>
      </View>
    )}

    {/* Equipment Reminder */}
    {safetyStatus.requiredEquipment.length > 0 && (
      <View style={styles.equipmentWarning}>
        <MaterialCommunityIcons name="shield-check" size={16} color={brandColors.warning.dark} />
        <Text style={styles.equipmentWarningText}>
          Safety equipment required: {safetyStatus.requiredEquipment.join(', ')}
        </Text>
      </View>
    )}
      <WebView
        ref={webViewRef}
        source={{ html: config.html + getControlPanelHTML() }}
        style={styles.webview}
        scrollEnabled={false}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        injectedJavaScript={`
         // 1. First, inject template if specified
    ${config.template ? TemplateLoader.getTemplateCode(config.template.type) : ''}

    // 2. Set up animation features
    window.animationFeatures = ${JSON.stringify(features)};
    window.initialState = {
      temperature: ${temperature},
      zoom: ${zoom},
      speed: ${speed},
      showBefore: ${showBefore},
      rotation3D: ${rotation3D},
      particleCount: ${particleCount},
      pressure: ${pressure},
      concentration: ${concentration},
      isPlaying: ${isPlaying}
    };

  // 3. Initialize with template if available
  if (${!!config.template}) {
    const templateConfig = ${JSON.stringify(config.template?.config || {})};

    window.addEventListener('load', () => {
      switch('${config.template?.type}') {
        case 'reaction':
          window.animation = new ReactionAnimation(templateConfig);
          break;
        case 'state-change':
          window.animation = new StateChangeAnimation(templateConfig);
          break;
        case 'dissolution':
          window.animation = new DissolutionAnimation(templateConfig);
          break;
        case 'definition': // ADD THIS CASE
          window.animation = new DefinitionAnimation(templateConfig);
          break;
      }

      // Auto-play if configured
      if (window.initialState.isPlaying && window.animation && window.animation.play) {
        window.animation.play();
      }
    });
  }

  true;
`}
      />

      {/* Native Control Panel */}
      {(features.temperature || features.zoom || features.speed || features.beforeAfter) && (
        <View style={styles.controlPanel}>
          {features.temperature && (
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Temperature</Text>
              <Slider
                style={styles.slider}
                minimumValue={-100}
                maximumValue={200}
                value={temperature}
                onValueChange={handleTemperatureChange}
                minimumTrackTintColor={brandColors.primary.main}
                maximumTrackTintColor={brandColors.neutral.light}
              />
              <Text style={styles.controlValue}>{Math.round(temperature)}°C</Text>
            </View>
          )}

          {features.zoom && (
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Zoom</Text>
              <Slider
                style={styles.slider}
                minimumValue={0.5}
                maximumValue={3}
                value={zoom}
                onValueChange={handleZoomChange}
                minimumTrackTintColor={brandColors.primary.main}
                maximumTrackTintColor={brandColors.neutral.light}
              />
              <Text style={styles.controlValue}>{zoom.toFixed(1)}x</Text>
            </View>
          )}

          {features.speed && (
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Speed</Text>
              <Slider
                style={styles.slider}
                minimumValue={0.1}
                maximumValue={3}
                value={speed}
                onValueChange={handleSpeedChange}
                minimumTrackTintColor={brandColors.primary.main}
                maximumTrackTintColor={brandColors.neutral.light}
              />
              <Text style={styles.controlValue}>{speed.toFixed(1)}x</Text>
            </View>
          )}

          {features.particleCount && (
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Particles</Text>
              <Slider
                style={styles.slider}
                minimumValue={10}
                maximumValue={200}
                value={particleCount}
                onValueChange={handleParticleCountChange}
                minimumTrackTintColor={brandColors.primary.main}
                maximumTrackTintColor={brandColors.neutral.light}
              />
              <Text style={styles.controlValue}>{Math.round(particleCount)}</Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.controlButton} onPress={togglePlayPause}>
              <MaterialCommunityIcons
                name={isPlaying ? "pause" : "play"}
                size={24}
                color={brandColors.primary.main}
              />
            </TouchableOpacity>

            {features.beforeAfter && (
              <TouchableOpacity style={styles.controlButton} onPress={toggleBeforeAfter}>
                <Text style={styles.buttonText}>{showBefore ? 'Before' : 'After'}</Text>
              </TouchableOpacity>
            )}

            {features.rotation3D && (
              <TouchableOpacity style={styles.controlButton} onPress={toggle3DRotation}>
                <MaterialCommunityIcons
                  name="rotate-3d-variant"
                  size={24}
                  color={rotation3D ? brandColors.primary.main : brandColors.neutral.light}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  controlPanel: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: brandColors.neutral.lighter,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: brandColors.neutral.dark,
    width: 80,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  controlValue: {
    fontSize: 14,
    color: brandColors.neutral.main,
    width: 50,
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  controlButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: brandColors.neutral.lightest,
    borderWidth: 1,
    borderColor: brandColors.neutral.lighter,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: brandColors.primary.main,
  },
  safetyWarning: {
    backgroundColor: brandColors.danger.main,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safetyWarningText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
  },
  equipmentWarning: {
    backgroundColor: brandColors.warning.lightest,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: brandColors.warning.light,
  },
  equipmentWarningText: {
    color: brandColors.warning.dark,
    marginLeft: 5,
    fontSize: 12,
  },
});

export default ChemistryAnimation;
