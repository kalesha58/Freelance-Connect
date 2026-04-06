import React, { useState, useRef, useEffect } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
    Alert,
    Keyboard,
    Animated,
    Dimensions,
    KeyboardEvent,
    StatusBar
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import { BlurView } from "@react-native-community/blur";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { uploadImage } from "@/utils/apiClient";

const { width } = Dimensions.get("window");

/**
 * Phase 2 Redesign for a "Rich & Premium" UI.
 * Inspired by modern post-creation interfaces like LinkedIn, Twitter, and Threads.
 */
export default function CreatePostScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { user, addPost } = useApp();

    const [caption, setCaption] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [postType, setPostType] = useState<"social" | "portfolio">(user?.role === "freelancer" ? "portfolio" : "social");
    const [isPosting, setIsPosting] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    
    // Animation refs
    const scrollY = useRef(new Animated.Value(0)).current;
    const keyboardTranslateY = useRef(new Animated.Value(60)).current;

    useEffect(() => {
        const showSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => {
                setIsKeyboardVisible(true);
                Animated.spring(keyboardTranslateY, { toValue: 0, friction: 8, useNativeDriver: true }).start();
            }
        );
        const hideSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setIsKeyboardVisible(false);
                Animated.timing(keyboardTranslateY, { toValue: 60, duration: 250, useNativeDriver: true }).start();
            }
        );

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    const addTag = () => {
        const cleanTag = tagInput.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        if (cleanTag && !tags.includes(cleanTag)) {
            setTags(prev => [...prev, cleanTag]);
        }
        setTagInput("");
    };

    const removeTag = (tag: string) => {
        setTags(prev => prev.filter(t => t !== tag));
    };

    const pickImage = async (useCamera: boolean) => {
        const options: any = {
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 1200,
            maxHeight: 1200,
            saveToPhotos: useCamera,
        };

        try {
            const result = useCamera ? await launchCamera(options) : await launchImageLibrary(options);
            if (result.didCancel) return;
            if (result.errorCode) {
                Alert.alert("Error", result.errorMessage || "Could not access media.");
                return;
            }
            if (result.assets && result.assets.length > 0) {
                setSelectedImage(result.assets[0].uri || null);
            }
        } catch (err) {
            console.error("ImagePicker Error:", err);
            Alert.alert("Permission Error", "Please ensure camera/photo permissions are granted in settings.");
        }
    };

    const handlePost = async () => {
        if (!caption.trim()) return;
        setIsPosting(true);
        Keyboard.dismiss();

        try {
            let imageUrl = undefined;
            if (selectedImage) {
                const uploadResult = await uploadImage(selectedImage);
                imageUrl = uploadResult.url;
            }

            await addPost({
                caption: caption.trim(),
                tags,
                type: postType,
                imageUrl
            });

            navigation.goBack();
        } catch (error: any) {
            Alert.alert("Post Failed", error.message || "Something went wrong while sharing your post.");
        } finally {
            setIsPosting(false);
        }
    };

    const canSubmit = caption.trim().length > 0 && selectedImage && !isPosting;

    const actionItems = [
        { id: 'photo', icon: 'image', label: 'Photo/Video', color: colors.primary, action: () => pickImage(false) },
        { id: 'camera', icon: 'camera', label: 'Camera', color: '#fbbf24', action: () => pickImage(true) },
        { id: 'poll', icon: 'bar-chart-2', label: 'Poll', color: '#10b981', action: () => Alert.alert("Coming Soon", "Polls will be available soon!") },
        { id: 'event', icon: 'calendar', label: 'Event', color: '#f43f5e', action: () => Alert.alert("Coming Soon", "Events will be available soon!") },
        { id: 'portfolio', icon: 'briefcase', label: 'Portfolio', color: '#8b5cf6', action: () => setPostType('portfolio') },
        { id: 'tag', icon: 'hash', label: 'Add Tag', color: colors.mutedForeground, action: () => {} },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                {/* Clean Header */}
                <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: colors.primary }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                        <Feather name="x" size={24} color="#fff" />
                    </TouchableOpacity>
                    
                    <Text style={[styles.headerTitle, { color: "#fff" }]}>Create Post</Text>
                    
                    <TouchableOpacity
                        style={[
                            styles.submitBtn, 
                            { 
                                backgroundColor: canSubmit ? "#10b981" : colors.card,
                                shadowColor: "#10b981",
                                shadowOpacity: canSubmit ? 0.3 : 0,
                            }
                        ]}
                        onPress={handlePost}
                        disabled={!canSubmit}
                    >
                        <Text style={[styles.submitBtnText, { color: canSubmit ? "#fff" : colors.mutedForeground }]}>
                            {isPosting ? "..." : "Post"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: 40 + insets.bottom }
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="always"
                >
                    {/* User Info Section */}
                    <View style={styles.userRow}>
                        <Image
                            source={{ uri: user?.avatar || "https://ui-avatars.com/api/?name=" + (user?.name || "User") }}
                            style={styles.avatar}
                        />
                        <View style={styles.userInfo}>
                            <View style={styles.nameRow}>
                                <Text style={[styles.userName, { color: colors.foreground }]}>{user?.name || "User"}</Text>
                                <Feather name="check-circle" size={14} color={colors.primary} style={styles.verifiedIcon} />
                            </View>
                            <TouchableOpacity 
                                style={[styles.postTypeBadge, { backgroundColor: colors.card, borderColor: colors.border }]}
                                onPress={() => setPostType(t => t === 'social' ? 'portfolio' : 'social')}
                            >
                                <Feather name={postType === 'portfolio' ? 'briefcase' : 'message-circle'} size={12} color={colors.primary} />
                                <Text style={[styles.postTypeText, { color: colors.mutedForeground }]}>
                                    {postType === 'portfolio' ? 'Portfolio Piece' : 'Social Update'}
                                </Text>
                                <Feather name="chevron-down" size={12} color={colors.mutedForeground} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Text Area */}
                    <TextInput
                        style={[styles.input, { color: colors.foreground }]}
                        placeholder="What do you want to talk about?"
                        placeholderTextColor={colors.mutedForeground}
                        multiline
                        value={caption}
                        onChangeText={setCaption}
                        autoFocus
                        textAlignVertical="top"
                    />

                    {/* Tags List */}
                    {tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            {tags.map((tag) => (
                                <TouchableOpacity
                                    key={tag}
                                    style={[styles.tagChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                                    onPress={() => removeTag(tag)}
                                >
                                    <Text style={[styles.tagChipText, { color: colors.foreground }]}>#{tag}</Text>
                                    <Feather name="x" size={14} color={colors.mutedForeground} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Image Attachment Preview */}
                    {selectedImage && (
                        <View style={styles.imagePreviewContainer}>
                            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                            <TouchableOpacity 
                                style={styles.removeImageBtn} 
                                onPress={() => setSelectedImage(null)}
                            >
                                <View style={styles.removeIconCircle}>
                                    <Feather name="x" size={18} color="#fff" />
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* "Add to your post" Section (Only visible when keyboard is hidden or scrolled down) */}
                    {!isKeyboardVisible && (
                        <View style={styles.addToPostContainer}>
                            <View style={styles.divider} />
                            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Add to your post</Text>
                            <View style={styles.actionGrid}>
                                {actionItems.map((item) => (
                                    <TouchableOpacity 
                                        key={item.id} 
                                        style={[styles.actionCard, { backgroundColor: colors.card }]}
                                        onPress={item.action}
                                    >
                                        <View style={[styles.itemIconContainer, { backgroundColor: item.color + '15' }]}>
                                            <Feather name={item.icon} size={24} color={item.color} />
                                        </View>
                                        <Text style={[styles.actionLabel, { color: colors.foreground }]}>{item.label}</Text>
                                        <Feather name="plus" size={14} color={colors.mutedForeground} style={styles.plusIcon} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Floating Keyboard Toolbar */}
                {isKeyboardVisible && (
                    <Animated.View 
                        style={[
                            styles.keyboardToolbar, 
                            { 
                                backgroundColor: colors.background, 
                                borderTopColor: colors.border,
                                paddingBottom: Platform.OS === 'ios' ? insets.bottom : insets.bottom + 5,
                                transform: [{ translateY: keyboardTranslateY }]
                            }
                        ]}
                    >
                        <View style={styles.toolbarContent}>
                            <View style={styles.toolbarIcons}>
                                {actionItems.slice(0, 5).map((item) => (
                                    <TouchableOpacity key={item.id} onPress={item.action} style={styles.toolbarIconBtn}>
                                        <Feather name={item.icon} size={20} color={item.color} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <Text style={[styles.charCount, { color: caption.length > 950 ? colors.destructive : colors.mutedForeground }]}>
                                {caption.length}/1000
                            </Text>
                        </View>
                    </Animated.View>
                )}
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    headerBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    submitBtn: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        minWidth: 75,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
    },
    submitBtnText: { fontSize: 15, fontWeight: '700' },
    
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 40,
    },
    
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    userInfo: { flex: 1 },
    nameRow: { 
        flexDirection: 'row', 
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: { fontSize: 17, fontWeight: '700' },
    verifiedIcon: { marginLeft: 6 },
    postTypeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        borderWidth: 1,
        alignSelf: 'flex-start',
        gap: 6,
    },
    postTypeText: { fontSize: 12, fontWeight: '600' },
    
    input: {
        fontSize: 19,
        lineHeight: 28,
        minHeight: 120,
        marginBottom: 20,
    },
    
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
    },
    tagChipText: { fontSize: 14, fontWeight: '500' },

    imagePreviewContainer: {
        marginVertical: 15,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        height: 120,
        width: 120,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
    removeImageBtn: {
        position: 'absolute',
        top: 6,
        right: 6,
        zIndex: 10,
    },
    removeIconCircle: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    addToPostContainer: {
        marginTop: 10,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#e2e8f0',
        marginBottom: 20,
    },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 20 },
    actionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    actionCard: {
        width: (width - 52) / 2,
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    actionLabel: { fontSize: 14, fontWeight: '600', flex: 1 },
    plusIcon: { marginLeft: 4 },

    keyboardToolbar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingBottom: Platform.OS === 'ios' ? 0 : 5,
    },
    toolbarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 54,
    },
    toolbarIcons: {
        flexDirection: 'row',
        gap: 20,
    },
    toolbarIconBtn: { padding: 4 },
    charCount: { fontSize: 13, fontWeight: '600', color: '#64748b' },
});
