// src/data/animations/ChemistryAnimation.tsx
import React, { useRef, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import Slider from '@react-native-community/slider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAnimation } from './animationRegistry';
import { AnimationType } from './types';
import { useTheme, useThemedStyles } from '@/lib/ThemeContext';
import { createShadow } from '@/lib/designSystem';
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
  const { theme } = useTheme();
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

  // Safety checks
  const [safetyStatus, setSafetyStatus] = useState<SafetyStatus>({
    isSafe: true,
    warnings: [],
    requiredEquipment: []
  });

  // Send control updates to WebView
  const sendControlUpdate = (controlType: string, value: any) => {
    webViewRef.current?.postMessage(JSON.stringify({
      type: 'controlUpdate',
      control: controlType,
      value: value
    }));
  };

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

  // Generate control panel HTML with theme colors
  const getControlPanelHTML = () => {
    return `
      <style>
        .control-panel {
          position: absolute;
          bottom: 10px;
          left: 10px;
          right: 10px;
          background: ${theme.colors.surface};
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border: 1px solid ${theme.colors.outlineVariant};
        }
        .control-row {
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .control-label {
          font-size: 12px;
          color: ${theme.colors.onSurface};
          font-weight: 500;
          min-width: 80px;
        }
        .control-value {
          font-size: 12px;
          color: ${theme.colors.onSurfaceVariant};
          min-width: 40px;
          text-align: right;
        }
      </style>
    `;
  };

  const styles = useThemedStyles((theme) => ({
    container: {
      width: '100%',
      marginVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.xl,
      overflow: 'hidden',
      backgroundColor: theme.colors.surfaceVariant,
    },
    webview: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    safetyWarning: {
      backgroundColor: theme.colors.error,
      padding: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    safetyWarningText: {
      color: theme.colors.onError || '#ffffff',
      marginLeft: theme.spacing.xs,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
    },
    equipmentWarning: {
      backgroundColor: theme.colors.warning + '20',
      padding: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.warning + '40',
    },
    equipmentWarningText: {
      color: theme.colors.warning,
      marginLeft: theme.spacing.xs,
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.medium,
    },
    controlPanel: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
      ...createShadow(2),
    },
    controlRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    controlLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.onSurface,
      width: 80,
    },
    slider: {
      flex: 1,
      height: 40,
      marginHorizontal: theme.spacing.sm,
    },
    controlValue: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.onSurfaceVariant,
      width: 50,
      textAlign: 'right',
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: theme.spacing.md,
      marginTop: theme.spacing.sm,
    },
    controlButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      flexDirection: 'row',
      alignItems: 'center',
      ...createShadow(1),
    },
    controlButtonActive: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
    },
    buttonText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.onSurfaceVariant,
    },
    buttonTextActive: {
      color: theme.colors.primary,
    },
  }));

  return (
    <View style={[styles.container, { height: finalHeight + (features.temperature || features.zoom || features.speed ? 120 : 0) }, style]}>
      {/* Safety Warning */}
      {!safetyStatus.isSafe && (
        <View style={styles.safetyWarning}>
          <MaterialCommunityIcons name="alert-circle" size={20} color={theme.colors.onError || '#ffffff'} />
          <Text style={styles.safetyWarningText}>
            {safetyStatus.warnings.join(' • ')}
          </Text>
        </View>
      )}

      {/* Equipment Reminder */}
      {safetyStatus.requiredEquipment.length > 0 && (
        <View style={styles.equipmentWarning}>
          <MaterialCommunityIcons name="shield-check" size={16} color={theme.colors.warning} />
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
                case 'definition':
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
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.outlineVariant}
                thumbTintColor={theme.colors.primary}
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
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.outlineVariant}
                thumbTintColor={theme.colors.primary}
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
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.outlineVariant}
                thumbTintColor={theme.colors.primary}
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
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.outlineVariant}
                thumbTintColor={theme.colors.primary}
              />
              <Text style={styles.controlValue}>{Math.round(particleCount)}</Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                isPlaying && styles.controlButtonActive
              ]}
              onPress={togglePlayPause}
            >
              <MaterialCommunityIcons
                name={isPlaying ? "pause" : "play"}
                size={24}
                color={isPlaying ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>

            {features.beforeAfter && (
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  !showBefore && styles.controlButtonActive
                ]}
                onPress={toggleBeforeAfter}
              >
                <Text style={[
                  styles.buttonText,
                  !showBefore && styles.buttonTextActive
                ]}>
                  {showBefore ? 'Before' : 'After'}
                </Text>
              </TouchableOpacity>
            )}

            {features.rotation3D && (
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  rotation3D && styles.controlButtonActive
                ]}
                onPress={toggle3DRotation}
              >
                <MaterialCommunityIcons
                  name="rotate-3d-variant"
                  size={24}
                  color={rotation3D ? theme.colors.primary : theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default ChemistryAnimation;
