"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Secure invitation email template
const createInvitationEmailHTML = (
  name: string,
  inviterName: string,
  role: string,
  setupUrl: string,
) => {
  const roleText = role === "librarian" ? "bibliotecario" : "usuario";

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invitación al Sistema de Biblioteca</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
          font-size: 16px;
          line-height: 1.5;
          color: #000000;
          background-color: #ffffff;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
        }
        
        .header {
          padding: 48px 24px 32px 24px;
          text-align: center;
          border-bottom: 1px solid #eaeaea;
        }
        
        .logo {
          font-size: 24px;
          font-weight: 600;
          color: #000000;
          margin-bottom: 8px;
        }
        
        .subtitle {
          font-size: 14px;
          color: #666666;
        }
        
        .content {
          padding: 32px 24px;
        }
        
        .greeting {
          font-size: 16px;
          font-weight: 500;
          color: #000000;
          margin-bottom: 24px;
        }
        
        .intro {
          font-size: 16px;
          color: #000000;
          margin-bottom: 32px;
          line-height: 1.6;
        }
        
        .cta-section {
          border: 1px solid #eaeaea;
          padding: 24px;
          margin: 32px 0;
          text-align: center;
        }
        
        .cta-title {
          font-size: 16px;
          font-weight: 500;
          color: #000000;
          margin-bottom: 16px;
        }
        
        .button {
          display: inline-block;
          background-color: #000000;
          color: #ffffff;
          padding: 12px 24px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          border: none;
          margin: 16px 0;
        }
        
        .expiry-note {
          font-size: 14px;
          color: #666666;
          margin-top: 16px;
        }
        
        .section {
          margin: 32px 0;
        }
        
        .section-title {
          font-size: 16px;
          font-weight: 500;
          color: #000000;
          margin-bottom: 16px;
        }
        
        .permissions-list {
          margin: 0;
          padding-left: 16px;
        }
        
        .permissions-list li {
          color: #000000;
          margin-bottom: 8px;
          font-size: 16px;
        }
        
        .info-box {
          border: 1px solid #eaeaea;
          padding: 16px;
          margin: 24px 0;
          background-color: #fafafa;
        }
        
        .info-box-title {
          font-size: 14px;
          font-weight: 500;
          color: #000000;
          margin-bottom: 8px;
        }
        
        .info-box-text {
          font-size: 14px;
          color: #666666;
        }
        
        .support-text {
          color: #666666;
          font-size: 14px;
          margin-top: 32px;
        }
        
        .footer {
          padding: 32px 24px;
          text-align: center;
          border-top: 1px solid #eaeaea;
        }
        
        .footer-text {
          color: #999999;
          font-size: 12px;
          margin: 4px 0;
        }
        
        /* Email-safe media queries */
        @media screen and (max-width: 600px) {
          .container {
            width: 100% !important;
          }
          .content {
            padding: 24px 16px !important;
          }
          .header {
            padding: 32px 16px 24px 16px !important;
          }
          .cta-section {
            padding: 20px !important;
          }
        }
      </style>
    </head>
    <body>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td>
            <div class="container">
              <div class="header">
                <div class="logo">Sistema de Biblioteca</div>
                <div class="subtitle">Invitación de acceso</div>
              </div>
              
              <div class="content">
                <div class="greeting">Hola ${name},</div>
                
                <div class="intro">
                  ${inviterName} te ha invitado a unirte al sistema de biblioteca como ${roleText}.
                </div>
                
                <div class="cta-section">
                  <div class="cta-title">Configura tu cuenta</div>
                  <a href="${setupUrl}" class="button">Establecer contraseña</a>
                  <div class="expiry-note">Este enlace expira en 24 horas</div>
                </div>
                
                <div class="section">
                  <div class="section-title">Permisos de ${roleText}:</div>
                  <ul class="permissions-list">
                    ${
                      role === "librarian"
                        ? `
                    <li>Gestionar catálogo de libros</li>
                    <li>Aprobar préstamos</li>
                    <li>Administrar devoluciones</li>
                    <li>Acceder a reportes</li>
                    `
                        : `
                    <li>Consultar catálogo</li>
                    <li>Solicitar préstamos</li>
                    <li>Gestionar perfil</li>
                    <li>Historial personal</li>
                    `
                    }
                  </ul>
                </div>
                
                <div class="info-box">
                  <div class="info-box-title">Seguridad</div>
                  <div class="info-box-text">
                    Tu contraseña solo la estableces tú. No la compartimos por correo electrónico.
                  </div>
                </div>
                
                <div class="info-box">
                  <div class="info-box-title">¿No solicitaste esta invitación?</div>
                  <div class="info-box-text">
                    Puedes ignorar este mensaje de forma segura.
                  </div>
                </div>
                
                <div class="support-text">
                  Para soporte, contacta a ${inviterName} o nuestro equipo técnico.
                </div>
              </div>
              
              <div class="footer">
                <div class="footer-text">Este mensaje se generó automáticamente</div>
                <div class="footer-text">© ${new Date().getFullYear()} Sistema de Biblioteca</div>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// Email sending function using Resend SDK
