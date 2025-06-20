import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showTimestamp?: boolean;
}

export default function MessageBubble({ message, isOwn, showTimestamp = true }: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, isOwn ? styles.ownMessage : styles.otherMessage]}>
      <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        {message.type === 'image' && message.imageUrl ? (
          <Image source={{ uri: message.imageUrl }} style={styles.image} />
        ) : (
          <Text style={[styles.text, isOwn ? styles.ownText : styles.otherText]}>
            {message.text}
          </Text>
        )}
      </View>
      {showTimestamp && (
        <Text style={[styles.timestamp, isOwn ? styles.ownTimestamp : styles.otherTimestamp]}>
          {formatTime(message.timestamp)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    paddingHorizontal: 16,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownText: {
    color: '#FFFFFF',
  },
  otherText: {
    color: '#000000',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    color: '#8E8E93',
  },
  ownTimestamp: {
    textAlign: 'right',
  },
  otherTimestamp: {
    textAlign: 'left',
  },
});