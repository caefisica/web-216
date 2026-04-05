"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Award, Clock, Target, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-gray-50">
      {/* Header Section */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">
            Acerca de nuestra biblioteca
          </h1>
          <p className="text-gray-600">
            Conoce nuestra misión, historia y compromiso con la educación en física
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mission */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Nuestra misión
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  La Biblioteca de Física sirve como piedra angular de la educación e investigación
                  científica, proporcionando acceso a colecciones integrales de literatura de
                  física, desde libros de texto fundamentales hasta publicaciones de investigación
                  de vanguardia. Nuestra misión es fomentar el aprendizaje, apoyar la investigación
                  e inspirar a la próxima generación de físicos.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Creemos que el conocimiento debe ser accesible para todos, y nos esforzamos por
                  crear un entorno inclusivo donde los estudiantes, investigadores y entusiastas de
                  la física puedan explorar, descubrir y avanzar en su comprensión del mundo físico.
                </p>
              </CardContent>
            </Card>

            {/* History */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  Nuestra historia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border-l-4 border-blue-200 pl-4">
                    <div className="flex items-center mb-2">
                      <Badge variant="outline" className="mr-2 border-gray-300">
                        1952
                      </Badge>
                      <h3 className="font-semibold text-gray-900">Fundación</h3>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Establecida como parte del departamento de física de la universidad con una
                      colección inicial de 500 libros donados por miembros de la facultad.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-200 pl-4">
                    <div className="flex items-center mb-2">
                      <Badge variant="outline" className="mr-2 border-gray-300">
                        1978
                      </Badge>
                      <h3 className="font-semibold text-gray-900">Gran expansión</h3>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Recibió una importante subvención que nos permitió ampliar nuestra colección a
                      más de 5,000 volúmenes y establecer secciones especializadas para diferentes
                      disciplinas de la física.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-200 pl-4">
                    <div className="flex items-center mb-2">
                      <Badge variant="outline" className="mr-2 border-gray-300">
                        1995
                      </Badge>
                      <h3 className="font-semibold text-gray-900">Integración digital</h3>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Implementamos nuestro primer sistema de catálogo digital y comenzamos a
                      ofrecer acceso en línea a recursos selectos.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-200 pl-4">
                    <div className="flex items-center mb-2">
                      <Badge variant="outline" className="mr-2 border-gray-300">
                        2020
                      </Badge>
                      <h3 className="font-semibold text-gray-900">Era moderna</h3>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Lanzamos nuestra plataforma digital integral, que permite el acceso remoto y
                      la gestión moderna de la biblioteca para nuestra creciente comunidad de más de
                      1,000 miembros.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Values */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <Heart className="h-5 w-5 mr-2 text-blue-600" />
                  Nuestros valores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-900">Accesibilidad</h3>
                    <p className="text-gray-700 text-sm">
                      Nos aseguramos de que nuestros recursos estén disponibles para todos los
                      miembros de la comunidad de física, independientemente de su origen o nivel de
                      estudio.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-900">Excelencia</h3>
                    <p className="text-gray-700 text-sm">
                      Mantenemos los más altos estándares en la curación de nuestra colección,
                      asegurando que nuestros materiales sean precisos, actuales y valiosos.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-900">Innovación</h3>
                    <p className="text-gray-700 text-sm">
                      Adoptamos nuevas tecnologías y métodos para mejorar nuestros servicios y
                      servir mejor a las necesidades cambiantes de nuestra comunidad.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-900">Colaboración</h3>
                    <p className="text-gray-700 text-sm">
                      Fomentamos las asociaciones con instituciones educativas, investigadores y la
                      comunidad científica en general.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">La biblioteca de un vistazo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-900">10,000+ Libros</p>
                    <p className="text-sm text-gray-600">En todas las disciplinas de la física</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-900">1,200+ Miembros</p>
                    <p className="text-sm text-gray-600">
                      Estudiantes, profesores e investigadores
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-900">70+ Años</p>
                    <p className="text-sm text-gray-600">Sirviendo a la comunidad de física</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specializations */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Nuestras especializaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    Mecánica cuántica
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    Física computacional
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    Física estadística
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    Física del estado sólido
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    Astrofísica
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    Física nuclear
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    Electromagnetismo
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    Mecánica clásica
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-900 mb-3">Ponte en contacto</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>📧 biblioteca@fisica.universidad.edu</p>
                  <p>📞 (555) 123-4567</p>
                  <p>📍 Edificio de Física, Sala 101</p>
                  <p>🕒 Lun-Vie: 8AM-8PM</p>
                  <p>🕒 Sáb-Dom: 10AM-6PM</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
