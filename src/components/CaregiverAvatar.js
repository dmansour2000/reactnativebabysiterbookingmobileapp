import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { colors } from '../theme';

export default function CaregiverAvatar({
  uri,
  name,
  style,
  imageStyle,
  resizeMode = 'cover',
  onPress,
  activeOpacity = 0.8,
  children,
}) {
  const [hasError, setHasError] = useState(false);

  const initial = (name || 'C').charAt(0).toUpperCase();
  const showImage = !hasError && Boolean(uri);

  const renderInner = () => {
    if (showImage) {
      return (
        <Image
          source={{ uri }}
          style={[styles.image, imageStyle]}
          resizeMode={resizeMode}
          onError={() => setHasError(true)}
        />
      );
    }

    return (
      <View style={[styles.fallbackContainer, imageStyle]}>
        <Text style={styles.initialText}>{initial}</Text>
      </View>
    );
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPress={onPress}
        style={[styles.container, style]}
      >
        {renderInner()}
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {renderInner()}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5eff7',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallbackContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
});
