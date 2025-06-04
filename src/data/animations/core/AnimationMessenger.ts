// src/data/animations/core/AnimationMessenger.ts
export interface MessageHandler {
  onControlUpdate?: (control: string, value: any) => void;
  onAnimationComplete?: () => void;
  onStateUpdate?: (state: any) => void;
  onError?: (error: string) => void;
  onReady?: () => void;
}

export interface AnimationMessage {
  type: 'controlUpdate' | 'animationComplete' | 'stateUpdate' | 'error' | 'ready';
  control?: string;
  value?: any;
  state?: any;
  error?: string;
  payload?: any;
}

export class AnimationMessenger {
  private static instance: AnimationMessenger;
  private handlers: Map<string, MessageHandler> = new Map();
  private messageQueue: AnimationMessage[] = [];
  private isReady = false;

  static getInstance(): AnimationMessenger {
    if (!AnimationMessenger.instance) {
      AnimationMessenger.instance = new AnimationMessenger();
    }
    return AnimationMessenger.instance;
  }

  /**
   * Register a message handler for an animation
   */
  register(animationId: string, handler: MessageHandler): void {
    this.handlers.set(animationId, handler);

    // Process any queued messages for this animation
    this.processQueuedMessages(animationId);
  }

  /**
   * Unregister a message handler
   */
  unregister(animationId: string): void {
    this.handlers.delete(animationId);
  }

  /**
   * Send a control update to WebView
   */
  sendControl(control: string, value: any): string {
    const message = JSON.stringify({
      type: 'controlUpdate',
      control,
      value,
      timestamp: Date.now()
    });

    return this.getInjectedScript(message);
  }

  /**
   * Send action to WebView (like restart)
   */
  sendAction(action: string, data?: any): string {
    const message = JSON.stringify({
      type: 'action',
      action,
      data,
      timestamp: Date.now()
    });

    return this.getInjectedScript(message);
  }

  /**
   * Handle incoming message from WebView
   */
  handleMessage(animationId: string, messageData: string): void {
    try {
      const message: AnimationMessage = JSON.parse(messageData);
      const handler = this.handlers.get(animationId);

      if (!handler) {
        // Queue message if handler not ready
        this.messageQueue.push({ ...message, animationId } as any);
        return;
      }

      switch (message.type) {
        case 'controlUpdate':
          handler.onControlUpdate?.(message.control!, message.value);
          break;
        case 'animationComplete':
          handler.onAnimationComplete?.();
          break;
        case 'stateUpdate':
          handler.onStateUpdate?.(message.state);
          break;
        case 'error':
          handler.onError?.(message.error || 'Unknown error');
          break;
        case 'ready':
          this.isReady = true;
          handler.onReady?.();
          break;
      }
    } catch (error) {
      const handler = this.handlers.get(animationId);
      handler?.onError?.(`Message parsing error: ${error}`);
    }
  }

  /**
   * Get the JavaScript code to inject into WebView
   */
  private getInjectedScript(message: string): string {
    return `
      (function() {
        try {
          if (window.handleExternalMessage) {
            window.handleExternalMessage(${message});
          } else {
            // Queue the message if handler not ready
            window.messageQueue = window.messageQueue || [];
            window.messageQueue.push(${message});
          }
        } catch (e) {
          console.error('Animation message error:', e);
        }
      })();
      true;
    `;
  }

  /**
   * Process any queued messages for a specific animation
   */
  private processQueuedMessages(animationId: string): void {
    const queuedMessages = this.messageQueue.filter(
      (msg: any) => msg.animationId === animationId
    );

    queuedMessages.forEach(message => {
      this.handleMessage(animationId, JSON.stringify(message));
    });

    // Remove processed messages
    this.messageQueue = this.messageQueue.filter(
      (msg: any) => msg.animationId !== animationId
    );
  }

  /**
   * Generate the base message handling script for WebView
   */
  static getBaseMessageScript(): string {
    return `
      <script>
        // Message handling setup
        window.messageQueue = window.messageQueue || [];

        // Handle external messages from React Native
        window.handleExternalMessage = function(message) {
          const data = message;

          if (data.type === 'controlUpdate') {
            if (window.handleControlUpdate) {
              window.handleControlUpdate(data.control, data.value);
            }
          } else if (data.type === 'action') {
            if (data.action === 'restart' && window.restartAnimation) {
              window.restartAnimation();
            } else if (data.action === 'play' && window.playAnimation) {
              window.playAnimation();
            } else if (data.action === 'pause' && window.pauseAnimation) {
              window.pauseAnimation();
            }
          }
        };

        // Process any queued messages
        window.addEventListener('load', function() {
          if (window.messageQueue && window.messageQueue.length > 0) {
            window.messageQueue.forEach(function(message) {
              window.handleExternalMessage(message);
            });
            window.messageQueue = [];
          }

          // Notify React Native that animation is ready
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'ready',
              timestamp: Date.now()
            }));
          }
        });

        // Send messages back to React Native
        window.sendMessageToReactNative = function(type, data) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: type,
              ...data,
              timestamp: Date.now()
            }));
          }
        };

        // Global error handler
        window.addEventListener('error', function(event) {
          window.sendMessageToReactNative('error', {
            error: event.error?.message || event.message || 'Unknown error',
            filename: event.filename,
            lineno: event.lineno
          });
        });
      </script>
    `;
  }
}
