"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Clock,
  Car,
  Bus,
  Bike,
  Phone,
  Mail,
  Wifi,
  Coffee,
  BookOpen,
} from "lucide-react";

export default function LocationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            Visita nuestra biblioteca
          </h1>
          <p className="text-gray-600">
            Encuéntranos en el campus y planifica tu visita
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Location & Directions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Ubicación y dirección
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Biblioteca de Física</h3>
                    <p className="text-gray-700">
                      Edificio de Física, Sala 101
                      <br />
                      Campus Universitario
                      <br />
                      123 Science Drive
                      <br />
                      Ciudad Universitaria, Estado 12345
                    </p>
                  </div>

                  {/* Map placeholder */}
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="h-12 w-12 mx-auto mb-2" />
                      <p>Mapa interactivo del campus</p>
                      <p className="text-sm">Edificio 15, planta baja</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transportation */}
            <Card>
              <CardHeader>
                <CardTitle>Cómo llegar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Car className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">En coche</h3>
                    <p className="text-sm text-gray-700">
                      Aparcamiento para visitantes disponible en el Lote C
                      (límite de 2 horas) y Lote D (todo el día). Se requieren
                      permisos de aparcamiento.
                    </p>
                  </div>
                  <div className="text-center">
                    <Bus className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Transporte público</h3>
                    <p className="text-sm text-gray-700">
                      Las rutas de autobús 15, 23 y 42 paran en el Centro
                      Universitario. La biblioteca está a 5 minutos a pie de la
                      parada de autobús.
                    </p>
                  </div>
                  <div className="text-center">
                    <Bike className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Bicicleta y a pie</h3>
                    <p className="text-sm text-gray-700">
                      Aparcabicis disponibles fuera del Edificio de Física. El
                      campus es peatonal con senderos accesibles.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Facilities */}
            <Card>
              <CardHeader>
                <CardTitle>Instalaciones y servicios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Espacios de estudio</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• 50 cubículos de estudio individuales</li>
                      <li>• 8 salas de estudio en grupo (2-6 personas)</li>
                      <li>• Zona de lectura tranquila</li>
                      <li>• Espacio de trabajo colaborativo</li>
                      <li>• Laboratorio de computación con 20 estaciones</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Servicios</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Consulta de investigación</li>
                      <li>• Impresión y escaneo</li>
                      <li>• Préstamos interbibliotecarios</li>
                      <li>• Coordinación de grupos de estudio</li>
                      <li>• Préstamo de equipos</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Badge variant="outline" className="flex items-center">
                    <Wifi className="h-3 w-3 mr-1" />
                    WiFi gratis
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <Coffee className="h-3 w-3 mr-1" />
                    Cafetería cercana
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <BookOpen className="h-3 w-3 mr-1" />
                    Acceso digital 24/7
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Clock className="h-5 w-5 mr-2" />
                  Horarios de apertura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Lunes - Viernes</span>
                    <span className="text-gray-600">8:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Sábado</span>
                    <span className="text-gray-600">10:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Domingo</span>
                    <span className="text-gray-600">12:00 PM - 6:00 PM</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Horarios festivos:</strong> Horario reducido durante
                    las vacaciones universitarias. Consulte nuestro sitio web
                    para conocer los horarios actuales.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Información de contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-3 text-gray-500" />
                  <div>
                    <p className="font-medium">(555) 123-4567</p>
                    <p className="text-sm text-gray-600">Mesa principal</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-3 text-gray-500" />
                  <div>
                    <p className="font-medium">
                      library@physics.university.edu
                    </p>
                    <p className="text-sm text-gray-600">Consultas generales</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accessibility */}
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg text-green-900">
                  Accesibilidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-green-800">
                  <li>• Entrada accesible para sillas de ruedas</li>
                  <li>• Acceso en ascensor a todas las plantas</li>
                  <li>• Baños accesibles</li>
                  <li>• Escritorios de altura ajustable</li>
                  <li>• Software de lectura de pantalla</li>
                  <li>• Materiales de impresión de gran tamaño disponibles</li>
                </ul>
              </CardContent>
            </Card>

            {/* Emergency */}
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-lg text-red-900">
                  Información de emergencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-red-800">
                  <p>
                    <strong>Seguridad del campus:</strong> (555) 123-9999
                  </p>
                  <p>
                    <strong>Emergencia:</strong> 911
                  </p>
                  <p>
                    <strong>Fuera de horario:</strong> Utilice los teléfonos de
                    emergencia ubicados en todo el edificio
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
