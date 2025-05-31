"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpen,
  Clock,
  Users,
  AlertTriangle,
  Shield,
  Heart,
  DollarSign,
} from "lucide-react";

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            Normas y políticas de la biblioteca
          </h1>
          <p className="text-gray-600">
            Directrices para usar nuestros servicios bibliotecarios y mantener
            nuestra comunidad
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Borrowing Policies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Políticas de préstamo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Períodos de préstamo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900">
                        Estudiantes de grado
                      </h4>
                      <p className="text-sm text-blue-800 mt-1">
                        2 semanas (renovable una vez)
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Máximo 5 libros a la vez
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-900">
                        Estudiantes de posgrado
                      </h4>
                      <p className="text-sm text-green-800 mt-1">
                        4 semanas (renovable dos veces)
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Máximo 10 libros a la vez
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-medium text-purple-900">
                        Profesorado y personal
                      </h4>
                      <p className="text-sm text-purple-800 mt-1">
                        8 semanas (renovable)
                      </p>
                      <p className="text-xs text-purple-700 mt-1">
                        Máximo 20 libros a la vez
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="font-medium text-orange-900">
                        Miembros de la comunidad
                      </h4>
                      <p className="text-sm text-orange-800 mt-1">
                        2 semanas (renovable una vez)
                      </p>
                      <p className="text-xs text-orange-700 mt-1">
                        Máximo 3 libros a la vez
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Política de renovación</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      • Los libros se pueden renovar en línea o contactando a la
                      biblioteca
                    </li>
                    <li>
                      • No se permiten renovaciones si el libro ha sido
                      solicitado por otro usuario
                    </li>
                    <li>
                      • Los libros atrasados no se pueden renovar hasta que se
                      devuelvan
                    </li>
                    <li>
                      • Algunos artículos de colecciones especiales pueden no
                      ser renovables
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Fines & Fees */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                  Multas y tasas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Todas las multas deben pagarse antes de tomar prestados
                    materiales adicionales o renovar los préstamos existentes.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Multas por retraso</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Libros regulares: $0.50 por día</li>
                      <li>• Materiales de reserva: $2.00 por día</li>
                      <li>• Colecciones especiales: $5.00 por día</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Otras tasas</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>
                        • Reemplazo de libro perdido: Costo total + $25 de
                        procesamiento
                      </li>
                      <li>
                        • Reparación de libro dañado: $10-50 dependiendo del
                        daño
                      </li>
                      <li>• Reemplazo de tarjeta de biblioteca: $5</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Library Conduct */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Conducta en la biblioteca
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">
                    Comportamiento esperado
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      • Mantener un ambiente tranquilo y respetuoso para el
                      estudio y la investigación
                    </li>
                    <li>
                      • Mantenga sus pertenencias personales con usted en todo
                      momento
                    </li>
                    <li>
                      • Utilice las áreas designadas para discusiones grupales y
                      trabajo colaborativo
                    </li>
                    <li>
                      • Manipule todos los materiales con cuidado e informe
                      cualquier daño de inmediato
                    </li>
                    <li>
                      • Siga todas las señales publicadas y las instrucciones
                      del personal
                    </li>
                    <li>
                      • Respete la necesidad de concentración y espacio de
                      estudio de otros usuarios
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Actividades prohibidas</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      • Conversaciones fuertes o comportamiento disruptivo
                    </li>
                    <li>
                      • Comida y bebidas (excepto agua en recipientes cubiertos)
                    </li>
                    <li>• Fumar o usar productos de tabaco</li>
                    <li>
                      • Retiro no autorizado de materiales de la biblioteca
                    </li>
                    <li>• Uso indebido de computadoras o acceso a internet</li>
                    <li>• Dormir o merodear</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Digital Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Política de recursos digitales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">
                    Uso de ordenadores e internet
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      • Las sesiones de computadora están limitadas a 2 horas
                      cuando otros están esperando
                    </li>
                    <li>
                      • El acceso a Internet es solo para fines educativos y de
                      investigación
                    </li>
                    <li>• Está prohibido descargar o transmitir medios</li>
                    <li>
                      • Los usuarios son responsables de guardar su trabajo; los
                      archivos se eliminan diariamente
                    </li>
                    <li>
                      • La impresión cuesta $0.10 por página (blanco y negro),
                      $0.25 por página (color)
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">
                    Acceso a colecciones digitales
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      • Se requiere una tarjeta de biblioteca válida para el
                      acceso remoto
                    </li>
                    <li>
                      • Compartir las credenciales de inicio de sesión está
                      estrictamente prohibido
                    </li>
                    <li>
                      • Las descargas son solo para uso académico personal
                    </li>
                    <li>
                      • Se aplican restricciones de derechos de autor a todos
                      los materiales digitales
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Clock className="h-5 w-5 mr-2" />
                  Referencia rápida
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm">
                    Períodos máximos de préstamo
                  </h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p>Estudiantes de grado: 2 semanas</p>
                    <p>Estudiantes de posgrado: 4 semanas</p>
                    <p>Profesorado: 8 semanas</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Multa por retraso</h4>
                  <p className="text-xs text-gray-600">
                    $0.50 por día por libro
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">
                    Límite de tiempo de la computadora
                  </h4>
                  <p className="text-xs text-gray-600">
                    2 horas cuando está ocupado
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Membership */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="h-5 w-5 mr-2" />
                  Membresía
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      Membresía gratuita
                    </Badge>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>
                        • Estudiantes universitarios, profesores, personal
                      </li>
                      <li>
                        • Se requiere una identificación universitaria válida
                      </li>
                      <li>• Renovación automática cada semestre</li>
                    </ul>
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2">
                      Membresía comunitaria
                    </Badge>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Tarifa anual de $25</li>
                      <li>
                        • Se requiere identificación con foto y comprobante de
                        domicilio
                      </li>
                      <li>• Privilegios de préstamo limitados</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Procedures */}
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-lg text-red-900">
                  Procedimientos de emergencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-red-800">
                  <p>
                    <strong>Alarma de incendio:</strong> Salga inmediatamente
                    por la salida más cercana
                  </p>
                  <p>
                    <strong>Emergencia médica:</strong> Llame al 911, notifique
                    al personal
                  </p>
                  <p>
                    <strong>Problemas de seguridad:</strong> Póngase en contacto
                    con la seguridad del campus (555) 123-9999
                  </p>
                  <p>
                    <strong>Fuera de horario:</strong> Utilice los teléfonos de
                    emergencia en el edificio
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact for Questions */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900 flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  ¿Preguntas?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-800 mb-3">
                  ¡Nuestro personal está aquí para ayudar! Si tiene preguntas
                  sobre las políticas de la biblioteca, necesita ayuda con la
                  investigación o desea una aclaración sobre alguna regla, no
                  dude en preguntar.
                </p>
                <div className="space-y-1 text-sm text-blue-700">
                  <p>📧 library@physics.university.edu</p>
                  <p>📞 (555) 123-4567</p>
                  <p>🕒 Disponible durante todas las horas de funcionamiento</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
