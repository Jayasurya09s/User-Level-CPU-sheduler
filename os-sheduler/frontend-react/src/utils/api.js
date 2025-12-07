/**
 * API client for CPU Scheduler backend
 * Handles all REST API communications
 */

import axios from 'axios';

// Base URL for the backend API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Start a new scheduling run
 * @param {object} params - { algorithm, args, meta: { workload_json } }
 */
export async function startRun(params) {
  const response = await api.post('/runs/start', params);
  return response.data;
}

/**
 * Stop a running simulation
 * @param {string} runId - The run ID to stop
 */
export async function stopRun(runId) {
  const response = await api.post(`/runs/${runId}/stop`);
  return response.data;
}

/**
 * Get all runs
 */
export async function getAllRuns() {
  const response = await api.get('/runs');
  return response.data;
}

/**
 * Get a specific run by ID
 * @param {string} runId - The run ID
 */
export async function getRun(runId) {
  const response = await api.get(`/runs/${runId}`);
  return response.data;
}

/**
 * Get all events for a run
 * @param {string} runId - The run ID
 */
export async function getRunEvents(runId) {
  const response = await api.get(`/runs/${runId}/events`);
  return response.data;
}

/**
 * Get summary for a run
 * @param {string} runId - The run ID
 */
export async function getRunSummary(runId) {
  const response = await api.get(`/runs/${runId}/summary`);
  return response.data;
}

/**
 * Delete a run
 * @param {string} runId - The run ID to delete
 */
export async function deleteRun(runId) {
  const response = await api.delete(`/runs/${runId}`);
  return response.data;
}

/**
 * Duplicate a run (start a new run with same configuration)
 * @param {string} runId - The run ID to duplicate
 */
export async function duplicateRun(runId) {
  // Get the original run details
  const originalRun = await getRun(runId);
  
  // Start a new run with the same parameters
  return startRun({
    algorithm: originalRun.algorithm,
    args: originalRun.args,
    meta: originalRun.meta
  });
}

export default api;
