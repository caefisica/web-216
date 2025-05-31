"use client";

import { useEffect, useState } from "react";
import type { User, Donation } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import {
  BookOpen,
  Heart,
  DollarSign,
  Calendar,
  TrendingUp,
  Users,
  Award,
  Sparkles,
  Gift,
  GraduationCap,
  UserCheck,
} from "lucide-react";

interface BookDonation {
  id: string;
  title: string;
  author: string;
  donor_name: string;
  donor_type: "profesor" | "estudiante" | "personal" | "egresado";
  donated_at: string;
  image_url?: string;
}

export default function DonorsPage() {
  const [bookDonations, setBookDonations] = useState<BookDonation[]>([]);
  const [topMonetaryDonors, setTopMonetaryDonors] = useState<User[]>([]);
  const [recentMonetaryDonations, setRecentMonetaryDonations] = useState<
    Donation[]
  >([]);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMoney: 0,
    totalDonors: 0,
    thisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Simulate book donations data (in real app, this would come from a book_donations table)
      const mockBookDonations: BookDonation[] = [
        {
          id: "1",
          title: "Quantum Mechanics: Concepts and Applications",
          author: "Nouredine Zettili",
          donor_name: "Prof. Sarah Chen",
          donor_type: "profesor",
          donated_at: "2024-01-15T10:30:00Z",
          image_url: "/placeholder.svg?height=120&width=80",
        },
        {
          id: "2",
          title: "Classical Mechanics",
          author: "Herbert Goldstein",
          donor_name: "Alex Rodriguez",
          donor_type: "estudiante",
          donated_at: "2024-01-14T14:20:00Z",
          image_url: "/placeholder.svg?height=120&width=80",
        },
        {
          id: "3",
          title: "Introduction to Electrodynamics",
          author: "David J. Griffiths",
          donor_name: "Dr. Michael Thompson",
          donor_type: "profesor",
          donated_at: "2024-01-13T09:15:00Z",
          image_url: "/placeholder.svg?height=120&width=80",
        },
        {
          id: "4",
          title: "Statistical Mechanics",
          author: "R.K. Pathria",
          donor_name: "Emma Wilson",
          donor_type: "estudiante",
          donated_at: "2024-01-12T16:45:00Z",
          image_url: "/placeholder.svg?height=120&width=80",
        },
        {
          id: "5",
          title: "Modern Physics",
          author: "Kenneth S. Krane",
          donor_name: "Prof. James Liu",
          donor_type: "profesor",
          donated_at: "2024-01-11T11:30:00Z",
          image_url: "/placeholder.svg?height=120&width=80",
        },
        {
          id: "6",
          title: "Thermodynamics and Statistical Mechanics",
          author: "Walter Greiner",
          donor_name: "Maria Garcia",
          donor_type: "estudiante",
          donated_at: "2024-01-10T13:20:00Z",
          image_url: "/placeholder.svg?height=120&width=80",
        },
      ];

      // Fetch monetary donors
      const { data: donors, error: donorsError } = await supabase
        .from("users")
        .select("*")
        .gt("total_donations", 0)
        .order("total_donations", { ascending: false })
        .limit(5);

      if (donorsError) throw donorsError;

      // Fetch recent monetary donations
      const { data: donations, error: donationsError } = await supabase
        .from("donations")
        .select(
          `
          *,
          user:users!user_id(name)
        `,
        )
        .order("created_at", { ascending: false })
        .limit(3);

      if (donationsError) throw donationsError;

      // Calculate stats
      const { data: allDonations } = await supabase
        .from("donations")
        .select("amount, created_at");
      const totalMoney =
        allDonations?.reduce((sum, d) => sum + d.amount, 0) || 0;
      const totalDonors = (donors?.length || 0) + mockBookDonations.length;
      const thisMonth =
        mockBookDonations.length +
        (allDonations?.filter(
          (d) => new Date(d.created_at).getMonth() === new Date().getMonth(),
        ).length || 0);

      setBookDonations(mockBookDonations);
      setTopMonetaryDonors(donors || []);
      setRecentMonetaryDonations(donations || []);
      setStats({
        totalBooks: mockBookDonations.length,
        totalMoney,
        totalDonors,
        thisMonth,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDonorIcon = (type: string) => {
    switch (type) {
      case "profesor":
        return <GraduationCap className="h-4 w-4 text-blue-600" />;
      case "estudiante":
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case "personal":
        return <Users className="h-4 w-4 text-purple-600" />;
      case "egresado":
        return <Award className="h-4 w-4 text-orange-600" />;
      default:
        return <Heart className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDonorBadgeColor = (type: string) => {
    switch (type) {
      case "profesor":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "estudiante":
        return "bg-green-100 text-green-800 border-green-200";
      case "personal":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "egresado":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-8">
            <div className="bg-gray-200 h-12 rounded mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-32 rounded-lg" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-24 rounded-lg" />
                ))}
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-32 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center space-y-6 animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <BookOpen className="h-16 w-16 animate-bounce" />
                <Sparkles className="h-6 w-6 absolute -top-2 -right-2 animate-pulse text-yellow-300" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Nuestros increíbles donantes
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Celebrando a los generosos profesores, estudiantes y miembros de
              la comunidad que ayudan a construir nuestra biblioteca de física a
              través de donaciones de libros y monetarias
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-blue-900 mb-1">
                <AnimatedCounter value={stats.totalBooks} />
              </div>
              <p className="text-sm text-blue-700 font-medium">
                Libros donados
              </p>
            </CardContent>
          </Card>

          <Card className="text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-green-900 mb-1">
                $<AnimatedCounter value={stats.totalMoney} />
              </div>
              <p className="text-sm text-green-700 font-medium">
                Fondos recaudados
              </p>
            </CardContent>
          </Card>

          <Card className="text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-purple-900 mb-1">
                <AnimatedCounter value={stats.totalDonors} />
              </div>
              <p className="text-sm text-purple-700 font-medium">
                Total de donantes
              </p>
            </CardContent>
          </Card>

          <Card className="text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-orange-900 mb-1">
                <AnimatedCounter value={stats.thisMonth} />
              </div>
              <p className="text-sm text-orange-700 font-medium">Este mes</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Donations - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Book Donations */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-xl">
                  <Gift className="h-6 w-6 mr-3" />
                  Donaciones recientes de libros
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bookDonations.map((donation, index) => (
                    <div
                      key={donation.id}
                      className="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: "slideInUp 0.6s ease-out forwards",
                      }}
                    >
                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <img
                            src={donation.image_url || "/placeholder.svg"}
                            alt={donation.title}
                            className="w-16 h-20 object-cover rounded shadow-sm group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                            {donation.title}
                          </h3>
                          <p className="text-xs text-gray-600 mb-2">
                            by {donation.author}
                          </p>
                          <div className="flex items-center space-x-2 mb-2">
                            {getDonorIcon(donation.donor_type)}
                            <span className="text-sm font-medium text-gray-900">
                              {donation.donor_name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge
                              className={`text-xs ${getDonorBadgeColor(donation.donor_type)}`}
                            >
                              {donation.donor_type}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(
                                donation.donated_at,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="border-0 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <Heart className="h-12 w-12 text-green-600 animate-pulse" />
                    <Sparkles className="h-4 w-4 absolute -top-1 -right-1 text-yellow-500 animate-bounce" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  ¿Quieres donar libros?
                </h3>
                <p className="text-gray-700 mb-6 max-w-md mx-auto">
                  ¡Ayuda a expandir nuestra biblioteca de física! Aceptamos
                  libros de texto, materiales de investigación y recursos
                  académicos.
                </p>
                <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg transform hover:scale-105 transition-all duration-300">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Donar libros
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Monetary Donations */}
          <div className="space-y-6">
            {/* Top Monetary Donors */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Patrocinadores financieros
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {topMonetaryDonors.length === 0 ? (
                  <div className="text-center py-6">
                    <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">
                      Aún no hay donantes financieros
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topMonetaryDonors.map((donor, index) => (
                      <div
                        key={donor.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        style={{
                          animationDelay: `${index * 150}ms`,
                          animation: "fadeInRight 0.6s ease-out forwards",
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-green-600">
                              #{index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{donor.name}</p>
                            <p className="text-xs text-gray-500">
                              Since {new Date(donor.created_at).getFullYear()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600 text-sm">
                            ${donor.total_donations.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Monetary Donations */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-gray-600" />
                  Donaciones financieras recientes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {recentMonetaryDonations.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No hay donaciones recientes
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentMonetaryDonations.map((donation, index) => (
                      <div
                        key={donation.id}
                        className="flex justify-between items-center p-3 border-l-4 border-green-400 bg-green-50 rounded-r-lg"
                        style={{
                          animationDelay: `${index * 200}ms`,
                          animation: "slideInLeft 0.6s ease-out forwards",
                        }}
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {donation.user?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(donation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-bold text-green-600">
                          ${donation.amount.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Support CTA */}
            <Card className="border-0 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-6 text-center">
                <DollarSign className="h-10 w-10 text-yellow-600 mx-auto mb-3 animate-bounce" />
                <h3 className="font-bold text-yellow-900 mb-2">
                  Apoya nuestra misión
                </h3>
                <p className="text-sm text-yellow-800 mb-4">
                  Las donaciones financieras nos ayudan a mantener y expandir
                  nuestra colección.
                </p>
                <Button
                  variant="outline"
                  className="border-yellow-400 text-yellow-700 hover:bg-yellow-100 transform hover:scale-105 transition-all duration-300"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Donar ahora
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
