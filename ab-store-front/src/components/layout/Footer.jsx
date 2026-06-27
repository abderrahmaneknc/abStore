import { Link } from 'react-router-dom';
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaMapMarkerAlt,
  FaPhone,
  FaWhatsapp,
} from 'react-icons/fa';
import { useCatalog } from '../../context/catalog';
import { useLanguage } from '../../context/language';
import {
  phoneHref,
  whatsappHref,
  STORE_PHONE_DISPLAY,
} from '../../config/storeContact';

const socialLinks = [
  {
    Icon: FaFacebookF,
    href: 'https://www.facebook.com/',
    label: 'Facebook',
  },
  {
    Icon: FaInstagram,
    href: 'https://www.instagram.com/',
    label: 'Instagram',
  },
  {
    Icon: FaTiktok,
    href: 'https://www.tiktok.com/',
    label: 'TikTok',
  },
];

const GOOGLE_MAPS_URL =
  'https://www.google.com/maps?q=Tokyo+Tower,+Minato+City,+Tokyo,+Japan';

export default function Footer() {
  const { t } = useLanguage();
  const { visibleCategories } = useCatalog();

  const navigation = [
    [t('home'), '/'],
    [t('shop'), '/catalog'],
    [t('about'), '/about'],
    [t('contact'), '/contact'],
  ];

  const productLinks = visibleCategories.map((category) => [
    category.name,
    `/catalog?category=${encodeURIComponent(category.name)}`,
  ]);

  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-12 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 gap-10 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">The Phone</h2>
          <p className="text-sm leading-relaxed text-gray-400">
            {t('footerText')}
          </p>

          <div className="mt-5 flex flex-col gap-2 text-sm sm:items-start">
            <a
              href={phoneHref}
              className="inline-flex items-center gap-2 text-gray-300 hover:text-gold transition"
            >
              <FaPhone size={14} />
              {STORE_PHONE_DISPLAY}
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-green-400 transition"
            >
              <FaWhatsapp size={16} />
              {t('whatsappUs')}
            </a>
          </div>

          <div className="flex justify-center gap-3 mt-6 sm:justify-start">
            {socialLinks.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition"
                aria-label={label}
              >
                <Icon size={18} />
              </a>
            ))}
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gray-800 rounded-full hover:bg-gold hover:text-black transition"
              aria-label={t('googleMapsLink')}
              title={t('googleMapsLink')}
            >
              <FaMapMarkerAlt size={18} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">{t('navigation')}</h3>
          <ul className="space-y-2 text-sm">
            {navigation.map(([label, path]) => (
              <li key={label}>
                <Link to={path} className="hover:text-white transition">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">{t('products')}</h3>
          <ul className="space-y-2 text-sm">
            {productLinks.length > 0 ? (
              productLinks.map(([label, path]) => (
                <li key={label}>
                  <Link to={path} className="hover:text-white transition">
                    {label}
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-gray-500">{t('noCategoriesYet')}</li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">{t('quickLinks')}</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/cart" className="hover:text-white transition">
                {t('cart')}
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="hover:text-white transition">
                {t('wishlist')}
              </Link>
            </li>
            <li>
              <Link to="/catalog" className="hover:text-white transition">
                {t('products')}
              </Link>
            </li>
          </ul>

          <div className="mt-6">
            <h3 className="text-white font-semibold mb-3">{t('findUsOnMap')}</h3>
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gold transition"
            >
              <FaMapMarkerAlt size={14} />
              {t('googleMapsLink')}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
        {t('rights')}
      </div>
    </footer>
  );
}
