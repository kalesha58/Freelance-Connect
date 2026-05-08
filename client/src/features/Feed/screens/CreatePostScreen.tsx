import React, { useState, useRef, useEffect } from "react";
import {
    Platform,
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
    StatusBar
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { uploadImage } from "@/utils/apiClient";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat/KeyboardAwareScrollViewCompat";

const { width } = Dimensions.get("window");

/**
 * Phase 2 Redesign for a "Rich & Premium" UI.
 * Optimized with KeyboardAwareScrollViewCompat for robust keyboard handling.
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
    
    // Animation refs for the toolbar
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
            quality: 0.5,
            maxWidth: 1000,
            maxHeight: 1000,
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
            <StatusBar barStyle="light-content" backgroundColor={colors.headerBackground} />
            
            {/* Clean Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: colors.headerBackground }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Feather name="x" size={24} color="#fff" />
                </TouchableOpacity>
                
                <Text style={[styles.headerTitle, { color: "#fff" }]}>Create Post</Text>
                
                <TouchableOpacity
                    style={[
                        styles.submitBtn, 
                        { 
                            backgroundColor: canSubmit ? colors.headerBackground : colors.card,
                            shadowColor: canSubmit ? colors.headerBackground : "transparent",
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

            <KeyboardAwareScrollViewCompat
                style={{ flex: 1 }}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: isKeyboardVisible ? 60 + insets.bottom : 20 + insets.bottom }
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

                {/* "Add to your post" Section (Only visible when keyboard is hidden) */}
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
            </KeyboardAwareScrollViewCompat>

            {/* Floating Keyboard Toolbar */}
            {isKeyboardVisible && (
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
                    style={styles.toolbarWrapper}
                >
                    <Animated.View 
                        style={[
                            styles.keyboardToolbar, 
                            { 
                                backgroundColor: colors.background, 
                                borderTopColor: colors.border,
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
                </KeyboardAvoidingView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    headerBtn: { 
        width: 36, 
        height: 36, 
        borderRadius: 18, 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)'
    },
    headerTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
    submitBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 18,
        minWidth: 70,
        alignItems: 'center',
    },
    submitBtnText: { fontSize: 14, fontWeight: '800' },
    
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    userInfo: { flex: 1 },
    nameRow: { 
        flexDirection: 'row', 
        alignItems: 'center',
        marginBottom: 2,
    },
    userName: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
    verifiedIcon: { marginLeft: 4 },
    postTypeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        borderWidth: 1,
        alignSelf: 'flex-start',
        gap: 4,
    },
    postTypeText: { fontSize: 11, fontWeight: '700' },
    
    input: {
        fontSize: 16,
        lineHeight: 24,
        minHeight: 100,
        marginBottom: 20,
        fontWeight: '500',
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
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        gap: 5,
    },
    tagChipText: { fontSize: 13, fontWeight: '600' },

    imagePreviewContainer: {
        marginVertical: 8,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        height: 140,
        width: 140,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
    removeImageBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
    },
    removeIconCircle: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    addToPostContainer: {
        marginTop: 10,
        paddingTop: 10,
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 16,
    },
    sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 16, letterSpacing: -0.2 },
    actionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    actionCard: {
        width: (width - 44) / 2,
        padding: 12,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    itemIconContainer: {
        width: 38,
        height: 38,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    actionLabel: { fontSize: 13, fontWeight: '700', flex: 1 },
    plusIcon: { marginLeft: 2, opacity: 0.4 },

    toolbarWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    keyboardToolbar: {
        borderTopWidth: 1,
    },
    toolbarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 50,
    },
    toolbarIcons: {
        flexDirection: 'row',
        gap: 18,
    },
    toolbarIconBtn: { padding: 2 },
    charCount: { fontSize: 12, fontWeight: '700', opacity: 0.6 },
});
