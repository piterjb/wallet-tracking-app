import Link from 'next/link';
import Image from 'next/image';

export default function SocialFooter() {
  return (
    <div className="flex justify-center mb-4">
      <div className="flex items-center space-x-6 bg-navy-800 rounded-full px-6 py-2 border border-gray-700">
        <Link href="https://x.com/whalewatchersol" target="_blank" className="text-gray-400 hover:text-white transition-colors">
          <Image src="/images/x-social-media-white-icon.svg" alt="Twitter" width={15} height={20} />
        </Link>
        <Link href="https://t.me/WW_portal" target="_blank" className="text-gray-400 hover:text-white transition-colors">
          <Image src="/images/telegram-white.svg" alt="Telegram" width={20} height={20} />
        </Link>
      </div>
    </div>
  );
}