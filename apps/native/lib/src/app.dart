import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'screens/auth_screen.dart';
import 'screens/library_screen.dart';

class APCLOUDTheme {
  static ThemeData light() => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF2455E8)),
    scaffoldBackgroundColor: const Color(0xFFF7F9FC),
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFFF7F9FC),
      foregroundColor: Color(0xFF172033),
      elevation: 0,
      centerTitle: false,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
    ),
  );
}

class APCLOUDApp extends StatelessWidget {
  const APCLOUDApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'APCLOUD',
    debugShowCheckedModeBanner: false,
    theme: APCLOUDTheme.light(),
    home: StreamBuilder<AuthState>(
      stream: Supabase.instance.client.auth.onAuthStateChange,
      builder: (context, snapshot) {
        if (Supabase.instance.client.auth.currentSession == null) {
          return const AuthScreen();
        }
        return const LibraryScreen();
      },
    ),
  );
}
