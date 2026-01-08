  import Link from "next/link";
  import { PackageX } from "lucide-react";

  export default function NotFound() {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <PackageX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">No encontrado</h1>
          <p className="text-gray-600 mb-6">
            No pudimos encontrar lo que buscabas.
          </p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }
