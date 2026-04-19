import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Dimensions,
    Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '@/navigation/types';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { BlurView } from '@react-native-community/blur';

const { width, height } = Dimensions.get('window');

type CreateStatusRouteProp = RouteProp<RootStackParamList, 'CreateStatus'>;

const PREDEFINED_TAGS = ['Creative', 'Work', 'Life', 'Update', 'Promotion', 'Available', 'Hiring'];

export default function CreateStatusScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<CreateStatusRouteProp>();
    const { imageUri } = route.params || {};
    const insets = useSafeAreaInsets();
    const colors = useColors();
    const { addStatus } = useApp();

    const [caption, setCaption] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isPosting, setIsPosting] = useState(false);

    // Safety check: if no imageUri, we can't do anything
    if (!imageUri) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.foreground }}>No image selected.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(prev => prev.filter(t => t !== tag));
        } else {
            setSelectedTags(prev => [...prev, tag]);
        }
    };

    const handlePost = async () => {
        if (isPosting || !imageUri) return;
        setIsPosting(true);
        try {
            await addStatus(imageUri, caption, selectedTags);
            // Navigate back to the main feed after posting
            navigation.navigate('Main');
        } catch (error: any) {
            console.error('Failed to post status:', error);
            Alert.alert("Post Failed", error.message || "Could not share status. Please try again.");
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Full Screen Image Preview */}
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />

            {/* Overlays */}
            <View style={styles.overlay}>
                <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.closeButton}
                    >
                        <BlurView blurType="dark" blurAmount={10} style={styles.blurCircle}>
                            <Feather name="x" size={24} color="#FFF" />
                        </BlurView>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handlePost}
                        disabled={isPosting}
                        style={[
                            styles.postButton,
                            { backgroundColor: colors.headerBackground || colors.primary }
                        ]}
                    >
                        {isPosting ? (
                            <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                            <>
                                <Text style={styles.postButtonText}>Share</Text>
                                <Ionicons name="paper-plane" size={18} color="#FFF" style={{ marginLeft: 6 }} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardContent}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.spacer} />

                        {/* Caption Input */}
                        <View style={styles.inputContainer}>
                            <BlurView blurType="dark" blurAmount={15} style={styles.inputBlur}>
                                <TextInput
                                    placeholder="Add a caption..."
                                    placeholderTextColor="rgba(255,255,255,0.6)"
                                    style={styles.textInput}
                                    multiline
                                    maxLength={200}
                                    value={caption}
                                    onChangeText={setCaption}
                                />
                            </BlurView>
                        </View>

                        {/* Tag Selection */}
                        <View style={styles.tagsSection}>
                            <Text style={styles.sectionTitle}>Status Tags</Text>
                            <View style={styles.tagsContainer}>
                                {PREDEFINED_TAGS.map(tag => {
                                    const isSelected = selectedTags.includes(tag);
                                    return (
                                        <TouchableOpacity
                                            key={tag}
                                            onPress={() => toggleTag(tag)}
                                            style={[
                                                styles.tagChip,
                                                isSelected && { backgroundColor: colors.primary }
                                            ]}
                                        >
                                            {!isSelected && (
                                                <BlurView
                                                    blurType="dark"
                                                    blurAmount={10}
                                                    style={StyleSheet.absoluteFill}
                                                />
                                            )}
                                            <Text style={[styles.tagText, isSelected && { color: '#FFF' }]}>
                                                {isSelected ? `#${tag}` : tag}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                        <View style={{ height: insets.bottom + 40 }} />
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    previewImage: {
        ...StyleSheet.absoluteFillObject,
        width: width,
        height: height,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 10,
    },
    closeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
    },
    blurCircle: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    postButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    postButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    keyboardContent: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
    },
    spacer: {
        flex: 1,
    },
    inputContainer: {
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    inputBlur: {
        padding: 18,
    },
    textInput: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '500',
        minHeight: 80,
        maxHeight: 150,
        textAlignVertical: 'top',
    },
    tagsSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        opacity: 0.8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    tagChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    tagText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '600',
    },
});
