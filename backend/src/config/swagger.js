const swaggerJsdoc = require('swagger-jsdoc');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'TerFer API',
        version: '1.0.0',
        description: 'REST API documentation for TerFer (users, products, orders)',
    },
    servers: [
        {
            url: 'http://localhost:5000',
            description: 'Local development server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            User: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    role: { type: 'string', enum: ['customer', 'seller', 'admin'] },
                    phone: { type: 'string' },
                    avatar: { type: 'string' },
                    shopName: { type: 'string' },
                    shopDescription: { type: 'string' },
                    token: { type: 'string' },
                },
            },
            Address: {
                type: 'object',
                properties: {
                    fullName: { type: 'string' },
                    phone: { type: 'string' },
                    address: { type: 'string' },
                    city: { type: 'string' },
                    postalCode: { type: 'string' },
                    country: { type: 'string' },
                    isDefault: { type: 'boolean' },
                },
            },
            Product: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    price: { type: 'number' },
                    images: {
                        type: 'array',
                        items: { type: 'string' },
                    },
                    category: { type: 'string' },
                    subcategory: { type: 'string' },
                    brand: { type: 'string' },
                    stock: { type: 'number' },
                    seller: { type: 'string' },
                    shop: { type: 'string' },
                    rating: { type: 'number' },
                    numReviews: { type: 'number' },
                },
            },
            OrderItem: {
                type: 'object',
                properties: {
                    product: { type: 'string' },
                    name: { type: 'string' },
                    quantity: { type: 'integer' },
                    price: { type: 'number' },
                    image: { type: 'string' },
                    seller: { type: 'string' },
                    shop: { type: 'string' },
                },
            },
            Order: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    orderNumber: { type: 'string' },
                    user: { type: 'string' },
                    items: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/OrderItem' },
                    },
                    shippingAddress: { $ref: '#/components/schemas/Address' },
                    paymentMethod: { type: 'string', enum: ['COD', 'Card', 'PayPal'] },
                    paymentStatus: { type: 'string' },
                    subtotal: { type: 'number' },
                    shippingCost: { type: 'number' },
                    total: { type: 'number' },
                    status: {
                        type: 'string',
                        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
                    },
                },
            },
        },
    },
    security: [
        {
            bearerAuth: [],
        },
    ],
    paths: {
        '/': {
            get: {
                tags: ['Health'],
                summary: 'Health check',
                responses: {
                    200: {
                        description: 'API is running',
                    },
                },
            },
        },
        '/api/users/register': {
            post: {
                tags: ['Users'],
                summary: 'Register a new user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'email', 'password'],
                                properties: {
                                    name: { type: 'string' },
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string', minLength: 6 },
                                    role: { type: 'string', enum: ['customer', 'seller'] },
                                    shopName: { type: 'string' },
                                    shopDescription: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'User created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/User' },
                            },
                        },
                    },
                    400: { description: 'User already exists or invalid data' },
                },
            },
        },
        '/api/users/login': {
            post: {
                tags: ['Users'],
                summary: 'Login user and get JWT token',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Authenticated user with token',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/User' },
                            },
                        },
                    },
                    401: { description: 'Invalid credentials' },
                },
            },
        },
        '/api/users/profile': {
            get: {
                tags: ['Users'],
                summary: 'Get current user profile',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'User profile',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/User' },
                            },
                        },
                    },
                    401: { description: 'Unauthorized' },
                },
            },
            put: {
                tags: ['Users'],
                summary: 'Update current user profile',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    email: { type: 'string', format: 'email' },
                                    phone: { type: 'string' },
                                    avatar: { type: 'string' },
                                    password: { type: 'string' },
                                    shopName: { type: 'string' },
                                    shopDescription: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Updated user',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/User' },
                            },
                        },
                    },
                    401: { description: 'Unauthorized' },
                },
            },
        },
        '/api/users/addresses': {
            post: {
                tags: ['Users'],
                summary: 'Add a new address for current user',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Address' },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Address list after creation',
                    },
                    401: { description: 'Unauthorized' },
                },
            },
        },
        '/api/users/addresses/{addressId}': {
            put: {
                tags: ['Users'],
                summary: 'Update an address of current user',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'addressId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Address' },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Updated addresses list',
                    },
                    401: { description: 'Unauthorized' },
                    404: { description: 'Address or user not found' },
                },
            },
            delete: {
                tags: ['Users'],
                summary: 'Delete an address of current user',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'addressId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    200: { description: 'Address deleted successfully' },
                    401: { description: 'Unauthorized' },
                    404: { description: 'Address or user not found' },
                },
            },
        },
        '/api/users/wishlist/{productId}': {
            post: {
                tags: ['Users'],
                summary: 'Toggle product in wishlist',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'productId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    200: {
                        description: 'Wishlist updated',
                    },
                    401: { description: 'Unauthorized' },
                    404: { description: 'User not found' },
                },
            },
        },
        '/api/users/seller/{id}': {
            get: {
                tags: ['Users'],
                summary: 'Get public seller info',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    200: {
                        description: 'Seller info',
                    },
                    404: { description: 'Seller not found' },
                },
            },
        },
        '/api/products': {
            get: {
                tags: ['Products'],
                summary: 'Get products with filters',
                parameters: [
                    { name: 'category', in: 'query', schema: { type: 'string' } },
                    { name: 'search', in: 'query', schema: { type: 'string' } },
                    { name: 'minPrice', in: 'query', schema: { type: 'number' } },
                    { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
                    { name: 'seller', in: 'query', schema: { type: 'string' } },
                    { name: 'sort', in: 'query', schema: { type: 'string' } },
                    { name: 'page', in: 'query', schema: { type: 'integer' } },
                    { name: 'limit', in: 'query', schema: { type: 'integer' } },
                ],
                responses: {
                    200: {
                        description: 'List of products with pagination',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        products: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/Product' },
                                        },
                                        page: { type: 'integer' },
                                        pages: { type: 'integer' },
                                        total: { type: 'integer' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Products'],
                summary: 'Create a new product (seller only)',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'description', 'price', 'images', 'category', 'stock', 'shop'],
                                properties: {
                                    name: { type: 'string' },
                                    description: { type: 'string' },
                                    price: { type: 'number' },
                                    images: {
                                        type: 'array',
                                        items: { type: 'string' },
                                    },
                                    category: { type: 'string' },
                                    subcategory: { type: 'string' },
                                    brand: { type: 'string' },
                                    stock: { type: 'number' },
                                    shop: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Product created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Product' },
                            },
                        },
                    },
                    401: { description: 'Unauthorized' },
                    403: { description: 'Not authorized as seller' },
                },
            },
        },
        '/api/products/category/{category}': {
            get: {
                tags: ['Products'],
                summary: 'Get products by category',
                parameters: [
                    {
                        name: 'category',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    200: {
                        description: 'List of products in category',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Product' },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/products/{id}': {
            get: {
                tags: ['Products'],
                summary: 'Get product by ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    200: {
                        description: 'Product object',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Product' },
                            },
                        },
                    },
                    404: { description: 'Product not found' },
                },
            },
            put: {
                tags: ['Products'],
                summary: 'Update a product (seller or admin)',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'Updated product' },
                    401: { description: 'Unauthorized' },
                    403: { description: 'Not authorized to update this product' },
                    404: { description: 'Product not found' },
                },
            },
            delete: {
                tags: ['Products'],
                summary: 'Delete a product (seller or admin)',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    200: { description: 'Product deleted successfully' },
                    401: { description: 'Unauthorized' },
                    403: { description: 'Not authorized to delete this product' },
                    404: { description: 'Product not found' },
                },
            },
        },
        '/api/products/{id}/reviews': {
            post: {
                tags: ['Products'],
                summary: 'Create a review for a product',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['rating', 'comment'],
                                properties: {
                                    rating: { type: 'number', minimum: 1, maximum: 5 },
                                    comment: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: 'Review added successfully' },
                    400: { description: 'Product already reviewed or invalid data' },
                    401: { description: 'Unauthorized' },
                    404: { description: 'Product not found' },
                },
            },
        },
        '/api/orders': {
            post: {
                tags: ['Orders'],
                summary: 'Create a new order',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['items', 'shippingAddress', 'paymentMethod'],
                                properties: {
                                    items: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/OrderItem' },
                                    },
                                    shippingAddress: { $ref: '#/components/schemas/Address' },
                                    paymentMethod: {
                                        type: 'string',
                                        enum: ['COD', 'Card', 'PayPal'],
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Order created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Order' },
                            },
                        },
                    },
                    400: { description: 'No order items or invalid data' },
                    401: { description: 'Unauthorized' },
                },
            },
        },
        '/api/orders/myorders': {
            get: {
                tags: ['Orders'],
                summary: 'Get orders of current user',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'List of user orders',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Order' },
                                },
                            },
                        },
                    },
                    401: { description: 'Unauthorized' },
                },
            },
        },
        '/api/orders/seller/myorders': {
            get: {
                tags: ['Orders'],
                summary: 'Get orders for current seller',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'List of seller orders',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Order' },
                                },
                            },
                        },
                    },
                    401: { description: 'Unauthorized' },
                    403: { description: 'Not authorized as seller' },
                },
            },
        },
        '/api/orders/all': {
            get: {
                tags: ['Orders'],
                summary: 'Get all orders (admin only)',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'List of all orders',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Order' },
                                },
                            },
                        },
                    },
                    401: { description: 'Unauthorized' },
                    403: { description: 'Not authorized as admin' },
                },
            },
        },
        '/api/orders/number/{orderNumber}': {
            get: {
                tags: ['Orders'],
                summary: 'Get order by order number',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'orderNumber',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    200: {
                        description: 'Order object',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Order' },
                            },
                        },
                    },
                    401: { description: 'Unauthorized' },
                    403: { description: 'Not authorized to view this order' },
                    404: { description: 'Order not found' },
                },
            },
        },
        '/api/orders/{id}': {
            get: {
                tags: ['Orders'],
                summary: 'Get order by ID',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    200: {
                        description: 'Order object',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Order' },
                            },
                        },
                    },
                    401: { description: 'Unauthorized' },
                    403: { description: 'Not authorized to view this order' },
                    404: { description: 'Order not found' },
                },
            },
        },
        '/api/orders/{id}/status': {
            put: {
                tags: ['Orders'],
                summary: 'Update order status (seller/admin)',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['status'],
                                properties: {
                                    status: {
                                        type: 'string',
                                        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
                                    },
                                    note: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'Updated order' },
                    401: { description: 'Unauthorized' },
                    403: { description: 'Not authorized as seller/admin' },
                    404: { description: 'Order not found' },
                },
            },
        },
        '/api/orders/{id}/cancel': {
            put: {
                tags: ['Orders'],
                summary: 'Cancel order (customer)',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                requestBody: {
                    required: false,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    reason: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'Cancelled order' },
                    400: { description: 'Order already shipped or delivered' },
                    401: { description: 'Unauthorized' },
                    403: { description: 'Not authorized to cancel this order' },
                    404: { description: 'Order not found' },
                },
            },
        },
    },
};

const swaggerOptions = {
    swaggerDefinition,
    apis: [], // no JSDoc scanning for now; we define paths above
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;

