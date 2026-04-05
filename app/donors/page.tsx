"use client";

import { useEffect, useState } from "react";
import { getDonors, getDonations, getDonationsStats } from "@/lib/actions/donors";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Users, BookOpen, Quote, Calendar } from "lucide-react";

export default function DonorsPage() {
  const [activeDonors, setActiveDonors] = useState<any[]>([]);
  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total_books: 0, total_donors: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonationsData();
  }, []);

  const fetchDonationsData = async () => {
    try {
      setLoading(true);
      const [donorsData, donationsData, statsData] = await Promise.all([
        getDonors(),
        getDonations(),
        getDonationsStats(),
      ]);

      setActiveDonors(donorsData || []);
      setRecentDonations(donationsData || []);
      setStats(statsData || { total_books: 0, total_donors: 0 });
    } catch (error) {
      console.error("Error fetching donations data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Heart className="h-64 w-64" />
        </div>
        <div className="container mx-auto px-6 py-16 text-center">
          <Badge className="mb-4 bg-red-100 text-red-600 border-red-200">Nuestros Donantes</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Gracias a ti, seguimos creciendo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Cada libro donado es una puerta que se abre para un nuevo lector. Nuestra comunidad se
            fortalece con cada contribución.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white border p-6 rounded-xl shadow-sm w-44">
              <div className="flex justify-center mb-2">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">{stats.total_books}</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">Libros Donados</div>
            </div>
            <div className="bg-white border p-6 rounded-xl shadow-sm w-44">
              <div className="flex justify-center mb-2">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{stats.total_donors}</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">Donantes</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <Tabs defaultValue="donors" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
              <TabsTrigger value="donors">Donantes</TabsTrigger>
              <TabsTrigger value="donations">Donaciones Recientes</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="donors">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="h-48 bg-white border rounded-xl animate-pulse" />
                  ))
              ) : activeDonors.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  Aún no hay donantes registrados.
                </div>
              ) : (
                activeDonors.map((donor) => (
                  <Card
                    key={donor.id}
                    className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="bg-blue-50/50 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                          {donor.name.charAt(0)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{donor.name}</CardTitle>
                          <div className="text-xs text-blue-600 font-medium">DONANTE MIEMBRO</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {donor.motivation && (
                        <div className="relative">
                          <Quote className="h-4 w-4 text-gray-200 absolute -top-1 -left-2" />
                          <p className="text-sm text-gray-600 italic px-4">{donor.motivation}</p>
                        </div>
                      )}
                      <Separator className="my-4" />
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Se unió el {new Date(donor.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="donations">
            <Card className="border-none shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-4">Libro</th>
                        <th className="px-6 py-4">Autor</th>
                        <th className="px-6 py-4">Donante</th>
                        <th className="px-6 py-4 text-center">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentDonations.map((donation) => (
                        <tr key={donation.id} className="bg-white border-b hover:bg-gray-50/50">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {donation.bookTitle}
                          </td>
                          <td className="px-6 py-4">{donation.bookAuthor}</td>
                          <td className="px-6 py-4">{donation.donor?.name || "Anónimo"}</td>
                          <td className="px-6 py-4 text-center">
                            {new Date(donation.donationDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
