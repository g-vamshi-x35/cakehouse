import { useIsFocused } from 'expo-router';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SITE_VIDEOS } from '@/lib/video-map';

/**
 * Silent, looping background video from the website (like its <LazyVideo>).
 * The poster frame shows instantly; the video fades in over it once the first
 * frame is ready. Playback pauses when the screen isn't focused, and it mixes
 * with the user's own music instead of interrupting it.
 */
export function SiteVideo({ name, style, active = true }: { name: keyof typeof SITE_VIDEOS | string; style?: StyleProp<ViewStyle>; active?: boolean }) {
  const media = SITE_VIDEOS[name];
  const focused = useIsFocused();
  const [ready, setReady] = useState(false);
  const player = useVideoPlayer(media?.video ?? null, (p) => {
    p.loop = true;
    p.muted = true;
    p.audioMixingMode = 'mixWithOthers';
  });

  const shouldPlay = focused && active;
  useEffect(() => {
    if (shouldPlay) player.play();
    else player.pause();
  }, [player, shouldPlay]);

  if (!media) return <View style={style} />;
  return (
    <View style={[styles.wrap, style]} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {media.poster ? <Image source={media.poster} style={StyleSheet.absoluteFill} contentFit="cover" alt="" /> : null}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: ready ? 1 : 0 }]} entering={ready ? FadeIn.duration(500) : undefined}>
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
          allowsPictureInPicture={false}
          surfaceType="textureView"
          onFirstFrameRender={() => setReady(true)}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: '#1f1411' },
});
