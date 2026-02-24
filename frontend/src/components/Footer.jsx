
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Facebook, Instagram, Linkedin, Send } from 'lucide-react';

const Footer = () => {
    const { t } = useTranslation('translation');

    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand & About */}
                    <div>
                        <h2 className="text-2xl font-bold tracking-tighter mb-6">TERFER</h2>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            {t('footer.about_text')}
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition duration-300">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition duration-300">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition duration-300">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Link 1 */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">{t('nav.categories.all_shops')}</h3>
                        <ul className="space-y-4 text-gray-400">
                            <li><a href="#" className="hover:text-primary transition">{t('footer.quick_links.top_sellers')}</a></li>
                            <li><a href="#" className="hover:text-primary transition">{t('footer.quick_links.new')}</a></li>
                            <li><a href="#" className="hover:text-primary transition">{t('footer.quick_links.promos')}</a></li>
                            <li><a href="#" className="hover:text-primary transition">{t('footer.quick_links.crafts')}</a></li>
                        </ul>
                    </div>

                    {/* Quick Link 2 */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">{t('footer.customer_service')}</h3>
                        <ul className="space-y-4 text-gray-400">
                            <li><a href="#" className="hover:text-primary transition">{t('footer.quick_links.help')}</a></li>
                            <li><a href="#" className="hover:text-primary transition">{t('footer.quick_links.returns')}</a></li>
                            <li><a href="#" className="hover:text-primary transition">{t('footer.quick_links.delivery')}</a></li>
                            <li><a href="#" className="hover:text-primary transition">{t('footer.quick_links.contact')}</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">{t('footer.newsletter.title')}</h3>
                        <p className="text-gray-400 mb-4">{t('footer.newsletter.text')}</p>
                        <form className="flex">
                            <input
                                type="email"
                                placeholder={t('footer.newsletter.placeholder')}
                                className="bg-gray-800 text-white px-4 py-3 rounded-l-lg focus:outline-none w-full border border-gray-700 focus:border-primary"
                            />
                            <button className="bg-primary hover:bg-primary/90 px-4 py-3 rounded-r-lg transition">
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} TERFER. {t('footer.rights')}</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition">{t('footer.privacy')}</a>
                        <a href="#" className="hover:text-white transition">{t('footer.terms')}</a>
                        <a href="#" className="hover:text-white transition">{t('footer.cookies')}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
