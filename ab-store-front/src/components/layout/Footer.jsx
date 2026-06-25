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
    href: 'https://www.facebook.com/profile.php?id=100090171853178&mibextid=wwXIfr&rdid=FDRJTIAcWjSfc4JG&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1a5YzhVBDU%2F%3Fmibextid%3DwwXIfr#',
    label: 'Facebook',
  },
  {
    Icon: FaInstagram,
    href: 'https://www.instagram.com/the__phone_house?igsh=MWNnZTgwZTN5dXVjYg%3D%3D&utm_source=qr',
    label: 'Instagram',
  },
  {
    Icon: FaTiktok,
    href: 'https://www.tiktok.com/@the.phone.housedz1?_r=1&_t=ZS-92IvwhydPQl',
    label: 'TikTok',
  },
];

const GOOGLE_MAPS_URL =
  'https://www.google.com/maps?q=5M2V+VW5+The+phone+house,+%D8%B4%D8%A7%D8%B1%D8%B9+%D8%A7%D9%84%D8%B9%D9%82%D9%8A%D8%AF+%D8%B3%D9%8A+%D8%A7%D9%84%D8%AD%D9%88%D8%A7%D8%B3%D8%8C+El+Eulma+19600&ftid=0x12f30b0009be0109:0x9109a88ff7243b9b&entry=gps&lucs=,94259550,94297699,94284457,94231188,94280568,47071704,94218641,94282134,94286869&g_ep=CAISEjI1LjQ5LjkuODM4ODk5MTgzMBgAIIgnKlEsOTQyNTk1NTAsOTQyOTc2OTksOTQyODQ0NTcsOTQyMzExODgsOTQyODA1NjgsNDcwNzE3MDQsOTQyMTg2NDEsOTQyODIxMzQsOTQyODY4NjlCAkRa&skid=57e42c45-fc9e-4659-b427-53156e36067f&g_st=ic';

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
          <h2 className="text-2xl font-bold text-white mb-4">The Phone House</h2>
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
