const mongoose = require('mongoose');

const RETRY_INTERVAL_MS = 5000;

const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri || typeof uri !== 'string') {
        console.error('MongoDB: MONGO_URI manquant dans .env. Copie .env.example en .env et définis MONGO_URI.');
        process.exit(1);
    }

    const tryConnect = async () => {
        try {
            await mongoose.connect(uri);
            console.log('MongoDB connected');
        } catch (error) {
            console.error(
                'MongoDB: connexion refusée —',
                error.message.includes('ECONNREFUSED')
                    ? 'MongoDB n\'est pas démarré ou MONGO_URI incorrect. Démarre MongoDB en local ou mets ton URI Atlas dans backend/.env. Nouvelle tentative dans 5s...'
                    : error.message
            );
            setTimeout(tryConnect, RETRY_INTERVAL_MS);
        }
    };

    await tryConnect();
};

module.exports = connectDB;
