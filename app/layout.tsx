import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../invitehub/context/AuthContext";
import { ThemeProvider } from "../invitehub/context/ThemeContext";

export const metadata: Metadata = {
  title: "InviteHub – Premium E-Invitation Platform",
  description:
    "Create, send, and manage beautiful digital invitations with RSVP tracking and guest management.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
