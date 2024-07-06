import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow-md dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" legacyBehavior>
              <a className="flex items-center space-x-2">
                <Image
                  src="/llama.png"
                  alt="Llama Logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="text-xl font-bold text-gray-800 dark:text-white">
                  LlamaIndex
                </span>
              </a>
            </Link>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/integrations" legacyBehavior>
              <a className="flex items-center justify-center bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1">
                Integrations
              </a>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
