import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axiosClient from '../../api/axiosClient';
import {
  getDocumentHeaders,
  getFlowchartById,
  createFlowchart,
  saveFlowchartSteps,
  cancelPendingSave,
  listProducts,
  createProduct,
  updateFlowchart,
  deleteFlowchart,
  FlowchartCreatePayload,
  FlowchartUpdatePayload,
  ProductCreatePayload,
  FlowchartStepPayload
} from '../../services/flowchartService';

// Mock the axiosClient
vi.mock('../../api/axiosClient', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

describe('flowchartService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDocumentHeaders', () => {
    it('should fetch flowchart headers with correct pagination params', async () => {
      const mockData = [{ id: 1, title: 'Flowchart 1' }];
      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getDocumentHeaders(10, 20);

      expect(axiosClient.get).toHaveBeenCalledWith('/flowcharts', {
        params: { skip: 10, limit: 20 },
      });
      expect(result).toEqual(mockData);
    });

    it('should use default pagination params if not provided', async () => {
      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: [] });
      await getDocumentHeaders();
      expect(axiosClient.get).toHaveBeenCalledWith('/flowcharts', {
        params: { skip: 0, limit: 50 },
      });
    });
  });

  describe('getFlowchartById', () => {
    it('should fetch a single flowchart by id', async () => {
      const mockData = { id: 1, title: 'Flowchart 1', steps: [] };
      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getFlowchartById(1);

      expect(axiosClient.get).toHaveBeenCalledWith('/flowcharts/1');
      expect(result).toEqual(mockData);
    });
  });

  describe('createFlowchart', () => {
    it('should create a new flowchart', async () => {
      const payload: FlowchartCreatePayload = { product_id: 1, title: 'New Flowchart' };
      const mockData = { id: 2, ...payload };
      vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockData });

      const result = await createFlowchart(payload);

      expect(axiosClient.post).toHaveBeenCalledWith('/flowcharts', payload);
      expect(result).toEqual(mockData);
    });
  });

  describe('saveFlowchartSteps', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should debounce the save and send the correct payload', async () => {
      const mockData = { id: 1, steps: [] };
      vi.mocked(axiosClient.put).mockResolvedValueOnce({ data: mockData });

      const steps: FlowchartStepPayload[] = [{ step_number: 1 }];
      
      const promise = saveFlowchartSteps(1, steps);
      
      // Should not be called immediately
      expect(axiosClient.put).not.toHaveBeenCalled();
      
      // Fast-forward time
      vi.advanceTimersByTime(2000);
      
      const result = await promise;
      
      expect(axiosClient.put).toHaveBeenCalledWith('/flowcharts/1/steps', { steps });
      expect(result).toEqual(mockData);
    });

    it('should cancel pending saves when called multiple times', async () => {
      const mockData = { id: 1, steps: [] };
      vi.mocked(axiosClient.put).mockResolvedValueOnce({ data: mockData });

      const steps1: FlowchartStepPayload[] = [{ step_number: 1 }];
      const steps2: FlowchartStepPayload[] = [{ step_number: 1 }, { step_number: 2 }];

      const promise1 = saveFlowchartSteps(1, steps1);
      
      vi.advanceTimersByTime(1000); // Wait 1s
      
      // Call again before the first debounce is complete
      const promise2 = saveFlowchartSteps(1, steps2);
      
      vi.advanceTimersByTime(2000); // Wait for the second debounce

      const result2 = await promise2;

      // The first call shouldn't have triggered the api because it was cancelled
      expect(axiosClient.put).toHaveBeenCalledTimes(1);
      expect(axiosClient.put).toHaveBeenCalledWith('/flowcharts/1/steps', { steps: steps2 });
      expect(result2).toEqual(mockData);
    });
  });

  describe('cancelPendingSave', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should cancel the timeout so no API call is made', () => {
      saveFlowchartSteps(1, []);
      cancelPendingSave();
      
      vi.advanceTimersByTime(2500);
      
      expect(axiosClient.put).not.toHaveBeenCalled();
    });
  });

  describe('listProducts', () => {
    it('should fetch the list of products', async () => {
      const mockData = [{ id: 1, customer_name: 'Customer A' }];
      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await listProducts();

      expect(axiosClient.get).toHaveBeenCalledWith('/flowcharts/products');
      expect(result).toEqual(mockData);
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const payload: ProductCreatePayload = { customer_name: 'Customer B', part_number: '123' };
      const mockData = { id: 2, ...payload };
      vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockData });

      const result = await createProduct(payload);

      expect(axiosClient.post).toHaveBeenCalledWith('/flowcharts/products', payload);
      expect(result).toEqual(mockData);
    });
  });

  describe('updateFlowchart', () => {
    it('should update a flowchart with the given payload', async () => {
      const payload: FlowchartUpdatePayload = { title: 'Updated Title' };
      const mockData = { id: 1, title: 'Updated Title' };
      vi.mocked(axiosClient.put).mockResolvedValueOnce({ data: mockData });

      const result = await updateFlowchart(1, payload);

      expect(axiosClient.put).toHaveBeenCalledWith('/flowcharts/1', payload);
      expect(result).toEqual(mockData);
    });
  });

  describe('deleteFlowchart', () => {
    it('should delete a flowchart', async () => {
      vi.mocked(axiosClient.delete).mockResolvedValueOnce({ data: null });

      await deleteFlowchart(1);

      expect(axiosClient.delete).toHaveBeenCalledWith('/flowcharts/1');
    });
  });
});
