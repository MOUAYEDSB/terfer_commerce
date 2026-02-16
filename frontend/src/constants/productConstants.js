// Categories and their subcategories
export const CATEGORIES_WITH_SUBCATEGORIES = {
    'Mode': [
        'Vêtements Homme',
        'Vêtements Femme',
        'Vêtements Enfant',
        'Chaussures',
        'Sacs & Accessoires',
        'Bijoux & Montres',
        'Lunettes'
    ],
    'High-Tech': [
        'Smartphones',
        'Ordinateurs',
        'Tablettes',
        'Accessoires Tech',
        'Audio & Video',
        'Gaming',
        'Drones & Cameras'
    ],
    'Maison': [
        'Mobilier',
        'Décoration',
        'Cuisine',
        'Électroménager',
        'Literie',
        'Jardinage',
        'Bricolage'
    ],
    'Beauté': [
        'Maquillage',
        'Soins Visage',
        'Soins Corps',
        'Parfums',
        'Cheveux',
        'Ongles',
        'Homme'
    ],
    'Bijoux': [
        'Colliers',
        'Bracelets',
        'Boucles d\'oreilles',
        'Bagues',
        'Montres',
        'Parures',
        'Bijoux Fantaisie'
    ],
    'Sport': [
        'Fitness',
        'Running',
        'Football',
        'Basketball',
        'Tennis',
        'Natation',
        'Yoga & Pilates',
        'Sports Outdoor'
    ],
    'Enfants': [
        'Vêtements Bébé',
        'Vêtements Enfant',
        'Jouets',
        'Puériculture',
        'Chaussures Enfant',
        'Mobilier Enfant',
        'Livres & Jeux'
    ],
    'Auto': [
        'Pièces Auto',
        'Accessoires Auto',
        'Entretien',
        'Électronique Auto',
        'Tuning',
        'Outils',
        'Moto'
    ],
    'Animaux': [
        'Chiens',
        'Chats',
        'Oiseaux',
        'Poissons',
        'Rongeurs',
        'Accessoires',
        'Nourriture'
    ],
    'Accessoires': [
        'Téléphones',
        'Ordinateurs',
        'Mode',
        'Maison',
        'Voyage',
        'Autres'
    ]
};

// Predefined colors with their hex codes
export const PREDEFINED_COLORS = [
    { name: 'Noir', hex: '#000000' },
    { name: 'Blanc', hex: '#FFFFFF' },
    { name: 'Gris', hex: '#808080' },
    { name: 'Rouge', hex: '#FF0000' },
    { name: 'Bleu', hex: '#0000FF' },
    { name: 'Vert', hex: '#00FF00' },
    { name: 'Jaune', hex: '#FFD700' },
    { name: 'Orange', hex: '#FFA500' },
    { name: 'Rose', hex: '#FFC0CB' },
    { name: 'Violet', hex: '#800080' },
    { name: 'Marron', hex: '#8B4513' },
    { name: 'Beige', hex: '#F5F5DC' },
    { name: 'Or', hex: '#FFD700' },
    { name: 'Argent', hex: '#C0C0C0' },
    { name: 'Bleu Marine', hex: '#000080' },
    { name: 'Turquoise', hex: '#40E0D0' },
    { name: 'Bordeaux', hex: '#800020' },
    { name: 'Kaki', hex: '#C3B091' },
];

// Predefined sizes
export const PREDEFINED_SIZES = [
    'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
    '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48',
    'Unique'
];

// Get color hex code by name
export const getColorHex = (colorName) => {
    const color = PREDEFINED_COLORS.find(c => c.name.toLowerCase() === colorName.toLowerCase());
    return color ? color.hex : '#CCCCCC'; // Default gray if not found
};

// Helper for image URLs
export const getImgUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/500x500?text=TerFer';
    if (path.startsWith('http')) return path;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};
