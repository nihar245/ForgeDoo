import { api } from './index.js';

const analyticsAPI = {
  async getDashboard() {
    try {
      const response = await api.get('/analytics/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw error;
    }
  },

  async getThroughput(startDate, endDate, granularity = 'day') {
    try {
      const response = await api.get('/analytics/throughput', {
        params: {
          start: startDate,
          end: endDate,
          granularity
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching throughput analytics:', error);
      throw error;
    }
  },

  async getCycleTime(startDate, endDate) {
    try {
      const response = await api.get('/analytics/cycle-time', {
        params: {
          start: startDate,
          end: endDate
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching cycle time analytics:', error);
      throw error;
    }
  }
};

export default analyticsAPI;