import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { ProAuthProvider } from "../context/ProAuthContext";
import { ThemeProvider } from "../context/ThemeContext";

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
          <ProAuthProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </ProAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
