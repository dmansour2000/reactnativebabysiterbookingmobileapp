import React, { useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, radius, spacing } from '../theme';
import { useLocale } from '../locales';

const DEFAULT_CLIENT_ID = 'ca-pub-3496568058228119';

export default function AdSenseBanner({
  clientId = DEFAULT_CLIENT_ID,
  slotId = '',
  format = 'auto',
  height = 100,
  style,
}) {
  const { t, isRTL } = useLocale();
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Google AdSense HTML string
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background-color: transparent;
            display: flex;
            align-items: center;
            justifyContent: center;
            width: 100%;
            height: 100%;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          .ad-container {
            width: 100%;
            text-align: center;
          }
          .adsbygoogle {
            display: block;
            margin: 0 auto;
          }
        </style>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}" crossorigin="anonymous"></script>
      </head>
      <body>
        <div class="ad-container">
          <ins class="adsbygoogle"
               style="display:block"
               data-ad-client="${clientId}"
               ${slotId ? `data-ad-slot="${slotId}"` : ''}
               data-ad-format="${format}"
               data-full-width-responsive="true"></ins>
          <script>
            try {
              (adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
              console.error('AdSense push error:', e);
            }
          </script>
        </div>
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.badgeRow, isRTL && styles.badgeRowRTL]}>
        <Text style={styles.adLabel}>{t('advertisement') || 'Advertisement'}</Text>
      </View>

      <View style={[styles.bannerCard, { height }]}>
        <WebView
          source={{ html: htmlContent, baseUrl: 'https://carenest.eg' }}
          style={styles.webView}
          scrollEnabled={false}
          bounces={false}
          scalesPageToFit={true}
          originWhitelist={['*']}
          mixedContentMode="always"
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setHasError(true);
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}

        {hasError && (
          <View style={styles.errorOverlay}>
            <Text style={styles.fallbackTitle}>Google AdSense</Text>
            <Text style={styles.fallbackText}>{clientId}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  badgeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  badgeRowRTL: {
    justifyContent: 'flex-end',
  },
  adLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: colors.textLight,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  bannerCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#e8dfe9',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webView: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#faf7fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  fallbackTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.plum,
    marginBottom: 2,
  },
  fallbackText: {
    fontSize: 10,
    color: colors.textMuted,
  },
});

