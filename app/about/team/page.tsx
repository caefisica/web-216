"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, BookOpen, Award, GraduationCap } from "lucide-react";

const teamMembers = [
  {
    name: "Dr. Sarah Chen",
    role: "Bibliotecario jefe",
    image: "/placeholder.svg?height=200&width=200",
    bio: "La Dra. Chen ha liderado nuestra biblioteca durante más de 15 años. Tiene un doctorado en Física del MIT y un MLIS de la Universidad de Columbia. Sus intereses de investigación incluyen la teoría de la información cuántica y la biblioteconomía.",
    specialties: [
      "Física cuántica",
      "Ciencia de la información",
      "Colecciones digitales",
    ],
    email: "s.chen@physics.university.edu",
    phone: "(555) 123-4567",
  },
  {
    name: "Prof. Michael Rodriguez",
    role: "Bibliotecario senior de física",
    image: "/placeholder.svg?height=200&width=200",
    bio: "El Prof. Rodriguez se especializa en recursos de física computacional y ha escrito varios artículos sobre gestión de información científica. Se unió a nuestro equipo en 2018 después de 10 años en la investigación académica.",
    specialties: [
      "Física computacional",
      "Métodos de investigación",
      "Gestión de datos",
    ],
    email: "m.rodriguez@physics.university.edu",
    phone: "(555) 123-4568",
  },
  {
    name: "Dr. Emily Watson",
    role: "Especialista en colecciones",
    image: "/placeholder.svg?height=200&width=200",
    bio: "La Dra. Watson gestiona nuestra colección de libros raros y supervisa las adquisiciones. Tiene una experiencia particular en textos históricos de física y la evolución de la literatura científica.",
    specialties: [
      "Física histórica",
      "Libros raros",
      "Desarrollo de colecciones",
    ],
    email: "e.watson@physics.university.edu",
    phone: "(555) 123-4569",
  },
  {
    name: "James Park",
    role: "Gerente de sistemas digitales",
    image: "/placeholder.svg?height=200&width=200",
    bio: "James lidera nuestras iniciativas digitales y mantiene nuestro sistema de catálogo en línea. Tiene experiencia en informática y tecnología de bibliotecas, lo que garantiza que nuestros recursos digitales sean accesibles y estén actualizados.",
    specialties: [
      "Sistemas digitales",
      "Gestión de bases de datos",
      "Experiencia de usuario",
    ],
    email: "j.park@physics.university.edu",
    phone: "(555) 123-4570",
  },
  {
    name: "Dr. Lisa Thompson",
    role: "Bibliotecario de apoyo a la investigación",
    image: "/placeholder.svg?height=200&width=200",
    bio: "La Dra. Thompson ayuda a los investigadores a encontrar y acceder a literatura especializada en física. Proporciona consultas de investigación e imparte talleres de alfabetización informacional para estudiantes de posgrado.",
    specialties: [
      "Apoyo a la investigación",
      "Alfabetización informacional",
      "Educación de posgrado",
    ],
    email: "l.thompson@physics.university.edu",
    phone: "(555) 123-4571",
  },
  {
    name: "Alex Kumar",
    role: "Coordinador de servicios estudiantiles",
    image: "/placeholder.svg?height=200&width=200",
    bio: "Alex se centra en el apoyo a los estudiantes de pregrado y organiza grupos de estudio y sesiones de tutoría. Tiene una maestría en Educación Física y le apasiona hacer que la física sea accesible para todos los estudiantes.",
    specialties: [
      "Apoyo estudiantil",
      "Educación física",
      "Programas de divulgación",
    ],
    email: "a.kumar@physics.university.edu",
    phone: "(555) 123-4572",
  },
];

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            Nuestro equipo
          </h1>
          <p className="text-gray-600">
            Conoce a los profesionales dedicados que hacen de nuestra biblioteca
            un centro de excelencia
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <p className="text-blue-600 font-medium">{member.role}</p>
                  </div>

                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    {member.bio}
                  </p>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 flex items-center text-sm">
                      <Award className="h-4 w-4 mr-1" />
                      Especialidades
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {member.specialties.map((specialty, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs"
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <a
                        href={`mailto:${member.email}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {member.email}
                      </a>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <a
                        href={`tel:${member.phone}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {member.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Únete a nuestro equipo
              </h3>
              <p className="text-blue-800 text-sm mb-4">
                Siempre estamos buscando personas apasionadas para unirse a
                nuestra misión de promover la educación en física y el apoyo a
                la investigación.
              </p>
              <p className="text-blue-700 text-sm">
                Puede encontrar las vacantes actuales y la información sobre
                cómo presentar una solicitud en la página de carreras de nuestra
                universidad.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Oportunidades de voluntariado
              </h3>
              <p className="text-green-800 text-sm mb-4">
                Los estudiantes de posgrado y los miembros del profesorado
                pueden ofrecerse como voluntarios para ayudar con proyectos
                especiales, la organización de colecciones y los programas de
                tutoría para estudiantes.
              </p>
              <p className="text-green-700 text-sm">
                Póngase en contacto con nosotros para obtener información sobre
                las oportunidades de voluntariado actuales.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
