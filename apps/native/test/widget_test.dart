import 'package:flutter_test/flutter_test.dart';
import 'package:apcloud_native/src/app.dart';

void main() {
  test('APCLOUD theme uses Material 3', () {
    expect(APCLOUDTheme.light().useMaterial3, isTrue);
  });
}
