import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

const naturalSceneryPhotos = [
  { id: 1, src: '/data/living1/Scenery 1/Natural Scenery/微信图片_20260526100911_126_244.jpg', title: '自然风光 1' },
  { id: 2, src: '/data/living1/Scenery 1/Natural Scenery/微信图片_20260526100914_127_244.jpg', title: '自然风光 2' },
  { id: 3, src: '/data/living1/Scenery 1/Natural Scenery/微信图片_20260526100924_128_244.jpg', title: '自然风光 3' },
  { id: 4, src: '/data/living1/Scenery 1/微信图片_20260526100941_133_244.jpg', title: '自然风光 4' },
  { id: 5, src: '/data/living1/Scenery 1/Natural Scenery/微信图片_20260526100943_134_244.jpg', title: '自然风光 5' },
  { id: 6, src: '/data/living1/Scenery 1/Natural Scenery/微信图片_20260526101014_137_244.jpg', title: '自然风光 6' },
];

const dailyLifePhotos = [
  { id: 1, src: '/data/living1/Scenery 1/Daily Life/微信图片_20260526100935_132_244.jpg', title: '日常记录 1' },
];

const animalsPhotos = [
  { id: 1, src: '/data/living1/animals/微信图片_20260526100927_129_244.jpg', title: '动物 1' },
  { id: 2, src: '/data/living1/animals/微信图片_20260526100930_130_244.jpg', title: '动物 2' },
  { id: 3, src: '/data/living1/animals/微信图片_20260526100933_131_244.jpg', title: '动物 3' },
];

const personalPhotos = [
  { id: 1, src: '/data/living1/Personal 1/微信图片_20260526093844_113_244.jpg', title: '个人照片 1' },
  { id: 2, src: '/data/living1/Personal 1/微信图片_20260526093844_114_244.jpg', title: '个人照片 2' },
  { id: 3, src: '/data/living1/Personal 1/微信图片_20260526100449_118_244.jpg', title: '个人照片 3' },
  { id: 4, src: '/data/living1/Personal 1/微信图片_20260526100454_120_244.jpg', title: '个人照片 4' },
  { id: 5, src: '/data/living1/Personal 1/微信图片_20260526100456_121_244.jpg', title: '个人照片 5' },
  { id: 6, src: '/data/living1/Personal 1/微信图片_20260526100904_125_244.jpg', title: '个人照片 6' },
  { id: 7, src: '/data/living1/Personal 1/微信图片_20260526102120_12_739.jpg', title: '个人照片 7' },
  { id: 8, src: '/data/living1/Personal 1/微信图片_20260526102134_13_739.jpg', title: '个人照片 8' },
  { id: 9, src: '/data/living1/Personal 1/微信图片_20260526102147_14_739.jpg', title: '个人照片 9' },
];

const photos = [
  { 
    id: 1, 
    src: '/data/living1/Scenery 1/Natural Scenery/微信图片_20260526100911_126_244.jpg', 
    title: '自然风光 / Natural Scenery', 
    description: '大自然的美丽风景 / The beautiful scenery of nature', 
    fullSrc: '/data/living1/Scenery 1/Natural Scenery/微信图片_20260526100911_126_244.jpg',
    album: naturalSceneryPhotos 
  },
  { 
    id: 2, 
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', 
    title: '城市夜景 / City Nightscape', 
    description: '繁华都市的夜晚 / The nights of a bustling city', 
    fullSrc: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
    album: [] 
  },
  { 
    id: 3, 
    src: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400', 
    title: '美食时光 / Food Moments', 
    description: '美味的食物 / Delicious food', 
    fullSrc: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a',
    album: [] 
  },
  { 
    id: 4, 
    src: '/data/living1/Scenery 1/Daily Life/微信图片_20260526100935_132_244.jpg', 
    title: '日常记录 / Daily Life', 
    description: '记录生活的点滴 / Recording moments of life', 
    fullSrc: '/data/living1/Scenery 1/Daily Life/微信图片_20260526100935_132_244.jpg',
    album: dailyLifePhotos 
  },
  { 
    id: 5, 
    src: '/data/living1/animals/微信图片_20260526100927_129_244.jpg', 
    title: '动物世界 / Animals', 
    description: '可爱的动物朋友们 / Cute animal friends', 
    fullSrc: '/data/living1/animals/微信图片_20260526100927_129_244.jpg',
    album: animalsPhotos 
  },
  { 
    id: 6, 
    src: '/data/living1/Personal 1/微信图片_20260526102134_13_739.jpg', 
    title: '个人照片 / Personal', 
    description: '个人生活照片 / Personal life photos', 
    fullSrc: '/data/living1/Personal 1/微信图片_20260526102134_13_739.jpg',
    album: personalPhotos 
  },
];

