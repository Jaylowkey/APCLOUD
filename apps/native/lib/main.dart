import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'src/app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  const supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  const supabaseAnonKey = String.fromEnvironment('SUPABASE_PUBLISHABLE_KEY');
  if (supabaseUrl.isEmpty || supabaseAnonKey.isEmpty) {
    runApp(const APCLOUDConfigurationErrorApp());
    return;
  }
  await Supabase.initialize(
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    authOptions: const FlutterAuthClientOptions(authFlowType: AuthFlowType.pkce),
  );
  runApp(const APCLOUDApp());
}

class APCLOUDConfigurationErrorApp extends StatelessWidget {
  const APCLOUDConfigurationErrorApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'APCLOUD',
    debugShowCheckedModeBanner: false,
    theme: APCLOUDTheme.light(),
    home: const Scaffold(
      body: Center(
        child: Padding(
          padding: EdgeInsets.all(28),
          child: Text(
            'Configuração em falta. Inicia a aplicação com SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY.',
            textAlign: TextAlign.center,
          ),
        ),
      ),
    ),
  );
}
