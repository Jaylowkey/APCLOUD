import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class LibraryScreen extends StatefulWidget {
  const LibraryScreen({super.key});
  @override
  State<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends State<LibraryScreen> {
  late Future<List<Map<String, dynamic>>> _photos;
  @override
  void initState() {
    super.initState();
    _photos = _loadPhotos();
  }

  Future<List<Map<String, dynamic>>> _loadPhotos() async {
    final client = Supabase.instance.client;
    final response = await client
      .from('photos')
      .select('id, storage_path, original_name, mime_type, size_bytes, created_at, deleted_at')
      .isFilter('deleted_at', null)
      .order('created_at', ascending: false);
    final rows = List<Map<String, dynamic>>.from(response);
    for (final row in rows) {
      final path = row['storage_path'] as String?;
      if (path == null || path.isEmpty) continue;
      row['signed_url'] = await client.storage.from('photos').createSignedUrl(path, 300);
    }
    return rows;
  }

  Future<void> _refresh() async {
    setState(() => _photos = _loadPhotos());
    await _photos;
  }

  Future<void> _signOut() async => Supabase.instance.client.auth.signOut();

  String _formatSize(dynamic bytes) {
    final size = (bytes as num?)?.toDouble() ?? 0;
    if (size < 1024) return '${size.toStringAsFixed(0)} B';
    if (size < 1024 * 1024) return '${(size / 1024).toStringAsFixed(1)} KB';
    return '${(size / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  @override
  Widget build(BuildContext context) {
    final email = Supabase.instance.client.auth.currentUser?.email ?? 'Conta APCLOUD';
    return Scaffold(
      appBar: AppBar(
        title: const Row(children: [
          Icon(Icons.cloud_done_rounded, color: Color(0xFF2455E8)),
          SizedBox(width: 10),
          Text('APCLOUD', style: TextStyle(fontWeight: FontWeight.w800)),
        ]),
        actions: [
          IconButton(tooltip: 'Actualizar', onPressed: _refresh, icon: const Icon(Icons.refresh)),
          IconButton(tooltip: 'Terminar sessão', onPressed: _signOut, icon: const Icon(Icons.logout)),
          const SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: FutureBuilder<List<Map<String, dynamic>>>(
          future: _photos,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError) {
              return ListView(children: [
                const SizedBox(height: 120),
                const Icon(Icons.cloud_off_outlined, size: 52, color: Colors.blueGrey),
                const SizedBox(height: 12),
                const Center(child: Text('Não foi possível carregar os ficheiros.')),
                Center(child: TextButton(onPressed: _refresh, child: const Text('Tentar novamente'))),
              ]);
            }
            final files = snapshot.data ?? [];
            if (files.isEmpty) {
              return ListView(children: [
                const SizedBox(height: 120),
                const Icon(Icons.photo_library_outlined, size: 64, color: Color(0xFF2455E8)),
                const SizedBox(height: 16),
                const Center(child: Text('A tua biblioteca está vazia', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700))),
                const Center(child: Text('Os teus ficheiros aparecerão aqui.')),
              ]);
            }
            return CustomScrollView(slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 18),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Olá, $email', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 4),
                    Text('${files.length} ficheiro(s) na tua biblioteca', style: TextStyle(color: Colors.blueGrey.shade600)),
                  ]),
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                sliver: SliverGrid(
                  delegate: SliverChildBuilderDelegate((context, index) {
                    final file = files[index];
                    final mime = (file['mime_type'] as String?) ?? '';
                    final isImage = mime.startsWith('image/');
                    final url = file['signed_url'] as String?;
                    return Card(
                      clipBehavior: Clip.antiAlias,
                      elevation: 0,
                      color: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                        side: const BorderSide(color: Color(0xFFE8EDF5)),
                      ),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                        Expanded(
                          child: isImage && url != null
                            ? Image.network(url, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.broken_image_outlined, size: 42))
                            : const Center(child: Icon(Icons.insert_drive_file_outlined, size: 44, color: Color(0xFF2455E8))),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(10),
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text((file['original_name'] as String?) ?? 'Ficheiro', maxLines: 1, overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontWeight: FontWeight.w600)),
                            const SizedBox(height: 3),
                            Text(_formatSize(file['size_bytes']), style: TextStyle(fontSize: 12, color: Colors.blueGrey.shade600)),
                          ]),
                        ),
                      ]),
                    );
                  }, childCount: files.length),
                  gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                    maxCrossAxisExtent: 220,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 0.82,
                  ),
                ),
              ),
            ]);
          },
        ),
      ),
    );
  }
}
