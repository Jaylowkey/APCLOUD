# APCLOUD Native

Aplicação Flutter compilada nativamente para Windows, Android e iOS. Não é PWA e não incorpora o site numa WebView.

## Requisitos

- Flutter stable instalado e configurado para Windows/Android/iOS.
- Windows: Visual Studio com workload **Desktop development with C++**.
- Android: Android Studio + Android SDK.
- iOS: macOS + Xcode (não é possível compilar iOS no Windows).

## Gerar os projectos nativos de plataforma

A partir desta pasta:

```powershell
flutter create --project-name apcloud_native --platforms=windows,android,ios .
flutter pub get
```

O comando gera os project runners nativos. Não substituas os ficheiros em `lib/`.

## Configuração Supabase

Usa o mesmo projecto APCLOUD existente e a respectiva publishable/anon key. Nunca uses `service_role`.

PowerShell:

```powershell
flutter run -d windows --dart-define=SUPABASE_URL=https://itvfvfqbghobktgopzxw.supabase.co --dart-define=SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
```

Android:

```powershell
flutter run -d android --dart-define=SUPABASE_URL=https://itvfvfqbghobktgopzxw.supabase.co --dart-define=SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
```

A chave pública é a publishable/anon key do Supabase. Não a confundas com a service-role key.

## Primeira etapa implementada

- Autenticação com as contas APCLOUD existentes.
- Leitura da biblioteca privada `photos` e visualização de imagens com URLs assinadas de curta duração.
- Interface Flutter adaptável para desktop e mobile.

Ainda não implementados: upload nativo, picker de ficheiros/fotos, fila offline, sincronização automática, backup em segundo plano, gestão de dispositivos e notificações push.

## Compatibilidade com o backend

A aplicação usa a tabela `public.photos` e o bucket privado `photos` já usados pelo site. Não cria tabelas, buckets ou políticas novas.