export default function PhotoDetail() {
  const { id } = useParams<{ id: string }>();
  const photo = photos.find((p) => p.id === parseInt(id || '1'));
  const [currentAlbumIndex, setCurrentAlbumIndex] = useState(0);

  if (!photo) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">照片未找到 / Photo Not Found</h1>
          <Link to="/life" className="text-purple-600 hover:underline">
            返回生活页面 / Back to Life Page
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = photos.findIndex((p) => p.id === photo.id);
  const prevPhoto = currentIndex > 0 ? photos[currentIndex - 1] : null;
  const nextPhoto = currentIndex < photos.length - 1 ? photos[currentIndex + 1] : null;

  const hasAlbum = photo.album && photo.album.length > 0;
  const currentAlbumPhoto = hasAlbum ? photo.album[currentAlbumIndex] : null;

  const goToPrevAlbumPhoto = () => {
    setCurrentAlbumIndex((prev) => 
      prev === 0 ? (hasAlbum ? photo.album.length - 1 : 0) : prev - 1
    );
  };

  const goToNextAlbumPhoto = () => {
    setCurrentAlbumIndex((prev) => 
      prev === (hasAlbum ? photo.album.length - 1 : 0) ? 0 : prev + 1
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <Link
            to="/life"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors duration-300"
          >
            <ArrowLeft size={20} />
            <span>返回生活页面 / Back to Life Page</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="relative">
            {hasAlbum && currentAlbumPhoto ? (
              <div className="relative">
                <img
                  src={currentAlbumPhoto.src}
                  alt={currentAlbumPhoto.title}
                  className="w-full h-[60vh] object-contain bg-gray-100"
                />
                <button
                  onClick={goToPrevAlbumPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors duration-300"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={goToNextAlbumPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors duration-300"
                >
                  <ChevronRight size={24} />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-white text-sm font-medium">
                    {currentAlbumIndex + 1} / {photo.album.length}
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={photo.fullSrc}
                  alt={photo.title}
                  className="w-full h-[60vh] object-contain bg-gray-100"
                />
              </div>
            )}
          </div>

          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">{photo.title}</h1>
            <p className="text-gray-600 text-lg">{photo.description}</p>
          </div>
        </div>

        {hasAlbum && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-6">相册 / Album</h2>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
              {photo.album.map((p, index) => (
                <button
                  key={p.id}
                  onClick={() => setCurrentAlbumIndex(index)}
                  className={`relative overflow-hidden rounded-lg aspect-square ${
                    index === currentAlbumIndex ? 'ring-4 ring-purple-600' : ''
                  }`}
                >
                  <img
                    src={p.src}
                    alt={p.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          {prevPhoto && (
            <Link
              to={`/photo/${prevPhoto.id}`}
              className="flex items-center space-x-3 px-6 py-3 bg-white hover:bg-gray-50 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <ArrowLeft size={20} className="text-gray-600" />
              <span className="text-gray-700">上一张 / Previous</span>
            </Link>
          )}
          {!prevPhoto && <div className="w-48" />}

          {nextPhoto && (
            <Link
              to={`/photo/${nextPhoto.id}`}
              className="flex items-center space-x-3 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <span>下一张 / Next</span>
              <ArrowLeft size={20} className="rotate-180" />
            </Link>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">更多照片 / More Photos</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {photos.map((p) => (
              <Link
                key={p.id}
                to={`/photo/${p.id}`}
                className={`relative overflow-hidden rounded-lg aspect-square ${
                  p.id === photo.id ? 'ring-4 ring-purple-600' : ''
                }`}
              >
                <img
                  src={p.src}
                  alt={p.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
