import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = ({ section = 'public' }) => {
    const isAdmin = section === 'admin';
    const isSeller = section === 'seller';

    const backPath = isAdmin ? '/admin/dashboard' : isSeller ? '/seller/dashboard' : '/';
    const backLabel = isAdmin ? 'Dashboard admin' : isSeller ? 'Dashboard vendeur' : 'Retour accueil';

    return (
        <section className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4 py-16">
            <div className="max-w-xl w-full bg-white border border-gray-100 rounded-2xl shadow-sm p-8 text-center">
                <p className="text-sm font-bold text-primary mb-3">Erreur 404</p>
                <h1 className="text-3xl font-black text-gray-900 mb-3">Page introuvable</h1>
                <p className="text-gray-600 mb-8">
                    Le chemin saisi n existe pas ou n est plus disponible.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to={backPath}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition"
                    >
                        <Home size={18} />
                        {backLabel}
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-300 text-gray-800 font-semibold hover:bg-gray-100 transition"
                    >
                        <ArrowLeft size={18} />
                        Retour
                    </button>
                </div>
            </div>
        </section>
    );
};

export default NotFoundPage;