async function sendEmail(to: string, subject: string, html: string) {
  try {
    // Check if we have the required environment variables
    if (!process.env.RESEND_API_KEY) {
      return { success: false, error: "Email service not configured" };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      console.error("❌ Invalid email format:", to);
      return {
        success: false,
        error: "Formato de correo electrónico inválido",
      };
    }

    // Send email using Resend SDK
    const { data, error } = await resend.emails.send({
      from: "Biblioteca 216 <biblioteca@caefisica.com>",
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      let errorMessage = "Error del servicio de correo";
      if (error.message?.includes("validation")) {
        errorMessage = "Error de validación en los datos del correo";
      } else if (error.message?.includes("domain")) {
        errorMessage = "Error de dominio no verificado";
      } else if (error.message?.includes("rate")) {
        errorMessage = "Límite de envío excedido";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error inesperado enviando correo",
    };
  }
}

export async function inviteUser(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const role = formData.get("role") as "user" | "librarian";
    const inviterName =
      (formData.get("inviterName") as string) || "Administrador";

    if (!email || !name || !role) {
      return {
        success: false,
        error: "Todos los campos son requeridos",
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: "Formato de correo electrónico inválido",
      };
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return {
        success: false,
        error: "Ya existe un usuario con este correo electrónico",
      };
    }

    // Create user without password (they'll set it via the invite link)
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          name,
          role,
          invited: true,
          invitation_pending: true,
        },
      });

    if (authError) {
      console.error("❌ Auth error:", authError);
      return {
        success: false,
        error: `Error creando usuario: ${authError.message}`,
      };
    }

    if (!authUser.user) {
      return {
        success: false,
        error: "No se pudo crear el usuario",
      };
    }

    // Create user profile
    const { error: profileError } = await supabaseAdmin.from("users").insert([
      {
        id: authUser.user.id,
        email,
        name,
        role,
        total_donations: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    if (profileError) {
      // Clean up the auth user if profile creation failed
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      return {
        success: false,
        error: `Error creando perfil: ${profileError.message}`,
      };
    }

    // Generate password reset link for the user to set their password
    const { data: resetData, error: resetError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/setup-password`,
        },
      });

    if (resetError) {
      return {
        success: false,
        error: `Error generando enlace de configuración: ${resetError.message}`,
      };
    }

    // Use the full action link as the setup URL
    const setupUrl =
      resetData.properties?.action_link ||
      `${process.env.NEXT_PUBLIC_SITE_URL}/auth/setup-password`;

    // Send secure invitation email
    const emailHTML = createInvitationEmailHTML(
      name,
      inviterName,
      role,
      setupUrl,
    );
    const emailResult = await sendEmail(
      email,
      `🎉 ${inviterName} te ha invitado al Sistema de Biblioteca`,
      emailHTML,
    );

    if (!emailResult.success) {
      console.warn(
        "⚠️ Email sending failed, but user was created:",
        emailResult.error,
      );
    }

    revalidatePath("/");

    return {
      success: true,
      message: `Usuario ${name} invitado exitosamente. ${emailResult.success ? "Se ha enviado un correo con el enlace de configuración." : `Usuario creado, pero el correo no pudo enviarse: ${emailResult.error}`}`,
      emailSent: emailResult.success,
      setupRequired: true,
      setupUrl: emailResult.success ? undefined : setupUrl, // Only provide URL if email failed
    };
  } catch (error) {
    console.error("❌ Unexpected error in inviteUser:", error);
    return {
      success: false,
      error: "Error inesperado al invitar usuario",
    };
  }
}

export async function updateUserRole(
  userId: string,
  newRole: "user" | "librarian" | "admin" | "suspended",
) {
  try {
    // Get current user count by role to prevent removing last admin
    if (newRole !== "admin") {
      const { count: adminCount } = await supabaseAdmin
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");

      const { data: targetUser } = await supabaseAdmin
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (adminCount === 1 && targetUser?.role === "admin") {
        return {
          success: false,
          error: "No se puede degradar al último administrador",
        };
      }
    }

    const { error } = await supabaseAdmin
      .from("users")
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      return {
        success: false,
        error: `Error actualizando rol: ${error.message}`,
      };
    }

    revalidatePath("/");

    return {
      success: true,
      message: `Rol actualizado a ${newRole === "admin" ? "administrador" : newRole === "librarian" ? "bibliotecario" : newRole === "suspended" ? "suspendido" : "usuario"}`,
    };
  } catch (error) {
    console.error("Error updating user role:", error);
    return {
      success: false,
      error: "Error inesperado al actualizar rol",
    };
  }
}

export async function suspendUser(userId: string) {
  try {
    const { error } = await supabaseAdmin
      .from("users")
      .update({
        role: "suspended",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      return {
        success: false,
        error: `Error suspendiendo usuario: ${error.message}`,
      };
    }

    revalidatePath("/");

    return {
      success: true,
      message: "Usuario suspendido exitosamente",
    };
  } catch (error) {
    console.error("Error suspending user:", error);
    return {
      success: false,
      error: "Error inesperado al suspender usuario",
    };
  }
}
