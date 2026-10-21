import React, { useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';

const DEFAULT_AVATAR = require('../../assets/icon.png');

export default function CaregiverAvatar({
  uri,
  style,
  imageStyle,
  resizeMode = 'cover',
  onPress,
  activeOpacity = 0.8,
  children,
}) {
  const [hasError, setHasError] = useState(false);

  const imageSource = !hasError && uri ? { uri } : DEFAULT_AVATAR;

  const content = (
    <View style={[styles.container, style]}>
      <Image
        source={imageSource}
        style={[styles.image, imageStyle]}
        resizeMode={resizeMode}
        onError={() => setHasError(true)}
      />
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPress={onPress}
        style={style}
      >
        <Image
          source={imageSource}
          style={[styles.image, imageStyle]}
          resizeMode={resizeMode}
          onError={() => setHasError(true)}
        />
        {children}
      </TouchableOpacity>
    );
  }

  return content;
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
});

