import { Link } from 'react-router-dom';
import { useCatalog } from '../../context/catalog';
import { useLanguage } from '../../context/language';

const fallbackImage =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&auto=format&fit=crop&q=80';

export default function Categories() {
  const { t } = useLanguage();
  const { visibleCategories } = useCatalog();

  return (
    <section className="px-4 sm:px-6 py-12 bg-gray-900 sm:py-16">
      <div className="max-w-7xl mx-auto mb-8 sm:mb-10">
        <div className="flex items-center gap-3 w-full sm:gap-4">
          <span className="flex-1 h-px bg-gray-500"></span>
          <h2 className="text-3xl font-bold text-white text-center sm:text-5xl">
            {t('ourProducts')}
          </h2>
          <span className="flex-1 h-px bg-gray-500"></span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {visibleCategories.map((cat) => (
          <Link
            to={`/catalog?category=${cat.name}`}
            key={cat.id}
            className="bg-white rounded-xl overflow-hidden shadow-md transition duration-300 group hover:shadow-xl"
          >
            <div className="overflow-hidden">
              <img
                src={cat.image || fallbackImage}
                alt={cat.name}
                className="h-56 w-full object-cover transition duration-300 group-hover:scale-105 sm:h-64 lg:h-72"
              />
            </div>

            <div className="p-5 flex flex-col items-center space-y-4">
              <h3 className="text-xl font-bold text-gray-800 sm:text-2xl">
                {cat.name === 'Accessoires'
                  ? t('accessories')
                  : t(cat.name.toLowerCase())}
              </h3>

              <span className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-lg transition">
                {t('buy')}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
