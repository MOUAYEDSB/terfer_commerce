const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const connectDB = require('./config/db');

dotenv.config();

const users = [
    {
        name: 'Admin User',
        email: 'admin@terfer.tn',
        password: 'admin123',
        role: 'admin'
    },
    {
        name: 'Mohamed Seller',
        email: 'mohamed@seller.tn',
        password: 'seller123',
        role: 'seller',
        shopName: 'Moda Tunis',
        shopDescription: 'Boutique de mode tendance à Tunis',
        isVerifiedSeller: true
    },
    {
        name: 'Sarah Seller',
        email: 'sarah@seller.tn',
        password: 'seller123',
        role: 'seller',
        shopName: 'Tech Store',
        shopDescription: 'Votre destination high-tech',
        isVerifiedSeller: true
    },
    {
        name: 'John Doe',
        email: 'john@customer.tn',
        password: 'customer123',
        role: 'customer',
        phone: '+216 12 345 678',
        addresses: [{
            fullName: 'John Doe',
            phone: '+216 12 345 678',
            address: '123 Rue de la République',
            city: 'Tunis',
            postalCode: '1001',
            isDefault: true
        }]
    }
];

const products = [
    {
        name: 'T-shirt Vintage Premium',
        description: 'T-shirt en coton bio, coupe vintage, disponible en plusieurs couleurs. Parfait pour un look décontracté et tendance.',
        price: 45,
        oldPrice: 60,
        wholesalePrice: 35,
        images: [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1503341504253-dff4815485f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        category: 'Mode',
        brand: 'Vintage Co',
        colors: ['Noir', 'Blanc', 'Bleu'],
        sizes: ['S', 'M', 'L', 'XL'],
        variants: [
            { color: 'Noir', size: 'S', quantity: 5 }, { color: 'Noir', size: 'M', quantity: 8 }, { color: 'Noir', size: 'L', quantity: 6 }, { color: 'Noir', size: 'XL', quantity: 3 },
            { color: 'Blanc', size: 'S', quantity: 4 }, { color: 'Blanc', size: 'M', quantity: 7 }, { color: 'Blanc', size: 'L', quantity: 5 }, { color: 'Blanc', size: 'XL', quantity: 2 },
            { color: 'Bleu', size: 'S', quantity: 3 }, { color: 'Bleu', size: 'M', quantity: 4 }, { color: 'Bleu', size: 'L', quantity: 3 }, { color: 'Bleu', size: 'XL', quantity: 4 }
        ],
        stock: 50,
        rating: 4.5,
        numReviews: 12
    },
    {
        name: 'Casque Audio Pro',
        description: 'Casque audio sans fil avec réduction de bruit active, autonomie 30h, son haute fidélité.',
        price: 120,
        oldPrice: 150,
        wholesalePrice: 95,
        images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        category: 'High-Tech',
        brand: 'AudioPro',
        stock: 30,
        rating: 4.8,
        numReviews: 25
    },
    {
        name: 'Lampe Bois Artisanale',
        description: 'Lampe de table en bois naturel, design minimaliste, fabriquée à la main par des artisans locaux.',
        price: 85,
        oldPrice: 110,
        wholesalePrice: 70,
        images: [
            'https://images.unsplash.com/photo-1513506003013-680c08528edc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        category: 'Maison',
        brand: 'Art Deco',
        stock: 15,
        rating: 4.9,
        numReviews: 8
    },
    {
        name: 'Montre Classique',
        description: 'Montre élégante avec bracelet en cuir véritable, mouvement quartz, étanche 50m.',
        price: 250,
        oldPrice: 320,
        wholesalePrice: 200,
        images: [
            'https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        category: 'Bijoux',
        brand: 'Luxury Time',
        stock: 20,
        rating: 4.7,
        numReviews: 15
    },
    {
        name: 'Baskets Urbaines',
        description: 'Sneakers confortables pour un style urbain, semelle amortissante, design moderne.',
        price: 180,
        oldPrice: 220,
        wholesalePrice: 150,
        images: [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        category: 'Mode',
        brand: 'Street Wear',
        colors: ['Noir', 'Blanc', 'Gris'],
        sizes: ['39', '40', '41', '42', '43', '44'],
        variants: [
            { color: 'Noir', size: '39', quantity: 2 }, { color: 'Noir', size: '40', quantity: 4 }, { color: 'Noir', size: '41', quantity: 3 }, { color: 'Noir', size: '42', quantity: 5 }, { color: 'Noir', size: '43', quantity: 3 }, { color: 'Noir', size: '44', quantity: 2 },
            { color: 'Blanc', size: '39', quantity: 1 }, { color: 'Blanc', size: '40', quantity: 3 }, { color: 'Blanc', size: '41', quantity: 2 }, { color: 'Blanc', size: '42', quantity: 4 }, { color: 'Blanc', size: '43', quantity: 2 }, { color: 'Blanc', size: '44', quantity: 1 },
            { color: 'Gris', size: '40', quantity: 2 }, { color: 'Gris', size: '41', quantity: 2 }, { color: 'Gris', size: '42', quantity: 2 }
        ],
        stock: 40,
        rating: 4.6,
        numReviews: 20
    },
    {
        name: 'Plante d\'intérieur',
        description: 'Monstera Deliciosa en pot céramique, plante facile d\'entretien, purifie l\'air.',
        price: 35,
        oldPrice: 45,
        wholesalePrice: 28,
        images: [
            'https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        category: 'Maison',
        brand: 'Green Life',
        stock: 25,
        rating: 4.9,
        numReviews: 10
    },
    {
        name: 'Appareil Photo Retro',
        description: 'Appareil photo vintage remis à neuf, objectif 50mm, parfait pour la photographie argentique.',
        price: 450,
        oldPrice: 520,
        wholesalePrice: 380,
        images: [
            'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        category: 'High-Tech',
        brand: 'Vintage Cam',
        stock: 5,
        rating: 4.4,
        numReviews: 6
    },
    {
        name: 'Lunettes de Soleil',
        description: 'Lunettes de soleil polarisées, protection UV400, monture légère et résistante.',
        price: 60,
        oldPrice: 75,
        wholesalePrice: 48,
        images: [
            'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        category: 'Accessoires',
        brand: 'Summer Vibes',
        stock: 35,
        rating: 4.5,
        numReviews: 14
    }
];

const importData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();

        console.log('Data cleared!');

        // Create users
        const createdUsers = await User.insertMany(users);
        console.log(`${createdUsers.length} users created!`);

        // Assign sellers to products
        const seller1 = createdUsers[1]; // Mohamed Seller
        const seller2 = createdUsers[2]; // Sarah Seller

        const productsWithSeller = products.map((product, index) => {
            return {
                ...product,
                seller: index % 2 === 0 ? seller1._id : seller2._id,
                shop: index % 2 === 0 ? seller1.shopName : seller2.shopName
            };
        });

        const createdProducts = await Product.insertMany(productsWithSeller);
        console.log(`${createdProducts.length} products created!`);

        console.log('✅ Data imported successfully!');
        process.exit();
    } catch (error) {
        console.error('❌ Error importing data:', error);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await connectDB();

        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();

        console.log('✅ Data destroyed successfully!');
        process.exit();
    } catch (error) {
        console.error('❌ Error destroying data:', error);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
