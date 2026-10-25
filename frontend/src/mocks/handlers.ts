
import { http, HttpResponse } from 'msw';
import { mockNfts, mockCartItems, mockUser } from './fixtures';

export const handlers = [

  http.get('/api/nfts', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');

    let result = [...mockNfts];
    if (category) {
      result = result.filter(n => n.category === category);
    }
    if (search) {
      result = result.filter(n => n.name.toLowerCase().includes(search.toLowerCase()));
    }

    return HttpResponse.json({
      data: result,
      total: result.length,
      page: 1,
      pageCount: Math.ceil(result.length / 9)
    });
  }),

  http.get('/api/nfts/:id', ({ params }) => {
    const { id } = params;
    const nft = mockNfts.find(n => n.id === Number(id));
    if (!nft) {
      return new HttpResponse(JSON.stringify({ message: 'NFT não encontrado' }), { status: 404 });
    }
    return HttpResponse.json(nft);
  }),


  http.get('/api/cart', () => {
    return HttpResponse.json(mockCartItems);
  }),

  http.post('/api/cart', async ({ request }) => {
    const body = await request.json() as any;
    mockCartItems.push(body);
    return HttpResponse.json(mockCartItems, { status: 201 });
  }),

  http.get('/api/auth/session', () => {
    return HttpResponse.json({ user: mockUser });
  }),

  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as any;
    if (body.email === 'erro@email.com') {
      return new HttpResponse(JSON.stringify({ message: 'Credenciais inválidas' }), { status: 401 });
    }
    return HttpResponse.json({ token: 'mock-jwt-token', user: mockUser });
  }),

  http.post('/api/orders', async ({ request }) => {
    const idempotencyKey = request.headers.get('x-idempotency-key');
    if (!idempotencyKey) {
      return new HttpResponse(JSON.stringify({ message: 'Chave de idempotência ausente' }), { status: 400 });
    }

    const body = await request.json() as any;
    const orderId = `DEMO-${Math.floor(Math.random() * 100000)}`;

    return HttpResponse.json({
      orderId,
      status: 'confirmed',
      items: body.items,
      total: body.total,
      txHash: '0xA91F_E82C',
      date: new Date().toISOString()
    }, { status: 201 });
  })
];