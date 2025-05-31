"use client";

import Link from "next/link";
import {
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Clock,
  Heart,
  Users,
  Award,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-4 group">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors duration-200">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold leading-none">
                  Biblioteca 216
                </span>
                <span className="text-xs text-gray-500 leading-none">
                  Colección de física
                </span>
              </div>
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Apoyando la educación e investigación en física desde ~1990 con
              una colección completa y el compromiso de estudiantes como tú.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-1" />
                <span>35+ años</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>320+ libros</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Biblioteca</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Explorar libros
                </Link>
              </li>
              <li>
                <Link
                  href="/donors"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Principales donantes
                </Link>
              </li>
              <li>
                <Link
                  href="/about/rules"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Normas de la biblioteca
                </Link>
              </li>
              <li>
                <Link
                  href="/favorites"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Mis favoritos
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Nosotros</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Nuestra misión
                </Link>
              </li>
              <li>
                <Link
                  href="/about/team"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Nuestro equipo
                </Link>
              </li>
              <li>
                <Link
                  href="/about/location"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Visítanos
                </Link>
              </li>
              <li>
                <Link
                  href="/about/rules"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Políticas
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-600">
                  <p>
                    Ambiente 216, Pabellón de Pregrado de la Facultad de
                    Ciencias Físicas
                  </p>
                  <p>Av. Germán Amézaga s/n</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                <a
                  href="tel:+15551234567"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  (555) 123-4567
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                <a
                  href="mailto:library@physics.university.edu"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  216@unmsm.edu.pe
                </a>
              </div>
              <div className="flex items-start">
                <Clock className="h-4 w-4 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-600">
                  <p>Lun-Vie: 8AM-8PM</p>
                  <p>Sab: Consulta horarios especiales</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 mb-4 md:mb-0">
            © {new Date().getFullYear()} Biblioteca 216. Todos los derechos
            reservados.
          </div>
          <div className="flex items-center space-x-6">
            <Link
              href="/about"
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              Política de privacidad
            </Link>
            <Link
              href="/about/rules"
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              Términos de servicio
            </Link>
            <div className="flex items-center text-sm text-gray-500">
              <Heart className="h-3 w-3 mr-1 text-red-400" />
              <span>Hecho con cariño para la comunidad de física</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
