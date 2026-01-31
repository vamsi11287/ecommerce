const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Restaurant Order Management API',
            version: '1.0.0',
            description: 'A comprehensive restaurant order management system with real-time updates using Socket.io',
            contact: {
                name: 'API Support',
                email: 'support@restaurant.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    required: ['username', 'password', 'role'],
                    properties: {
                        id: {
                            type: 'string',
                            description: 'User ID'
                        },
                        username: {
                            type: 'string',
                            description: 'Username'
                        },
                        password: {
                            type: 'string',
                            description: 'Password (hashed)'
                        },
                        role: {
                            type: 'string',
                            enum: ['owner', 'staff', 'kitchen'],
                            description: 'User role'
                        },
                        email: {
                            type: 'string',
                            description: 'User email'
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'Account active status'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                Order: {
                    type: 'object',
                    required: ['customerName', 'items'],
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Order ID'
                        },
                        orderId: {
                            type: 'string',
                            description: 'Unique order number (e.g., ORD-00001)'
                        },
                        customerName: {
                            type: 'string',
                            description: 'Customer name'
                        },
                        items: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    menuItemId: {
                                        type: 'string',
                                        description: 'Menu item ID'
                                    },
                                    name: {
                                        type: 'string',
                                        description: 'Item name'
                                    },
                                    price: {
                                        type: 'number',
                                        description: 'Item price'
                                    },
                                    quantity: {
                                        type: 'number',
                                        description: 'Quantity'
                                    }
                                }
                            }
                        },
                        totalAmount: {
                            type: 'number',
                            description: 'Total order amount'
                        },
                        status: {
                            type: 'string',
                            enum: ['PENDING', 'STARTED', 'COMPLETED', 'READY'],
                            description: 'Order status'
                        },
                        createdBy: {
                            type: 'string',
                            description: 'User ID who created the order'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                MenuItem: {
                    type: 'object',
                    required: ['name', 'price', 'category'],
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Menu item ID'
                        },
                        name: {
                            type: 'string',
                            description: 'Item name'
                        },
                        description: {
                            type: 'string',
                            description: 'Item description'
                        },
                        price: {
                            type: 'number',
                            description: 'Item price'
                        },
                        category: {
                            type: 'string',
                            description: 'Item category'
                        },
                        imageUrl: {
                            type: 'string',
                            description: 'Image URL'
                        },
                        isAvailable: {
                            type: 'boolean',
                            description: 'Availability status'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                Settings: {
                    type: 'object',
                    properties: {
                        key: {
                            type: 'string',
                            description: 'Setting key'
                        },
                        value: {
                            type: 'object',
                            description: 'Setting value'
                        },
                        description: {
                            type: 'string',
                            description: 'Setting description'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            description: 'Error message'
                        },
                        error: {
                            type: 'string',
                            description: 'Detailed error'
                        }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        message: {
                            type: 'string',
                            description: 'Success message'
                        },
                        data: {
                            type: 'object',
                            description: 'Response data'
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./src/routes/*.js'] // Path to API routes
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
