import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('http://localhost:5000/api/products', () => {
    return HttpResponse.json({
      products: [
        { id: 1, name: 'Mock Shirt', price: 19.99, imageUrl: null },
        { id: 2, name: 'Mock Shorts', price: 15.99, imageUrl: null },
      ],
      total: 2,
      page: 1,
      totalPages: 1,
    });
  }),
  http.get('http://localhost:5000/api/categories', () => {
    return HttpResponse.json([
      { id: 1, name: 'Shirts' },
      { id: 2, name: 'Shorts' },
    ]);
  }),
];