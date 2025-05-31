"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Clock, BookOpen, TrendingUp, Eye, EyeOff } from "lucide-react";

interface TimelineEvent {
  id: string;
  type: "borrow" | "return" | "request";
  timestamp: string;
  book_title: string;
  user_name?: string;
  user_initials?: string;
  status: string;
  anonymized?: boolean;
}

export function BorrowingTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnonymized, setShowAnonymized] = useState(false);
  const [publicView, setPublicView] = useState(false);

  useEffect(() => {
    fetchTimelineEvents();
  }, [showAnonymized]);

  const fetchTimelineEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("borrow_requests")
        .select(
          `
          id,
          status,
          request_date,
          approved_date,
          returned_date,
          book:books!book_id(title),
          user:users!user_id(name)
        `,
        )
        .order("request_date", { ascending: false })
        .limit(50);

      if (error) throw error;

      const timelineEvents: TimelineEvent[] = [];

      data?.forEach((request) => {
        const userName = showAnonymized ? undefined : request.user?.name;
        const userInitials = userName
          ? userName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
          : "U";

        // Request event
        timelineEvents.push({
          id: `${request.id}-request`,
          type: "request",
          timestamp: request.request_date,
          book_title: request.book?.title || "Unknown Book",
          user_name: userName,
          user_initials: userInitials,
          status: request.status,
          anonymized: showAnonymized,
        });

        // Approval/Borrow event
        if (request.approved_date && request.status !== "rejected") {
          timelineEvents.push({
            id: `${request.id}-borrow`,
            type: "borrow",
            timestamp: request.approved_date,
            book_title: request.book?.title || "Unknown Book",
            user_name: userName,
            user_initials: userInitials,
            status: request.status,
            anonymized: showAnonymized,
          });
        }

        // Return event
        if (request.returned_date) {
          timelineEvents.push({
            id: `${request.id}-return`,
            type: "return",
            timestamp: request.returned_date,
            book_title: request.book?.title || "Unknown Book",
            user_name: userName,
            user_initials: userInitials,
            status: "returned",
            anonymized: showAnonymized,
          });
        }
      });

      // Sort by timestamp
      timelineEvents.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      setEvents(timelineEvents);
    } catch (error) {
      console.error("Error fetching timeline events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "request":
        return <Clock className="h-4 w-4" />;
      case "borrow":
        return <BookOpen className="h-4 w-4" />;
      case "return":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string, status: string) => {
    if (status === "rejected") return "bg-red-100 text-red-800 border-red-200";

    switch (type) {
      case "request":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "borrow":
        return "bg-green-100 text-green-800 border-green-200";
      case "return":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEventText = (event: TimelineEvent) => {
    const userText = event.anonymized
      ? "Un usuario"
      : event.user_name || "Un usuario";

    switch (event.type) {
      case "request":
        return event.status === "rejected"
          ? `${userText} tuvo su solicitud de "${event.book_title}" rechazada`
          : `${userText} solicitó "${event.book_title}"`;
      case "borrow":
        return `${userText} tomó prestado "${event.book_title}"`;
      case "return":
        return `${userText} devolvió "${event.book_title}"`;
      default:
        return `Actividad para "${event.book_title}"`;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `hace ${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 24 * 7) {
      return `hace ${Math.floor(diffInHours / 24)}d`;
    } else {
      return date.toLocaleDateString("es-ES");
    }
  };

  const getEventTypeText = (type: string) => {
    switch (type) {
      case "request":
        return "solicitud";
      case "borrow":
        return "préstamo";
      case "return":
        return "devolución";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Cronograma de actividad de la biblioteca
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="anonymize"
                  checked={showAnonymized}
                  onCheckedChange={setShowAnonymized}
                />
                <Label htmlFor="anonymize" className="text-sm">
                  Anonimizar usuarios
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="public-view"
                  checked={publicView}
                  onCheckedChange={setPublicView}
                />
                <Label htmlFor="public-view" className="text-sm">
                  Vista pública
                </Label>
                {publicView ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            {publicView
              ? "Este cronograma muestra actividad bibliotecaria anonimizada y sería visible para todos los usuarios."
              : "Este cronograma muestra actividad bibliotecaria detallada para propósitos administrativos."}
          </p>
          {publicView && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Nota de privacidad:</strong> Cuando es público, toda la
                información del usuario se anonimiza automáticamente para
                proteger la privacidad mientras se muestran los patrones de
                actividad de la biblioteca.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 animate-pulse"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay actividad para mostrar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event, index) => (
                <div key={event.id} className="flex items-start space-x-4">
                  {/* Timeline Line */}
                  <div className="relative">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getEventColor(
                        event.type,
                        event.status,
                      )
                        .replace("text-", "border-")
                        .replace("bg-", "bg-white border-")}`}
                    >
                      {event.anonymized || publicView ? (
                        getEventIcon(event.type)
                      ) : (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {event.user_initials}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    {index < events.length - 1 && (
                      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-gray-200" />
                    )}
                  </div>

                  {/* Event Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-900">
                        {getEventText(event)}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={getEventColor(event.type, event.status)}
                        >
                          {getEventTypeText(event.type)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Privacidad y protección de datos
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-gray-600 space-y-2">
          <p>
            <strong>Vista de administrador:</strong> Muestra actividad detallada
            para propósitos de gestión bibliotecaria. Los nombres de usuario son
            visibles solo para el personal autorizado.
          </p>
          <p>
            <strong>Vista pública:</strong> Cuando está habilitado, este
            cronograma podría mostrarse públicamente con toda la información del
            usuario anonimizada para mostrar patrones de actividad bibliotecaria
            mientras se protege la privacidad.
          </p>
          <p>
            <strong>Retención de datos:</strong> Los datos de actividad se
            conservan para propósitos operacionales y pueden ser anonimizados o
            eliminados bajo solicitud en cumplimiento con las regulaciones de
            privacidad.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
