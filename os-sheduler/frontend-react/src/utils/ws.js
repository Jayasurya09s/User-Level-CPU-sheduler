/**
 * WebSocket client for real-time scheduler events
 * Manages WebSocket connection and message routing
 */

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';

class WebSocketClient {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectTimeout = null;
    this.reconnectDelay = 3000;
    this.isIntentionallyClosed = false;
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    this.isIntentionallyClosed = false;
    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.notifyListeners('connection', { status: 'connected' });
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.notifyListeners('error', { error });
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.notifyListeners('connection', { status: 'disconnected' });
      
      // Attempt to reconnect unless intentionally closed
      if (!this.isIntentionallyClosed) {
        this.scheduleReconnect();
      }
    };
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    this.isIntentionallyClosed = true;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      console.log('Attempting to reconnect WebSocket...');
      this.connect();
    }, this.reconnectDelay);
  }

  /**
   * Handle incoming WebSocket message
   */
  handleMessage(message) {
    const { type, run_id } = message;

    // Notify type-specific listeners
    this.notifyListeners(type, message);

    // Notify run-specific listeners
    if (run_id) {
      this.notifyListeners(`run:${run_id}`, message);
    }

    // Notify all listeners
    this.notifyListeners('*', message);
  }

  /**
   * Add a listener for specific message types
   * @param {string} event - Event type ('event', 'stderr', 'run_finished', 'run_killed', 'run:RUN_ID', '*')
   * @param {function} callback - Callback function
   * @returns {function} Unsubscribe function
   */
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  /**
   * Notify all listeners for a specific event
   */
  notifyListeners(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Send a message to the server
   */
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Cannot send message:', message);
    }
  }

  /**
   * Get connection status
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
const wsClient = new WebSocketClient();

export default wsClient;
