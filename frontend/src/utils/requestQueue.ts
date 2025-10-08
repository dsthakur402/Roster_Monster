interface QueuedRequest {
  url: string;
  options: RequestInit;
  resolve: (value: Response | PromiseLike<Response>) => void;
  reject: (reason?: any) => void;
}

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private isRefreshing = false;

  public async enqueue(url: string, options: RequestInit): Promise<Response> {
    return new Promise((resolve, reject) => {
      this.queue.push({ url, options, resolve, reject });
      
      if (!this.isRefreshing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.queue.length === 0) {
      return;
    }

    this.isRefreshing = true;

    try {
      // Process all requests in the queue
      const requests = [...this.queue];
      this.queue = [];

      for (const request of requests) {
        try {
          const response = await fetch(request.url, request.options);
          request.resolve(response);
        } catch (error) {
          request.reject(error);
        }
      }
    } finally {
      this.isRefreshing = false;
      
      // Process any new requests that were added while processing
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }
  }
}

export const requestQueue = new RequestQueue(); 